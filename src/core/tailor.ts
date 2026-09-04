import type { TailorReport } from "../types.js";
import { TECH_TOKENS } from "./rules.js";

const BULLET_RE = /^\s*[*-]\s+(.*)$/;
const H2_RE = /^##\s+(.*)$/;

/** Multi-word phrases that must match as a whole. */
const PHRASES = [
  "clean architecture", "event-driven", "domain-driven", "spring boot", "next.js",
  "react native", "ci/cd", "unit test", "integration test", "e2e", "end-to-end",
  "code review", "system design", "distributed systems", "message queue",
  "observability", "monitoring", "incident", "agile", "scrum", "mentoring",
];

const norm = (s: string) => s.toLowerCase().replace(/\*\*/g, "").replace(/`/g, "");

/**
 * Compare a CV against a job description.
 *
 * The goal is not keyword stuffing. It surfaces three things: what the JD asks for
 * with no evidence in the CV, which keywords live only under SKILLS (those fall apart
 * in a deep interview), and which bullets are unrelated to the JD — so you cut those
 * before cutting anything valuable.
 */
export function tailor(cvRaw: string, jdRaw: string): TailorReport {
  const cv = norm(cvRaw);
  const jd = norm(jdRaw);
  const lines = cvRaw.split("\n");

  const wanted = new Set<string>();
  for (const t of [...TECH_TOKENS, ...PHRASES]) if (jd.includes(t)) wanted.add(t);

  // Where each keyword shows up: under SKILLS, or in real experience.
  const inSkills = new Map<string, number>();
  const inEvidence = new Map<string, number>();
  let section = "";
  lines.forEach((line, idx) => {
    const h2 = line.match(H2_RE);
    if (h2) { section = h2[1].toUpperCase(); return; }
    const flat = norm(line);
    const target = section.includes("SKILL") ? inSkills : inEvidence;
    for (const t of wanted) if (flat.includes(t) && !target.has(t)) target.set(t, idx + 1);
  });

  const missing = [...wanted]
    .filter((t) => !inSkills.has(t) && !inEvidence.has(t))
    .map((keyword) => ({
      keyword,
      hint: `The JD mentions "${keyword}" but the CV does not. Add a bullet if you genuinely have it; otherwise leave it out rather than stuffing it in.`,
    }));

  const unsupported = [...wanted]
    .filter((t) => inSkills.has(t) && !inEvidence.has(t))
    .map((keyword) => ({
      keyword,
      hint: `"${keyword}" appears only under SKILLS. Interviewers will dig into it — it needs an experience line behind it.`,
    }));

  const covered = [...wanted]
    .filter((t) => inEvidence.has(t))
    .map((keyword) => ({ keyword, evidenceLine: inEvidence.get(keyword)! }));

  // Experience bullets that touch none of the JD keywords.
  const irrelevant: TailorReport["irrelevant"] = [];
  section = "";
  lines.forEach((line, idx) => {
    const h2 = line.match(H2_RE);
    if (h2) { section = h2[1].toUpperCase(); return; }
    if (!section.includes("EXPERIENCE")) return;
    const m = line.match(BULLET_RE);
    if (!m) return;
    const flat = norm(m[1]);
    if (flat.length < 40) return;
    const touches = [...wanted].some((t) => flat.includes(t));
    if (!touches) irrelevant.push({ line: idx + 1, excerpt: m[1].replace(/\*\*/g, "").slice(0, 70) });
  });

  const score = wanted.size === 0 ? 0 : Math.round((covered.length / wanted.size) * 100);
  return { missing, unsupported, irrelevant, covered, score };
}
