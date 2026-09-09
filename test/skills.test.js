import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { listSkills, installSkills } from "../dist/core/skills.js";

test("lists the bundled skills with their descriptions", () => {
  const skills = listSkills();
  const names = skills.map((s) => s.name);
  assert.ok(names.includes("markcv"), "the markcv skill ships with the package");
  assert.ok(names.includes("topcv"), "the topcv skill ships with the package");
  for (const s of skills) {
    assert.ok(s.description.length > 0, `${s.name} has a description in its frontmatter`);
  }
});

test("installs every skill into the destination", () => {
  const dest = mkdtempSync(join(tmpdir(), "markcv-skills-"));
  try {
    const results = installSkills({ dest });
    assert.equal(results.length, listSkills().length);
    assert.ok(results.every((r) => r.written));
    for (const r of results) {
      const body = readFileSync(join(r.target, "SKILL.md"), "utf8");
      assert.match(body, /^---\n[\s\S]*?\n---/, "the copied file keeps its frontmatter");
    }
  } finally {
    rmSync(dest, { recursive: true, force: true });
  }
});

test("installs only the named skill", () => {
  const dest = mkdtempSync(join(tmpdir(), "markcv-skills-"));
  try {
    const results = installSkills({ names: ["topcv"], dest });
    assert.deepEqual(results.map((r) => r.name), ["topcv"]);
  } finally {
    rmSync(dest, { recursive: true, force: true });
  }
});

test("rejects an unknown skill name and says what exists", () => {
  assert.throws(
    () => installSkills({ names: ["nope"], dest: tmpdir() }),
    /unknown skill\(s\): nope — available: /,
  );
});

test("keeps a user's edits unless forced", () => {
  const dest = mkdtempSync(join(tmpdir(), "markcv-skills-"));
  try {
    mkdirSync(join(dest, "topcv"), { recursive: true });
    writeFileSync(join(dest, "topcv", "SKILL.md"), "edited by hand");

    const kept = installSkills({ names: ["topcv"], dest });
    assert.equal(kept[0].written, false);
    assert.equal(readFileSync(join(dest, "topcv", "SKILL.md"), "utf8"), "edited by hand");

    const forced = installSkills({ names: ["topcv"], dest, force: true });
    assert.equal(forced[0].written, true);
    assert.notEqual(readFileSync(join(dest, "topcv", "SKILL.md"), "utf8"), "edited by hand");
  } finally {
    rmSync(dest, { recursive: true, force: true });
  }
});
