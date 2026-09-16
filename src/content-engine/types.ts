import type { CarouselContent } from '../schema/content.js';

export type Category = CarouselContent['category'];
export type Severity = 'info' | 'warning' | 'error';
export interface ValidationIssue { severity: Severity; code: string; message: string; path?: string }
export interface ValidationResult { valid: boolean; issues: ValidationIssue[] }
export interface FilterResult { status: 'allowed' | 'review' | 'blocked'; reasons: string[] }
export interface Classification { category: Category; inferredCategory: Category; scores: Record<Category, number>; reason: string; issues: ValidationIssue[] }
export interface PlanPoint { number: number; role: string; thesis: string; sourceRefs: string[] }
export interface CarouselPlan { slug: string; topic: string; angle: string; thesis: string; category: Category; pageCount: number; body: PlanPoint[]; reason: string; issues: ValidationIssue[] }
export interface EvidenceRef { sourceId: string; field: 'facts' | 'summary' | 'quotes'; index?: number }
export interface Claim {
  path: string;
  text: string;
  kind: 'fact' | 'quote' | 'interpretation' | 'hypothetical';
  evidence: EvidenceRef[];
  speaker?: string;
}
/** Enriched manuscript; stripped only at the renderer boundary. */
export type EngineCarousel = Omit<CarouselContent, 'body' | 'summary'> & {
  body: (CarouselContent['body'][number] & { sourceRefs: string[] })[];
  summary: CarouselContent['summary'] & { sourceRefs: string[] };
};
export interface ProviderOutput { carousel: EngineCarousel; claims: Claim[] }
export class EngineValidationError extends Error {
  constructor(public readonly issues: ValidationIssue[]) {
    super(issues.map(i => `${i.severity} ${i.code}${i.path ? ` (${i.path})` : ''}: ${i.message}`).join('\n'));
    this.name = 'EngineValidationError';
  }
}
export function assertValid(issues: ValidationIssue[]) {
  if (issues.some(i => i.severity === 'error')) throw new EngineValidationError(issues);
}
