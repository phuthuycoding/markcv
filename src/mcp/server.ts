#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { render } from "../core/render.js";
import { analyseFit } from "../core/fit.js";
import { lint } from "../core/lint.js";
import { tailor } from "../core/tailor.js";
import { newVariant, listVariants, diffVariants } from "../core/variants.js";

const server = new McpServer({ name: "fitcv", version: "0.1.0" });

/** Every tool returns JSON so an agent can loop on the result, rather than prose for a human. */
const json = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
});
const fail = (message: string) => ({
  content: [{ type: "text" as const, text: JSON.stringify({ error: message }, null, 2) }],
  isError: true,
});

const mdFile = z.string().describe("Path to the CV markdown file");

server.registerTool(
  "render_cv",
  {
    title: "Build a PDF from a markdown CV",
    description:
      "Render the CV to PDF (and HTML). Returns the real page count plus layout numbers to verify against.",
    inputSchema: {
      file: mdFile,
      pdf: z.string().optional().describe("Output PDF path; defaults to the .md path with a .pdf extension"),
      theme: z.enum(["classic", "compact"]).optional(),
      target_pages: z.number().int().min(1).max(10).optional(),
    },
  },
  async ({ file, pdf, theme, target_pages }) => {
    if (!existsSync(resolve(file))) return fail(`File not found: ${file}`);
    const res = await render({
      input: file,
      pdf: pdf ?? file.replace(/\.md$/, ".pdf"),
      theme,
      targetPages: target_pages,
    });
    const fit = analyseFit(res.measure, res.pageBox, res.pdfPages ?? 0, target_pages);
    return json({
      pdf: res.pdfPath,
      pages: res.pdfPages,
      photo: res.photoFile,
      photo_warning: res.photoWarning,
      fit,
    });
  },
);

server.registerTool(
  "check_fit",
  {
    title: "Why the CV does not fit",
    description:
      "Separates two very different causes: content that is too long, versus bad page breaks. " +
      "Returns the overflow, the blocks pushed onto a new page, the pixels wasted, and concrete suggestions.",
    inputSchema: {
      file: mdFile,
      target_pages: z.number().int().min(1).max(10).default(2),
      theme: z.enum(["classic", "compact"]).optional(),
    },
  },
  async ({ file, target_pages, theme }) => {
    if (!existsSync(resolve(file))) return fail(`File not found: ${file}`);
    const tmpPdf = join(tmpdir(), `fitcv-mcp-${Date.now()}.pdf`);
    const res = await render({ input: file, pdf: tmpPdf, theme, targetPages: target_pages });
    return json(analyseFit(res.measure, res.pageBox, res.pdfPages ?? 0, target_pages));
  },
);

server.registerTool(
  "lint_cv",
  {
    title: "Audit CV content",
    description:
      "Finds unverifiable self-praise, UNDERSTATED claims relative to the real work, present-tense " +
      "bullets on finished jobs, skills with no supporting evidence, duplicate bullets, and IC/manager role mismatch.",
    inputSchema: { file: mdFile },
  },
  async ({ file }) => {
    if (!existsSync(resolve(file))) return fail(`File not found: ${file}`);
    const findings = lint(readFileSync(resolve(file), "utf8"));
    return json({
      total: findings.length,
      errors: findings.filter((f) => f.severity === "error").length,
      warnings: findings.filter((f) => f.severity === "warn").length,
      findings,
    });
  },
);

server.registerTool(
  "tailor_to_jd",
  {
    title: "Compare the CV against a job description",
    description:
      "Points out JD requirements with no evidence, keywords that live only under SKILLS, and unrelated " +
      "bullets (cut those first, before cutting anything valuable).",
    inputSchema: {
      file: mdFile,
      jd_file: z.string().optional().describe("Path to a job-description file"),
      jd_text: z.string().optional().describe("Job description pasted inline"),
    },
  },
  async ({ file, jd_file, jd_text }) => {
    if (!existsSync(resolve(file))) return fail(`File not found: ${file}`);
    const jd = jd_text ?? (jd_file && existsSync(resolve(jd_file)) ? readFileSync(resolve(jd_file), "utf8") : "");
    if (!jd.trim()) return fail("Either jd_file or jd_text is required");
    return json(tailor(readFileSync(resolve(file), "utf8"), jd));
  },
);

server.registerTool(
  "list_variants",
  {
    title: "List CV versions",
    description: "Every .md file in a folder with its line count, bullet count and section list.",
    inputSchema: { dir: z.string().default(".") },
  },
  async ({ dir }) => {
    if (!existsSync(resolve(dir))) return fail(`Directory not found: ${dir}`);
    return json(listVariants(dir));
  },
);

server.registerTool(
  "new_variant",
  {
    title: "Start a tailored version",
    description: "Copy a master CV to cv-<name>.md so it can be trimmed for one specific role.",
    inputSchema: { master: mdFile, name: z.string().regex(/^[a-z0-9-]+$/) },
  },
  async ({ master, name }) => {
    try {
      return json({ created: newVariant(master, name) });
    } catch (e) {
      return fail((e as Error).message);
    }
  },
);

server.registerTool(
  "diff_variants",
  {
    title: "Compare two CV versions",
    description: "Which bullets exist on only one side — use it to see what a tailored copy dropped.",
    inputSchema: { a: mdFile, b: mdFile },
  },
  async ({ a, b }) => {
    if (!existsSync(resolve(a)) || !existsSync(resolve(b))) return fail("One of the two files was not found");
    return json(diffVariants(a, b));
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
