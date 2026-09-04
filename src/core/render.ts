import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import puppeteer, { type Browser } from "puppeteer-core";
import { renderBody, buildHtml } from "./markdown.js";
import { photoBlock } from "./photo.js";
import { findChrome } from "./browser.js";
import type { RenderOptions } from "../types.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const MM_TO_PX = 96 / 25.4;
const A4 = { widthMm: 210, heightMm: 297 };

export interface PageBox {
  widthPx: number;
  heightPx: number;
}

/** Read the theme's `@page { margin: ... }` to derive the real printable area. */
export function pageBoxFromCss(css: string): PageBox {
  const at = css.match(/@page\s*{([^}]*)}/)?.[1] ?? "";
  const margin = at.match(/margin:\s*([^;]+);/)?.[1]?.trim() ?? "10mm";
  const parts = margin.split(/\s+/).map((v) => parseFloat(v) || 0);
  const [top, right, bottom, left] =
    parts.length === 1 ? [parts[0], parts[0], parts[0], parts[0]]
    : parts.length === 2 ? [parts[0], parts[1], parts[0], parts[1]]
    : parts.length === 3 ? [parts[0], parts[1], parts[2], parts[1]]
    : [parts[0], parts[1], parts[2], parts[3]];

  return {
    widthPx: Math.round((A4.widthMm - left - right) * MM_TO_PX),
    heightPx: Math.round((A4.heightMm - top - bottom) * MM_TO_PX),
  };
}

export function loadTheme(name = "classic"): string {
  const candidates = [
    resolve(HERE, "../../themes", `${name}.css`),
    resolve(HERE, "../../../themes", `${name}.css`),
    resolve(process.cwd(), "themes", `${name}.css`),
    resolve(name),
  ];
  const found = candidates.find(existsSync);
  if (!found) throw new Error(`Theme "${name}" not found. Available: classic, compact.`);
  return readFileSync(found, "utf8");
}

/** Measurements taken in the browser at the printable width. */
export interface RawMeasure {
  contentHeight: number;
  blocks: { tag: string; title: string; top: number; clusterHeight: number }[];
}

export interface RenderResult {
  htmlPath: string;
  pdfPath?: string;
  pageBox: PageBox;
  measure: RawMeasure;
  pdfPages?: number;
  photoFile: string | null;
  photoWarning?: string;
}

function countPdfPages(path: string): number {
  const buf = readFileSync(path);
  const matches = buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g);
  return matches ? matches.length : 0;
}

export async function render(opts: RenderOptions): Promise<RenderResult> {
  const mdPath = resolve(opts.input);
  const raw = readFileSync(mdPath, "utf8");
  const css = loadTheme(opts.theme);
  const pageBox = pageBoxFromCss(css);

  const photo = photoBlock(mdPath, opts.photo);
  const html = buildHtml(renderBody(raw, photo.html), css);

  const htmlPath = opts.html
    ? resolve(opts.html)
    : join(tmpdir(), `markcv-${Date.now()}.html`);
  mkdirSync(dirname(htmlPath), { recursive: true });
  writeFileSync(htmlPath, html, "utf8");

  let browser: Browser | undefined;
  try {
    browser = await puppeteer.launch({
      executablePath: findChrome(),
      headless: true,
      args: ["--no-sandbox", "--disable-gpu", "--font-render-hinting=none"],
    });
    const page = await browser.newPage();
    // Measure at the printable width, otherwise text wraps differently than it prints.
    await page.setViewport({ width: pageBox.widthPx, height: pageBox.heightPx });
    await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });

    const measure: RawMeasure = await page.evaluate(() => {
      const blocks = [...document.querySelectorAll("h1, h2, h3")].map((el) => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        // h2/h3 use break-after: avoid, so they stay glued to the element after them.
        const next = el.nextElementSibling as HTMLElement | null;
        const bottom = next
          ? next.getBoundingClientRect().bottom + window.scrollY
          : el.getBoundingClientRect().bottom + window.scrollY;
        return {
          tag: el.tagName,
          title: (el.textContent ?? "").trim().slice(0, 48),
          top: Math.round(top),
          clusterHeight: Math.round(bottom - top),
        };
      });
      return { contentHeight: Math.round(document.body.scrollHeight), blocks };
    });

    let pdfPages: number | undefined;
    let pdfPath: string | undefined;
    if (opts.pdf) {
      pdfPath = resolve(opts.pdf);
      mkdirSync(dirname(pdfPath), { recursive: true });
      await page.pdf({
        path: pdfPath,
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false,
      });
      pdfPages = countPdfPages(pdfPath);
    }

    return {
      htmlPath, pdfPath, pageBox, measure, pdfPages,
      photoFile: photo.file, photoWarning: photo.warning,
    };
  } finally {
    await browser?.close();
  }
}
