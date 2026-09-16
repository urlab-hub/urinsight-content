import { z } from 'zod';
import { contentSchema } from '../schema/content.js';

const text = z.string().trim().min(1).max(20_000);
const id = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/);
export const sourceTypes = ['news', 'report', 'interview', 'official', 'social', 'research', 'manual'] as const;
const date = z.string().refine(value => {
  const match = value.match(/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/);
  const day = value.slice(0, 10);
  return !!match && Number.isFinite(Date.parse(value)) && new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) === day;
}, 'Use a real ISO date or timestamp');

export const sourceSchema = z.object({
  id, title: text, publisher: text,
  url: z.string().url().refine(url => /^(https?:\/\/|urn:)/i.test(url), 'Use HTTP(S), or urn: for a manual source'),
  publishedAt: date,
  // Open vocabulary: known types are guidance, new lowercase types are preserved.
  type: z.string().regex(/^[a-z][a-z0-9-]{0,39}$/),
  isPrimary: z.boolean(), summary: text,
  facts: z.array(text).max(100),
  quotes: z.array(z.object({ speaker: text, text, isDirectQuote: z.boolean() }).strict()).max(100),
}).strict();

export const researchSchema = z.object({
  topic: text.max(300),
  slug: contentSchema.shape.slug.optional(),
  requestedCategory: z.enum(['business', 'money', 'insight']).nullable().default(null),
  angleHint: text.max(1000).nullable().default(null),
  sources: z.array(sourceSchema).max(100),
  notes: z.array(text).max(100).default([]),
  // Optional editor-supplied independent arguments; only this can justify 6/7 BODY pages.
  outline: z.array(z.object({ thesis: text.max(500), sourceRefs: z.array(id).min(1).max(100) }).strict()).min(1).max(7).optional(),
}).strict();
export type ResearchInput = z.infer<typeof researchSchema>;
export type ResearchSource = z.infer<typeof sourceSchema>;
