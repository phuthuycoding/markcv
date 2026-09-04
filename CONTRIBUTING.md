# Contributing

## Development

```bash
npm install          # `prepare` builds dist/ automatically
npm run build        # or rebuild by hand
npm test             # 20 tests, no browser needed
```

Only `render` and `fit` need a browser, and only at runtime — the test suite does not
launch Chrome, so it runs anywhere.

## Layout

```
src/core/   render · fit · lint · rules · tailor · variants · markdown · photo · browser
src/cli.ts  the CLI
src/mcp/    the MCP server
themes/     CSS, one file per theme
examples/   sample CVs, rendered into docs/screenshots/
```

`rules.ts` holds the word lists for `lint` on purpose: tuning what counts as
overselling should not mean touching the logic that finds it.

## Adding a lint rule

Rules live in `lint()` in `src/core/lint.ts` and share one pass over the lines. A rule
should earn its place — every false positive costs the user trust in all the others.
The `unsupported-skill` rule is split into `warn` and `info` for exactly that reason:
flagging MySQL as "unproven" is noise, flagging Kubernetes is not.

Add a case to `test/lint.test.js` using `test/fixtures/bad-cv.md`.

## Releasing

Publishing runs from GitHub Actions, never from a laptop.

**One-time setup**

1. Create an npm access token of type **Automation** on npmjs.com. This matters:
   a "Publish" token still demands a one-time password, and CI has no authenticator,
   so the publish fails with `EOTP`.
2. Add it to the repo as the secret `NPM_TOKEN`
   (Settings → Secrets and variables → Actions).
3. Optional: create an environment named `npm` (Settings → Environments) with a
   required reviewer, so every publish needs human approval.

**Cutting a release**

1. Bump `version` in `package.json` and commit.
2. Publish a GitHub Release tagged `v<version>` — the tag must match `package.json`
   or the workflow stops.
3. `publish.yml` runs build and tests, refuses to republish an existing version, and
   publishes with `--provenance`.

Rehearse first: run the **Publish to npm** workflow manually with `dry_run` left on.
