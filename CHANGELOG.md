# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-09-09

### Added

- Agent skills bundled with the package, plus `markcv skills` to list them and
  `markcv skills install [names...]` to copy them into `~/.claude/skills`
  (`--dest` to install elsewhere, `--force` to overwrite). The MCP server hands an
  agent the tools; a skill is what tells it which cure a given `fit` diagnosis calls
  for, and what a bullet should sound like. Two ship today: `markcv` for writing and
  auditing a CV, and `topcv` for publishing one to TopCV.vn. An already-installed
  skill is left alone unless `--force` is passed, so local edits are never lost.

## [0.1.5] - 2026-09-06

### Fixed

- `fit` measured only headings, so a page break caused by a list item or a
  paragraph was reported with an empty `culprits` list: it said the page break was
  at fault but could not say which block. Both carry `break-inside: avoid` in the
  print stylesheet and are pushed onto a new page whole, exactly like a heading.
  All three are now measured, and nested blocks at the same position are reported
  once rather than twice.

## [0.1.4] - 2026-09-06

### Fixed

- HTML comments were printed into the PDF instead of being dropped. With
  markdown-it's `html: false`, comments are escaped into visible text rather than
  ignored, so a file carrying `<!-- markcv:no-build -->` rendered that marker at
  the top of the page. Comments are metadata for tooling, never content, and are
  now stripped before rendering.

## [0.1.3] - 2026-09-06

### Changed

- Package description and keywords rewritten around what people actually search
  for. `resume-linter` had no package competing for it at all, while `markdown
  resume` is crowded — so the wording leads with the linting and page-fit work
  rather than with rendering, which is the part everyone already does.
- README opens by stating what the tool does differently, and adds a section
  comparing it with the existing Markdown resume renderers, including when to use
  one of those instead.
- Image alt text now describes the resumes shown rather than repeating the tool name.

## [0.1.2] - 2026-09-06

### Fixed

- `markcv --version` reported the version that was hardcoded in the source rather
  than the one actually installed: 0.1.1 shipped while `--version` still said
  0.1.0. Both the CLI and the MCP server now read it from `package.json`, and a
  test fails if the two ever disagree.

## [0.1.1] - 2026-09-06

### Added

- `markcv mcp` subcommand, so MCP clients can use the shape everyone else uses:
  `npx -y @phuthuycoding/markcv mcp`. With two binaries in the package, the bare
  `npx` form would otherwise need `--package=…`, which nobody writes from memory.

### Changed

- README now leads with installing from npm, and no longer asks the reader to
  clone and build. Development setup moved to `CONTRIBUTING.md`.
- MCP documentation defaults to the `npx` form; the global `markcv-mcp` binary is
  presented as the faster alternative rather than the only way.
- `render --no-photo` reports `photo disabled` instead of
  `photo none (placeholder box)` — not embedding a photo and not finding one are
  different things.

## [0.1.0] - 2026-09-06

First release.

### Added

- `fit` — explains *why* a CV does not fit a page target, separating content that
  is genuinely too long from content pushed onto a new page by a bad break, and
  naming the block responsible with the pixels it wasted.
- `lint` — audits content rather than formatting: overselling (`spearheaded`,
  `comprehensive`), **underselling** (`advised on` next to work of real scale),
  present-tense bullets on finished jobs, skills claimed with no supporting
  experience, duplicate bullets, IC/manager role mismatch, bullets without a
  single number, emoji in headings, and over-long bullets.
- `tailor` — compares a CV against a job description: requirements with no
  evidence, keywords that appear only under SKILLS, and bullets unrelated to the
  role.
- `render` — Markdown to A4 PDF via a system Chrome, with portrait photo
  auto-detection and a warning when the photo will bloat the PDF.
- `new`, `list`, `diff`, `build` — master/variant workflow for keeping one content
  store and cutting tailored copies from it.
- MCP server exposing seven tools that return structured JSON, so an agent can
  iterate: edit → `check_fit` → read `culprits` → edit again.
- Two ATS-safe themes: `classic` and `compact`.
- Example CVs in `examples/`, with and without a portrait photo.

[Unreleased]: https://github.com/phuthuycoding/markcv/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/phuthuycoding/markcv/compare/v0.1.5...v0.2.0
[0.1.5]: https://github.com/phuthuycoding/markcv/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/phuthuycoding/markcv/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/phuthuycoding/markcv/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/phuthuycoding/markcv/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/phuthuycoding/markcv/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/phuthuycoding/markcv/releases/tag/v0.1.0
