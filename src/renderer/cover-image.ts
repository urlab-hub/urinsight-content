import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

/** Boundary for a future Cover Image System. Phase 1 only reads a local asset. */
export interface CoverImageProvider {
  resolve(imagePath: string | undefined, contentDirectory: string): Promise<string | undefined>;
}
export class LocalCoverImageProvider implements CoverImageProvider {
  async resolve(imagePath: string | undefined, contentDirectory: string) {
    if (!imagePath) return undefined;
    if (/^[a-z]+:\/\//i.test(imagePath)) throw new Error('cover.image must be a local file path');
    const bytes = await readFile(path.resolve(contentDirectory, imagePath));
    // Normalize to PNG so SVG dependencies, scripts, EXIF rotation, and external requests cannot leak into rendering.
    const png = await sharp(bytes, { limitInputPixels: 80_000_000 }).rotate().png().toBuffer();
    return `data:image/png;base64,${png.toString('base64')}`;
  }
}
