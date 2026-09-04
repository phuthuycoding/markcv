import type { LintFinding } from "../types.js";
import { BOAST, WEAK_VERBS, SCALE_HINTS, PRESENT_VERBS, TECH_TOKENS, HEAVY_TOKENS, IC_TITLES, PEOPLE_MGMT } from "./rules.js";

const BULLET_RE = /^\s*[*-]\s+(.*)$/;
const H2_RE = /^##\s+(.*)$/;
const H3_RE = /^###\s+(.*)$/;
const META_RE = /^\*\*(.+?)\*\*\s*\|\s*(.*)$/;
/** A finished date range: no Present/Now marker. */
// 'hiện tại' is Vietnamese for 'present' - kept so Vietnamese-language CVs work too.
const ENDED_RE = /\d{4}\s*[-–—]\s*(?!.*(present|now|current|hiện tại))/i;

const strip = (s: string) => s.replace(/\*\*/g, "").replace(/`/g, "").trim();
const lower = (s: string) => strip(s).toLowerCase();

interface Ctx {
  section: string;
  jobTitle: string;
  jobEnded: boolean;
}

export function lint(raw: string): LintFinding[] {
  const lines = raw.split("\n");
  const findings: LintFinding[] = [];
  const ctx: Ctx = { section: "", jobTitle: "", jobEnded: false };
  const bullets: { line: number; text: string; section: string }[] = [];
  const skillTokens = new Map<string, number>();
  const evidence = new Set<string>();

  // Evidence can appear on ANY line outside SKILLS — including the prose in
  // PROJECT HIGHLIGHTS, not just bullets.
  {
    let sec = "";
    for (const line of lines) {
      const h = line.match(H2_RE);
      if (h) { sec = strip(h[1]).toUpperCase(); continue; }
      if (sec.includes("SKILL")) continue;
      const flat = lower(line);
      for (const t of TECH_TOKENS) if (flat.includes(t)) evidence.add(t);
    }
  }

  lines.forEach((line, idx) => {
    const no = idx + 1;

    const h2 = line.match(H2_RE);
    if (h2) {
      ctx.section = strip(h2[1]).toUpperCase();
      ctx.jobTitle = "";
      ctx.jobEnded = false;
      if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(line)) {
        findings.push({
          rule: "ats-emoji", severity: "warn", line: no, excerpt: strip(h2[1]),
          message: "Emoji in a heading can break fonts or confuse ATS parsers.",
          suggestion: "Remove the emoji from the heading.",
        });
      }
      return;
    }

    const h3 = line.match(H3_RE);
    if (h3) { ctx.jobTitle = strip(h3[1]); return; }

    const meta = line.match(META_RE);
    if (meta) {
      ctx.jobTitle = strip(meta[1]);
      ctx.jobEnded = ENDED_RE.test(line);
      return;
    }

    const bullet = line.match(BULLET_RE);
    if (!bullet) return;
    const text = bullet[1];
    const flat = lower(text);
    bullets.push({ line: no, text: strip(text), section: ctx.section });

    if (ctx.section.includes("SKILL")) {
      for (const t of TECH_TOKENS) if (flat.includes(t)) skillTokens.set(t, no);
    }

    // 1. overselling
    for (const w of BOAST) {
      if (flat.includes(w)) {
        findings.push({
          rule: "over-claim", severity: "warn", line: no, excerpt: w,
          message: `"${w}" is unverifiable self-praise — readers skip straight past it.`,
          suggestion: "Replace it with a fact: a number, a scale, or a before/after result.",
        });
      }
    }

    // 2. underselling: a weak verb next to real scale
    const weak = WEAK_VERBS.find((w) => flat.startsWith(w) || flat.includes(` ${w} `));
    if (weak && SCALE_HINTS.some((h) => flat.includes(h)) && /\d/.test(flat)) {
      findings.push({
        rule: "under-claim", severity: "error", line: no, excerpt: weak,
        message: `"${weak}" understates the scale described on the same line.`,
        suggestion: "If you actually did or led it, say Led / Built / Designed.",
      });
    }

    // 3. tense: a finished job written in the present
    if (ctx.jobEnded) {
      const first = flat.replace(/^\*\*[^*]+:\*\*\s*/, "").split(/\s+/)[0]?.replace(/[^a-z]/g, "");
      const firstAfterLabel = strip(text).replace(/^[^:]+:\s*/, "").split(/\s+/)[0]?.toLowerCase();
      const verb = PRESENT_VERBS.find((v) => v === first || v === firstAfterLabel);
      if (verb) {
        findings.push({
          rule: "tense", severity: "error", line: no, excerpt: verb,
          message: `"${ctx.jobTitle}" has ended, but this bullet is in the present tense ("${verb}").`,
          suggestion: "Switch it to past tense.",
        });
      }
    }

    // 4. experience bullet with no number at all
    if ((ctx.section.includes("EXPERIENCE") || ctx.section.includes("PROJECT")) && !/\d/.test(flat) && flat.length > 60) {
      findings.push({
        rule: "no-metric", severity: "info", line: no, excerpt: strip(text).slice(0, 60),
        message: "A long bullet with no number in it.",
        suggestion: "Add a scale or a before/after result if you have one.",
      });
    }

    // 5. bullet too long
    if (strip(text).length > 320) {
      findings.push({
        rule: "long-bullet", severity: "info", line: no, excerpt: `${strip(text).length} chars`,
        message: "Long enough that a skimming reader will skip it.",
        suggestion: "Split it in two, or move the detail into a project section.",
      });
    }

    // 6. role mismatch: IC title, people-management wording
    const titleLower = ctx.jobTitle.toLowerCase();
    if (IC_TITLES.some((t) => titleLower.includes(t)) && !/(lead|manager|head|director)/.test(titleLower)) {
      const mgmt = PEOPLE_MGMT.find((m) => flat.includes(m));
      if (mgmt && /\d/.test(flat)) {
        findings.push({
          rule: "role-mismatch", severity: "warn", line: no, excerpt: mgmt,
          message: `"${ctx.jobTitle}" is an IC title, but this bullet reads like people management.`,
          suggestion: "Make the technical/advisory nature explicit, or drop the headcount.",
        });
      }
    }
  });

  // 7. skill listed under SKILLS with no supporting experience
  for (const [token, line] of skillTokens) {
    if (!evidence.has(token)) {
      const heavy = HEAVY_TOKENS.includes(token);
      findings.push({
        rule: "unsupported-skill",
        severity: heavy ? "warn" : "info",
        line, excerpt: token,
        message: heavy
          ? `"${token}" appears only under SKILLS — this is one interviewers dig into.`
          : `"${token}" appears only under SKILLS (harmless for a commodity technology).`,
        suggestion: heavy
          ? "Add an experience line that backs it up, or drop it from SKILLS."
          : "Safe to ignore unless the JD leans on it.",
      });
    }
  }

  // 8. two bullets saying the same thing.
  // SKILLS is excluded: a stack list naturally shares words with experience bullets,
  // which is not repetition.
  const comparable = bullets.filter((b) => !b.section.includes("SKILL"));
  for (let i = 0; i < comparable.length; i++) {
    for (let j = i + 1; j < comparable.length; j++) {
      const sim = similarity(comparable[i].text, comparable[j].text);
      if (sim >= 0.6) {
        findings.push({
          rule: "duplicate", severity: "warn", line: comparable[j].line,
          excerpt: comparable[j].text.slice(0, 60),
          message: `Says the same thing as line ${comparable[i].line} (${Math.round(sim * 100)}%).`,
          suggestion: "Merge them, or drop one.",
        });
      }
    }
  }

  // 9. missing basic contact details
  const head = raw.slice(0, 1200).toLowerCase();
  if (!/@/.test(head)) {
    findings.push({ rule: "contact", severity: "error", line: 1, excerpt: "email",
      message: "No email address found in the CV header.", suggestion: "Add an **Email:** line." });
  }

  return findings.sort((a, b) => a.line - b.line);
}

/** Similarity over meaningful words, ignoring short filler words. */
function similarity(a: string, b: string): number {
  const words = (s: string) =>
    new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 3));
  const A = words(a), B = words(b);
  if (A.size < 4 || B.size < 4) return 0;
  let shared = 0;
  for (const w of A) if (B.has(w)) shared++;
  return shared / Math.min(A.size, B.size);
}
