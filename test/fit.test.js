import { test } from "node:test";
import assert from "node:assert/strict";
import { pageBoxFromCss } from "../dist/core/render.js";
import { analyseFit } from "../dist/core/fit.js";

test("reads the printable area from @page", () => {
  const box = pageBoxFromCss("@page { size: A4; margin: 11mm 13mm; }");
  assert.equal(box.widthPx, Math.round((210 - 26) * 96 / 25.4));
  assert.equal(box.heightPx, Math.round((297 - 22) * 96 / 25.4));
});

test("separates content-too-long from bad-page-break", () => {
  const box = { widthPx: 695, heightPx: 1040 };

  // content fits in 2 pages, but a heading lands right at the bottom of page 1
  const breakProblem = analyseFit(
    { contentHeight: 1986, blocks: [{ tag: "H2", title: "PROJECT HIGHLIGHTS", top: 1009, clusterHeight: 90 }] },
    box, 3, 2,
  );
  assert.equal(breakProblem.contentWouldFit, true);
  assert.equal(breakProblem.culprits.length, 1);
  assert.equal(breakProblem.culprits[0].wastedPx, 31);
  assert.match(breakProblem.suggestions[0], /HAS ROOM/);

  // content genuinely too long
  const tooLong = analyseFit({ contentHeight: 2400, blocks: [] }, box, 3, 2);
  assert.equal(tooLong.contentWouldFit, false);
  assert.match(tooLong.suggestions[0], /longer than/);
});

test("no suggestions when it already fits", () => {
  const r = analyseFit({ contentHeight: 1900, blocks: [] }, { widthPx: 695, heightPx: 1040 }, 2, 2);
  assert.equal(r.fits, true);
  assert.equal(r.suggestions.length, 0);
});

test("a paragraph or list item pushed to a new page is reported too", () => {
  const box = { widthPx: 695, heightPx: 1040 };
  // No heading involved: a long list item sits too close to the page edge.
  const r = analyseFit(
    { contentHeight: 2048, blocks: [{ tag: "LI", title: "Managed the infrastructure and", top: 1020, clusterHeight: 40 }] },
    box, 3, 2,
  );
  assert.equal(r.culprits.length, 1, "the list item should be named as a culprit");
  assert.equal(r.culprits[0].tag, "LI");
  assert.equal(r.culprits[0].wastedPx, 20);
});

test("nested blocks at the same position are not counted twice", () => {
  const box = { widthPx: 695, heightPx: 1040 };
  const r = analyseFit(
    {
      contentHeight: 2048,
      blocks: [
        { tag: "LI", title: "same spot", top: 1020, clusterHeight: 40 },
        { tag: "P", title: "same spot", top: 1021, clusterHeight: 38 },
      ],
    },
    box, 3, 2,
  );
  assert.equal(r.culprits.length, 1, "one break, one culprit");
});
