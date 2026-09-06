# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/phuthuycoding/markcv/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/phuthuycoding/markcv/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/phuthuycoding/markcv/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/phuthuycoding/markcv/releases/tag/v0.1.0
