import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { contentSchema } from '../src/schema/content.js';
import { seoulDate } from '../src/renderer/render.js';

const sample = JSON.parse(await readFile(new URL('../content/sample-insight.json', import.meta.url), 'utf8'));
test('v6 sample and all categories validate', () => {
  for (const category of ['business', 'money', 'insight']) assert.equal(contentSchema.parse({ ...sample, category }).body.length, 5);
});
test('8–10 pages only, sequential body numbers', () => {
  for (const count of [4, 5, 6, 7, 8]) {
    const body = Array.from({ length: count }, (_, i) => ({ ...sample.body[0], number: i + 1 }));
    assert.equal(contentSchema.safeParse({ ...sample, body }).success, count >= 5 && count <= 7);
  }
  const c = structuredClone(sample); c.body[1].number = 4;
  assert.equal(contentSchema.safeParse(c).success, false);
});
test('missing, blank, invalid and ambiguous highlight targets fail', () => {
  for (const target of ['', '판단 ', ' 판단', '없는 단어']) {
    const c = structuredClone(sample); c.cover.highlight = target;
    assert.equal(contentSchema.safeParse(c).success, false);
  }
  const missing = structuredClone(sample); delete missing.body[0].keySentence;
  assert.equal(contentSchema.safeParse(missing).success, false);
  const duplicate = structuredClone(sample); duplicate.body[0].title = '싸지고 싸지고';
  assert.equal(contentSchema.safeParse(duplicate).success, false);
});
test('safe slugs and semantic line integrity', () => {
  for (const slug of ['../escape', 'x/y', 'CON.txt', 'con', 'nul', '']) assert.equal(contentSchema.safeParse({ ...sample, slug }).success, false);
  const c = structuredClone(sample); c.body[0].paragraphLines[0] = ['내용 변경'];
  assert.equal(contentSchema.safeParse(c).success, false);
  const broken = structuredClone(sample); broken.insight.headlineLines = ['정보가 넘치는 시대에는 많이 아는 사람보다 잘 판단하는', '사람이 비싸진다'];
  assert.equal(contentSchema.safeParse(broken).success, false);
});
test('output date uses Asia/Seoul', () => assert.equal(seoulDate(new Date('2026-09-15T16:00:00Z')), '2026-09-16'));
