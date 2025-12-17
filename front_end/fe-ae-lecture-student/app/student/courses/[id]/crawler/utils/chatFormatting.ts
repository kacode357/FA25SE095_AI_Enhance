"use client";

import DOMPurify from "isomorphic-dompurify";

export type RenderedMessageContent = {
  html: string;
  images: string[];
};

const IMAGE_REGEX =
  /(https?:\/\/[^\s<>'"]+\.(?:png|jpe?g|gif|webp|svg))(?:\?\S*)?/gi;

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function replaceImagesWithPlaceholders(value: string, images: string[]) {
  let text = value;
  text = text.replace(IMAGE_REGEX, (match) => {
    const safe = DOMPurify.sanitize(match, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    if (!safe) return "";
    const key = `%%IMG${images.length}%%`;
    images.push(safe);
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
  const images: string[] = [];
  const lines = content.split(/\r?\n/);
  const blocks: string[] = [];
  let activeList: { type: "ul" | "ol"; items: string[] } | null = null;
  let pendingNestedItems: string[] | null = null;

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
    const withPlaceholders = replaceImagesWithPlaceholders(line, images);
    const trimmed = withPlaceholders.trim();
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    const bulletMatch = trimmed.match(/^[-*+]\s+(.*)/);

    if (orderedMatch) {
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

    flushList();
    blocks.push(`<p>${applyInlineFormatting(trimmed)}</p>`);
  });

  flushList();

  const htmlRaw = blocks.length
    ? blocks.join("")
    : `<p>${applyInlineFormatting(replaceImagesWithPlaceholders(content, images))}</p>`;

  const htmlWithImages = htmlRaw.replace(/%%IMG(\d+)%%/g, (_, idxStr) => {
    const idx = Number(idxStr);
    const src = images[idx];
    if (!src) return "";
    return `<img src="${src}" alt="message-image" loading="lazy" referrerpolicy="no-referrer" data-inline-img="true" />`;
  });

  const sanitized = DOMPurify.sanitize(htmlWithImages, {
    ADD_TAGS: ["img"],
    ADD_ATTR: ["loading", "referrerpolicy", "data-inline-img"],
  });

  return { html: sanitized, images };
}

export function renderMessageContent(content: string): RenderedMessageContent {
  const trimmed = (content || "").trim();
  const { html, images } = buildSanitizedHtml(content || "");

  return { html, images };
}
