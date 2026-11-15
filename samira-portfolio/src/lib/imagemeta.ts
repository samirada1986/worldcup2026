/**
 * Build-time image metadata (server only).
 *
 * Reads the real file under /public so intrinsic size and the blur placeholder can never
 * drift out of sync with the photograph — and so a photo uploaded through the admin panel
 * needs no manual width/height entry.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { Artwork } from "./types";

export interface ImageMeta {
  w: number;
  h: number;
  blur?: string;
}

const cache = new Map<string, Promise<ImageMeta | null>>();

export function imageMeta(src: string): Promise<ImageMeta | null> {
  const hit = cache.get(src);
  if (hit) return hit;
  const p = (async () => {
    try {
      const file = path.join(process.cwd(), "public", src.replace(/^\/+/, ""));
      if (!fs.existsSync(file)) return null;
      const input = sharp(file).rotate(); // honour EXIF orientation
      const meta = await input.metadata();
      const swap = (meta.orientation ?? 1) >= 5;
      const w = (swap ? meta.height : meta.width) ?? 0;
      const h = (swap ? meta.width : meta.height) ?? 0;
      const buf = await sharp(file).rotate().resize(24).jpeg({ quality: 45 }).toBuffer();
      return { w, h, blur: `data:image/jpeg;base64,${buf.toString("base64")}` };
    } catch {
      return null;
    }
  })();
  cache.set(src, p);
  return p;
}

/** Fill in w/h/blur from the file. Falls back to any values already present. */
export async function enrich<T extends Partial<Artwork> & { src: string }>(art: T): Promise<T & Pick<Artwork, "w" | "h" | "blur">> {
  const m = await imageMeta(art.src);
  return {
    ...art,
    w: m?.w || art.w || 1600,
    h: m?.h || art.h || 1067,
    blur: m?.blur ?? art.blur,
  };
}
