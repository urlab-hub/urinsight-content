import { readFile } from 'node:fs/promises';
import type { CarouselContent } from '../schema/content.js';
import { launchBrowser } from '../renderer/browser.js';
import { renderHtml, slidesFor } from '../renderer/template.js';
import { prepareAndValidate } from '../renderer/validate.js';
import { tokens } from '../config/tokens.js';

/** Reuses baseline renderer checks without changing templates or generating PNGs. */
export async function validateCarouselLayout(content: CarouselContent) {
  const font = (await readFile(new URL('../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2', import.meta.url))).toString('base64');
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport: tokens.canvas, deviceScaleFactor: 1, locale: 'ko-KR', timezoneId: 'Asia/Seoul' });
    await page.route('**/*', route => route.abort());
    const reports = [];
    for (const [index, slide] of slidesFor(content).entries()) {
      await page.setContent(renderHtml(content, slide, font), { waitUntil: 'load' });
      reports.push({ page: index + 1, kind: slide.kind, ...await prepareAndValidate(page) });
    }
    return { passed: true, browserVersion: browser.version(), reports };
  } finally { await browser.close(); }
}
