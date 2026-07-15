---
name: verify
description: Verify vue-pdf-flipbook changes by driving the playground (or a tarball consumer) in real Chrome with puppeteer-core.
---

# Verifying vue-pdf-flipbook changes

## Pick the surface

- **Engine/DOM/component changes** → the aliased playground is enough:
  `npm run dev -- --port 5199 --strictPort` (serves `playground/`, aliases
  `vue-pdf-flipbook` to `src/`). It loads `/sample.pdf` (14 pages, even).
- **Worker / packaging / interop changes** → the playground does NOT exercise
  the prebundled-dependency path. Use `npm pack`, install the tarball into a
  scratch Vite consumer, and drive that instead (see the project memory note).

## Drive it

Use puppeteer-core with system Chrome
(`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
`headless: 'new'`). A reusable `node_modules` with puppeteer-core lives in old
session scratchpads under `/private/tmp/claude-501/-Users-arif-code-vue-pdf-flipbook/`
— symlink it into the current scratchpad rather than reinstalling.

Wait for readiness with: a `[data-pdf-flipbook-canvas]` whose `width > 0`.

Useful hooks: `[data-pdf-flipbook-page]` (real pages),
`[data-pdf-flipbook-blank]` (synthetic blank back cover),
`[data-pdf-flipbook-shell]` (centering shift transform),
`[data-pdf-flipbook-viewport]` (click/zoom target). The playground logs all
component events to console as `[playground] …` — capture them via
`page.on('console')` to assert on emitted payloads.

## Gotchas

- Need a different PDF (e.g. odd page count)? Don't edit the playground —
  intercept the `/sample.pdf` request and `req.respond()` with your bytes.
  A no-dependency generator for a 5-page PDF exists in past scratchpads
  (`make-odd-pdf.mjs` pattern).
- Flips animate ~800 ms by default; sleep ~1.1 s after clicking Next/Prev.
- Portrait/landscape is driven by container width: `page.setViewport({ width:
  390 })` forces portrait, `1280` landscape (mode `auto`).
