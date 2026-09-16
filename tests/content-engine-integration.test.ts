import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir, mkdtemp, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { createDraft, createPrompt } from '../src/content-engine/generator.js';
import { generate, projectRoot } from '../src/renderer/render.js';
import { contentSchema } from '../src/schema/content.js';
import { MockContentProvider } from '../src/providers/mock-provider.js';

test('research → draft → unchanged renderer yields the exact approved content and PNGs', async () => {
  await mkdir(path.join(projectRoot, 'output/.tests'), { recursive: true });
  const root = await mkdtemp(path.join(projectRoot, 'output/.tests/engine-'));
  const input = path.join(projectRoot, 'research/fixtures/information-and-judgment.json');
  const now = new Date('2026-09-16T06:00:00Z');
  try {
    const draft = await createDraft(input, { draftsRoot: path.join(root, 'drafts'), now });
    assert.equal(draft.report.validation.result, 'passed');
    assert.equal(draft.report.validation.layout.reports.length, 8);
    assert.deepEqual((await readdir(draft.directory)).sort(), ['carousel.json', 'generation-report.json', 'prompt.txt', 'sources.json']);
    const c = contentSchema.parse(JSON.parse(await readFile(draft.contentFile, 'utf8')));
    const original = JSON.parse(await readFile(path.join(projectRoot, 'content/sample-insight.json'), 'utf8'));
    assert.deepEqual(c, original);
    const sources = JSON.parse(await readFile(path.join(draft.directory, 'sources.json'), 'utf8'));
    assert.equal(sources.pageSourceRefs.body.length, 5);
    assert.ok(sources.pageSourceRefs.summary.sourceRefs.length > 0);
    assert.ok(sources.claims.length > 25);
    const rendered = await generate(draft.contentFile, { outputRoot: path.join(root, 'rendered'), date: '2026-09-16' });
    const baseline = await generate(path.join(projectRoot, 'content/sample-insight.json'), { outputRoot: path.join(root, 'baseline'), date: '2026-09-16' });
    for (const name of (await readdir(rendered.directory)).filter(n => n.endsWith('.png'))) {
      const actual = await readFile(path.join(rendered.directory, name));
      assert.deepEqual(actual, await readFile(path.join(baseline.directory, name)), `Regression: ${name}`);
      if (/^\d/.test(name)) { const meta = await sharp(actual).metadata(); assert.equal(meta.width, 1080); assert.equal(meta.height, 1350); }
    }
    const before = await readFile(draft.contentFile);
    const provider = new MockContentProvider();
    await assert.rejects(createDraft(input, { draftsRoot: path.join(root, 'drafts'), now, provider: { name: 'bad', async generateCarousel(request) {
      const output = await provider.generateCarousel(request);
      output.carousel.body[0].highlight = '없는 구절';
      return output;
    } } }), /CONTENT_SCHEMA/);
    assert.deepEqual(await readFile(draft.contentFile), before);
    const layoutProvider = { name: 'overflow', async generateCarousel(request: Parameters<MockContentProvider['generateCarousel']>[0]) {
      const output = await provider.generateCarousel(request);
      const text = '정보 ' + 'W'.repeat(24);
      output.carousel.body[0].title = text; output.carousel.body[0].highlight = '정보';
      const claim = output.claims.find(c => c.path === 'body.0.title')!; claim.text = text;
      return output;
    } };
    await assert.rejects(createDraft(input, { draftsRoot: path.join(root, 'drafts'), now, provider: layoutProvider }), /LAYOUT_VALIDATION/);
    assert.deepEqual(await readFile(draft.contentFile), before);
    const promptBefore = await readFile(path.join(draft.directory, 'prompt.txt'));
    const prompt = await createPrompt(input, { draftsRoot: path.join(root, 'drafts'), now });
    assert.ok(prompt.promptFile.endsWith('prompt-only' + path.sep + 'prompt.txt'));
    assert.deepEqual(await readFile(path.join(draft.directory, 'prompt.txt')), promptBefore);
    const manifest = JSON.parse((await readFile(path.join(projectRoot, 'references/v6/manifest.json'), 'utf8')).replace(/^\uFEFF/, ''));
    for (const item of manifest) assert.equal(createHash('sha256').update(await readFile(path.join(projectRoot, 'references/v6', item.file))).digest('hex'), item.sha256);
  } finally { await rm(root, { recursive: true, force: true }); }
});
