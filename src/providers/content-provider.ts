import type { ResearchInput } from '../research/schema.js';
import type { CarouselPlan } from '../content-engine/types.js';

export interface ContentGenerationInput { research: ResearchInput; plan: CarouselPlan; prompt: string }
export interface ContentProvider {
  readonly name: string;
  /** Untrusted provider response: engine, not provider, owns validation. */
  generateCarousel(input: ContentGenerationInput): Promise<unknown>;
}
