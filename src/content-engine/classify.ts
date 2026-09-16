import type { ResearchInput } from '../research/schema.js';
import type { Category, Classification } from './types.js';

const keywords: Record<Category, readonly string[]> = {
  business: ['고객', '마케팅', '브랜딩', '판매', '창업', '사업모델', '사업 모델', '비즈니스 모델', '회사 운영', '경영', '매출', '구독', 'customer', 'marketing', 'branding', 'business model'],
  money: ['소비', '저축', '자산', '현금흐름', '현금 흐름', '재무', '부자', '가계', '예산', '돈 관리', '돈을 다루', '지출', 'saving', 'cash flow', 'personal finance'],
  insight: ['시장 변화', '사회', '트렌드', '심리', '성공', '시대', '사고방식', '관점', '판단', '정보', '선택', 'attention', 'judgment', 'mindset'],
};
export function classify(input: ResearchInput): Classification {
  const score = (text: string, category: Category) => keywords[category].reduce((n, keyword) => n + (text.toLocaleLowerCase().includes(keyword) ? 1 : 0), 0);
  // Direct subject has priority; incidental terms inside source documents cannot hijack it.
  const scores = Object.fromEntries((Object.keys(keywords) as Category[]).map(c => [c, score(input.topic, c) * 3 + score(input.angleHint ?? '', c) * 4])) as Record<Category, number>;
  const ranked = (['business', 'money', 'insight'] as Category[]).sort((a, b) => scores[b] - scores[a]);
  const inferredCategory = scores[ranked[0]] === 0 ? 'insight' : ranked[0];
  const category = input.requestedCategory ?? inferredCategory;
  const issues: Classification['issues'] = [];
  if (input.requestedCategory && category !== inferredCategory && scores[inferredCategory] >= 6 && scores[category] === 0) issues.push({ severity: 'warning', code: 'CATEGORY_CONFLICT', message: `Requested ${category}; direct subject strongly suggests ${inferredCategory}` });
  if (scores[ranked[0]] === scores[ranked[1]]) issues.push({ severity: 'info', code: 'CATEGORY_AMBIGUOUS', message: 'Keyword classifier has limited confidence; editorial review recommended' });
  return { category, inferredCategory, scores, reason: input.requestedCategory ? 'Explicit category preference retained; conflicts are reported' : 'Weighted direct topic/angle keywords; insight fallback when no match', issues };
}
