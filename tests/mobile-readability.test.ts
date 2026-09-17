import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { Browser, Page } from 'playwright';
import { launchBrowser } from '../src/renderer/browser.js';
import { renderHtml } from '../src/renderer/template.js';
import { prepareAndValidate } from '../src/renderer/validate.js';
import { tokens, designTokens, coverOverlay } from '../src/config/tokens.js';
import { projectRoot } from '../src/renderer/render.js';
import { contentSchema } from '../src/schema/content.js';
import { mobileContentFixture } from './fixtures/mobile-content.js';

const approved = contentSchema.parse(JSON.parse(await readFile(path.join(projectRoot, 'content/sample-insight.json'), 'utf8')));
const sample = mobileContentFixture(approved);
const font = (await readFile(path.join(projectRoot, 'node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2'))).toString('base64');
const white = 'data:image/png;base64,' + (await sharp({ create: { width: 1080, height: 1350, channels: 3, background: '#fff' } }).png().toBuffer()).toString('base64');
let browser: Browser, page: Page;
before(async () => { browser = await launchBrowser(); page = await browser.newPage({ viewport: tokens.canvas }); await page.route('**/*', r => r.abort()); });
after(async () => { await browser?.close(); });

test('daily typography is clearly enlarged while legacy tokens and BODY/SUMMARY anchors remain stable', async () => {
  const mobile = designTokens(true);
  assert.ok(mobile.cover.titleSize / tokens.cover.titleSize > 1.15);
  assert.ok(mobile.body.textSize / tokens.body.textSize > 1.2);
  for (const kind of ['body', 'summary'] as const) {
    await page.setContent(renderHtml(sample, kind === 'body' ? { kind, index: 0 } : { kind }, font, undefined, undefined, 'anchored'));
    const report = await prepareAndValidate(page);
    assert.equal(await page.locator('.copy').evaluate(e => getComputedStyle(e).fontSize), '38px');
    assert.equal(await page.locator('h2').evaluate(e => getComputedStyle(e).fontSize), kind === 'body' ? '48px' : '52px');
    assert.equal((await page.locator('h2').boundingBox())!.y, tokens[kind].titleTop);
    assert.equal(report.contentFit!.emphasisBottomY, 1103);
    assert.equal(report.contentFit!.titleToBodyGap, 51);
  }
});

test('Daily COVER overlay fills the frame and stays lighter than INSIGHT', async () => {
  await page.setContent(renderHtml(sample, { kind: 'cover' }, font, white, undefined, 'anchored'));
  await prepareAndValidate(page);
  assert.deepEqual(await page.locator('.cover-overlay').boundingBox(), { x: 0, y: 0, width: 1080, height: 1350 });
  assert.equal(await page.locator('.cover-readability').count(), 0);
  const pixels = await page.screenshot();
  for (const top of [10, 1300]) {
    const pixel = await sharp(pixels).extract({ left: 10, top, width: 1, height: 1 }).raw().toBuffer();
    assert.ok(Math.abs(pixel[0] - 140) <= 1);
  }
  assert.equal(coverOverlay.opacity, .45);
  assert.ok(coverOverlay.opacity < tokens.insightImage.overlayOpacity);
  for (const image of [white, undefined]) {
    await page.setContent(renderHtml(sample, { kind: 'cover' }, font, image));
    assert.equal(await page.locator('.cover-overlay').count(), 0);
  }
});

test('enlarged cover keeps three lines, highlight spacing, and rejects overlong old copy instead of shrinking', async () => {
  await page.setContent(renderHtml(sample, { kind: 'cover' }, font, white, undefined, 'anchored')); await prepareAndValidate(page);
  assert.equal(await page.locator('.cover-line').count(), 3);
  assert.equal(await page.locator('.cover-title').evaluate(e => getComputedStyle(e).fontSize), '104px');
  const highlights = await page.locator('mark').evaluateAll(es => es.map(e => ({ text: e.textContent!, left: parseFloat((e as HTMLElement).style.getPropertyValue('--highlight-left')), right: parseFloat((e as HTMLElement).style.getPropertyValue('--highlight-right')) })));
  assert.ok(highlights.every(h => h.text === h.text.trim() && h.left <= 5 && h.right <= 7));
  await page.setContent(renderHtml(approved, { kind: 'cover' }, font, white, undefined, 'anchored'));
  await assert.rejects(prepareAndValidate(page), /Overflow|clipping/);
  await page.setContent(renderHtml(approved, { kind: 'cover' }, font)); await prepareAndValidate(page);
});

test('Daily INSIGHT headline enlarges while top and footer anchors remain fixed', async () => {
  const image = { kind: 'provided' as const, dataUrl: white };
  await page.setContent(renderHtml(sample, { kind: 'insight' }, font, white, image)); await prepareAndValidate(page);
  const before = await page.screenshot();
  await page.setContent(renderHtml(sample, { kind: 'insight' }, font, white, image, 'anchored')); await prepareAndValidate(page);
  assert.notDeepEqual(await page.screenshot(), before);
  assert.equal(await page.locator('.insight-title').evaluate(e => getComputedStyle(e).fontSize), '72px');
  for (const [selector, y] of [['.insight-label', 255], ['.insight-title', 344], ['.insight-footer', 899]] as const) assert.equal((await page.locator(selector).boundingBox())!.y, y);
  const long = structuredClone(sample); long.insight.headline = '판단 '.repeat(200); delete long.insight.headlineLines; long.insight.highlight = '판단';
  await page.setContent(renderHtml(long, { kind: 'insight' }, font, white, image, 'anchored'));
  await assert.rejects(prepareAndValidate(page), /Overflow|clipping|overlap/i);
});
