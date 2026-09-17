import type { CarouselContent } from '../../src/schema/content.js';

/** Short cover copy for enlarged daily typography; approved legacy sample remains untouched. */
export function mobileContentFixture(sample: CarouselContent): CarouselContent {
  const c = structuredClone(sample);
  c.cover.titleLines = ['정보가 넘칠수록', '더 비싸지는 것은', '스스로 내리는 판단'];
  return c;
}
