---
name: topcv
description: Push a Markdown CV to TopCV.vn — both the CV builder (/viet-cv/...) and the personal profile page (/p/<slug>). Vietnamese job market. Use when the user asks to update their TopCV CV or profile, sync a CV to TopCV, or mentions topcv.
---

# Syncing a Markdown CV to TopCV.vn

TopCV is Vietnam's largest job board. Two destinations, **completely different mechanics**:

| Target | URL | Tech | How you write to it |
|---|---|---|---|
| CV builder | `/viet-cv/<template>` | contenteditable + `cvoForm` | set `innerText` on `cvo-*` elements |
| Profile page | `/p/<slug>` | **Vue** | drive the `__vue__` instance |

UI strings below are quoted in Vietnamese because they must match the live DOM exactly.

## Prerequisites

This skill drives a real browser and **requires the `chrome-devtools` MCP server**. Check
whether it is available (look for `mcp__chrome-devtools__*` tools). If it is missing, ask the
user to add it to their MCP config and restart — do not try to work around it:

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

Put it in `~/.claude.json` (personal, all projects) or the project's `.mcp.json` (shared with
the team). In Claude Code the user can also run:

```bash
claude mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest --autoConnect
```

The user must be **logged into TopCV in that Chrome profile** already. Never handle their
password: if the page redirects to `/login`, stop and ask them to sign in themselves.

**Do not substitute a desktop-automation MCP.** Computer-use style servers grant browsers at a
read-only tier — you can see the screen but every click and keystroke is blocked.

TopCV's accessibility snapshots are large (60k+ characters). Always dump to a file and grep it
instead of pulling it into context:

```
take_snapshot(filePath: ".tmp-snap.txt")   →   grep for the uid you need
```

## Before you touch anything

1. Read the source Markdown CV. If several variants exist (role × language), **ask which one** —
   do not pick for the user.
2. Diff what TopCV already holds against the file. Anything that disagrees (date of birth, name
   spelling, an end date still showing "Hiện tại") is a question for the user, not a guess.
3. Anything on TopCV that the CV file lacks: **ask before deleting.** Deletions are permanent.
4. Never invent data the file does not have — project dates, team size, client names. An empty
   field beats a fabricated one.

---

## Part A — CV builder (`/viet-cv/<template>`)

Every field is a `contenteditable` carrying its own form metadata:

```html
<span class="cvo-experience-company" name="cvoData[experience][@index][company]"
      blockkey="experience" fieldkey="company" cvo-form-field="true" contenteditable="true">
```

On submit the page collects fields by `name` plus DOM order (`@index` becomes a real number),
so **setting `innerText` is enough** — no need to type character by character:

```js
el.focus();
el.innerText = text;
el.dispatchEvent(new Event('input', {bubbles: true}));
el.dispatchEvent(new Event('change', {bubbles: true}));
el.blur();
```

Select by class + DOM order (`.cvo-experience-company`, `.cvo-skillgroup-area`, …), **never by
`name`** — every row shares the literal `@index`, so `name` cannot tell rows apart.

### Built-in API worth using

- `CVOFormController.getTemporaryFormData()` — returns exactly what will be submitted. Use it to
  verify **before** saving, especially to count rows.
- `#layout-editor` panel + `LayoutEditorControler` — enable/disable sections and reorder them.
- `cvoDefaultLayout`, `CVOFormController.cvoHiddenBlocks` — current layout and hidden sections.

### Sections

```js
// open: click the div.title whose text is "Thêm mục"
document.querySelectorAll('#layout-editor .block')   // each has blockkey + class 'active'
(block.querySelector('.selector') || block).click()  // toggle on/off
// reorder: appendChild the .block elements into .group[groupkey="content"] in the order you want
// then click "Cập nhật" in .action-bar
```

### Duplicating a row

`.clone` / `.remove` live in a single `.fieldgroup_controls` that follows the hovered block.
**Never `appendChild` that element yourself** — it breaks and only a reload brings it back.

What works is calling the jQuery `mouseover` handler bound to the row itself:

```js
const $ = window.jQuery;
const ev = $._data(row, 'events');
ev.mouseover.forEach(h => h.handler.call(row, $.Event('mouseover', {target: row, currentTarget: row})));
document.querySelector('.fieldgroup_controls .clone').click();
```

**Critical trap — the DOM updates late.** A loop like `while (rows.length < target) clone()`
reads a stale count and over-clicks; in practice this produced 33 rows where 2 were wanted.
Either clone **one row per tool call** and check the count each time, or `await sleep(...)` and
re-read the count fresh on every iteration. Verify the real number with
`getTemporaryFormData()`, not just a selector.

### Saving

Click the `div.title` reading "Lưu CV". Success redirects to `/save-cv-success/<id>?type=create`.
Confirm the CV appears in `/quan-ly-cv`.

### Known obstacles

- Cookie banners and modals sit on top of the page — `document.elementFromPoint()` returning
  `DIV.modal` means you are blocked. Dismiss them first.
- `#modal-recover-unsaved-cv` ("khôi phục lại không?") restores an unsaved draft after a reload.
- The "Dự án" section hardcodes labels *Khách hàng / Số lượng thành viên / Vị trí công việc*.
  If the CV has no such data, use the "Hoạt động" block instead and rename its title (edit
  `[blockkey="activity"][name*="blocktitle"]`) — name / role / description, no empty labels.
- No dedicated languages section: fold it into "Kỹ năng" as one more group.

---

## Part B — Profile page (`/p/<slug>`)

This page is **Vue**. Setting `input.value` and clicking submit **fails silently** — no error,
no network request, nothing. Go through the component instance.

```js
const findVm = (sel) => { let n = document.querySelector(sel);
  for (let i=0;i<10 && n;i++) { if (n.__vue__) return n.__vue__; n = n.parentElement; } return null; };
const vm = findVm('#modal-update-experience');
```

| Modal | Array | Draft object | Methods |
|---|---|---|---|
| `#modal-update-info-personal` | `userInfo` | | plain form; click "Cập nhật" |
| `#modal-update-experience` | `experiences` | `currentExp` | `newExp` `editExp(i)` `deleteExp(i)` `submit` |
| `#modal-update-education` | `educations` | `currentEducation` | same shape |
| `#modal-update-skill` | `skills` | `currentSkill` | `newSkill` `editSkill(i)` `deleteSkill(i)` `ratingSkill(n)` `submit` |
| `#modal-update-project` | `projects` | `currentProject` | `newProject` `editProject(i)` `deleteProject(i)` `submit` |
| `-certificate` `-award` `-course` `-product` `-social-activities` | matching arrays | | same shape |

Adding one entry:

```js
const before = vm.experiences.length;
vm.newExp();
await sleep(150);
Object.assign(vm.currentExp, {
  id: '', company_id: '', company_name: 'Company',   // REQUIRED — see trap 1
  position_name: 'Title',
  start_month: '4', start_year: '2022', end_month: '1', end_year: '2026',
  description: '- bullet...\n- bullet...',
  attachments: []                                     // clear the empty placeholder
});
vm.companyKeyword = 'Company';
vm.still_here = false;                                // true = "Tôi đang làm việc ở đây"
vm.submit();
for (let t = 0; t < 40 && vm.experiences.length === before; t++) await sleep(200);
```

### Traps that cost real time

1. **Empty `company_name` → silent failure.** The company field is an autocomplete: typing only
   fills `companyKeyword`, leaving `currentExp.company_name` empty, and Vue refuses to submit
   without saying so. Symptom: the button does nothing, console is clean, no POST is sent. Set
   `company_name` explicitly.
2. **Skill rating must go through `vm.ratingSkill(n)`.** The blank draft object spells the field
   `rete` (TopCV's typo) while saved records use `rate` — assigning by hand silently saves 1 star.
3. **Look up `skill_id` first:**
   ```js
   await fetch('/profile/skills?keyword=Golang', {headers:{'X-Requested-With':'XMLHttpRequest'}})
   // → {data:{skills:[{id:4715, name:"Golang"}]}}
   ```
   Plenty of things are missing from the catalogue (NestJS, Next.js, Microservices, DDD, Grafana,
   GraphQL) — skip them or find the closest catalogued name.
4. **`deleteExp` / `deleteProject` raise `window.confirm`** — handle the dialog, and watch for one
   still pending when you move on.
5. A change is only real once you **reload and re-read** `vm.<array>`. `POST /profile/update-*`
   returning 200 is the other confirmation.

### Order of work

Add experience entries **first**: the "Công việc hiện tại" dropdown in the personal-info modal
only lists companies that already exist on the profile.

---

## Reporting back

Tell the user what changed, what was left blank because the source CV had no data for it, and
everything that was deleted. If you misfired — created duplicates, removed the wrong row — say
so plainly instead of quietly cleaning it up.
