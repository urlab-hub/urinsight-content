import { chromium } from 'playwright';

/** Default is Playwright's pinned headless shell; opt in to an installed browser. */
export async function launchBrowser() {
  const channel = process.env.URINSIGHT_BROWSER_CHANNEL;
  if (channel && !['chrome', 'msedge', 'chromium'].includes(channel)) throw new Error('URINSIGHT_BROWSER_CHANNEL must be chrome, msedge, or chromium');
  return chromium.launch({ headless: true, ...(channel ? { channel } : {}) });
}
