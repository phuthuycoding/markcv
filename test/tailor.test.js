import { test } from "node:test";
import assert from "node:assert/strict";
import { tailor } from "../dist/core/tailor.js";

const cv = `# A B

**Email:** a@b.c

## WORK EXPERIENCE

### C

**Lead** | 2020 - 2021

* Built services with Golang and Kafka, deployed on Kubernetes.
* Organised the annual company picnic and managed catering budgets.

## SKILLS

* **Infra:** Kubernetes, Terraform, React.
`;

const jd = "We need Golang, Kafka, Kubernetes, React, Terraform and Playwright for e2e testing.";

test("separates proven / skills-only / entirely missing", () => {
  const r = tailor(cv, jd);
  const covered = r.covered.map((c) => c.keyword);
  const unsupported = r.unsupported.map((c) => c.keyword);
  const missing = r.missing.map((c) => c.keyword);

  assert.ok(covered.includes("golang"), "golang appears in experience");
  assert.ok(covered.includes("kafka"));
  assert.ok(unsupported.includes("terraform"), "terraform is SKILLS-only");
  assert.ok(missing.includes("playwright"), "JD asks for playwright, CV has none");
});

test("flags bullets unrelated to the JD", () => {
  const r = tailor(cv, jd);
  assert.ok(r.irrelevant.some((i) => i.excerpt.includes("picnic")));
});

test("match score stays within 0..100", () => {
  const r = tailor(cv, jd);
  assert.ok(r.score >= 0 && r.score <= 100);
});
