import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp, { type SharpOptions } from 'sharp';
import { projectRoot } from '../renderer/render.js';

try {
  if (!process.argv[2]) throw new Error('Usage: pnpm compare output/<date>/<slug>');
  const directory = path.resolve(process.argv[2]);
  const reference = path.join(projectRoot, 'references/v6');
  const manifest = JSON.parse((await readFile(path.join(reference, 'manifest.json'), 'utf8')).replace(/^\uFEFF/, '')) as { file: string; sha256: string }[];
  for (const item of manifest) {
    const digest = createHash('sha256').update(await readFile(path.join(reference, item.file))).digest('hex');
    if (digest !== item.sha256) throw new Error(`Reference was modified: ${item.file}`);
  }
  const files = (await readdir(directory)).filter(name => /^\d{2}_(cover|body|summary|insight)\.png$/.test(name)).sort();
  if (files.length !== 8) throw new Error('v6 comparison requires the 8-page sample');
  const comparisons = [];
  const metrics = [];
  for (const file of files) {
    const original = path.join(reference, file), actual = path.join(directory, file);
    const a = await sharp(original).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const b = await sharp(actual).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    if (a.info.width !== b.info.width || a.info.height !== b.info.height || a.data.length !== b.data.length) throw new Error(`Dimension mismatch: ${file}`);
    let total = 0, differentPixels = 0;
    const diff = Buffer.alloc(a.data.length);
    for (let i = 0; i < a.data.length; i += 3) {
      let max = 0;
      for (let c = 0; c < 3; c++) { const d = Math.abs(a.data[i + c] - b.data[i + c]); total += d; max = Math.max(max, d); diff[i + c] = d; }
      if (max > 16) differentPixels++;
    }
    metrics.push({ file, meanAbsoluteChannelError: total / a.data.length, pixelsDifferentOver16Percent: 100 * differentPixels / (a.info.width * a.info.height) });
    const thumb = async (input: string | Buffer, raw?: SharpOptions) => sharp(input, raw).resize(270, 338).png().toBuffer();
    comparisons.push(await thumb(original), await thumb(actual), await thumb(diff, { raw: a.info }));
  }
  await sharp({ create: { width: 870, height: files.length * 358 + 20, channels: 3, background: '#ededed' } })
    .composite(comparisons.map((input, i) => ({ input, left: 20 + i % 3 * 285, top: 20 + Math.floor(i / 3) * 358 }))).png().toFile(path.join(directory, 'reference-comparison.png'));
  await writeFile(path.join(directory, 'reference-diff.json'), JSON.stringify({ columns: ['reference', 'rendered', 'absolute pixel difference'], caveat: 'Reference uses Noto Sans CJK; renderer uses Pretendard. Cover uses placeholder. Pixel error is diagnostic, not a pass/fail similarity score.', metrics }, null, 2));
  console.log(`Reference hashes verified. Comparison: ${path.join(directory, 'reference-comparison.png')}`);
} catch (error) { console.error(error); process.exitCode = 1; }
