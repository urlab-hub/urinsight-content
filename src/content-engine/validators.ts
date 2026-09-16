import { z } from 'zod';
import { bodySchema, contentSchema, type CarouselContent } from '../schema/content.js';
import type { ResearchInput } from '../research/schema.js';
import { canonicalSourceUrl } from '../research/normalize.js';
import { filterTopic } from './filters.js';
import type { Claim, EngineCarousel, EvidenceRef, ProviderOutput, ValidationIssue, ValidationResult } from './types.js';

const refs = z.array(z.string().min(1)).min(1).refine(ids => new Set(ids).size === ids.length, 'Duplicate sourceRefs');
export const engineCarouselSchema = z.object({
  category: contentSchema.shape.category, slug: contentSchema.shape.slug,
  cover: contentSchema.shape.cover,
  body: z.array(bodySchema.extend({ sourceRefs: refs })).min(5).max(7),
  summary: contentSchema.shape.summary.extend({ sourceRefs: refs }),
  insight: contentSchema.shape.insight,
}).strict();
export const providerOutputSchema = z.object({
  carousel: engineCarouselSchema,
  claims: z.array(z.object({
    path: z.string().min(1), text: z.string().min(1),
    kind: z.enum(['fact', 'quote', 'interpretation', 'hypothetical']),
    evidence: z.array(z.object({ sourceId: z.string().min(1), field: z.enum(['facts', 'summary', 'quotes']), index: z.number().int().nonnegative().optional() }).strict()).min(1),
    speaker: z.string().trim().min(1).optional(),
  }).strict()).min(1),
}).strict();

export function toRendererContent(carousel: EngineCarousel): CarouselContent {
  const { sourceRefs: _summaryRefs, ...summary } = carousel.summary;
  return contentSchema.parse({ ...carousel, body: carousel.body.map(({ sourceRefs: _refs, ...body }) => body), summary });
}
export function copyFields(c: EngineCarousel | CarouselContent): { path: string; text: string }[] {
  return [
    { path: 'cover.title', text: c.cover.titleLines.join(' ') },
    ...c.body.flatMap((b, i) => [
      { path: `body.${i}.title`, text: b.title },
      ...b.paragraphs.map((text, j) => ({ path: `body.${i}.paragraphs.${j}`, text })),
      { path: `body.${i}.keySentence`, text: b.keySentence },
    ]),
    { path: 'summary.headline', text: c.summary.headline },
    ...c.summary.paragraphs.map((text, j) => ({ path: `summary.paragraphs.${j}`, text })),
    { path: 'summary.keySentence', text: c.summary.keySentence },
    { path: 'insight.headline', text: c.insight.headline },
  ];
}
export function evidenceText(input: ResearchInput, ref: EvidenceRef): string | undefined {
  const source = input.sources.find(s => s.id === ref.sourceId);
  if (!source) return undefined;
  if (ref.field === 'summary') return ref.index === undefined ? source.summary : undefined;
  if (ref.index === undefined) return undefined;
  return ref.field === 'facts' ? source.facts[ref.index] : source.quotes[ref.index]?.text;
}
export function numericTokens(text: string): string[] {
  const arabic = text.match(/-?\d[\d,]*(?:\.\d+)?\s*(?:(?:천|만|억|조)\s*)?(?:%|퍼센트|원|달러|명|개|배|년|월|일|건|위|시간|분|초|kg|km)?/g) ?? [];
  const korean = text.match(/(?:한|두|세|네|다섯|여섯|일|이|삼|사|오|십|백)\s+(?:개|명|배|퍼센트|년|달|시간)/g) ?? [];
  return [...new Set([...arabic, ...korean].map(t => t.replace(/[\s,]/g, '')))];
}
const unsupportedMarker = /unsupported[_\s-]*(?:factual[_\s-]*)?(?:claim|fact)|\[\s*(?:출처\s*없음|근거\s*없음|미검증\s*사실)\s*\]/i;
const directAttribution = /[“”"]|(?:라고|라며|라고도).{0,8}(?:말했|밝혔|언급|발언)|\b(?:said|stated|according to)\b/i;
const concreteAssertion = /(?:연구|조사|통계|실험).{0,25}(?:결과|밝혀|확인|증명|나타났)|(?:기업|회사|넷플릭스|삼성|애플|구글|테슬라|엔비디아|[A-Z][A-Za-z]{2,}).{0,30}(?:출시|인수|발표|해고|고용|달성|기록|매출|투자했)|(?:매출|시장\s*규모|성장률|점유율).{0,20}(?:증가|감소|기록|달성)/i;

export function validateGenerated(output: ProviderOutput, input: ResearchInput, expectedPages?: number): ValidationResult {
  const issues: ValidationIssue[] = [];
  const add = (severity: ValidationIssue['severity'], code: string, message: string, path?: string) => issues.push({ severity, code, message, ...(path ? { path } : {}) });
  const c = output.carousel;
  try { toRendererContent(c); } catch (e) { add('error', 'CONTENT_SCHEMA', String(e)); }
  if (c.cover.image) add('error', 'GENERATED_IMAGE_PATH', 'Content providers cannot choose local image paths');
  if (expectedPages !== undefined && c.body.length + 3 !== expectedPages) add('error', 'PLAN_PAGE_COUNT', `Expected ${expectedPages} pages`);
  for (const [i, body] of c.body.entries()) {
    if ([...body.title].length > 28 || /^\s*\d+[.)]/.test(body.title)) add('error', 'BODY_TITLE_LENGTH', 'Use a short one-line title without a prefixed number', `body.${i}.title`);
    if (body.paragraphs.length < 2 || body.paragraphs.length > 3) add('error', 'PARAGRAPH_COUNT', 'Use 2–3 semantic paragraphs', `body.${i}`);
    if (body.paragraphs.includes(body.keySentence)) add('warning', 'REPEATED_KEY_SENTENCE', 'Compress or reframe the explanation', `body.${i}.keySentence`);
  }
  if (c.summary.paragraphs.length < 2 || c.summary.paragraphs.length > 3) add('error', 'PARAGRAPH_COUNT', 'Summary needs 2–3 paragraphs', 'summary');
  if (c.summary.keySentence === c.insight.headline) add('error', 'DUPLICATED_INSIGHT', 'Summary key sentence and final insight must differ');
  if ([...c.cover.highlight].length > 12) add('warning', 'LONG_COVER_HIGHLIGHT', 'Prefer a compact hook highlight');
  const sourceIds = new Set(input.sources.map(s => s.id));
  for (const [path, sourceRefs] of [...c.body.map((b, i) => [`body.${i}`, b.sourceRefs] as const), ['summary', c.summary.sourceRefs] as const]) {
    for (const ref of sourceRefs) if (!sourceIds.has(ref)) add('error', 'UNKNOWN_SOURCE_REF', ref, path);
  }
  const fields = copyFields(c), paths = new Set(fields.map(f => f.path));
  const claimMap = new Map<string, Claim>();
  for (const claim of output.claims) {
    if (claimMap.has(claim.path)) add('error', 'DUPLICATE_CLAIM', 'One claim record per copy field', claim.path);
    if (!paths.has(claim.path)) add('error', 'UNKNOWN_CLAIM_PATH', claim.path);
    claimMap.set(claim.path, claim);
  }
  let interpretations = 0, statistics = false, quotes = false;
  for (const { path, text } of fields) {
    if (unsupportedMarker.test(text)) add('error', 'UNSUPPORTED_FACT_MARKER', 'Remove unsupported factual claims', path);
    const claim = claimMap.get(path);
    if (!claim) { add('error', 'MISSING_GROUNDING', 'Every copy field needs an evidence record', path); continue; }
    if (claim.text !== text) add('error', 'CLAIM_TEXT_MISMATCH', 'Claim text must exactly match the rendered field', path);
    const evidence = claim.evidence.map(ref => evidenceText(input, ref));
    claim.evidence.forEach((ref, i) => {
      if (evidence[i] === undefined) add('error', 'INVALID_EVIDENCE', `${ref.sourceId}/${ref.field}/${ref.index ?? ''}`, path);
      const match = path.match(/^body\.(\d+)\./);
      const pageRefs = match ? c.body[Number(match[1])]?.sourceRefs : path.startsWith('summary.') ? c.summary.sourceRefs : undefined;
      if (pageRefs && !pageRefs.includes(ref.sourceId)) add('error', 'EVIDENCE_NOT_IN_PAGE_REFS', ref.sourceId, path);
    });
    const evidenceNumbers = new Set(evidence.flatMap(e => numericTokens(e ?? '')));
    const numbers = numericTokens(text);
    for (const number of numbers) if (!evidenceNumbers.has(number)) add('error', 'UNSUPPORTED_NUMBER', `Number/unit ${number} absent from cited evidence`, path);
    if (numbers.length && claim.kind === 'interpretation') add('error', 'UNLABELED_NUMBER', 'Quantitative copy must be a supported fact or an explicit sourced hypothetical', path);
    if (directAttribution.test(text) && claim.kind !== 'quote') add('error', 'UNSUPPORTED_QUOTE', 'Direct quotation/attribution needs an exact quote record and speaker', path);
    if (claim.kind === 'quote') {
      quotes = true;
      const matches = claim.evidence.filter(ref => {
        const source = input.sources.find(s => s.id === ref.sourceId);
        const quote = ref.field === 'quotes' && ref.index !== undefined ? source?.quotes[ref.index] : undefined;
        return quote?.isDirectQuote && quote.speaker === claim.speaker && quote.text === text;
      });
      if (!claim.speaker || !matches.length) add('error', 'UNSUPPORTED_QUOTE', 'Quote text, speaker and direct source quote must all match exactly', path);
      if (!matches.some(ref => input.sources.find(s => s.id === ref.sourceId)?.isPrimary)) add('warning', 'QUOTE_PRIMARY_MISSING', 'Primary/original quotation source recommended', path);
    } else if (claim.kind === 'fact' || claim.kind === 'hypothetical') {
      // Deliberately conservative: paraphrased concrete claims require a later editorial verifier.
      if (!claim.evidence.some((ref, i) => ref.field !== 'quotes' && evidence[i] === text)) add('error', 'UNSUPPORTED_FACT', 'Concrete facts/hypotheticals must reproduce an exact cited fact or summary', path);
      if (claim.kind === 'hypothetical' && !/예를|가정|만약|선택지가|상품이|리뷰가|hypothetical|suppose/i.test(text)) add('error', 'UNLABELED_HYPOTHETICAL', 'Make the hypothetical nature explicit', path);
      if (claim.kind === 'fact' && numbers.length) statistics = true;
    } else {
      interpretations++;
      if (concreteAssertion.test(text)) add('error', 'CONCRETE_CLAIM_AS_INTERPRETATION', 'Research results/company actions must use exact factual evidence', path);
    }
  }
  const uniqueSources = new Set(input.sources.map(s => canonicalSourceUrl(s.url))).size;
  if (statistics && uniqueSources < 3) add('warning', 'FEW_STATISTICAL_SOURCES', 'At least three sources recommended when numbers support the argument');
  if (quotes && uniqueSources < 2) add('warning', 'QUOTE_SUPPORT_MISSING', 'One primary and one supporting source recommended');
  if (interpretations) add('warning', 'INTERPRETATION_REVIEW', 'Interpretive wording needs human semantic review; lexical checks do not prove truth');
  if (fields.filter(f => /할 수 있습니다|라고 볼 수 있습니다/.test(f.text)).length > 1) add('warning', 'WEAK_COPY_STYLE', 'Repeated weak polite phrasing; use concise declarative copy');
  const filter = filterTopic(fields.map(f => f.text).join('\n'));
  if (filter.status === 'blocked') add('error', 'BLOCKED_OUTPUT', filter.reasons.join('; '));
  return { valid: !issues.some(i => i.severity === 'error'), issues };
}
