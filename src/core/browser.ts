import { existsSync } from "node:fs";
import { platform } from "node:os";

/** Common Chrome/Edge/Chromium locations, per platform. */
const PATHS: Record<string, string[]> = {
  darwin: [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  ],
  linux: [
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/microsoft-edge",
    "/snap/bin/chromium",
  ],
  win32: [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ],
};

/**
 * Locate an installed Chrome. markcv deliberately does NOT ship its own Chromium
 * (puppeteer-core, not puppeteer) so the install stays small.
 */
export function findChrome(explicit?: string): string {
  if (explicit) {
    if (!existsSync(explicit)) throw new Error(`No browser found at: ${explicit}`);
    return explicit;
  }
  const fromEnv = process.env.MARKCV_CHROME ?? process.env.CHROME_PATH;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;

  const found = (PATHS[platform()] ?? []).find(existsSync);
  if (!found) {
    throw new Error(
      "No Chrome/Chromium/Edge found on this machine.\n" +
        "Install Chrome, or point at it with MARKCV_CHROME=/path/to/chrome",
    );
  }
  return found;
}
