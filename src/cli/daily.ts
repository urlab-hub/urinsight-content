import { parseDailyArgs, runDaily } from '../daily/runner.js';

try {
  const result = await runDaily({ root: process.cwd(), ...parseDailyArgs(process.argv.slice(2)) });
  if (result.failed) process.exitCode = 1;
} catch (error) {
  console.error(`Daily failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
