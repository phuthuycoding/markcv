# markcv

Build a CV from Markdown — a CLI **and** an MCP server for AI agents.

Two things set it apart from ordinary markdown→PDF tools:

- **`fit`** tells you *why* your CV does not fit on 2 pages. "Content too long" and "bad page break" are different illnesses with opposite cures — trimming words while the real culprit is a heading sitting 31px from the bottom of page 1 just wastes your time.
- **`lint`** checks *content*, not formatting. It catches overselling **and underselling** — claiming less than you did is a mistake too, and it costs you something while gaining nothing.

## Install

```bash
npm install -g markcv
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

## MCP server

Lets an AI agent (Claude Code, Claude Desktop, Cursor…) build and audit CVs on its own.

### Install from source

```bash
git clone https://github.com/phuthuycoding/markcv.git
cd markcv
npm install
npm run build          # produces dist/
```

Check the server starts (it waits for JSON-RPC on stdin and prints nothing — that is correct; Ctrl+C to quit):

```bash
node dist/mcp/server.js
```

### Register it with a client

The repo ships `.mcp.json.example` — copy it and fix the paths for your machine. Always use an **absolute path** to `dist/mcp/server.js`.

**Claude Code** — add to `.mcp.json` in your project (shared with the team), or `~/.claude.json` (just you):

```json
{
  "mcpServers": {
    "markcv": {
      "command": "node",
      "args": ["/path/to/markcv/dist/mcp/server.js"]
    }
  }
}
```

Or add it from the command line:

```bash
claude mcp add markcv -- node /path/to/markcv/dist/mcp/server.js
claude mcp list          # confirm it connected
```

**Claude Desktop** — `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows), same `mcpServers` shape, then restart the app.

**Cursor** — `.cursor/mcp.json` in the project, same shape.

### Shorter command with `npm link`

Instead of an absolute path to `dist/mcp/server.js`, symlink the package globally:

```bash
cd markcv
npm link
```

`markcv` and `markcv-mcp` are then on your PATH, and the config collapses to:

```json
{ "mcpServers": { "markcv": { "command": "markcv-mcp", "cwd": "/path/to/your/cv/folder" } } }
```

### Running straight from GitHub

Works without publishing, because `prepare` builds on install:

```bash
npx -y --package=github:phuthuycoding/markcv markcv-mcp
```

Fine for a one-off try, but not ideal as a permanent MCP entry: the server is
spawned every time the client starts, and npx re-resolves and rebuilds the
package each time. Prefer `npm link` locally, or install from npm once published.

### Once published to npm

```bash
npm install -g markcv
```

```json
{ "mcpServers": { "markcv": { "command": "markcv-mcp" } } }
```

### File paths in tool arguments

Every tool takes a file path. Relative paths resolve against the **server process's working directory**, so either pass absolute paths or give the server a `cwd`:

```json
{
  "mcpServers": {
    "markcv": {
      "command": "node",
      "args": ["/path/to/markcv/dist/mcp/server.js"],
      "cwd": "/path/to/your/cv/folder"
    }
  }
}
```

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

Node >= 18 and a Chromium-based browser. If it is in a non-standard location:

```json
{ "mcpServers": { "markcv": { "command": "node", "args": ["..."],
  "env": { "MARKCV_CHROME": "/path/to/chrome" } } } }
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

## License

MIT
