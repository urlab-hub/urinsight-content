import type { FilterResult } from './types.js';

const politics = /정치인|정당|선거|대통령|국회의원|대선|총선|후보.{0,12}(평가|지지|반대|투표)|민주당|국민의힘|\b(election|politician|political party|vote for|presidential candidate)\b/i;
const investment = /(?:주식|종목|코인|비트코인|이더리움|주가|ETF|테슬라|엔비디아|애플|삼성전자).{0,35}(?:매수|매도|사라|사세요|팔아라|팔세요|투자하라|투자하세요|투자 권유|매입 추천)|(?:매수|매도).{0,12}(?:추천|권유|하라|하세요)|(?:매수|매도|투자 추천|사야 할|팔아야 할).{0,25}(?:주식|종목|코인)|(?:수익|원금|고수익).{0,12}(?:보장|확정)|\b(?:buy|sell)\s+(?:stock|shares|bitcoin|crypto)|guaranteed\s+(?:profit|return)/i;
export function filterTopic(subject: string, surroundingText = ''): FilterResult {
  const reasons: string[] = [];
  if (politics.test(subject)) reasons.push('Political/election-centered content');
  if (investment.test(subject)) reasons.push('Direct investment recommendation or guaranteed returns');
  if (reasons.length) return { status: 'blocked', reasons };
  if (politics.test(surroundingText) || investment.test(surroundingText)) return { status: 'review', reasons: ['Excluded subject appears in supporting material; check the editorial focus'] };
  return { status: 'allowed', reasons: [] };
}
