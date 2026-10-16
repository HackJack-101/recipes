import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const DIR = path.resolve(process.env.UPLOAD_DIR || "./data/uploads");
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

/** Détecte le vrai type d'image via les magic bytes (on ne fait pas confiance au Content-Type client). */
export function sniffImage(buf: Buffer): { mime: string; ext: string } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mime: "image/png", ext: "png" };
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return { mime: "image/webp", ext: "webp" };
  if (buf.subarray(0, 3).toString() === "GIF") return { mime: "image/gif", ext: "gif" };
  return null;
}

export async function savePhotoFile(buf: Buffer, ext: string) {
  await mkdir(DIR, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(DIR, filename), buf);
  return filename;
}

const safe = (f: string) => path.join(DIR, path.basename(f));
export const readPhotoFile = (f: string) => readFile(safe(f));
export const deletePhotoFile = (f: string) => unlink(safe(f)).catch(() => {});
