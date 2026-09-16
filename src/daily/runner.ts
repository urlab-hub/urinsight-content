import { lstat, readdir, readFile, mkdir, mkdtemp, writeFile, copyFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { contentSchema } from '../schema/content.js';
import { generate, seoulDate } from '../renderer/render.js';
import { LocalCoverImageProvider } from '../renderer/cover-image.js';
import { ZodError } from 'zod';
import type { InsightImage } from '../renderer/template.js';

export interface DailyOptions { root: string; dryRun?: boolean; only?: string; log?: (message: string) => void }
export interface PackageResult { name: string; status: 'success' | 'failed' | 'ready'; output?: string; error?: string }
export async function exists(file: string) {
  try { await lstat(file); return true; } catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return false; throw e; }
}
async function regular(file: string, directory = false) {
  const stat = await lstat(file);
  if (stat.isSymbolicLink() || (directory ? !stat.isDirectory() : !stat.isFile())) throw new Error(`Not a regular ${directory ? 'directory' : 'file'}: ${file}`);
}
// Reject network paths and linked ancestors before reading any input or moving folders.
async function localPath(file: string) {
  if (/^(?:[\\/]{2}|[a-z][a-z0-9+.-]*:)/i.test(file) && !/^[a-z]:[\\/]/i.test(file)) throw new Error('Only local filesystem paths are supported');
  let cursor = path.resolve(file);
  while (true) {
    if (await exists(cursor) && (await lstat(cursor)).isSymbolicLink()) throw new Error(`Linked paths are unsupported: ${cursor}`);
    const parent = path.dirname(cursor); if (parent === cursor) break; cursor = parent;
  }
}
function safeName(name: string) {
  if (!name || name === '.' || name === '..' || /[\\/:\x00-\x1f]/.test(name)) throw new Error('Invalid package name');
}
export function parseDailyArgs(args: string[]) {
  const result: { dryRun?: boolean; only?: string } = {};
  const values = args[0] === '--' ? args.slice(1) : args;
  for (let i = 0; i < values.length; i++) {
    if (values[i] === '--dry-run' && !result.dryRun) result.dryRun = true;
    else if (values[i] === '--only' && !result.only) { const name = values[++i]; if (!name || name.startsWith('--')) throw new Error('--only requires a package name'); safeName(name); result.only = name; }
    else throw new Error(`Unknown or duplicate option: ${values[i]}`);
  }
  return result;
}
export async function resolveCover(packageDir: string, provided?: string) {
  const names = (await readdir(packageDir)).filter(n => /^cover\.(jpg|jpeg|png|webp)$/i.test(n));
  if (names.length > 1) throw new Error('Multiple cover images: keep exactly one cover file');
  let file: string | undefined;
  const warnings: string[] = [];
  let status: 'provided' | 'auto-detected' | 'placeholder' = 'placeholder';
  if (provided) {
    await localPath(provided);
    const candidate = path.resolve(packageDir, provided);
    await localPath(candidate);
    if (await exists(candidate)) { file = candidate; status = 'provided'; }
    else warnings.push(`cover.image not found: ${provided}; trying package cover`);
  }
  if (!file && names.length) { file = path.join(packageDir, names[0]); status = 'auto-detected'; }
  let image: string | undefined;
  if (file) {
    await localPath(file); await regular(file);
    if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) throw new Error('Unsupported cover extension');
    image = await new LocalCoverImageProvider().resolve(file, packageDir);
  } else warnings.push('Cover missing: using renderer placeholder');
  return { status, source: file ?? null, image, warnings };
}
export async function resolveInsight(packageDir: string, cover: Awaited<ReturnType<typeof resolveCover>>) {
  const names = (await readdir(packageDir)).filter(n => /^insight\.(jpg|jpeg|png|webp)$/i.test(n));
  if (names.length > 1) throw new Error('Multiple insight images: keep exactly one insight file');
  let source: string | null = null;
  let runtime: InsightImage;
  const warnings: string[] = [];
  if (names.length) {
    source = path.join(packageDir, names[0]);
    await localPath(source); await regular(source);
    const dataUrl = await new LocalCoverImageProvider().resolve(source, packageDir);
    runtime = { kind: 'provided', dataUrl: dataUrl! };
  } else if (cover.image) {
    source = cover.source;
    runtime = { kind: 'cover-fallback', dataUrl: cover.image };
    warnings.push('Insight missing: using cover image with alternate framing; emergency fallback requires quality review');
  } else {
    runtime = { kind: 'placeholder-fallback' };
    warnings.push('QUALITY REVIEW REQUIRED: Insight missing: using placeholder fallback; supply a real image before publishing');
  }
  return { status: runtime.kind, source, runtime, warnings, requiresQualityReview: runtime.kind !== 'provided' };
}
export async function runDaily(options: DailyOptions) {
  const root = path.resolve(options.root), date = seoulDate(), log = options.log ?? console.log;
  await localPath(root);
  const inbox = path.join(root, 'inbox'), output = path.join(root, 'output', date), processed = path.join(root, 'processed', date);
  for (const p of [inbox, output, processed, path.join(root, '.tmp')]) await localPath(p);
  log(`URINSIGHT DAILY\nDate: ${date}${options.dryRun ? '\nDRY RUN (no files changed; layout checked during rendering)' : ''}`);
  let names: string[] = [];
  if (options.only) { safeName(options.only); names = [options.only]; }
  else if (await exists(inbox)) names = (await readdir(inbox, { withFileTypes: true })).filter(e => e.isDirectory() || e.isSymbolicLink()).map(e => e.name).sort();
  log(`Found: ${names.length} packages`);
  const results: PackageResult[] = [];
  const lock = path.join(root, '.tmp', 'daily.lock');
  let locked = false;
  try {
    if (!options.dryRun && names.length) {
      await mkdir(path.dirname(lock), { recursive: true });
      try { await mkdir(lock); locked = true; } catch (e) { if ((e as NodeJS.ErrnoException).code === 'EEXIST') throw new Error('Another daily run or interrupted run holds .tmp/daily.lock; check before removing the lock'); throw e; }
    }
    for (const [index, name] of names.entries()) {
      log(`\n[${index + 1}/${names.length}] ${name}`);
      let temp: string | undefined;
      try {
        safeName(name);
        const input = path.join(inbox, name);
        await localPath(input); await regular(input, true);
        const json = path.join(input, 'carousel.json'); await regular(json);
        const content = contentSchema.parse(JSON.parse((await readFile(json, 'utf8')).replace(/^\uFEFF/, '')));
        log('✓ carousel.json valid');
        if (name !== content.slug) log(`! Package name differs from slug: ${content.slug}`);
        const cover = await resolveCover(input, content.cover.image);
        cover.warnings.forEach(w => log(`! ${w}`)); log(`✓ Cover: ${cover.source ?? 'placeholder'}`);
        const insight = await resolveInsight(input, cover);
        insight.warnings.forEach(w => log(`! ${w}`));
        log(`✓ Insight: ${insight.source ?? 'placeholder'} (${insight.status})`);
        const target = path.join(output, content.slug), archive = path.join(processed, name);
        if (await exists(target)) throw new Error(`ERROR_EXISTING_OUTPUT: ${target}`);
        if (await exists(archive)) throw new Error(`ERROR_EXISTING_PROCESSED: ${archive}`);
        const sources: string[] = [];
        for (const source of ['sources.md', 'sources.json']) if (await exists(path.join(input, source))) { await regular(path.join(input, source)); sources.push(source); }
        if (options.dryRun) { log(`✓ Ready: ${content.body.length + 3} pages → ${target}`); results.push({ name, status: 'ready', output: target }); continue; }
        temp = await mkdtemp(path.join(root, '.tmp', 'daily-'));
        // An ephemeral copy and cached local image keep the original JSON untouched.
        const runtimeFile = path.join(temp, 'carousel.json');
        await writeFile(runtimeFile, JSON.stringify(content));
        log(`✓ Rendering ${content.body.length + 3} pages`);
        const rendered = await generate(runtimeFile, { outputRoot: path.join(temp, 'render'), date, provider: { resolve: async () => cover.image }, insightImage: insight.runtime });
        log('✓ Contact sheet created');
        for (const source of sources) await copyFile(path.join(input, source), path.join(rendered.directory, source));
        if (sources.length) log('✓ Sources copied');
        const outputs = (await readdir(rendered.directory)).filter(n => n.endsWith('.png')).sort();
        await writeFile(path.join(rendered.directory, 'manifest.json'), JSON.stringify({ slug: content.slug, category: content.category, pageCount: rendered.pages, processedAt: new Date().toISOString(), inputPackage: name, cover: { status: cover.status, source: cover.source }, insight: { status: insight.status, source: insight.source, requiresQualityReview: insight.requiresQualityReview }, outputs, sources: { markdown: sources.includes('sources.md'), json: sources.includes('sources.json') } }, null, 2) + '\n');
        await mkdir(output, { recursive: true }); await mkdir(processed, { recursive: true });
        // Recheck under the exclusive runner lock immediately before publishing.
        if (await exists(target)) throw new Error(`ERROR_EXISTING_OUTPUT: ${target}`);
        if (await exists(archive)) throw new Error(`ERROR_EXISTING_PROCESSED: ${archive}`);
        await rename(rendered.directory, target);
        try { await rename(input, archive); } catch (e) { await rename(target, rendered.directory); throw e; }
        log('✓ Output complete\n✓ Moved to processed');
        results.push({ name, status: 'success', output: target });
      } catch (e) {
        const error = e instanceof ZodError ? `Invalid carousel\n${e.issues.map(issue => `  ${issue.path.join('.')}: ${issue.message}`).join('\n')}` : e instanceof Error ? e.message : String(e);
        log(`✗ ${error}`); results.push({ name, status: 'failed', error });
      } finally { if (temp) await rm(temp, { recursive: true, force: true }); }
    }
  } finally { if (locked) await rm(lock, { recursive: true }); }
  const failed = results.filter(r => r.status === 'failed').length;
  log(`\nRESULT\nSuccess: ${results.filter(r => r.status === 'success').length}\nFailed: ${failed}\nSkipped: 0\nReady (dry-run): ${results.filter(r => r.status === 'ready').length}\nOutput:\n${output}`);
  return { results, failed, date };
}
