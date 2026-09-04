import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, basename, dirname, join } from "node:path";

/** Start a tailored copy from a master file. It only copies; trimming is up to you or the agent. */
export function newVariant(master: string, name: string): string {
  const src = resolve(master);
  if (!existsSync(src)) throw new Error(`Master file not found: ${master}`);
  const dest = join(dirname(src), `cv-${name}.md`);
  if (existsSync(dest)) throw new Error(`Already exists: ${dest}`);
  const raw = readFileSync(src, "utf8").replace(/^<!--[\s\S]*?-->\n*/, "");
  writeFileSync(dest, raw, "utf8");
  return dest;
}

export interface VariantInfo {
  file: string;
  name: string;
  lines: number;
  bullets: number;
  sections: string[];
}

export function listVariants(dir: string): VariantInfo[] {
  return readdirSync(resolve(dir))
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = readFileSync(join(resolve(dir), f), "utf8");
      const lines = raw.split("\n");
      return {
        file: f,
        name: basename(f, ".md"),
        lines: lines.length,
        bullets: lines.filter((l) => /^\s*[*-]\s+/.test(l)).length,
        sections: lines.filter((l) => l.startsWith("## ")).map((l) => l.slice(3).trim()),
      };
    });
}

/** Compare two versions: which bullets exist on only one side. */
export function diffVariants(a: string, b: string) {
  const read = (p: string) =>
    readFileSync(resolve(p), "utf8").split("\n")
      .filter((l) => /^\s*[*-]\s+/.test(l))
      .map((l) => l.replace(/^\s*[*-]\s+/, "").replace(/\*\*/g, "").trim());
  const A = read(a), B = read(b);
  const setB = new Set(B), setA = new Set(A);
  return {
    onlyInA: A.filter((l) => !setB.has(l)),
    onlyInB: B.filter((l) => !setA.has(l)),
    shared: A.filter((l) => setB.has(l)).length,
  };
}
