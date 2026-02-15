import { setupClaudeCode } from './setup/index.js';

export async function cli(args: string[]): Promise<void> {
  if (args.includes('--setup') || args.includes('--install')) {
    await setupClaudeCode();
    return;
  }

  if (args.includes('--configure')) {
    const { startConfigServer } = await import('./configure/index.js');
    await startConfigServer();
    return;
  }

  // Default: statusline rendering mode
  const { main } = await import('./main.js');
  await main();
}
