import { createDraft } from '../content-engine/generator.js';
import { generate } from '../renderer/render.js';
import { contentArgs } from './content-args.js';
try {
  const { file, provider } = contentArgs(process.argv.slice(2));
  const draft = await createDraft(file, { provider });
  console.log(`Draft created: ${draft.directory}; human review required`);
  const result = await generate(draft.contentFile);
  console.log(`Rendered ${result.pages} validated PNGs + contact-sheet.png\n${result.directory}`);
} catch (error) { console.error(`Draft/render failed: ${error instanceof Error ? error.message : error}`); process.exitCode = 1; }
