import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';
import { runDaily, resolveCover, parseDailyArgs, exists } from '../src/daily/runner.js';
import { projectRoot, seoulDate, generate } from '../src/renderer/render.js';

const sample = JSON.parse(await readFile(path.join(projectRoot, 'content/sample-insight.json'), 'utf8'));
const exec = promisify(execFile);
const quiet = () => {};
async function isolated(fn: (root: string) => Promise<void>) {
  const root = await mkdtemp(path.join(tmpdir(), 'urinsight-daily-'));
  try { await fn(root); } finally { await rm(root, { recursive: true, force: true }); }
}
async function pack(root: string, name = sample.slug, content = sample) {
  const dir = path.join(root, 'inbox', name); await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'carousel.json'), JSON.stringify(content)); return dir;
}
async function image(dir: string, name: string) {
  await sharp({ create: { width: 20, height: 20, channels: 3, background: '#123456' } }).toFile(path.join(dir, name));
}

test('daily empty inbox creates nothing', async () => isolated(async root => {
  assert.equal((await runDaily({ root, log: quiet })).results.length, 0); assert.deepEqual(await readdir(root), []);
}));
for (const mode of ['missing', 'invalid-json', 'invalid-schema', 'unsafe-slug', 'bad-highlight', 'bad-count']) {
  test(`daily rejects ${mode}, preserves inbox and creates no final output`, async () => isolated(async root => {
    const dir = await pack(root);
    if (mode === 'missing') await rm(path.join(dir, 'carousel.json'));
    else if (mode === 'invalid-json') await writeFile(path.join(dir, 'carousel.json'), '{');
    else {
      const c = structuredClone(sample);
      if (mode === 'invalid-schema') c.category = 'invalid';
      if (mode === 'unsafe-slug') c.slug = '../outside';
      if (mode === 'bad-highlight') c.body[0].highlight = '없는단어';
      if (mode === 'bad-count') c.body.pop();
      await writeFile(path.join(dir, 'carousel.json'), JSON.stringify(c));
    }
    assert.equal((await runDaily({ root, log: quiet })).failed, 1);
    assert.ok(await exists(dir)); assert.ok(!await exists(path.join(root, 'output')));
  }));
}
for (const ext of ['jpg', 'jpeg', 'png', 'webp']) test(`daily auto detects and decodes ${ext}`, async () => isolated(async root => {
  const dir = await pack(root); await image(dir, `cover.${ext}`);
  assert.equal((await resolveCover(dir)).status, 'auto-detected');
}));
test('cover precedence, missing fallback, placeholder, multiple, corrupt, URL and extension rules', async () => isolated(async root => {
  const dir = await pack(root);
  assert.equal((await resolveCover(dir)).status, 'placeholder');
  assert.match((await resolveCover(dir)).warnings[0], /placeholder/);
  await image(dir, 'cover.png'); await image(dir, 'chosen.jpg');
  assert.equal((await resolveCover(dir, 'chosen.jpg')).status, 'provided');
  assert.equal((await resolveCover(dir, 'missing.jpg')).status, 'auto-detected');
  await assert.rejects(resolveCover(dir, 'https://example.com/cover.png'), /local/);
  await assert.rejects(resolveCover(dir, '\\\\server\\cover.png'), /local/);
  await writeFile(path.join(dir, 'bad.txt'), 'not image');
  await assert.rejects(resolveCover(dir, 'bad.txt'), /extension/);
  await writeFile(path.join(dir, 'cover.png'), 'not image');
  await assert.rejects(resolveCover(dir));
  await image(dir, 'cover.jpg');
  await assert.rejects(resolveCover(dir, 'chosen.jpg'), /Multiple/);
}));
test('dry-run validates multiple packages, creates and moves nothing, and warns about mismatches', async () => isolated(async root => {
  const dir = await pack(root, 'different-name'); const before = await readFile(path.join(dir, 'carousel.json'));
  const logs: string[] = [];
  const result = await runDaily({ root, dryRun: true, only: 'different-name', log: s => logs.push(s) });
  assert.equal(result.results[0].status, 'ready');
  assert.ok(logs.some(s => s.includes('differs from slug')));
  assert.deepEqual(await readdir(root), ['inbox']);
  assert.deepEqual(await readFile(path.join(dir, 'carousel.json')), before);
  assert.equal((await runDaily({ root, dryRun: true, only: 'absent', log: quiet })).failed, 1);
}));
test('existing output and processed are never overwritten even during dry-run', async () => isolated(async root => {
  await pack(root);
  for (const folder of ['output', 'processed']) {
    const target = path.join(root, folder, seoulDate(), sample.slug); await mkdir(target, { recursive: true });
    await writeFile(path.join(target, 'keep'), 'unchanged');
    for (const dryRun of [true, false]) {
      const result = await runDaily({ root, dryRun, log: quiet }); assert.equal(result.failed, 1);
      assert.match(result.results[0].error!, new RegExp(`ERROR_EXISTING_${folder.toUpperCase()}`));
      assert.equal(await readFile(path.join(target, 'keep'), 'utf8'), 'unchanged');
    }
    await rm(target, { recursive: true });
  }
}));
test('CLI options validate -- separator, --only and unknown flags', () => {
  assert.deepEqual(parseDailyArgs(['--', '--dry-run', '--only', 'test']), { dryRun: true, only: 'test' });
  for (const args of [['--only'], ['--force'], ['--only', '../x'], ['--dry-run', '--dry-run']]) assert.throws(() => parseDailyArgs(args));
});
test('exclusive daily lock protects overlapping runs', async () => isolated(async root => {
  await pack(root); await mkdir(path.join(root, '.tmp', 'daily.lock'), { recursive: true });
  await assert.rejects(runDaily({ root, log: quiet }), /holds/);
  assert.ok(await exists(path.join(root, '.tmp', 'daily.lock')));
}));
test('render failure cleans temp, keeps inbox, continues to success; sources and original input survive', async () => isolated(async root => {
  const bad = structuredClone(sample); bad.cover.titleLines[0] += ' 넘치는 제목'.repeat(30);
  await pack(root, 'a-bad', bad);
  const good = await pack(root, 'z-good');
  const original = await readFile(path.join(good, 'carousel.json'));
  await writeFile(path.join(good, 'sources.md'), '\uFEFF# 원본\r\n');
  await writeFile(path.join(good, 'sources.json'), '{ "note" : "original" }\r\n');
  const result = await runDaily({ root, log: quiet });
  assert.equal(result.failed, 1); assert.deepEqual(result.results.map(r => r.status), ['failed', 'success']);
  assert.ok(await exists(path.join(root, 'inbox', 'a-bad'))); assert.ok(!await exists(good));
  const archive = path.join(root, 'processed', result.date, 'z-good'), out = result.results[1].output!;
  assert.deepEqual(await readFile(path.join(archive, 'carousel.json')), original);
  for (const source of ['sources.md', 'sources.json']) assert.deepEqual(await readFile(path.join(out, source)), await readFile(path.join(archive, source)));
  const manifest = JSON.parse(await readFile(path.join(out, 'manifest.json'), 'utf8'));
  assert.equal(manifest.pageCount, 8); assert.equal(manifest.cover.status, 'placeholder');
  assert.equal(manifest.outputs.length, 9); assert.deepEqual(await readdir(path.join(root, '.tmp')), []);
  // Legacy CLI remains available; Daily uses the opt-in anchored frame.
  const generatedSlug = `daily-regression-${path.basename(root).toLowerCase()}`;
  const c = structuredClone(sample); c.slug = generatedSlug;
  const file = path.join(root, 'generate.json'); await writeFile(file, JSON.stringify(c));
  const generated = path.join(projectRoot, 'output', seoulDate(), generatedSlug);
  try {
    const cli = await exec(process.execPath, [path.join(projectRoot, 'node_modules/tsx/dist/cli.mjs'), path.join(projectRoot, 'src/cli/generate.ts'), file], { cwd: root });
    assert.match(cli.stdout, /Generated 8/);
    for (const name of ['01_cover.png', '08_insight.png']) assert.deepEqual(await readFile(path.join(out, name)), await readFile(path.join(generated, name)));
    const anchored = await generate(file, { outputRoot: path.join(root, 'anchored'), contentLayout: 'anchored' });
    for (const name of manifest.outputs) assert.deepEqual(await readFile(path.join(out, name)), await readFile(path.join(anchored.directory, name)));
    assert.notDeepEqual(await readFile(path.join(out, '02_body.png')), await readFile(path.join(generated, '02_body.png')));
  } finally { await rm(generated, { recursive: true, force: true }); }
}));
for (const count of [9, 10]) test(`daily renders ${count} pages with detected cover without modifying JSON`, async () => isolated(async root => {
  const c = structuredClone(sample); c.body = Array.from({ length: count - 3 }, (_, i) => ({ ...sample.body[i % 5], number: i + 1 }));
  const dir = await pack(root, sample.slug, c); await image(dir, 'cover.png');
  const original = await readFile(path.join(dir, 'carousel.json'));
  const result = await runDaily({ root, log: quiet }); assert.equal(result.failed, 0);
  const out = result.results[0].output!;
  assert.ok(await exists(path.join(out, `${String(count).padStart(2, '0')}_insight.png`)));
  for (const name of (await readdir(out)).filter(n => /^\d/.test(n))) { const meta = await sharp(path.join(out, name)).metadata(); assert.equal(meta.width, 1080); assert.equal(meta.height, 1350); }
  assert.deepEqual(await readFile(path.join(root, 'processed', result.date, sample.slug, 'carousel.json')), original);
}));
test('v6 reference hashes remain identical to manifest', async () => {
  const dir = path.join(projectRoot, 'references/v6');
  const manifest = JSON.parse(await readFile(path.join(dir, 'manifest.json'), 'utf8'));
  for (const entry of manifest) assert.equal(createHash('sha256').update(await readFile(path.join(dir, entry.file))).digest('hex'), entry.sha256);
});
