import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { lint } from "../dist/core/lint.js";

const raw = readFileSync(new URL("./fixtures/bad-cv.md", import.meta.url), "utf8");
const findings = lint(raw);
const rules = findings.map((f) => f.rule);

test("catches overselling", () => {
  assert.ok(rules.includes("over-claim"), "expected an over-claim finding");
  assert.ok(findings.some((f) => f.excerpt === "spearheaded"));
});

test("catches underselling", () => {
  const uc = findings.filter((f) => f.rule === "under-claim");
  assert.ok(uc.length > 0, "expected under-claim on the 'Advised on ... 30 services' line");
  assert.equal(uc[0].severity, "error");
});

test("catches present tense on a finished job", () => {
  const t = findings.filter((f) => f.rule === "tense");
  assert.ok(t.length > 0, "expected 'Mentor' to be flagged on a job that ended in 2023");
});

test("catches skills with no supporting evidence", () => {
  const u = findings.filter((f) => f.rule === "unsupported-skill").map((f) => f.excerpt);
  assert.ok(u.includes("terraform"), "terraform appears only under SKILLS");
  assert.ok(u.includes("opentelemetry"));
});

test("catches duplicate bullets", () => {
  assert.ok(rules.includes("duplicate"), "two identical bullets should be flagged");
});

test("catches IC/manager role mismatch", () => {
  assert.ok(rules.includes("role-mismatch"), "Staff Engineer + 'managed a team of 12'");
});

test("catches over-long bullets", () => {
  assert.ok(rules.includes("long-bullet"));
});

test("a clean CV produces no errors", () => {
  const clean = `# A B\n\n**Email:** a@b.c\n\n## WORK EXPERIENCE\n\n### C\n\n**Lead** | 2020 - 2021\n\n* Led the migration of 30 services to microservices, cutting deploy time from 45 to 8 minutes.\n`;
  const f = lint(clean).filter((x) => x.severity === "error");
  assert.equal(f.length, 0, JSON.stringify(f));
});
