// utils/html-normalize.ts

/** Dọn HTML list cho đúng chuẩn trước khi gửi API */
export function normalizeHtmlForSave(input?: string | null): string {
  if (!input) return "";

  let html = input;

  // 1) Gỡ <p> bao quanh <ol>/<ul>
  html = html
    .replace(/<p>\s*(<(?:ol|ul)[\s\S]*?<\/(?:ol|ul)>)\s*<\/p>/gi, "$1");

  // 2) Gỡ <p> bên trong <li> -> <li>Text</li>
  html = html
    .replace(/<li>\s*<p>([\s\S]*?)<\/p>\s*<\/li>/gi, "<li>$1</li>");

  // 3) Bỏ <p><br></p> rỗng
  html = html.replace(/<p>\s*(?:<br\s*\/?>)?\s*<\/p>/gi, "");

  // 4) Gộp nhiều <br> liên tiếp
  html = html.replace(/(?:<br\s*\/?>\s*){3,}/gi, "<br>");

  // 5) Bỏ wrapper <div> đơn, thường do quill/word
  html = html.replace(/^\s*<div[^>]*>([\s\S]*?)<\/div>\s*$/i, "$1");

  return html.trim();
}

/** Làm sạch HTML mang vào editor (từ paste/insert) để không đẻ ra markup xấu */
export function cleanIncomingHtml(input: string): string {
  if (!input) return "";
  let html = input;

  // Gỡ <p> bọc list
  html = html.replace(/<p>\s*(<(?:ol|ul)[\s\S]*?<\/(?:ol|ul)>)\s*<\/p>/gi, "$1");

  // <li><p>..</p></li> -> <li>..</li>
  html = html.replace(/<li>\s*<p>([\s\S]*?)<\/p>\s*<\/li>/gi, "<li>$1</li>");

  // Các editor hay bọc toàn bộ bằng 1 <div>
  html = html.replace(/^\s*<div[^>]*>([\s\S]*?)<\/div>\s*$/i, "$1");

  return html;
}
