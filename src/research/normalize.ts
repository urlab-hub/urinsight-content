import { createHash } from 'node:crypto';
import { researchSchema, type ResearchInput } from './schema.js';

function normalizeValue(value: unknown): unknown {
  if (typeof value === 'string') return value.normalize('NFC').replace(/\r\n?/g, '\n').trim();
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, v]) => [key, normalizeValue(v)]));
  return value;
}
export function normalizeResearch(input: unknown): ResearchInput {
  return researchSchema.parse(normalizeValue(input));
}
export function fingerprintResearch(input: ResearchInput): string {
  return createHash('sha256').update(JSON.stringify(input)).digest('hex');
}
export function researchSlug(input: ResearchInput): string {
  return input.slug ?? `research-${createHash('sha256').update(input.topic).digest('hex').slice(0, 12)}`;
}
export function canonicalSourceUrl(value: string) {
  const url = new URL(value);
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  return url.toString().replace(/\/$/, '');
}
