import { MockContentProvider } from '../providers/mock-provider.js';

export function contentArgs(args: string[], allowProvider = true) {
  if (args.length !== 1 && !(allowProvider && args.length === 3 && args[1] === '--provider')) throw new Error(`Usage: pnpm ${allowProvider ? 'draft <research.json> [--provider mock]' : 'prompt <research.json>'}`);
  if (!args[0] || args[0].startsWith('--')) throw new Error('A research JSON path is required');
  if (allowProvider && args[2] && args[2] !== 'mock') throw new Error('Only --provider mock is implemented. No API calls are available.');
  return { file: args[0], provider: new MockContentProvider() };
}
