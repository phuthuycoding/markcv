import { test } from "node:test";
import assert from "node:assert/strict";
import { renderBody, parseCv } from "../dist/core/markdown.js";

const cv = `# Ta Manh Quyen

**Address:** Hà Nội

**Email:** a@b.c

***

## OBJECTIVE

Some text.

## WORK EXPERIENCE

### Company

**Lead** | Jan 2020 - Dec 2021

* Bullet one with **bold**.
* Bullet two.
`;

test("groups contact lines into a single block", () => {
  const html = renderBody(cv, '<img class="photo">');
  assert.equal((html.match(/<div class="contacts">/g) ?? []).length, 1);
  assert.equal((html.match(/<p class="contact">/g) ?? []).length, 2);
});

test("wraps the header and places the photo inside it", () => {
  const html = renderBody(cv, '<img class="photo">');
  const headerStart = html.indexOf('<div class="header">');
  const photo = html.indexOf('<img class="photo">');
  const h1 = html.indexOf("<h1>");
  assert.ok(headerStart >= 0 && photo > headerStart && h1 > photo);
  // .header must close before the first section
  assert.ok(html.indexOf("</div>") < html.indexOf("<h2>"));
});

test("job title + dates gets the meta class", () => {
  const html = renderBody(cv, "");
  assert.match(html, /<p class="meta"><strong>Lead<\/strong> \| Jan 2020 - Dec 2021<\/p>/);
});

test("contact lines are not mistaken for meta lines", () => {
  const html = renderBody(cv, "");
  assert.ok(!/<p class="meta"><strong>Email/.test(html));
});

test("parseCv lists the sections in order", () => {
  const doc = parseCv(cv);
  assert.deepEqual(doc.sections.map((s) => s.title), ["OBJECTIVE", "WORK EXPERIENCE"]);
});

test("bullets keep bold formatting", () => {
  const html = renderBody(cv, "");
  assert.match(html, /<li>Bullet one with <strong>bold<\/strong>.<\/li>/);
});
