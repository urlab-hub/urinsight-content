import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { resolveCover, resolveInsight, runDaily, exists } from '../src/daily/runner.js';
import { projectRoot, generate } from '../src/renderer/render.js';
import { launchBrowser } from '../src/renderer/browser.js';
import { renderHtml } from '../src/renderer/template.js';
import { prepareAndValidate } from '../src/renderer/validate.js';
import { contentSchema } from '../src/schema/content.js';

const sample = JSON.parse(await readFile(path.join(projectRoot, 'content/sample-insight.json'), 'utf8'));
async function fixture(run: (root: string, dir: string) => Promise<void>) {
  const root = await mkdtemp(path.join(tmpdir(), 'urinsight-image-'));
  const dir = path.join(root, 'inbox', sample.slug); await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'carousel.json'), JSON.stringify(sample));
  try { await run(root, dir); } finally { await rm(root, { recursive: true, force: true }); }
}
async function photo(dir: string, name: string, color = '#90a080') {
  await sharp({ create: { width: 120, height: 150, channels: 3, background: color } }).toFile(path.join(dir, name));
}
for (const ext of ['png', 'jpg', 'jpeg', 'webp']) test(`explicit insight.${ext} decode and dry-run without mutation`, async () => fixture(async (root, dir) => {
  await photo(dir, `insight.${ext}`); await photo(dir, 'cover.png', '#445566');
  const cover = await resolveCover(dir), insight = await resolveInsight(dir, cover);
  assert.equal(insight.status, 'provided'); assert.equal(insight.requiresQualityReview, false);
  assert.notEqual(insight.runtime.kind === 'provided' && insight.runtime.dataUrl, cover.image);
  const before = await readFile(path.join(dir, 'carousel.json')); const logs: string[] = [];
  assert.equal((await runDaily({ root, dryRun: true, log: s => logs.push(s) })).failed, 0);
  assert.ok(logs.some(s => s.includes(`insight.${ext} (provided)`)));
  assert.deepEqual(await readdir(root), ['inbox']); assert.deepEqual(await readFile(path.join(dir, 'carousel.json')), before);
}));
test('multiple and corrupt insight files fail both dry-run and real run without moving input', async () => fixture(async (root, dir) => {
  await photo(dir, 'insight.png'); await photo(dir, 'insight.jpg');
  for (const dryRun of [true, false]) {
    const result = await runDaily({ root, dryRun, log: () => {} });
    assert.equal(result.failed, 1); assert.match(result.results[0].error!, /Multiple insight/);
  }
  await rm(path.join(dir, 'insight.jpg')); await writeFile(path.join(dir, 'insight.png'), 'broken');
  for (const dryRun of [true, false]) assert.equal((await runDaily({ root, dryRun, log: () => {} })).failed, 1);
  assert.ok(await exists(dir)); assert.ok(!await exists(path.join(root, 'output')));
}));
for (const mode of ['provided', 'cover-fallback', 'placeholder-fallback'] as const) test(`daily ${mode}: manifest, source preservation and validated image-mode output`, async () => fixture(async (root, dir) => {
  if (mode !== 'placeholder-fallback') await photo(dir, 'cover.png', '#445566');
  if (mode === 'provided') await photo(dir, 'insight.png');
  const original = new Map(await Promise.all((await readdir(dir)).map(async name => [name, await readFile(path.join(dir, name))] as const)));
  const cover = await resolveCover(dir), insight = await resolveInsight(dir, cover);
  assert.equal(insight.status, mode); assert.equal(insight.requiresQualityReview, mode !== 'provided');
  if (mode !== 'provided') assert.ok(insight.warnings.length);
  const result = await runDaily({ root, log: () => {} }); assert.equal(result.failed, 0);
  const out = result.results[0].output!, archive = path.join(root, 'processed', result.date, sample.slug);
  for (const [name, bytes] of original) assert.deepEqual(await readFile(path.join(archive, name)), bytes);
  const manifest = JSON.parse(await readFile(path.join(out, 'manifest.json'), 'utf8'));
  assert.equal(manifest.insight.status, mode); assert.equal(manifest.insight.requiresQualityReview, mode !== 'provided');
  assert.ok(!await exists(path.join(out, 'insight.png')));
  const meta = await sharp(path.join(out, '08_insight.png')).metadata(); assert.equal(meta.width, 1080); assert.equal(meta.height, 1350);
  const legacyFile = path.join(root, 'legacy.json'); await writeFile(legacyFile, JSON.stringify(sample));
  const legacy = await generate(legacyFile, { outputRoot: path.join(root, 'legacy'), provider: { resolve: async () => cover.image } });
  for (let i = 1; i <= 7; i++) {
    const name = `${String(i).padStart(2, '0')}_${i === 1 ? 'cover' : i === 7 ? 'summary' : 'body'}.png`;
    assert.deepEqual(await readFile(path.join(out, name)), await readFile(path.join(legacy.directory, name)));
  }
  if (mode !== 'placeholder-fallback') assert.notDeepEqual(await readFile(path.join(out, '08_insight.png')), await readFile(path.join(legacy.directory, '08_insight.png')));
  else assert.deepEqual(await readFile(path.join(out, '08_insight.png')), await readFile(path.join(legacy.directory, '08_insight.png')));
}));
test('INSIGHT visual layer preserves brand text geometry and highlight padding; fallback is reframed', async () => fixture(async (_root, dir) => {
  await photo(dir, 'cover.png'); const cover = await resolveCover(dir); const insight = await resolveInsight(dir, cover);
  const font = (await readFile(path.join(projectRoot, 'node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2'))).toString('base64');
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } }); await page.route('**/*', r => r.abort());
    const c = contentSchema.parse(sample); await page.setContent(renderHtml(c, { kind: 'insight' }, font)); await prepareAndValidate(page);
    const legacy = await page.locator('[data-check], mark').evaluateAll(es => es.map(e => ({ text: e.textContent, rect: e.getBoundingClientRect().toJSON() })));
    await page.setContent(renderHtml(c, { kind: 'insight' }, font, undefined, insight.runtime)); await prepareAndValidate(page);
    assert.deepEqual(await page.locator('[data-check], mark').evaluateAll(es => es.map(e => ({ text: e.textContent, rect: e.getBoundingClientRect().toJSON() }))), legacy);
    assert.equal(await page.locator('[data-insight-mode="cover-fallback"]').count(), 1);
    assert.notEqual(await page.locator('.insight-image').evaluate(e => getComputedStyle(e).transform), 'none');
    assert.equal(await page.locator('.insight-overlay').evaluate(e => getComputedStyle(e).backgroundColor), 'rgba(0, 0, 0, 0.65)');
  } finally { await browser.close(); }
}));
