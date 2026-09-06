import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Read the version from package.json instead of hardcoding it.
 * A hardcoded copy silently goes stale the moment a release is cut, and then
 * `--version` reports one thing while the installed code is another.
 */
function readVersion(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  for (const rel of ["../package.json", "../../package.json"]) {
    try {
      return JSON.parse(readFileSync(join(here, rel), "utf8")).version as string;
    } catch {
      // try the next candidate: dist/ is one level deeper than src/
    }
  }
  return "0.0.0";
}

export const VERSION = readVersion();
