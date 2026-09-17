import type { CarouselContent } from '../../src/schema/content.js';

/** Semantic paragraphs with authored phrase boundaries for reproducible fit tests. */
export function verticalFixture(sample: CarouselContent, kind: 'body' | 'summary', length: 'short' | 'long', keyLines: 1 | 2): CarouselContent {
  const c = structuredClone(sample);
  const groups = length === 'short'
    ? [['선택지는 늘고 있다.'], ['기준이 있어야 선택이 쉬워진다.']]
    : kind === 'body'
      ? [['선택지가 늘었다.', '비교할 항목도 많아졌다.', '모든 항목을 확인하기는 어렵다.'], ['먼저 필요한 조건을 정한다.', '조건에 맞지 않으면 제외한다.', '남은 선택지만 자세히 살펴본다.'], ['중요한 것은 비교의 양이 아니다.', '선택에 필요한 기준을 세우는 일이다.', '기준이 분명하면 행동도 달라진다.']]
      : [['선택지가 늘었다.', '비교할 항목도 많아졌다.'], ['조건에 맞지 않는 선택지를 제외한다.', '남은 선택지만 자세히 살펴본다.'], ['기준이 분명하면 행동도 달라진다.']];
  const page = kind === 'body' ? c.body[0] : c.summary;
  page.paragraphLines = groups;
  page.paragraphs = groups.map(lines => lines.join(' '));
  page.keySentence = keyLines === 1 ? '선택의 기준이 행동을 바꾼다.' : '선택의 기준이 분명해질수록 불필요한 고민은 줄어들고 중요한 일에 집중할 여유가 생긴다.';
  if (kind === 'body') {
    c.body[0].keySentenceLines = keyLines === 1 ? [page.keySentence] : ['선택의 기준이 분명해질수록 불필요한 고민은 줄어들고', '중요한 일에 집중할 여유가 생긴다.'];
  } else c.summary.keySentenceHighlight = '선택의 기준';
  return c;
}
