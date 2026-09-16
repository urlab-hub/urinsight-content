import { readFile } from 'node:fs/promises';
import { normalizeResearch, fingerprintResearch } from '../research/normalize.js';
import { providerOutputSchema } from '../content-engine/validators.js';
import type { ContentProvider, ContentGenerationInput } from './content-provider.js';

export class MockContentProvider implements ContentProvider {
  readonly name = 'mock';
  async generateCarousel({ research, plan }: ContentGenerationInput) {
    const fixture = normalizeResearch(JSON.parse(await readFile(new URL('../../research/fixtures/information-and-judgment.json', import.meta.url), 'utf8')));
    // Only category/angle preferences can vary; never silently answer an unrelated research topic.
    const identity = (value: typeof fixture) => fingerprintResearch({ ...value, requestedCategory: null, angleHint: null });
    if (identity(research) !== identity(fixture)) throw new Error('MockContentProvider only supports the checked-in information-and-judgment research fixture. Use pnpm prompt for other research inputs.');
    const output = providerOutputSchema.parse(JSON.parse(await readFile(new URL('../../research/fixtures/information-and-judgment.output.json', import.meta.url), 'utf8')));
    if (plan.pageCount !== output.carousel.body.length + 3) throw new Error('Mock fixture does not implement this page plan');
    output.carousel.category = plan.category;
    return output;
  }
}
