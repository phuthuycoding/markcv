import { readFileSync, existsSync, statSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";

const CANDIDATES = ["photo.jpg", "photo.jpeg", "photo.png", "photo.webp", "avatar.jpg", "avatar.png"];
const MIME: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
};
/** Above this size the photo pushes the PDF past what job portals accept. */
const WARN_BYTES = 400 * 1024;

export interface PhotoResult {
  html: string;
  file: string | null;
  bytes: number;
  warning?: string;
}

/**
 * Return the portrait as a base64-embedded tag, or an empty placeholder box.
 * Embedding keeps the HTML self-contained — it survives being moved or emailed,
 * and Chrome's PDF export never depends on a relative path.
 */
export function photoBlock(mdPath: string, explicit?: string | null): PhotoResult {
  if (explicit === null) return { html: "", file: null, bytes: 0 };   // explicitly disabled

  const folder = dirname(resolve(mdPath));
  const found = explicit
    ? (existsSync(explicit) ? explicit : null)
    : CANDIDATES.map((n) => resolve(folder, n)).find(existsSync) ?? null;

  if (!found) {
    return {
      html: '<div class="photo-empty">PHOTO</div>',
      file: null,
      bytes: 0,
    };
  }

  const bytes = statSync(found).size;
  const mime = MIME[extname(found).toLowerCase()] ?? "image/jpeg";
  const b64 = readFileSync(found).toString("base64");
  const result: PhotoResult = {
    html: `<img class="photo" src="data:${mime};base64,${b64}" alt="">`,
    file: found,
    bytes,
  };
  if (bytes > WARN_BYTES) {
    result.warning =
      `Photo is ${(bytes / 1024 / 1024).toFixed(1)}MB and will bloat the PDF. ` +
      `Compress it first: sips -Z 800 -s format jpeg -s formatOptions 88 <photo> --out photo.jpg`;
  }
  return result;
}
