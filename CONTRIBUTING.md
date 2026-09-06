# Contributing to markcv

## Development

```bash
git clone https://github.com/phuthuycoding/markcv.git
cd markcv
npm install          # `prepare` builds dist/ automatically
npm run build        # or rebuild by hand
npm test             # 20 tests, no browser needed
npm link             # optional: run your working copy as `markcv`
```

`npm link` replaces any globally installed copy with this working tree, which is
what you want while developing. `npm unlink -g @phuthuycoding/markcv` puts the
published one back.

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

The package is published as `@phuthuycoding/markcv`. The scope is not decoration:
npm rejected the unscoped `markcv` for resembling `mark-cv`, then rejected `fitcv`
for resembling `fetch`. That similarity rule is neither documented nor queryable,
so an unscoped name can only be tested by publishing. A scope is the author's own
namespace and is never compared against anyone else's package.

`publishConfig.access` is set to public, since scoped packages default to private.

**Cutting a release**

1. Add a section to `CHANGELOG.md` for the new version. The workflow reads it and
   fails if it is missing or empty, so the changelog cannot be skipped.
2. Bump `version` in `package.json` and commit both.
3. Publish a GitHub Release tagged `v<version>` — the tag must match `package.json`
   or the workflow stops.
4. `publish.yml` runs build and tests, checks the changelog entry, refuses to
   republish an existing version, publishes with `--provenance`, and finally
   rewrites the release notes from `CHANGELOG.md`.

Release notes are generated rather than written twice, so the release page and the
changelog cannot drift apart. Preview what a release will say:

```bash
npm run changelog 0.1.1
```

Rehearse first: run the **Publish to npm** workflow manually with `dry_run` left on.
