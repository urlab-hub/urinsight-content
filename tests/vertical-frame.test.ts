import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Browser, Page } from 'playwright';
import { launchBrowser } from '../src/renderer/browser.js';
import { projectRoot } from '../src/renderer/render.js';
import { renderHtml, type Slide } from '../src/renderer/template.js';
import { prepareAndValidate } from '../src/renderer/validate.js';
import { contentSchema, type CarouselContent } from '../src/schema/content.js';
import { tokens } from '../src/config/tokens.js';
import { verticalFixture, summaryHeadlineFixture } from './fixtures/vertical-frame.js';

const sample = contentSchema.parse(JSON.parse(await readFile(path.join(projectRoot, 'content/sample-insight.json'), 'utf8')));
const font = (await readFile(path.join(projectRoot, 'node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2'))).toString('base64');
let browser: Browser, page: Page;
before(async () => { browser = await launchBrowser(); page = await browser.newPage({ viewport: tokens.canvas }); await page.route('**/*', r => r.abort()); });
after(async () => { await browser?.close(); });
async function load(c: CarouselContent, slide: Slide, anchored = true) {
  await page.setContent(renderHtml(contentSchema.parse(c), slide, font, undefined, undefined, anchored ? 'anchored' : 'legacy'));
  return prepareAndValidate(page);
}

for (const kind of ['body', 'summary'] as const) for (const length of ['short', 'long'] as const) for (const lines of [1, 2] as const) {
  test(`${kind}: ${length} paragraphs, ${lines}-line emphasis maintains fixed frame`, async () => {
    const c = verticalFixture(sample, kind, length, lines);
    const report = await load(c, kind === 'body' ? { kind, index: 0 } : { kind });
    const fit = report.contentFit!;
    assert.equal(fit.emphasisBottomY, tokens.content.emphasisBottomY);
    assert.equal(fit.keyLines, lines);
    assert.ok(fit.currentHeight <= fit.allowedHeight);
    assert.equal(fit.allowedHeight, tokens.content.emphasisBottomY - lines * tokens.body.keyLine - (kind === 'body' ? tokens.body.keyGap : tokens.summary.keyGap) - fit.contentStartY);
    assert.equal((await page.locator(`.${kind}-title`).boundingBox())!.y, tokens[kind].titleTop);
    const label = (await page.locator(kind === 'body' ? '.body-brand' : '.summary-label').boundingBox())!;
    assert.equal(label.y, kind === 'body' ? tokens.body.brandTop : tokens.insight.labelTop);
    if (kind === 'summary') assert.equal(label.x, tokens.layout.left);
  });
}

test('all BODY pages share top anchors and BODY/SUMMARY share bottom; v6 summary supplies baseline', async () => {
  await load(sample, { kind: 'summary' }, false);
  const original = (await page.locator('.summary-key').boundingBox())!;
  assert.equal(original.y + original.height, tokens.content.emphasisBottomY);
  for (let index = 0; index < sample.body.length; index++) {
    const fit = (await load(sample, { kind: 'body', index })).contentFit!;
    assert.equal(fit.emphasisBottomY, original.y + original.height);
    assert.equal((await page.locator('.body-title').boundingBox())!.y, tokens.body.titleTop);
    const brand = (await page.locator('.body-brand').boundingBox())!;
    assert.equal(brand.y, tokens.body.brandTop);
    assert.equal(fit.contentStartY, 504);
    assert.equal(fit.titleToBodyGap, 57);
    assert.equal(brand.x + brand.width, tokens.canvas.width - tokens.layout.right);
  }
});

for (const count of [1, 2, 3] as const) test(`SUMMARY ${count}-line headline: shared 57px gap and unchanged anchors`, async () => {
  const c = summaryHeadlineFixture(sample, count);
  const fit = (await load(c, { kind: 'summary' })).contentFit!;
  const title = (await page.locator('.summary-title').boundingBox())!;
  assert.equal(title.y, 394); assert.equal(title.height, count * 64);
  assert.equal(fit.contentStartY, [515, 579, 643][count - 1]);
  assert.equal(fit.contentStartY - title.y - title.height, tokens.content.titleToBodyGap);
  assert.equal(fit.titleToBodyGap, 57);
  assert.equal(fit.emphasisBottomY, 1103);
  const label = (await page.locator('.summary-label').boundingBox())!;
  assert.equal(label.y, 255); assert.equal(label.x, 110);
});

test('SUMMARY measures CSS-wrapped headline after font loading without authored lines', async () => {
  const c = summaryHeadlineFixture(sample, 3); delete c.summary.headlineLines;
  const fit = (await load(c, { kind: 'summary' })).contentFit!;
  const title = (await page.locator('.summary-title').boundingBox())!;
  assert.ok(title.height > 64);
  assert.equal(fit.contentStartY, title.y + title.height + 57);
  assert.equal(fit.emphasisBottomY, 1103);
});

test('SUMMARY taller headline reduces available area and rejects previously fitting explanation', async () => {
  const c = summaryHeadlineFixture(sample, 1);
  c.summary.paragraphLines = [Array(4).fill('필요한 조건을 먼저 정한다.'), Array(3).fill('남은 선택지를 자세히 살펴본다.')];
  c.summary.paragraphs = c.summary.paragraphLines.map(lines => lines.join(' '));
  assert.equal((await load(c, { kind: 'summary' })).contentFit!.currentHeight, 355);
  const three = summaryHeadlineFixture(sample, 3).summary;
  c.summary.headline = three.headline; c.summary.headlineLines = three.headlineLines;
  await assert.rejects(load(c, { kind: 'summary' }), /SUMMARY_CONTENT_OVERFLOW page=7 region=paragraphs currentHeight=355px allowedHeight=337px/);
});

for (const kind of ['body', 'summary'] as const) for (const region of ['paragraphs', 'keySentence', 'headline'] as const) {
  test(`${kind} rejects ${region} overflow with page and measured limits`, async () => {
    const c = verticalFixture(sample, kind, 'long', 2);
    const p = kind === 'body' ? c.body[0] : c.summary;
    if (region === 'paragraphs') { p.paragraphs = ['불필요한 설명이 계속 늘어난다. '.repeat(60).trim()]; delete p.paragraphLines; }
    if (region === 'keySentence') {
      p.keySentence = '선택의 기준 ' + '강조 문장이 너무 길다. '.repeat(20).trim();
      if (kind === 'body') delete c.body[0].keySentenceLines;
    }
    if (region === 'headline') {
      if (kind === 'body') c.body[0].title += ' 너무 긴 제목'.repeat(20);
      else { c.summary.headline += ' 너무 긴 제목'.repeat(30); delete c.summary.headlineLines; }
    }
    await assert.rejects(load(c, kind === 'body' ? { kind, index: 0 } : { kind }), kind === 'body' && region === 'headline' ? /Overflow|clipping/ : new RegExp(`${kind.toUpperCase()}_CONTENT_OVERFLOW page=\\d+ region=${region} currentHeight=.*allowedHeight=`));
  });
}

test('legacy default equals explicit legacy on all approved pages; protected COVER/INSIGHT ignore frame mode', async () => {
  const slides: Slide[] = [{ kind: 'cover' }, ...sample.body.map((_, index) => ({ kind: 'body' as const, index })), { kind: 'summary' }, { kind: 'insight' }];
  for (const slide of slides) {
    assert.equal(renderHtml(sample, slide, font), renderHtml(sample, slide, font, undefined, undefined, 'legacy'));
    if (slide.kind === 'cover' || slide.kind === 'insight') assert.equal(renderHtml(sample, slide, font), renderHtml(sample, slide, font, undefined, undefined, 'anchored'));
  }
});
