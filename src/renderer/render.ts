import { readFile, mkdir, mkdtemp, rename, rm, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from './browser.js';
import sharp from 'sharp';
import { contentSchema } from '../schema/content.js';
import { tokens } from '../config/tokens.js';
import { LocalCoverImageProvider, type CoverImageProvider } from './cover-image.js';
import { slidesFor, renderHtml, type InsightImage } from './template.js';
import { prepareAndValidate } from './validate.js';
import { contactSheet } from './contact-sheet.js';

export const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
export function seoulDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export async function generate(contentFile: string, options: { outputRoot?: string; date?: string; provider?: CoverImageProvider; insightImage?: InsightImage } = {}) {
  const contentPath = path.resolve(contentFile);
  const content = contentSchema.parse(JSON.parse((await readFile(contentPath, 'utf8')).replace(/^\uFEFF/, '')));
  if (options.insightImage && options.insightImage.kind !== 'placeholder-fallback' && !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(options.insightImage.dataUrl)) throw new Error('insightImage must be a locally decoded PNG data URL');
  const date = options.date ?? seoulDate();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid output date');
  const image = await (options.provider ?? new LocalCoverImageProvider()).resolve(content.cover.image, path.dirname(contentPath));
  const font = (await readFile(path.join(projectRoot, 'node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2'))).toString('base64');
  const parent = path.resolve(options.outputRoot ?? path.join(projectRoot, 'output'), date);
  await mkdir(parent, { recursive: true });
  const target = path.join(parent, content.slug);
  const staging = await mkdtemp(path.join(parent, `.${content.slug}-`));
  const reports = [];
  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage({ viewport: tokens.canvas, deviceScaleFactor: 1, locale: 'ko-KR', timezoneId: 'Asia/Seoul', colorScheme: 'light', reducedMotion: 'reduce' });
    await page.route('**/*', route => route.abort());
    const failures: string[] = [];
    page.on('pageerror', error => failures.push(error.message));
    const files: string[] = [];
    const slides = slidesFor(content);
    if (slides.length < 8 || slides.length > 10) throw new Error('Expected 8–10 slides');
    for (const [index, slide] of slides.entries()) {
      const name = `${String(index + 1).padStart(2, '0')}_${slide.kind}.png`;
      await page.setContent(renderHtml(content, slide, font, image, options.insightImage), { waitUntil: 'load' });
      let report;
      try { report = await prepareAndValidate(page); } catch (error) { throw new Error(`${name}: ${String(error)}`); }
      if (failures.length) throw new Error(failures.join('\n'));
      const file = path.join(staging, name);
      await page.screenshot({ path: file, type: 'png', animations: 'disabled' });
      const meta = await sharp(file).metadata();
      if (meta.width !== tokens.canvas.width || meta.height !== tokens.canvas.height) throw new Error(`${name}: incorrect PNG dimensions`);
      files.push(file); reports.push({ file: name, ...report });
    }
    await contactSheet(files, path.join(staging, 'contact-sheet.png'));
    await writeFile(path.join(staging, 'validation.json'), JSON.stringify({ category: content.category, slug: content.slug, pages: reports.length, placeholder: !image, browser: { channel: process.env.URINSIGHT_BROWSER_CHANNEL ?? 'headless-shell', version: browser.version() }, reports }, null, 2));
    await browser.close(); browser = undefined;
    // Preserve an existing successful render until the complete replacement passes.
    const backup = `${staging}-previous`;
    let exists = false;
    try { await access(target); exists = true; } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    if (exists) await rename(target, backup);
    try { await rename(staging, target); } catch (error) { if (exists) await rename(backup, target); throw error; }
    if (exists) await rm(backup, { recursive: true, force: true });
    return { directory: target, pages: reports.length, placeholder: !image };
  } finally {
    await browser?.close();
    await rm(staging, { recursive: true, force: true });
  }
}
