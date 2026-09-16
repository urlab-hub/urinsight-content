import { readFile, mkdir, mkdtemp, writeFile, rename, rm, access } from 'node:fs/promises';
import path from 'node:path';
import { normalizeResearch, fingerprintResearch } from '../research/normalize.js';
import { validateResearch } from '../research/validate.js';
import { classify } from './classify.js';
import { planCarousel } from './planner.js';
import { buildPrompt } from './prompt-builder.js';
import { filterTopic } from './filters.js';
import { providerOutputSchema, toRendererContent, validateGenerated, copyFields } from './validators.js';
import { assertValid, EngineValidationError, type ValidationIssue } from './types.js';
import { MockContentProvider } from '../providers/mock-provider.js';
import type { ContentProvider } from '../providers/content-provider.js';
import { validateCarouselLayout } from './layout-validation.js';
import { projectRoot, seoulDate } from '../renderer/render.js';

export async function prepareResearch(input: unknown, now = new Date()) {
  const research = normalizeResearch(input);
  const sources = validateResearch(research, now);
  assertValid(sources.issues);
  const filter = filterTopic([research.topic, research.angleHint, ...(research.outline ?? []).map(p => p.thesis)].filter(Boolean).join('\n'), JSON.stringify(research.sources));
  if (filter.status === 'blocked') throw new EngineValidationError([{ severity: 'error', code: 'BLOCKED_TOPIC', message: filter.reasons.join('; ') }]);
  const classification = classify(research);
  const plan = planCarousel(research, classification.category);
  const issues: ValidationIssue[] = [...sources.issues, ...classification.issues, ...plan.issues];
  if (filter.status === 'review') issues.push({ severity: 'warning', code: 'TOPIC_REVIEW', message: filter.reasons.join('; ') });
  return { research, classification, plan, filter, issues, prompt: await buildPrompt(research, plan) };
}

/** Atomic bundle replacement: failed generation never overwrites a successful draft. */
async function writeBundle(directory: string, files: Record<string, string>) {
  const parent = path.dirname(directory);
  await mkdir(parent, { recursive: true });
  const staging = await mkdtemp(path.join(parent, `.${path.basename(directory)}-`));
  const backup = `${staging}-previous`;
  let previous = false;
  try {
    for (const [name, value] of Object.entries(files)) await writeFile(path.join(staging, name), value, 'utf8');
    try { await access(directory); previous = true; } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    if (previous) await rename(directory, backup);
    try { await rename(staging, directory); } catch (error) { if (previous) await rename(backup, directory); throw error; }
    if (previous) await rm(backup, { recursive: true, force: true });
  } finally { await rm(staging, { recursive: true, force: true }); }
}
function destination(slug: string, now: Date, root?: string) {
  return path.resolve(root ?? path.join(projectRoot, 'drafts'), seoulDate(now), slug);
}
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n';
export async function createDraft(inputFile: string, options: { provider?: ContentProvider; draftsRoot?: string; now?: Date } = {}) {
  const now = options.now ?? new Date();
  const prepared = await prepareResearch(JSON.parse((await readFile(path.resolve(inputFile), 'utf8')).replace(/^\uFEFF/, '')), now);
  const provider = options.provider ?? new MockContentProvider();
  const response = await provider.generateCarousel({ research: prepared.research, plan: prepared.plan, prompt: prepared.prompt });
  const parsed = providerOutputSchema.safeParse(response);
  if (!parsed.success) throw new EngineValidationError([{ severity: 'error', code: 'PROVIDER_SCHEMA', message: parsed.error.message }]);
  const output = parsed.data;
  const validation = validateGenerated(output, prepared.research, prepared.plan.pageCount);
  if (output.carousel.category !== prepared.plan.category) validation.issues.push({ severity: 'error', code: 'CATEGORY_MISMATCH', message: 'Provider must follow the selected category' });
  if (output.carousel.slug !== prepared.plan.slug) validation.issues.push({ severity: 'error', code: 'SLUG_MISMATCH', message: 'Provider must follow the planned slug' });
  assertValid(validation.issues);
  const content = toRendererContent(output.carousel);
  let layout;
  try { layout = await validateCarouselLayout(content); }
  catch (error) { throw new EngineValidationError([{ severity: 'error', code: 'LAYOUT_VALIDATION', message: String(error) }]); }
  const issues = [...prepared.issues, ...validation.issues];
  const report = {
    selectedCategory: prepared.plan.category, selectedAngle: prepared.plan.angle, thesis: prepared.plan.thesis, pageCount: prepared.plan.pageCount,
    classification: prepared.classification, plan: prepared.plan, filter: prepared.filter,
    sourceWarnings: prepared.issues.filter(i => i.severity !== 'info'),
    factualGroundingWarnings: validation.issues,
    validation: { result: 'passed', requiresHumanReview: true, issues, layout },
    provider: provider.name, generationTimestamp: now.toISOString(), researchFingerprint: fingerprintResearch(prepared.research),
    copyFieldCount: copyFields(content).length,
    note: 'Input evidence alignment is checked; source truth and semantic entailment are not externally verified. Human editorial review is required.',
  };
  const sources = {
    version: 1, research: prepared.research,
    pageSourceRefs: {
      body: output.carousel.body.map(b => ({ number: b.number, sourceRefs: b.sourceRefs })),
      summary: { sourceRefs: output.carousel.summary.sourceRefs },
    },
    claims: output.claims,
  };
  const directory = destination(content.slug, now, options.draftsRoot);
  await writeBundle(directory, { 'carousel.json': json(content), 'generation-report.json': json(report), 'sources.json': json(sources), 'prompt.txt': prepared.prompt });
  return { directory, contentFile: path.join(directory, 'carousel.json'), content, report };
}
export async function createPrompt(inputFile: string, options: { draftsRoot?: string; now?: Date } = {}) {
  const now = options.now ?? new Date();
  const prepared = await prepareResearch(JSON.parse((await readFile(path.resolve(inputFile), 'utf8')).replace(/^\uFEFF/, '')), now);
  // Separate prompt-only directory prevents replacing the prompt attached to an existing draft.
  const directory = path.join(destination(prepared.plan.slug, now, options.draftsRoot), 'prompt-only');
  await writeBundle(directory, { 'prompt.txt': prepared.prompt, 'generation-report.json': json({ mode: 'prompt-only', provider: 'none', timestamp: now.toISOString(), plan: prepared.plan, filter: prepared.filter, issues: prepared.issues, researchFingerprint: fingerprintResearch(prepared.research) }) });
  return { directory, promptFile: path.join(directory, 'prompt.txt'), plan: prepared.plan };
}
