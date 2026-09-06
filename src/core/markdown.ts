import MarkdownIt from "markdown-it";
import type { CvDoc } from "../types.js";

const md = new MarkdownIt({ html: false, linkify: false, typographer: false });

/**
 * HTML comments carry metadata for tools (markcv:no-build and friends), never
 * content. With `html: false` markdown-it escapes them into visible text rather
 * than dropping them, so strip them before rendering.
 */
function stripComments(raw: string): string {
  return raw.replace(/<!--[\s\S]*?-->/g, "");
}

/** A header contact line: `**Label:** value` (no `|`, unlike a job-title line). */
const CONTACT_RE = /^<p><strong>[^<]+:<\/strong>[^|]*<\/p>$/;
/** A job-title line: `**Job Title** | 2020 - 2021`. */
const META_RE = /^<p><strong>.*\|.*<\/p>$/;

export function parseCv(input: string): CvDoc {
  const raw = stripComments(input);
  const lines = raw.split("\n");
  const sections: CvDoc["sections"] = [];
  lines.forEach((line, i) => {
    if (line.startsWith("## ")) {
      if (sections.length) sections[sections.length - 1].end = i - 1;
      sections.push({ title: line.slice(3).trim(), start: i, end: lines.length - 1 });
    }
  });
  return { raw, lines, sections };
}

/**
 * Markdown -> page body HTML.
 * The header (name + contact lines) is wrapped in .header so the portrait can be
 * positioned against it, and contact lines are grouped into .contacts so they can
 * be laid out as one block.
 */
export function renderBody(raw: string, photoHtml: string): string {
  const html = md.render(stripComments(raw));
  const blocks = html.split("\n").filter((l) => l.trim() !== "");

  const out: string[] = [];
  let headerOpen = false;
  let contactsOpen = false;

  const closeContacts = () => {
    if (contactsOpen) {
      out.push("</div>");
      contactsOpen = false;
    }
  };

  for (const block of blocks) {
    const isContact = headerOpen && CONTACT_RE.test(block);

    if (!isContact) closeContacts();

    if (block.startsWith("<h1>")) {
      out.push('<div class="header">', photoHtml, block);
      headerOpen = true;
      continue;
    }

    if (block.startsWith("<h2>") && headerOpen) {
      out.push("</div>");           // close .header before the first section
      headerOpen = false;
    }

    if (isContact) {
      if (!contactsOpen) {
        out.push('<div class="contacts">');
        contactsOpen = true;
      }
      out.push(block.replace("<p>", '<p class="contact">'));
      continue;
    }

    if (META_RE.test(block)) {
      out.push(block.replace("<p>", '<p class="meta">'));
      continue;
    }

    out.push(block);
  }

  closeContacts();
  if (headerOpen) out.push("</div>");
  return out.join("\n");
}

export function buildHtml(body: string, css: string, title = "CV"): string {
  return [
    '<!doctype html><html lang="en"><head><meta charset="utf-8">',
    `<title>${title}</title><style>${css}</style></head><body>`,
    body,
    "</body></html>",
  ].join("");
}
