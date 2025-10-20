// utils/sanitize-html.ts
import DOMPurify from "isomorphic-dompurify";

/**
 * Chuẩn hoá HTML Quill trả ra (gỡ các nesting sai cơ bản) rồi sanitize.
 * - Bỏ <p> bao quanh <ol>/<ul>
 * - Dọn <p><br></p> thừa
 * - Bỏ div wrapper dư
 */
export function normalizeAndSanitizeHtml(input?: string | null): string {
  if (!input || input.trim() === "") return "<p>—</p>";

  let html = input;

  // Gỡ <div> bọc vô nghĩa
  html = html.replace(/^\s*<div[^>]*>([\s\S]*?)<\/div>\s*$/i, "$1");

  // Bỏ <p> bao quanh list (sai chuẩn HTML, gây xuống dòng lạ)
  html = html
    .replace(/<p>\s*(<ol[\s\S]*?<\/ol>)\s*<\/p>/gi, "$1")
    .replace(/<p>\s*(<ul[\s\S]*?<\/ul>)\s*<\/p>/gi, "$1");

  // Dọn <p><br></p> rỗng
  html = html.replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/gi, "");

  // Option: gộp nhiều <br> liên tiếp thành 1
  html = html.replace(/(<br\s*\/?>\s*){3,}/gi, "<br>");

  // Sanitize: cho phép các tag cơ bản dùng trong mô tả
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h1","h2","h3","h4","h5","h6",
      "p","strong","b","i","em","u","s","strike",
      "ol","ul","li","br","hr","blockquote",
      "a","code","pre","span","div"
    ],
    ALLOWED_ATTR: ["href","title","target","rel","class","style"],
    FORBID_ATTR: ["onerror","onclick","onload"],
    USE_PROFILES: { html: true },
  });

  return clean || "<p>—</p>";
}
