import { createPrompt } from '../content-engine/generator.js';
import { contentArgs } from './content-args.js';
try {
  const { file } = contentArgs(process.argv.slice(2), false);
  const result = await createPrompt(file);
  console.log(`Prompt created (no provider/API invoked): ${result.promptFile}`);
} catch (error) { console.error(`Prompt failed: ${error instanceof Error ? error.message : error}`); process.exitCode = 1; }
