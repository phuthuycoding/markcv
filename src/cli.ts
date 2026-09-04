#!/usr/bin/env node
import { Command } from "commander";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, basename, join } from "node:path";
import { render } from "./core/render.js";
import { analyseFit } from "./core/fit.js";
import { lint } from "./core/lint.js";
import { tailor } from "./core/tailor.js";
import { newVariant, listVariants, diffVariants } from "./core/variants.js";
import { c, ok, bad, warn, info } from "./ui.js";
import type { FitReport, LintFinding } from "./types.js";

const program = new Command();
program.name("markcv").description("Build, fit and audit a CV written in Markdown").version("0.1.0");

const pdfNameFor = (md: string) => md.replace(/\.md$/, ".pdf");

function printFit(r: FitReport) {
  const head = r.fits ? ok(`${r.pages} page(s)`) : bad(`${r.pages} pages (target ${r.targetPages})`);
  console.log(head);
  console.log(info(`content ${r.contentHeight}px / ${r.usablePerPage * (r.targetPages ?? r.pages)}px available`));
  if (r.wastedByBreaksPx > 0) console.log(info(`${r.wastedByBreaksPx}px wasted by page breaks`));
  if (r.culprits.length) {
    console.log(c.bold("\nBlocks pushed to a new page:"));
    for (const cu of r.culprits) {
      console.log(`  ${c.yellow(cu.title)} ${c.dim(`(${cu.tag}, y=${cu.top})`)} → wastes ${c.red(String(cu.wastedPx) + "px")} at the end of page ${cu.page}`);
    }
  }
  if (r.suggestions.length) {
    console.log(c.bold("\nSuggestions:"));
    for (const s of r.suggestions) console.log(`  ${s}`);
  }
}

function printLint(fs: LintFinding[]) {
  if (!fs.length) return console.log(ok("no issues found"));
  const bySeverity = { error: 0, warn: 0, info: 0 };
  for (const f of fs) {
    bySeverity[f.severity]++;
    const tag =
      f.severity === "error" ? c.red("error") : f.severity === "warn" ? c.yellow("warn ") : c.dim("info ");
    console.log(`${tag} ${c.dim(`L${String(f.line).padStart(3)}`)} ${c.cyan(f.rule)}  ${f.message}`);
    if (f.excerpt) console.log(`      ${c.dim("→ " + f.excerpt)}`);
    if (f.suggestion) console.log(`      ${c.green("fix:")} ${f.suggestion}`);
  }
  console.log(`\n${bySeverity.error} error · ${bySeverity.warn} warn · ${bySeverity.info} info`);
}

program
  .command("render <file>")
  .description("Build a PDF (and HTML) from a markdown file")
  .option("-o, --pdf <path>", "output PDF path")
  .option("--html <path>", "keep the intermediate HTML")
  .option("-t, --theme <name>", "theme: classic | compact", "classic")
  .option("-p, --pages <n>", "target page count", (v) => parseInt(v, 10))
  .option("--no-photo", "do not embed the portrait photo")
  .action(async (file, o) => {
    const res = await render({
      input: file,
      pdf: o.pdf ?? pdfNameFor(file),
      html: o.html,
      theme: o.theme,
      photo: o.photo === false ? null : undefined,
      targetPages: o.pages,
    });
    console.log(ok(`PDF  ${res.pdfPath}`));
    if (o.html) console.log(info(`HTML ${res.htmlPath}`));
    const photoNote = o.photo === false ? "disabled" : res.photoFile ? basename(res.photoFile) : "none (placeholder box)";
    console.log(info(`photo ${photoNote}`));
    if (res.photoWarning) console.log(warn(res.photoWarning));
    const fit = analyseFit(res.measure, res.pageBox, res.pdfPages ?? 0, o.pages);
    printFit(fit);
  });

program
  .command("fit <file>")
  .description("Why the CV does not fit the target page count")
  .option("-p, --pages <n>", "target page count", (v) => parseInt(v, 10), 2)
  .option("-t, --theme <name>", "theme", "classic")
  .option("--json", "output JSON")
  .action(async (file, o) => {
    const tmpPdf = join(process.env.TMPDIR ?? "/tmp", `markcv-fit-${Date.now()}.pdf`);
    const res = await render({ input: file, pdf: tmpPdf, theme: o.theme, targetPages: o.pages });
    const report = analyseFit(res.measure, res.pageBox, res.pdfPages ?? 0, o.pages);
    if (o.json) return console.log(JSON.stringify(report, null, 2));
    printFit(report);
    process.exitCode = report.fits ? 0 : 1;
  });

program
  .command("lint <file>")
  .description("Audit content: overselling, underselling, tense, unbacked claims, duplicates")
  .option("--json", "output JSON")
  .option("--strict", "treat warnings as failures")
  .action((file, o) => {
    const findings = lint(readFileSync(resolve(file), "utf8"));
    if (o.json) return console.log(JSON.stringify(findings, null, 2));
    printLint(findings);
    const fail = findings.some((f) => f.severity === "error" || (o.strict && f.severity === "warn"));
    process.exitCode = fail ? 1 : 0;
  });

program
  .command("tailor <file>")
  .description("Compare the CV against a job description")
  .requiredOption("--jd <path>", "job description file (txt/md)")
  .option("--json", "output JSON")
  .action((file, o) => {
    const report = tailor(readFileSync(resolve(file), "utf8"), readFileSync(resolve(o.jd), "utf8"));
    if (o.json) return console.log(JSON.stringify(report, null, 2));
    console.log(c.bold(`Match: ${report.score}%  (${report.covered.length}/${report.covered.length + report.missing.length + report.unsupported.length} JD keywords)`));
    if (report.missing.length) {
      console.log(c.bold("\nAsked for by the JD, missing from the CV:"));
      for (const m of report.missing) console.log(`  ${bad(m.keyword)} ${c.dim(m.hint)}`);
    }
    if (report.unsupported.length) {
      console.log(c.bold("\nOnly under SKILLS, with no evidence:"));
      for (const u of report.unsupported) console.log(`  ${warn(u.keyword)} ${c.dim(u.hint)}`);
    }
    if (report.irrelevant.length) {
      console.log(c.bold("\nBullets unrelated to the JD (cut these first):"));
      for (const i of report.irrelevant.slice(0, 8)) console.log(`  ${c.dim(`L${i.line}`)} ${i.excerpt}`);
    }
    if (report.covered.length) {
      console.log(c.bold("\nBacked by evidence:"));
      console.log("  " + report.covered.map((x) => c.green(x.keyword)).join(", "));
    }
  });

program
  .command("new <name>")
  .description("Start a tailored version from a master file")
  .requiredOption("--from <master>", "master CV file")
  .action((name, o) => console.log(ok(`created ${newVariant(o.from, name)}`)));

program
  .command("list [dir]")
  .description("List every CV in a folder")
  .action((dir = ".") => {
    for (const v of listVariants(dir)) {
      console.log(`${c.bold(v.name.padEnd(28))} ${String(v.lines).padStart(4)} lines  ${String(v.bullets).padStart(3)} bullets  ${c.dim(v.sections.join(" · "))}`);
    }
  });

program
  .command("diff <a> <b>")
  .description("Compare two CVs bullet by bullet")
  .action((a, b) => {
    const d = diffVariants(a, b);
    console.log(c.bold(`${d.shared} bullets in common`));
    if (d.onlyInA.length) {
      console.log(c.bold(`\nOnly in ${basename(a)}:`));
      for (const l of d.onlyInA) console.log(`  ${c.green("+")} ${l.slice(0, 100)}`);
    }
    if (d.onlyInB.length) {
      console.log(c.bold(`\nOnly in ${basename(b)}:`));
      for (const l of d.onlyInB) console.log(`  ${c.blue("+")} ${l.slice(0, 100)}`);
    }
  });

program
  .command("build [dir]")
  .description("Build a PDF for every cv-*.md in a folder")
  .option("-p, --pages <n>", "target page count", (v) => parseInt(v, 10), 2)
  .option("-t, --theme <name>", "theme", "classic")
  .action(async (dir = ".", o) => {
    const all = readdirSync(resolve(dir)).filter((f) => f.startsWith("cv-") && f.endsWith(".md"));
    // A file marked <!-- markcv:no-build --> is a content store, not something you
    // submit — skip it in batch builds.
    const files = all.filter((f) => {
      const head = readFileSync(join(resolve(dir), f), "utf8").slice(0, 400);
      const skip = /markcv:no-build/i.test(head);
      if (skip) console.log(`${c.dim("–")} ${f.padEnd(34)} ${c.dim("skipped (content store)")}`);
      return !skip;
    });
    if (!files.length) return console.log(warn("nothing to build"));
    for (const f of files) {
      const src = join(resolve(dir), f);
      const res = await render({ input: src, pdf: pdfNameFor(src), theme: o.theme, targetPages: o.pages });
      const fit = analyseFit(res.measure, res.pageBox, res.pdfPages ?? 0, o.pages);
      const mark = fit.fits ? c.green("✓") : c.red("✗");
      console.log(`${mark} ${f.padEnd(34)} ${fit.pages} page(s)  ${c.dim(fit.fits ? "" : fit.suggestions[0] ?? "")}`);
    }
  });

program.parseAsync(process.argv);
