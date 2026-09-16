import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir, mkdtemp, writeFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { launchBrowser } from '../src/renderer/browser.js';
import sharp from 'sharp';
import { contentSchema } from '../src/schema/content.js';
import { renderHtml } from '../src/renderer/template.js';
import { prepareAndValidate } from '../src/renderer/validate.js';
import { generate, projectRoot } from '../src/renderer/render.js';
import { LocalCoverImageProvider } from '../src/renderer/cover-image.js';

const sample = JSON.parse(await readFile(path.join(projectRoot, 'content/sample-insight.json'), 'utf8'));
test('browser rejects long titles, long copy, and overlapping summary regions', async () => {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
    const font = (await readFile(path.join(projectRoot, 'node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2'))).toString('base64');
    for (const kind of ['title', 'copy', 'summary'] as const) {
      const c = structuredClone(sample);
      if (kind === 'title') c.body[0].title += ' 매우 긴 소제목'.repeat(20);
      if (kind === 'copy') { delete c.body[0].paragraphLines; c.body[0].paragraphs = ['넘치는 본문입니다. '.repeat(200)]; }
      if (kind === 'summary') { delete c.summary.headlineLines; c.summary.headline += ' 긴 제목'.repeat(20); }
      await page.setContent(renderHtml(contentSchema.parse(c), kind === 'summary' ? { kind: 'summary' } : { kind: 'body', index: 0 }, font));
      await assert.rejects(prepareAndValidate(page), /Overflow|Outside canvas|overlap|clipping/);
    }
    await page.setContent(renderHtml(contentSchema.parse(sample), { kind: 'body', index: 0 }, font));
    await prepareAndValidate(page);
    const highlight = await page.locator('mark').evaluate(el => ({ text: el.textContent, width: parseFloat((el as HTMLElement).style.getPropertyValue('--ink-width')), box: el.getBoundingClientRect().width }));
    assert.equal(highlight.text, '싸지고');
    assert.ok(highlight.width > 0 && highlight.width <= highlight.box + 2);
  } finally { await browser.close(); }
});
test('9/10-page renders, local cover image, and failed render preserves previous output', async () => {
  const testRoot = path.join(projectRoot, 'output', '.tests');
  await mkdir(testRoot, { recursive: true });
  const dir = await mkdtemp(path.join(testRoot, 'render-'));
  try {
    await sharp({ create: { width: 1080, height: 1350, channels: 3, background: '#263344' } }).png().toFile(path.join(dir, 'cover.png'));
    const file = path.join(dir, 'input.json');
    for (const count of [6, 7]) {
      const c = structuredClone(sample);
      c.category = count === 6 ? 'business' : 'money';
      c.body = Array.from({ length: count }, (_, i) => ({ ...sample.body[i % 5], number: i + 1 }));
      c.cover.image = './cover.png';
      await writeFile(file, JSON.stringify(c));
      const result = await generate(file, { outputRoot: dir, date: '2026-09-16' });
      assert.equal(result.pages, count + 3);
      assert.equal(result.placeholder, false);
      const names = await readdir(result.directory);
      assert.ok(names.includes(`${String(count + 3).padStart(2, '0')}_insight.png`));
      const prior = await readFile(path.join(result.directory, '01_cover.png'));
      c.cover.titleLines[0] += ' 넘치는 제목'.repeat(30);
      await writeFile(file, JSON.stringify(c));
      await assert.rejects(generate(file, { outputRoot: dir, date: '2026-09-16' }), /Overflow|clipping/);
      assert.deepEqual(await readFile(path.join(result.directory, '01_cover.png')), prior);
      assert.ok(!(await readdir(path.join(dir, '2026-09-16'))).some(name => name.startsWith('.')));
    }
    await assert.rejects(new LocalCoverImageProvider().resolve('./missing.png', dir), /ENOENT/);
    await assert.rejects(new LocalCoverImageProvider().resolve('https://example.com/a.jpg', dir), /local file/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
