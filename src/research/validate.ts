import { sourceTypes, type ResearchInput } from './schema.js';
import { canonicalSourceUrl } from './normalize.js';
import type { ValidationIssue, ValidationResult } from '../content-engine/types.js';

export function validateResearch(input: ResearchInput, now = new Date()): ValidationResult {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>(), urls = new Set<string>();
  for (const [index, source] of input.sources.entries()) {
    const path = `sources.${index}`;
    if (ids.has(source.id)) issues.push({ severity: 'error', code: 'DUPLICATE_SOURCE_ID', message: source.id, path });
    ids.add(source.id);
    const url = canonicalSourceUrl(source.url);
    if (urls.has(url)) issues.push({ severity: 'warning', code: 'DUPLICATE_SOURCE_URL', message: 'Duplicate URLs do not count as independent sources', path });
    urls.add(url);
    if (source.type !== 'manual' && source.url.startsWith('urn:')) issues.push({ severity: 'error', code: 'NON_MANUAL_URN', message: 'Only manual editorial material can use urn:', path });
    if (!(sourceTypes as readonly string[]).includes(source.type)) issues.push({ severity: 'info', code: 'CUSTOM_SOURCE_TYPE', message: source.type, path });
    if (Date.parse(source.publishedAt) > now.getTime()) issues.push({ severity: 'warning', code: 'FUTURE_SOURCE_DATE', message: source.publishedAt, path });
    if (source.type === 'manual') issues.push({ severity: 'warning', code: 'MANUAL_SOURCE', message: 'Editorial input, not externally verified reporting', path });
    if (!source.facts.length && !source.quotes.length) issues.push({ severity: 'warning', code: 'NO_EXTRACTED_EVIDENCE', message: 'Only a summary is available', path });
  }
  if (urls.size < 2) issues.push({ severity: 'warning', code: 'FEW_SOURCES', message: 'At least two distinct sources are recommended for general insight' });
  if (new Set(input.sources.map(s => s.publisher.toLocaleLowerCase())).size < 2) issues.push({ severity: 'warning', code: 'LOW_SOURCE_DIVERSITY', message: 'Independent publisher corroboration is recommended' });
  for (const [index, point] of (input.outline ?? []).entries()) for (const ref of point.sourceRefs) {
    if (!ids.has(ref)) issues.push({ severity: 'error', code: 'UNKNOWN_SOURCE_REF', message: ref, path: `outline.${index}.sourceRefs` });
  }
  return { valid: !issues.some(i => i.severity === 'error'), issues };
}
