import { isClient } from './env'

type PdfJsModule = typeof import('pdfjs-dist')

let globalWorkerSrc: string | undefined
let warned = false

/** Set a worker URL globally (used by the plugin's install options). */
export function setGlobalWorkerSrc(src: string): void {
  globalWorkerSrc = src
}

export function cdnWorkerSrc(pdfjs: PdfJsModule): string {
  // Pinned to the installed pdfjs-dist version: pdf.js hard-errors on an
  // API/worker version mismatch.
  return `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
}

export function applyCdnWorker(pdfjs: PdfJsModule): void {
  pdfjs.GlobalWorkerOptions.workerSrc = cdnWorkerSrc(pdfjs)
  if (!warned) {
    warned = true
    console.warn(
      '[vue-pdf-flipbook] Falling back to loading the pdf.js worker from jsdelivr. ' +
        'For offline or CSP-restricted environments, pass a `workerSrc` prop or plugin option ' +
        '(e.g. in Vite: `import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"`).',
    )
  }
}

async function isLoadableWorkerScript(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    if (!res.ok) return false
    // Dev servers with SPA fallback can answer 200 (text/html) for any path;
    // pdf.js would then fail hard when importing it as a worker module.
    const type = res.headers.get('content-type') ?? ''
    return type.includes('javascript')
  } catch {
    return false
  }
}

/**
 * Configure GlobalWorkerOptions.workerSrc, layered:
 * 1. explicit override (prop) or plugin-level workerSrc
 * 2. a value the consumer already set on GlobalWorkerOptions
 * 3. runtime URL resolution relative to this module (works when the bundler
 *    serves node_modules, e.g. some dev servers) — verified with a HEAD request
 * 4. version-pinned CDN fallback (with a one-time console warning)
 *
 * Returns true when the worker URL came from the consumer (1/2) — in that case
 * load errors should NOT trigger a CDN retry.
 */
export async function configureWorker(pdfjs: PdfJsModule, override?: string): Promise<boolean> {
  if (!isClient()) return true
  const explicit = override ?? globalWorkerSrc
  if (explicit) {
    pdfjs.GlobalWorkerOptions.workerSrc = explicit
    return true
  }
  if (pdfjs.GlobalWorkerOptions.workerSrc) return true
  // Intentionally non-static so neither our build nor the consumer's bundler
  // tries to statically resolve/emit this specifier.
  const specifier = 'pdfjs-dist/build/pdf.worker.min.mjs'
  try {
    const candidate = new URL(specifier, import.meta.url).toString()
    if (candidate.startsWith('http') && (await isLoadableWorkerScript(candidate))) {
      pdfjs.GlobalWorkerOptions.workerSrc = candidate
      return false
    }
  } catch {
    // fall through to CDN
  }
  applyCdnWorker(pdfjs)
  return false
}
