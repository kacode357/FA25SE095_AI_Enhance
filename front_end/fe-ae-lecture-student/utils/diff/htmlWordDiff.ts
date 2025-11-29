// utils/diff/htmlWordDiff.ts
import { diffWords } from "diff";

export type HtmlWordDiffResult = {
  /** HTML đã highlight cho bản cũ (before) */
  oldHighlighted: string;
  /** HTML đã highlight cho bản mới (after) */
  newHighlighted: string;
};

/** Chuyển HTML TinyMCE => plain text, giữ xuống dòng cơ bản */
function htmlToPlain(html: string): string {
  if (!html) return "";
  let s = html;
  s = s.replace(/<\/p>/gi, "\n\n");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<[^>]+>/g, "");
  s = s.replace(/&nbsp;/g, " ");
  return s;
}

/** Plain text (có \n) => HTML đơn giản với <br /> trong 1 <p> */
function plainToHtml(text: string): string {
  if (!text) return "";
  const withBr = text.replace(/\n/g, "<br />");
  return `<p>${withBr}</p>`;
}

/**
 * Diff theo từng "word" giữa 2 HTML:
 * - phần chung: giữ nguyên (không màu)
 * - phần chỉ có ở old: bôi đỏ + gạch ngang
 * - phần chỉ có ở new: bôi xanh
 */
export function buildHtmlWordDiff(
  oldHtml: string,
  newHtml: string
): HtmlWordDiffResult {
  const oldText = htmlToPlain(oldHtml);
  const newText = htmlToPlain(newHtml);

  if (!oldText && !newText) {
    return { oldHighlighted: oldHtml, newHighlighted: newHtml };
  }
  if (oldText === newText) {
    return { oldHighlighted: oldHtml, newHighlighted: newHtml };
  }

  const parts = diffWords(oldText, newText);
  let oldBuf = "";
  let newBuf = "";

  parts.forEach((p) => {
    if (p.added) {
      // chỉ new có → tô xanh bên new
      newBuf += `<span style="background-color:#dcfce7;">${p.value}</span>`;
    } else if (p.removed) {
      // chỉ old có → tô đỏ bên old
      oldBuf += `<span style="background-color:#fee2e2; text-decoration:line-through;">${p.value}</span>`;
    } else {
      // chung nhau → giữ nguyên cả hai, không màu
      oldBuf += p.value;
      newBuf += p.value;
    }
  });

  return {
    oldHighlighted: plainToHtml(oldBuf),
    newHighlighted: plainToHtml(newBuf),
  };
}
