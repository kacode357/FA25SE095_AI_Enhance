"use client";

import DOMPurify from "isomorphic-dompurify";

export type RenderedMessageContent = {
  html: string;
  images: string[];
};

const MARKDOWN_IMAGE_REGEX = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/gi;
const IMAGE_URL_REGEX =
  /(https?:\/\/[^\s<>'"()]+\.(?:png|jpe?g|gif|webp|svg))(?:\?[^\s<>'"]*)?/gi;

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function stripImagesLabel(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return line;
  const normalized = trimmed
    .replace(/^[-*+]\s*/, "")
    .replace(/:$/, "")
    .trim()
    .toLowerCase();
  if (normalized === "images" || normalized === "image") return "";
  return line;
}

type InlineImage = {
  src: string;
  alt?: string;
};

function replaceImagesWithPlaceholders(value: string, images: InlineImage[]) {
  let text = value;

  text = text.replace(MARKDOWN_IMAGE_REGEX, (_, altText, url) => {
    const safe = DOMPurify.sanitize(url, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    if (!safe) return "";
    const cleanedAlt = DOMPurify.sanitize(altText || "", {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    }).trim();
    const key = `%%IMG${images.length}%%`;
    images.push({ src: safe, alt: cleanedAlt || undefined });
    return key;
  });

  text = text.replace(IMAGE_URL_REGEX, (match) => {
    const safe = DOMPurify.sanitize(match, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    if (!safe) return "";
    const key = `%%IMG${images.length}%%`;
    images.push({ src: safe });
    return key;
  });

  return text;
}

function applyInlineFormatting(value: string) {
  let html = escapeHtml(value);

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  html = html.replace(/(?<!\\)\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/(?<!\\)_([^_]+)_/g, "<em>$1</em>");
  html = html.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noreferrer">$1</a>'
  );

  return html;
}

function buildSanitizedHtml(content: string) {
  const images: InlineImage[] = [];
  const lines = content.split(/\r?\n/);
  const blocks: string[] = [];
  let activeList: { type: "ul" | "ol"; items: string[] } | null = null;
  let pendingNestedItems: string[] | null = null;
  const imageOnlyRegex = /^(?:%%IMG\d+%%\s*)+$/;

  const appendToLastOrderedItem = (html: string) => {
    if (!activeList || activeList.type !== "ol" || !activeList.items.length) {
      return false;
    }

    if (pendingNestedItems) {
      const nestedHtml = `<ul>${pendingNestedItems
        .map((item) => `<li>${item}</li>`)
        .join("")}</ul>`;
      const lastIdx = activeList.items.length - 1;
      activeList.items[lastIdx] = `${activeList.items[lastIdx]}${nestedHtml}`;
      pendingNestedItems = null;
    }

    const lastIdx = activeList.items.length - 1;
    activeList.items[lastIdx] = `${activeList.items[lastIdx]}${html}`;
    return true;
  };

  const flushList = () => {
    if (!activeList) return;
    if (activeList.type === "ol" && pendingNestedItems && activeList.items.length) {
      const nestedHtml = `<ul>${pendingNestedItems
        .map((item) => `<li>${item}</li>`)
        .join("")}</ul>`;
      const lastIdx = activeList.items.length - 1;
      activeList.items[lastIdx] = `${activeList.items[lastIdx]}${nestedHtml}`;
      pendingNestedItems = null;
    } else if (pendingNestedItems) {
      const nestedHtml = `<ul>${pendingNestedItems
        .map((item) => `<li>${item}</li>`)
        .join("")}</ul>`;
      blocks.push(nestedHtml);
      pendingNestedItems = null;
    }

    const items = activeList.items.map((item) => `<li>${item}</li>`).join("");
    blocks.push(`<${activeList.type}>${items}</${activeList.type}>`);
    activeList = null;
  };

  lines.forEach((line) => {
    const sanitizedLine = stripImagesLabel(line);
    if (!sanitizedLine) return;
    const withPlaceholders = replaceImagesWithPlaceholders(sanitizedLine, images);
    const trimmed = withPlaceholders.trim();
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    const bulletMatch = trimmed.match(/^[-*+]\s+(.*)/);

    if (orderedMatch) {
      if (imageOnlyRegex.test(orderedMatch[2].trim())) {
        const imageBlock = `<div class="inline-image-block">${applyInlineFormatting(
          orderedMatch[2]
        )}</div>`;
        if (!appendToLastOrderedItem(imageBlock)) {
          flushList();
          blocks.push(imageBlock);
        }
        return;
      }
      if (activeList?.type === "ol") {
        if (pendingNestedItems) {
          const lastIdx = activeList.items.length - 1;
          const nestedHtml = `<ul>${pendingNestedItems
            .map((item) => `<li>${item}</li>`)
            .join("")}</ul>`;
          activeList.items[lastIdx] = `${activeList.items[lastIdx]}${nestedHtml}`;
          pendingNestedItems = null;
        }
      } else {
        flushList();
        activeList = { type: "ol", items: [] };
      }
      activeList.items.push(applyInlineFormatting(orderedMatch[2]));
      return;
    }

    if (bulletMatch) {
      if (imageOnlyRegex.test(bulletMatch[1].trim())) {
        const imageBlock = `<div class="inline-image-block">${applyInlineFormatting(
          bulletMatch[1]
        )}</div>`;
        if (!appendToLastOrderedItem(imageBlock)) {
          if (activeList?.type === "ul") {
            flushList();
          }
          blocks.push(imageBlock);
        }
        return;
      }
      if (activeList?.type === "ol") {
        if (!pendingNestedItems) pendingNestedItems = [];
        pendingNestedItems.push(applyInlineFormatting(bulletMatch[1]));
      return;
      }
      if (!activeList || activeList.type !== "ul") {
        flushList();
        activeList = { type: "ul", items: [] };
      }
      activeList.items.push(applyInlineFormatting(bulletMatch[1]));
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      flushList();
      const level = Math.min(6, headingMatch[1].length);
      const headingContent = applyInlineFormatting(headingMatch[2]);
      blocks.push(`<h${level}>${headingContent}</h${level}>`);
      return;
    }

    if (trimmed === "") {
      return;
    }

    if (activeList) {
      // Append as continuation of current list item (preserve numbering)
      if (activeList.type === "ol") {
        appendToLastOrderedItem(`<br/>${applyInlineFormatting(trimmed)}`);
      } else if (activeList.items.length) {
        const lastIdx = activeList.items.length - 1;
        activeList.items[lastIdx] = `${activeList.items[lastIdx]}<br/>${applyInlineFormatting(trimmed)}`;
      }
      return;
    }

    flushList();
    blocks.push(`<p>${applyInlineFormatting(trimmed)}</p>`);
  });

  flushList();

  const htmlRaw = blocks.length
    ? blocks.join("")
    : content.trim()
    ? `<p>${applyInlineFormatting(replaceImagesWithPlaceholders(content, images))}</p>`
    : "";

  const htmlWithImages = htmlRaw.replace(/%%IMG(\d+)%%/g, (_, idxStr) => {
    const idx = Number(idxStr);
    const img = images[idx];
    if (!img?.src) return "";
    const caption = img.alt
      ? `<figcaption>${escapeHtml(img.alt)}</figcaption>`
      : "";
    return `<figure class="inline-image"><img src="${img.src}" alt="${escapeHtml(
      img.alt || "message-image"
    )}" loading="lazy" referrerpolicy="no-referrer" data-inline-img="true" />${caption}</figure>`;
  });

  const sanitized = DOMPurify.sanitize(htmlWithImages, {
    ADD_TAGS: ["img", "figure", "figcaption", "div"],
    ADD_ATTR: ["loading", "referrerpolicy", "data-inline-img", "class"],
  });

  return { html: sanitized, images };
}

export function renderMessageContent(content: string): RenderedMessageContent {
  const raw = content || "";
  const { html, images } = buildSanitizedHtml(raw);

  return { html, images: images.map((img) => img.src) };
}
