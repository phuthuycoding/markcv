<p align="center">
  <img src="https://raw.githubusercontent.com/phuthuycoding/markcv/master/docs/images/logo-256.png" width="104" alt="markcv logo">
</p>

<h1 align="center">markcv</h1>

[![CI](https://github.com/phuthuycoding/markcv/actions/workflows/ci.yml/badge.svg)](https://github.com/phuthuycoding/markcv/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@phuthuycoding/markcv.svg)](https://www.npmjs.com/package/@phuthuycoding/markcv)
[![docs](https://img.shields.io/badge/docs-markcv-c96442)](https://phuthuycoding.github.io/markcv/)

<p align="center">
  <img src="https://raw.githubusercontent.com/phuthuycoding/markcv/master/docs/screenshots/engineering-lead.png" width="640" alt="Two-page ATS-safe resume PDF generated from Markdown by markcv">
  <br>
  <sub><code>examples/engineering-lead.md</code> — plain Markdown in, two-page A4 PDF out</sub>
</p>

**Markdown resume builder** that does two things other markdown-to-PDF tools do not:
it tells you *why* your CV will not fit on two pages, and it lints the writing itself.
Runs as a CLI and as an **MCP server**, so an AI agent can do both on its own.

- **`fit`** tells you *why* your CV does not fit on 2 pages. "Content too long" and "bad page break" are different illnesses with opposite cures — trimming words while the real culprit is a heading sitting 31px from the bottom of page 1 just wastes your time.
- **`lint`** checks *content*, not formatting. It catches overselling **and underselling** — claiming less than you did is a mistake too, and it costs you something while gaining nothing.

## Contents

- [Install](#install)
- [Usage](#usage)
  - [`fit` — page-break diagnosis](#fit--page-break-diagnosis)
  - [`lint` — rules](#lint--rules)
- [Examples](#examples)
  - [With a portrait photo](#with-a-portrait-photo)
- [MCP server](#mcp-server)
  - [Register it with a client](#register-it-with-a-client)
  - [File paths in tool arguments](#file-paths-in-tool-arguments)
  - [Tools](#tools)
  - [Requirements](#requirements)
- [Agent skills](#agent-skills)
- [CV format](#cv-format)
- [Themes](#themes)
- [How this differs from other Markdown resume tools](#how-this-differs-from-other-markdown-resume-tools)
- [Author](#author)
- [License](#license)

## Install

```bash
npm install -g @phuthuycoding/markcv
```

The package is scoped; the commands are not. You type `markcv` and `markcv-mcp`.

Or run it without installing:

```bash
npx @phuthuycoding/markcv fit cv.md --pages 2
```

Requires a Chromium-based browser already on your machine (Chrome, Chromium, Edge, Brave). markcv deliberately does **not** download its own Chromium — it uses `puppeteer-core`, so the install stays small. If your browser lives somewhere unusual, point at it with `MARKCV_CHROME=/path/to/chrome`.

## Usage

```bash
markcv render cv.md -o Output.pdf     # build the PDF, report the page count
markcv fit cv.md --pages 2            # why it does not fit yet
markcv lint cv.md                     # audit the content
markcv tailor cv.md --jd jd.txt       # compare against a job description
markcv new techlead --from cv-master.md
markcv list                           # every CV in the folder
markcv diff cv-a.md cv-b.md           # what a tailored copy dropped
markcv build --pages 2                # build every cv-*.md
markcv skills install                 # install the agent skills (see below)
```

### `fit` — page-break diagnosis

```
✗ 3 pages (target 2)
· content 1986px / 2080px available
· 31px wasted by page breaks

Blocks pushed to a new page:
  PROJECT HIGHLIGHTS (H2, y=1009) → wastes 31px at the end of page 1

Suggestions:
  Content HAS ROOM (94px to spare) — length is not the problem, the page break is.
  "PROJECT HIGHLIGHTS" at y=1009 has only 31px left before the end of page 1, so the whole block moved down.
  Fix: reorder sections, cut ~3 lines above it, or use --theme compact.
```

### `lint` — rules

| Rule | What it catches |
|---|---|
| `over-claim` | `spearheaded`, `rigorous`, `comprehensive`, `excellence`… — self-praise nobody can verify |
| `under-claim` | `advised on` / `worked on` next to real scale — you are probably selling yourself short |
| `tense` | a finished job still described in the present tense |
| `unsupported-skill` | a skill listed under SKILLS with no experience line backing it |
| `duplicate` | two bullets saying the same thing |
| `role-mismatch` | an IC job title paired with people-management language |
| `no-metric` | a long bullet with no number in it |
| `ats-emoji` | emoji in a heading — risky for ATS parsers |
| `long-bullet` | a bullet long enough that skimmers will skip it |

## Examples

Three complete CVs in [`examples/`](examples), written for different roles so you can see
how the same format stretches. Each one builds with the default theme and no photo.

<table>
<tr>
<td width="33%"><a href="docs/screenshots/backend-engineer.png"><img src="https://raw.githubusercontent.com/phuthuycoding/markcv/master/docs/screenshots/backend-engineer.png" alt="Backend engineer resume built from Markdown"></a></td>
<td width="33%"><a href="docs/screenshots/engineering-lead.png"><img src="https://raw.githubusercontent.com/phuthuycoding/markcv/master/docs/screenshots/engineering-lead.png" alt="Engineering lead resume, two pages, ATS-safe"></a></td>
<td width="33%"><a href="docs/screenshots/data-scientist.png"><img src="https://raw.githubusercontent.com/phuthuycoding/markcv/master/docs/screenshots/data-scientist.png" alt="Data scientist resume, one page"></a></td>
</tr>
<tr>
<td align="center"><a href="examples/backend-engineer.md">backend-engineer.md</a><br><sub>1 page</sub></td>
<td align="center"><a href="examples/engineering-lead.md">engineering-lead.md</a><br><sub>2 pages</sub></td>
<td align="center"><a href="examples/data-scientist.md">data-scientist.md</a><br><sub>1 page</sub></td>
</tr>
</table>

### With a portrait photo

Markets differ: a CV in Berlin or Toronto normally carries no photo, while one in
Vietnam, Japan or Germany's more traditional employers usually does. Drop a
`photo.jpg` next to the markdown file and it lands in the top-right corner.

<p align="center">
  <a href="docs/screenshots/fullstack-engineer-photo.png">
    <img src="https://raw.githubusercontent.com/phuthuycoding/markcv/master/docs/screenshots/fullstack-engineer-photo.png" width="440" alt="Markdown resume with a portrait photo in the header">
  </a>
  <br>
  <sub><a href="examples/with-photo/fullstack-engineer.md">examples/with-photo/fullstack-engineer.md</a> — one page, photo auto-detected</sub>
</p>

The photo lives in its own folder because detection is per-directory: any `.md`
file next to a `photo.*` picks it up. Keep photo-less CVs in a separate folder,
or pass `--no-photo`.

Build them yourself:

```bash
markcv build examples --pages 2
markcv render examples/with-photo/fullstack-engineer.md --pages 1
```

Note what the bullets in those samples have in common: a number, or a before and after.
`lint` exists to push a CV in that direction — the samples are what it is aiming at, and
[`test/fixtures/bad-cv.md`](test/fixtures/bad-cv.md) is what it is aiming away from.

## MCP server

Lets an AI agent (Claude Code, Claude Desktop, Cursor…) build and audit CVs on its own.

Nothing to install: `npx` fetches the package on first use and caches it.

### Register it with a client

**Claude Code** — add to `.mcp.json` in your project (shared with the team), or
`~/.claude.json` (just you):

```json
{
  "mcpServers": {
    "markcv": {
      "command": "npx",
      "args": ["-y", "@phuthuycoding/markcv", "mcp"],
      "cwd": "/path/to/your/cv/folder"
    }
  }
}
```

Or from the command line:

```bash
claude mcp add markcv -- npx -y @phuthuycoding/markcv mcp
claude mcp list          # confirm it connected
```

Restart the client afterwards so it picks the server up.

If you installed the package globally, `"command": "markcv-mcp"` with no `args`
works too and starts marginally faster. The repo ships `.mcp.json.example` with
both shapes.

**Claude Desktop** — `~/Library/Application Support/Claude/claude_desktop_config.json`
(macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows), same shape,
then restart the app.

**Cursor** — `.cursor/mcp.json` in the project, same shape.

### File paths in tool arguments

Every tool takes a file path, and relative paths resolve against the **server
process's working directory** — hence the `cwd` above. Without it, pass absolute
paths instead.

### Tools

| Tool | Purpose |
|---|---|
| `render_cv` | build the PDF, return the real page count plus layout numbers |
| `check_fit` | why it does not fit in N pages: too long, or bad page breaks |
| `lint_cv` | audit content (overselling, underselling, tense, unbacked claims…) |
| `tailor_to_jd` | compare against a job description (`jd_file` or `jd_text`) |
| `list_variants` | list every CV in a folder |
| `new_variant` | start a tailored copy from a master file |
| `diff_variants` | compare two versions, see what a tailored copy dropped |

Every tool returns **structured JSON**, not prose — so an agent can loop on it: edit the markdown → `check_fit` → read `slackPx` and `culprits` → edit again, until it fits.

### Requirements

Node >= 18 and a Chromium-based browser (only `render` and `check_fit` need it).
If it is in a non-standard location:

```json
{ "mcpServers": { "markcv": { "command": "node", "args": ["..."],
  "env": { "MARKCV_CHROME": "/path/to/chrome" } } } }
```

## Agent skills

The MCP server gives an agent the *tools*. Skills give it the *judgement* — when a
page-break diagnosis means "reorder", when it means "cut", and what a bullet should sound
like. They are plain Markdown files an agent reads on demand.

```bash
markcv skills               # what ships with the package
markcv skills install       # copy into ~/.claude/skills
markcv skills install topcv # just one
```

| Skill | What it covers |
|---|---|
| `markcv` | Writing and auditing a CV with markcv: reading a `fit` report correctly, the `lint` rules, bullet style, keeping several variants in sync. |
| `topcv` | Publishing a Markdown CV to [TopCV.vn](https://www.topcv.vn) (Vietnamese job market) — both the CV builder and the profile page. |

Existing skills are never overwritten, so your own edits survive; pass `--force` when you
do want the bundled version back. Restart the agent afterwards so it sees them.

The `topcv` skill drives a real browser and additionally needs the **chrome-devtools MCP
server**:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest", "--autoConnect"]
    }
  }
}
```

```bash
claude mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest --autoConnect
```

## CV format

Plain Markdown. The only convention lives in the header:

```markdown
# Your Name

**Email:** you@example.com
**Phone:** +84 9xx xxx xxx

***

## OBJECTIVE
...

## WORK EXPERIENCE

### Company Name

**Job Title** | Jan 2020 - Dec 2023

* Bullet...
```

`**Label:** value` lines directly under `# Your Name` become the contact block. A line containing `|` is read as job title + dates — and `lint` uses those dates to know whether a job has ended.

**Portrait photo:** drop `photo.jpg` (or `photo.png`, `avatar.jpg`) next to the `.md` file and it is embedded in the top-right corner. Without one you get an empty placeholder box. Photos over 400KB trigger a warning, because they push the PDF past the upload limit many job portals enforce.

**Skip a file in `markcv build`:** put `<!-- markcv:no-build -->` near the top. Useful for a master file that is a content store rather than something you submit.

## Themes

`classic` (default) and `compact`. Both are single-column, emoji-free, with a real text layer — safe for ATS parsers.

## How this differs from other Markdown resume tools

Rendering Markdown into a good-looking CV is well covered — [`@resumx/resumx`](https://www.npmjs.com/package/@resumx/resumx),
[`markdown-resume`](https://www.npmjs.com/package/markdown-resume) and others do it well, and if that is all
you need, use one of them.

markcv exists for the part that comes after the rendering works:

| | Typical Markdown→PDF tool | markcv |
|---|---|---|
| Render to PDF | yes | yes |
| Themes | yes | two, ATS-safe |
| **Why it does not fit N pages** | — | names the block, the wasted pixels, and whether length or a page break is at fault |
| **Content audit** | — | overselling, underselling, tense, unbacked skills, duplicates |
| **Job-description match** | — | missing requirements, SKILLS-only claims, unrelated bullets |
| **Usable by an AI agent** | — | MCP server, structured JSON |

## Author

Built by [Ta Manh Quyen](https://quyentm.dev) — a staff engineer who got tired of guessing
why a CV spilled onto a third page. More writing at [quyentm.dev](https://quyentm.dev).

## License

MIT
