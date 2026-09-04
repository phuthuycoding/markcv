import type { FitReport, CulpritBlock } from "../types.js";
import type { RawMeasure, PageBox } from "./render.js";

/**
 * Explain why a CV does not fit the target page count.
 *
 * The key distinction: "content too long" and "bad page break" are TWO different
 * problems with opposite cures. Trimming words while the real culprit is a heading
 * sitting just above a page boundary wastes effort — that one needs a reorder or
 * tighter spacing instead.
 */
export function analyseFit(
  measure: RawMeasure,
  pageBox: PageBox,
  pdfPages: number,
  targetPages?: number,
): FitReport {
  const usable = pageBox.heightPx;
  const { contentHeight } = measure;

  const culprits: CulpritBlock[] = [];
  for (const b of measure.blocks) {
    // Bottom edge of the page this block sits on. floor+1, not ceil: a block at
    // y=0 belongs to page 1 and still has the whole page below it.
    const pageEnd = (Math.floor(b.top / usable) + 1) * usable;
    const room = pageEnd - b.top;
    // The cluster (heading + the element glued to it) does not fit -> it gets pushed down.
    if (b.clusterHeight > room) {
      culprits.push({
        title: b.title,
        tag: b.tag,
        top: b.top,
        wastedPx: Math.round(room),
        page: Math.floor(b.top / usable) + 1,
      });
    }
  }
  culprits.sort((a, b) => b.wastedPx - a.wastedPx);

  const wastedByBreaksPx = culprits.reduce((sum, c) => sum + c.wastedPx, 0);
  const target = targetPages ?? pdfPages;
  const budget = usable * target;
  const slackPx = Math.round(budget - contentHeight);
  const contentWouldFit = contentHeight <= budget;
  const fits = pdfPages <= target;

  const suggestions: string[] = [];
  if (!fits) {
    if (contentWouldFit) {
      const worst = culprits[0];
      suggestions.push(
        `Content HAS ROOM (${slackPx}px to spare) - length is not the problem, the page break is.`,
      );
      if (worst) {
        suggestions.push(
          `"${worst.title}" at y=${worst.top} has only ${worst.wastedPx}px left before the end of ` +
            `page ${worst.page}, so the whole block moved down.`,
        );
        suggestions.push(
          `Fix: reorder sections, cut ~${Math.ceil(worst.wastedPx / 15)} lines above it, ` +
            `or use --theme compact.`,
        );
      }
    } else {
      const over = Math.abs(slackPx);
      suggestions.push(
        `Content is ~${over}px longer than ${target} page(s) (~${Math.ceil(over / 15)} lines).`,
      );
      suggestions.push(`Cut ~${Math.ceil(over / 15)} lines, or use --theme compact.`);
      if (wastedByBreaksPx > 0) {
        suggestions.push(
          `On top of that, ${wastedByBreaksPx}px is wasted by page breaks - see culprits.`,
        );
      }
    }
  }

  return {
    pages: pdfPages,
    targetPages,
    fits,
    contentHeight,
    usablePerPage: usable,
    slackPx,
    contentWouldFit,
    wastedByBreaksPx,
    culprits: culprits.slice(0, 5),
    suggestions,
  };
}
