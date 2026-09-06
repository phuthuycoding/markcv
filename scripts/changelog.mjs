#!/usr/bin/env node
/**
 * Print the CHANGELOG section for one version, so release notes and the
 * changelog cannot drift apart — the release is generated from the file that
 * gets reviewed, rather than written a second time by hand.
 *
 *   node scripts/changelog.mjs 0.1.1
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const version = (process.argv[2] ?? "").replace(/^v/, "");
if (!version) {
  console.error("usage: changelog.mjs <version>");
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lines = readFileSync(join(root, "CHANGELOG.md"), "utf8").split("\n");

const start = lines.findIndex((l) => l.startsWith(`## [${version}]`));
if (start === -1) {
  console.error(`No CHANGELOG entry for ${version}. Add one before releasing.`);
  process.exit(1);
}
const rest = lines.slice(start + 1);
const end = rest.findIndex((l) => l.startsWith("## "));
const body = (end === -1 ? rest : rest.slice(0, end))
  .join("\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

if (!body) {
  console.error(`CHANGELOG entry for ${version} is empty.`);
  process.exit(1);
}
console.log(body);
