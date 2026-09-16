import type { Category } from '../content-engine/types.js';

export interface HistoryEntry { slug: string; topic: string; category: Category; publishedAt: string; keywords: string[] }
export interface ContentHistory { list(): Promise<HistoryEntry[]> }
export function topicSimilarity(a: string, b: string): number {
  const normalize = (text: string) => text.normalize('NFC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  const grams = (text: string) => new Set(text.length < 2 ? [text] : Array.from({ length: text.length - 1 }, (_, i) => text.slice(i, i + 2)));
  const left = normalize(a), right = normalize(b);
  if (!left || !right) return 0;
  const x = grams(left), y = grams(right);
  return [...x].filter(g => y.has(g)).length / new Set([...x, ...y]).size;
}
export function recentSimilarTopics(topic: string, entries: HistoryEntry[], now = new Date(), threshold = .55) {
  return entries.filter(e => {
    const age = now.getTime() - Date.parse(e.publishedAt);
    return Number.isFinite(age) && age >= 0 && age < 7 * 24 * 60 * 60 * 1000;
  }).map(entry => ({ entry, similarity: Math.max(topicSimilarity(topic, entry.topic), topicSimilarity(topic, entry.keywords.join(' '))) }))
    .filter(item => item.similarity >= threshold).sort((a, b) => b.similarity - a.similarity);
}
