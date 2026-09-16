import { generate } from '../renderer/render.js';

try {
  const file = process.argv[2];
  if (!file || process.argv.length !== 3) throw new Error('Usage: pnpm generate content/sample-insight.json');
  const result = await generate(file);
  console.log(`Generated ${result.pages} validated PNGs (1080x1350) + contact-sheet.png\n${result.directory}${result.placeholder ? '\nCover: development placeholder (no cover.image supplied)' : ''}`);
} catch (error) {
  console.error(`Generation failed:\n${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
