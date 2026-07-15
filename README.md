# vue-pdf-flipbook

A **headless Vue 3 component** that renders a PDF as an interactive flipbook with a page-turn effect (swipe or click to flip). PDF rendering is powered by [pdf.js](https://mozilla.github.io/pdf.js/); the flip animation is a built-in, dependency-free CSS 3D engine.

**Headless by design** — the library ships almost no styling and never requires Tailwind, but every element accepts your own classes (Tailwind or otherwise) via props, slots, and stable `data-*` attributes.

## Features

- 📖 3D page-turn animation with click and swipe navigation (no flip-engine dependency)
- 🎨 Headless: style everything with your own Tailwind/CSS classes
- 🧩 Use as a plugin (`app.use()`) or import the component directly
- ⚡ Lazy page rendering with a priority queue — handles large PDFs
- 📱 Responsive with automatic single-page/spread switching
- 🎯 Lone pages (cover/back cover) are automatically centered
- 🔍 Pinch & scroll zoom (up to `maxZoom`, default 2×) with drag-to-pan
- ⛶ Built-in fullscreen mode
- 🔒 SSR-safe (Nuxt): browser-only libraries load in `onMounted`
- 🟦 Written in TypeScript, full type declarations included

## Installation

```bash
npm install vue-pdf-flipbook
```

Requires Vue `^3.4`. The package is ESM-only.

## Quick start

```ts
// main.ts — as a plugin
import { createApp } from 'vue'
import VuePdfFlipbook from 'vue-pdf-flipbook'
import 'vue-pdf-flipbook/style.css' // optional convenience styles

createApp(App).use(VuePdfFlipbook).mount('#app')
```

```vue
<!-- or import the component directly -->
<script setup lang="ts">
import { PdfFlipbook } from 'vue-pdf-flipbook'
</script>

<template>
  <PdfFlipbook src="/document.pdf" />
</template>
```

## pdf.js worker setup

pdf.js parses PDFs in a Web Worker. Out of the box, vue-pdf-flipbook tries to resolve the worker automatically and otherwise loads it from jsdelivr, **pinned to your installed pdfjs-dist version** (you'll see a one-time console warning). For production, offline, or CSP-restricted apps, set the worker URL explicitly:

**Vite / Nuxt:**

```ts
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

app.use(VuePdfFlipbook, { workerSrc: workerUrl })
// or per component: <PdfFlipbook :worker-src="workerUrl" ... />
```

**Webpack 5:**

```ts
const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
app.use(VuePdfFlipbook, { workerSrc: workerUrl })
```

Setting `GlobalWorkerOptions.workerSrc` yourself before the first render is also respected.

## Styling with Tailwind

The component is unstyled by default. Pass your classes through the class props:

```vue
<PdfFlipbook
  src="/document.pdf"
  container-class="rounded-xl bg-white p-6 shadow-lg"
  button-class="rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-500 disabled:opacity-40"
  page-indicator-class="font-mono text-sm text-slate-600"
/>
```

Or replace the controls entirely with the `controls` slot:

```vue
<PdfFlipbook src="/document.pdf">
  <template #controls="{ visiblePages, totalPages, next, prev, canGoNext, canGoPrev }">
    <div class="mt-4 flex items-center justify-center gap-4">
      <button class="btn" :disabled="!canGoPrev" @click="prev">← Prev</button>
      <span>
        {{ visiblePages.length > 1 ? `${visiblePages[0]}–${visiblePages[1]}` : visiblePages[0] }}
        / {{ totalPages }}
      </span>
      <button class="btn" :disabled="!canGoNext" @click="next">Next →</button>
    </div>
  </template>
</PdfFlipbook>
```

Every internal element also carries a stable data attribute (`data-pdf-flipbook`, `-viewport`, `-book`, `-page`, `-canvas`, `-controls`, `-prev`, `-next`, `-indicator`, `-loading`, `-error`), so Tailwind arbitrary variants work too:

```html
<div class="[&_[data-pdf-flipbook-page]]:rounded-lg [&_[data-pdf-flipbook-page]]:shadow-md">
  <PdfFlipbook src="/document.pdf" />
</div>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `src` | `string \| URL \| ArrayBuffer \| Uint8Array` | — (required) | PDF source. Reactive — swapping reloads the book |
| `pdfOptions` | `object` | — | Extra pdf.js `getDocument` parameters |
| `workerSrc` | `string` | auto | pdf.js worker URL override |
| `width` | `number` | `550` | Base single-page width (px) |
| `height` | `number` | PDF aspect ratio | Base single-page height (px) |
| `responsive` | `boolean` | `true` | Scale book to its container |
| `minWidth` / `maxWidth` / `minHeight` / `maxHeight` | `number` | derived | Responsive size bounds |
| `startPage` | `number` | `1` | Initial page (1-based) |
| `mode` | `'auto' \| 'single' \| 'spread'` | `'auto'` | Page display mode |
| `showCover` | `boolean` | `true` | Open on the first page alone (centered); the last page is also shown alone when parity allows. Set `false` to always show full spreads |
| `flipOptions` | `FlipOptions` | — | Flip animation tuning (`flippingTime`, `drawShadow`, `maxShadowOpacity`, `swipeDistance`, `useMouseEvents`, `disableFlipByClick`) |
| `renderScale` | `number` | `1.5` | Render quality multiplier (× capped devicePixelRatio) |
| `renderRange` | `number` | `2` | Spreads kept rendered around the current one; `Infinity` renders all |
| `controlsPosition` | `'top' \| 'bottom'` | `'bottom'` | Place controls above or below the book |
| `maxZoom` | `number` | `2` | Maximum pinch/scroll zoom level; `1` disables zooming |
| `containerClass`, `bookClass`, `pageClass`, `controlsClass`, `buttonClass`, `pageIndicatorClass`, `loadingClass`, `errorClass` | `string` | — | Class hooks for every element |
| `fullscreenClass` | `string` | — | Extra classes applied to the container while fullscreen |

## Events

| Event | Payload |
|---|---|
| `loaded` | `{ totalPages, pdf }` |
| `error` | `Error` |
| `page-changed` | `{ page, totalPages }` |
| `flip-start` | `{ fromPage, toPage }` |
| `orientation-changed` | `'portrait' \| 'landscape'` |
| `rendered` | `{ page }` — a page finished rendering |
| `fullscreen-changed` | `boolean` |
| `zoom-changed` | `number` — current zoom level (1 = fit) |

## Slots

| Slot | Slot props |
|---|---|
| `controls` | `{ currentPage, visiblePages, totalPages, next, prev, goToPage, canGoNext, canGoPrev, isFullscreen, toggleFullscreen, zoom, setZoom, resetZoom }` — `visiblePages` is the one or two pages currently shown |
| `loading` | `{ progress }` (0–1) |
| `error` | `{ error, retry }` |

## Exposed methods (template ref)

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import type { PdfFlipbookExpose } from 'vue-pdf-flipbook'

const book = useTemplateRef<PdfFlipbookExpose>('book')
// book.value.next() / .prev() / .goToPage(5) / .reload()
// book.value.currentPage / .totalPages
// book.value.enterFullscreen() / .exitFullscreen() / .toggleFullscreen() / .isFullscreen
// book.value.zoom / .setZoom(1.5) / .resetZoom()
// book.value.getPdfDocument() / .getFlipInstance()
</script>

<template>
  <PdfFlipbook ref="book" src="/document.pdf" />
</template>
```

## Fullscreen

The default controls include a fullscreen toggle (hidden when the browser doesn't allow it, e.g. iPhone Safari or sandboxed iframes). Programmatic control is available via the template ref (`enterFullscreen` / `exitFullscreen` / `toggleFullscreen`) and the `controls` slot (`isFullscreen`, `toggleFullscreen`). While fullscreen, the container gets a `data-fullscreen` attribute and your `fullscreenClass`, so you can restyle it freely:

```vue
<PdfFlipbook src="/document.pdf" fullscreen-class="!bg-slate-900 !rounded-none" />
```

## Zoom

Zoom in with a touch pinch, trackpad pinch, or the mouse wheel over the book (up to `maxZoom`, default 2×). While zoomed, dragging pans the page instead of flipping it — the prev/next controls still work and keep the zoom. Zooming stays sharp because pages are pre-rendered above CSS size (`renderScale`). Programmatic control: `setZoom(level)` / `resetZoom()` via the template ref or the `controls` slot, plus a `zoom-changed` event. Set `:max-zoom="1"` to disable zooming.

## SSR / Nuxt

The component is SSR-safe: `pdfjs-dist` and the flip engine only run in the browser (`onMounted`). No `<ClientOnly>` wrapper is required, though wrapping is harmless.

## Large PDFs

Pages are rendered lazily around the current spread (`renderRange`, default 2 spreads each side) and far-away page bitmaps are released as you move through the document, keeping memory bounded for 100+ page files. Set `renderRange: Infinity` to render everything eagerly at idle priority.

## Development

```bash
npm install
npm run dev        # playground at localhost:5173
npm test           # vitest
npm run typecheck  # vue-tsc
npm run build      # library build to dist/
```

## License

MIT
