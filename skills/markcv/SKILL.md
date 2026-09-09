---
name: markcv
description: Write, audit and build a Markdown CV with markcv — fix page-break problems, catch overselling and underselling, and tailor a CV to a job description. Use when the user asks to write a CV or resume, edit CV content, make a CV fit two pages, check a CV, or tailor one to a job posting.
---

# Working on a CV with markcv

markcv builds a PDF from a Markdown CV and — more importantly — tells you *why* the result
is wrong. Use the diagnostics; do not guess at layout.

```bash
markcv render cv.md -o Out.pdf --pages 2   # build, report real page count
markcv fit cv.md --pages 2                 # why it does not fit
markcv lint cv.md                          # audit the writing
markcv tailor cv.md --jd jd.txt            # compare against a job description
markcv new techlead --from cv-master.md    # start a tailored variant
markcv diff cv-a.md cv-b.md                # what the variant dropped
markcv build --pages 2                     # build every cv-*.md in the folder
```

The MCP server exposes the same operations as tools (`render_cv`, `check_fit`, `lint_cv`,
`tailor_to_jd`, `new_variant`, `list_variants`, `diff_variants`). Prefer them when running
as an agent — they return structured numbers instead of text you have to parse.

## The one thing people get wrong about page count

**"Too long" and "bad page break" are opposite illnesses.** Read the numbers before cutting
anything:

| Signal | Meaning | Cure |
|---|---|---|
| `contentWouldFit: false` | genuinely too much content | cut content, or use `--theme compact` |
| `contentWouldFit: true` + `fits: false` | content fits, a block got pushed | fix the break, do **not** cut at random |

When a block is pushed, `culprits` names it and says how many pixels were wasted at the
bottom of the previous page. Trim a line or two **immediately above that block**, or reorder
sections. Cutting elsewhere does nothing.

**The trap:** everything after a pushed heading has to fit on the remaining pages by itself.
If the content below heading X is 1049px and a page holds 1039px, no amount of trimming
*above* X will ever help — you must shorten something at or after X. Compare
`contentHeight - culprit.top` against `usablePerPage` before you start editing.

A CV sitting a few pixels under the limit is fragile: adding three words can cost a whole
page. After every content edit, render again and check `fits` — do not assume.

## Writing the content

`lint` catches both directions, and both matter:

- **over-claim** — `spearheaded`, `comprehensive`, `excellence`: self-praise nobody can verify.
- **under-claim** — `worked on` / `advised on` next to real scale. Claiming less than you did
  costs you something and gains nothing.
- **tense** — a finished job written in the present tense.
- **unsupported-skill** — a skill under SKILLS with no experience line backing it. Interviewers
  dig into exactly these.
- **no-metric**, **long-bullet**, **duplicate**, **role-mismatch**, **ats-emoji**.

House style for bullets: **strong verb → scope → result.** Do not narrate the process, and do
not explain why the work was hard — that reads as justifying yourself. Turn the hard constraint
into the achievement:

> ✗ The auth flow predated OAuth so it took a lot of customisation, and we could not disrupt
>   live merchants. I owned the dashboard; other teams handled shop management.
>
> ✓ Brought OAuth to the merchant services through a compatibility layer over a pre-OAuth auth
>   flow, rolled out with zero downtime for live merchants. Owned the merchant dashboard.

Also drop tenure claims attached to individual skills ("three years of microservices") — the
work history already shows the timeline, and the phrasing reads junior.

Never invent numbers, dates or scope that are not in the source material. If a figure is
missing, leave the field out and tell the user what is missing.

## Working loop

1. Read the existing CV before editing. Keep the user's voice; do not rewrite wholesale.
2. Make the edit.
3. `render` (or `check_fit`) and read `fits`, `contentWouldFit`, `wastedByBreaksPx`, `culprits`.
4. If it does not fit, apply the cure that matches the diagnosis above — then re-render.
5. `lint` before declaring it done.
6. Report the real page count. A CV that renders three pages against a two-page target is not
   finished, however good the wording is.

## Multiple variants

`cv-master.md` holds everything; `markcv new <role> --from cv-master.md` starts a trimmed copy.
When the user maintains several variants (role × language), **an edit to shared wording has to
be applied to every file that carries it** — check with `grep` rather than assuming, and
re-render all of them, since each variant has its own page-break behaviour.

## Publishing to a job site

Building the PDF is not always the end of the job. If the user also keeps a profile on a job
board, see the `topcv` skill for the Vietnamese market (TopCV.vn).
