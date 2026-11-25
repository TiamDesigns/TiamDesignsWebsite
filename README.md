# Tiam Designs website

Static portfolio site, deployed to Cloudflare Pages from `dist/`.

```sh
pnpm install
pnpm run check   # tests, build, HTML lint and site checks: the same as CI
```

## Checks

| Check | When | What it catches |
| --- | --- | --- |
| **CI** (`.github/workflows/ci.yml`) | Every PR and push to `main` | Jest tests, a build of `dist/`, HTML and accessibility lint (`.htmlvalidate.json`), missing local files, images without alt text, page images over 1 MB, out-of-date `pnpm-lock.yaml` |
| **External link check** (`link-check.yml`) | Mondays, or run it by hand | Dead links to other sites |
| **Gemini review** (`gemini-dispatch.yml`) | When a PR opens or leaves draft, or on an `@gemini-cli /review` comment | Bugs, layout, copy and image issues a script can't judge. Review standards live in `GEMINI.md` |

Downloads (CAD, spreadsheets, PDFs, full-res renders) are meant to be public
and are not counted against the image budget unless a page embeds them.
