import { readFileSync, existsSync, readdirSync, mkdirSync, copyFileSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));

/** A skill shipped with markcv, ready to be copied into an agent's skills folder. */
export interface Skill {
  /** Folder name, also the name an agent invokes. */
  name: string;
  /** One-line summary lifted from the SKILL.md frontmatter. */
  description: string;
  /** Absolute path of the folder holding SKILL.md. */
  dir: string;
}

/** Where an agent looks for user-level skills. */
export const SKILLS_HOME = join(homedir(), ".claude", "skills");

/**
 * Locate the bundled skills/ folder. It sits outside dist/, so the path differs
 * between a published install and a source checkout — same fallback chain the
 * theme loader uses.
 */
function skillsRoot(): string {
  const candidates = [
    resolve(HERE, "../../skills"), // dist/core/ -> package root
    resolve(HERE, "../../../skills"), // src/core/ during development
    resolve(process.cwd(), "skills"),
  ];
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error("bundled skills folder not found — is the package installed correctly?");
  return found;
}

/** Read `description:` out of the YAML frontmatter, tolerating a missing one. */
function describe(skillFile: string): string {
  const text = readFileSync(skillFile, "utf8");
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return "";
  const line = fm[1].match(/^description:\s*(.+)$/m);
  return line ? line[1].trim().replace(/^["']|["']$/g, "") : "";
}

/** Every skill bundled with markcv. */
export function listSkills(): Skill[] {
  const root = skillsRoot();
  return readdirSync(root)
    .filter((name) => statSync(join(root, name)).isDirectory())
    .filter((name) => existsSync(join(root, name, "SKILL.md")))
    .map((name) => ({
      name,
      description: describe(join(root, name, "SKILL.md")),
      dir: join(root, name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export interface InstallResult {
  name: string;
  target: string;
  /** False when the skill was already there and `force` was not set. */
  written: boolean;
}

/**
 * Copy skills into `dest` (defaults to ~/.claude/skills). Existing skills are left
 * alone unless `force` is set, so a user's own edits are never clobbered silently.
 */
export function installSkills(opts: { names?: string[]; dest?: string; force?: boolean } = {}): InstallResult[] {
  const dest = opts.dest ? resolve(opts.dest) : SKILLS_HOME;
  const available = listSkills();

  let chosen = available;
  if (opts.names?.length) {
    const unknown = opts.names.filter((n) => !available.some((s) => s.name === n));
    if (unknown.length) {
      throw new Error(`unknown skill(s): ${unknown.join(", ")} — available: ${available.map((s) => s.name).join(", ")}`);
    }
    chosen = available.filter((s) => opts.names!.includes(s.name));
  }

  return chosen.map((skill) => {
    const target = join(dest, skill.name);
    const file = join(target, "SKILL.md");
    if (existsSync(file) && !opts.force) return { name: skill.name, target, written: false };
    mkdirSync(target, { recursive: true });
    for (const entry of readdirSync(skill.dir)) {
      const from = join(skill.dir, entry);
      if (statSync(from).isDirectory()) continue; // skills here are single-file
      copyFileSync(from, join(target, entry));
    }
    return { name: skill.name, target, written: true };
  });
}
