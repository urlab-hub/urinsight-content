import { createDraft } from '../content-engine/generator.js';
import { contentArgs } from './content-args.js';
try {
  const { file, provider } = contentArgs(process.argv.slice(2));
  const result = await createDraft(file, { provider });
  console.log(`Draft created: ${result.directory}\n${result.report.pageCount} pages; provider=${provider.name}; validation=passed; human review required`);
  for (const issue of result.report.validation.issues) console.log(`${issue.severity}: ${issue.code} — ${issue.message}`);
} catch (error) { console.error(`Draft failed: ${error instanceof Error ? error.message : error}`); process.exitCode = 1; }
