/** Types shared by the CLI and the MCP server. */

export interface RenderOptions {
  /** Source markdown file. */
  input: string;
  /** Output PDF path. Omit to only produce HTML. */
  pdf?: string;
  /** Output HTML path. Omit to use a temp file. */
  html?: string;
  /** Theme name under themes/, defaults to "classic". */
  theme?: string;
  /** Portrait photo. Omit to auto-detect photo.* next to the markdown file. */
  photo?: string | null;
  /** Target page count, used to report pass/fail. */
  targetPages?: number;
}

/** A block pushed onto a new page, with the gap it left behind. */
export interface CulpritBlock {
  title: string;
  tag: string;
  /** Vertical position in the content flow (px). */
  top: number;
  /** Empty space left at the bottom of the previous page (px). */
  wastedPx: number;
  page: number;
}

export interface FitReport {
  pages: number;
  targetPages?: number;
  fits: boolean;
  /** Real content height (px, measured at the printable width). */
  contentHeight: number;
  /** Usable height of a single page (px). */
  usablePerPage: number;
  /** Space left over; negative means the content is too long. */
  slackPx: number;
  /** Whether the content would fit if no block were pushed to a new page. */
  contentWouldFit: boolean;
  /** Pixels wasted by blocks pushed onto a new page. */
  wastedByBreaksPx: number;
  culprits: CulpritBlock[];
  /** Suggested actions, most effective first. */
  suggestions: string[];
}

export type Severity = "error" | "warn" | "info";

export interface LintFinding {
  rule: string;
  severity: Severity;
  line: number;
  /** The text that triggered this finding. */
  excerpt: string;
  message: string;
  suggestion?: string;
}

export interface TailorReport {
  /** JD requirements with no evidence anywhere in the CV. */
  missing: { keyword: string; hint: string }[];
  /** Keywords that appear only under SKILLS, with no experience backing them. */
  unsupported: { keyword: string; hint: string }[];
  /** Bullets unrelated to the JD - cut these before cutting anything valuable. */
  irrelevant: { line: number; excerpt: string }[];
  /** JD keywords the CV genuinely backs up. */
  covered: { keyword: string; evidenceLine: number }[];
  score: number;
}

export interface CvDoc {
  /** Raw markdown. */
  raw: string;
  /** Lines, for line-number lookups. */
  lines: string[];
  /** Level-2 sections in document order. */
  sections: { title: string; start: number; end: number }[];
}
