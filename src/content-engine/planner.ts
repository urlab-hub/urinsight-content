import type { ResearchInput } from '../research/schema.js';
import { researchSlug } from '../research/normalize.js';
import type { CarouselPlan, Category, PlanPoint } from './types.js';

const roles = ['현상과 첫 주장', '작동 원리', '사례와 이유', '가치의 변화', '행동과 해석', '반론과 조건', '추가 함의'];
export function planCarousel(input: ResearchInput, category: Category): CarouselPlan {
  const issues: CarouselPlan['issues'] = [];
  const candidates = input.outline ?? input.sources.flatMap(s => s.facts.map(thesis => ({ thesis, sourceRefs: [s.id] })));
  const unique = candidates.filter((p, i) => candidates.findIndex(q => q.thesis === p.thesis) === i);
  const expanded = !!input.outline && unique.length > 5 && unique.every(p => p.sourceRefs.length > 0);
  const bodyCount = expanded ? Math.min(unique.length, 7) : 5;
  if (unique.length < 5) issues.push({ severity: 'warning', code: 'SPARSE_RESEARCH', message: 'Insufficient distinct arguments for five developed pages; do not invent additional facts' });
  const body: PlanPoint[] = Array.from({ length: bodyCount }, (_, i) => ({ number: i + 1, role: roles[i], thesis: unique[i]?.thesis ?? input.topic, sourceRefs: unique[i]?.sourceRefs ?? [] }));
  return { slug: researchSlug(input), topic: input.topic, angle: input.angleHint ?? input.topic, thesis: input.angleHint ?? unique[0]?.thesis ?? input.topic, category, pageCount: bodyCount + 3, body,
    reason: expanded ? 'Editor supplied six/seven distinct sourced arguments' : 'Default five BODY pages; raw source count does not inflate the carousel', issues };
}
