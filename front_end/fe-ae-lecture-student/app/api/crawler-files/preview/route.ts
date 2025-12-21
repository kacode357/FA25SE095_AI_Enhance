import { NextResponse } from "next/server";

const DEFAULT_MAX_BYTES = 400000;

const readStreamText = async (res: Response, maxBytes: number) => {
  const reader = res.body?.getReader();
  if (!reader) {
    const text = await res.text();
    const truncated = text.length > maxBytes;
    return { text: truncated ? text.slice(0, maxBytes) : text, truncated };
  }

  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  let truncated = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    const nextBytes = bytes + value.byteLength;
    if (nextBytes > maxBytes) {
      const available = Math.max(maxBytes - bytes, 0);
      if (available > 0) {
        text += decoder.decode(value.slice(0, available), { stream: true });
      }
      truncated = true;
      try {
        await reader.cancel();
      } catch {
        // ignore cancel errors
      }
      break;
    }

    bytes = nextBytes;
    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();
  return { text, truncated };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const urlParam = searchParams.get("url");
  if (!urlParam) {
    return NextResponse.json(
      { success: false, message: "Missing url parameter." },
      { status: 400 }
    );
  }

  let target: URL;
  try {
    target = new URL(urlParam);
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid url parameter." },
      { status: 400 }
    );
  }

  if (!["http:", "https:"].includes(target.protocol)) {
    return NextResponse.json(
      { success: false, message: "Unsupported protocol." },
      { status: 400 }
    );
  }

  const maxBytes = Number(process.env.CRAWLER_FILE_PREVIEW_MAX_BYTES || DEFAULT_MAX_BYTES);
  const safeMaxBytes = Number.isFinite(maxBytes) ? Math.max(1000, maxBytes) : DEFAULT_MAX_BYTES;

  try {
    const res = await fetch(target.toString(), { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: `Failed to fetch file (${res.status}).` },
        { status: res.status }
      );
    }

    const { text, truncated } = await readStreamText(res, safeMaxBytes);
    return NextResponse.json({ success: true, text, truncated });
  } catch (err) {
    console.error("[crawler-files][preview] fetch error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch file." },
      { status: 500 }
    );
  }
}
