import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'

export interface RendererOptions {
  renderScale: () => number
  renderRange: () => number
  onRendered?: (page: number) => void
  onError?: (page: number, error: Error) => void
}

interface ActiveRender {
  page: number
  task: RenderTask | null
  cancelled: boolean
}

function isCancelException(err: unknown): boolean {
  return err instanceof Error && err.name === 'RenderingCancelledException'
}

/**
 * Renders PDF pages into registered canvases, prioritized by distance from the
 * current page. Pages far outside the window get their canvas bitmap released
 * and are re-rendered when approached again.
 */
export function usePdfRenderer(options: RendererOptions) {
  let pdf: PDFDocumentProxy | null = null
  const canvases = new Map<number, HTMLCanvasElement>()
  const rendered = new Set<number>()
  /**
   * Pages whose render threw a real error. They are excluded from the wanted
   * list instead of being retried: with a persistent failure (e.g. canvas 2D
   * contexts blocked in embedded/automation browsers) an automatic retry
   * becomes a microtask-speed infinite loop that locks up the main thread.
   */
  const failed = new Set<number>()
  let currentPage = 1
  let active: ActiveRender | null = null
  let pumping = false

  function dpr(): number {
    return Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)
  }

  /** Pages kept rendered: current spread ± renderRange spreads (2 pages per spread). */
  function keepRadius(): number {
    const range = options.renderRange()
    return range === Infinity ? Infinity : Math.max(2, range * 2 + 1)
  }

  function wantedPages(): number[] {
    if (!pdf) return []
    const total = pdf.numPages
    const radius = keepRadius()
    const pages: number[] = []
    for (let p = 1; p <= total; p++) {
      if (
        Math.abs(p - currentPage) <= radius &&
        !rendered.has(p) &&
        !failed.has(p) &&
        canvases.has(p)
      ) {
        pages.push(p)
      }
    }
    // Nearest first; ties favor the page ahead (the likely flip direction).
    pages.sort((a, b) => {
      const da = Math.abs(a - currentPage)
      const db = Math.abs(b - currentPage)
      return da === db ? b - a : da - db
    })
    return pages
  }

  function evictFarPages(): void {
    const radius = keepRadius()
    if (radius === Infinity) return
    for (const page of rendered) {
      if (Math.abs(page - currentPage) > radius * 2) {
        const canvas = canvases.get(page)
        if (canvas) {
          // Release the backing bitmap; CSS keeps the page box sized.
          canvas.width = 0
          canvas.height = 0
        }
        rendered.delete(page)
      }
    }
  }

  async function renderPage(page: number): Promise<void> {
    if (!pdf) return
    const canvas = canvases.get(page)
    if (!canvas) return
    const doc = pdf
    const entry: ActiveRender = { page, task: null, cancelled: false }
    active = entry
    try {
      const pdfPage = await doc.getPage(page)
      if (entry.cancelled || pdf !== doc) return
      const viewport = pdfPage.getViewport({ scale: options.renderScale() * dpr() })
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      entry.task = pdfPage.render({ canvas, viewport })
      await entry.task.promise
      if (entry.cancelled || pdf !== doc) return
      rendered.add(page)
      options.onRendered?.(page)
    } catch (err) {
      if (!isCancelException(err) && !entry.cancelled) {
        failed.add(page)
        options.onError?.(page, err instanceof Error ? err : new Error(String(err)))
      }
    } finally {
      if (active === entry) active = null
    }
  }

  function idle(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof requestIdleCallback === 'function') requestIdleCallback(() => resolve())
      else setTimeout(resolve, 16)
    })
  }

  async function pump(): Promise<void> {
    if (pumping) return
    pumping = true
    try {
      const renderAll = options.renderRange() === Infinity
      let next: number | undefined
      while (pdf && (next = wantedPages()[0]) !== undefined) {
        if (renderAll) await idle()
        await renderPage(next)
      }
    } finally {
      pumping = false
    }
  }

  /** Cancel the in-flight render if it fell outside the wanted window. */
  function cancelStale(): void {
    if (active && Math.abs(active.page - currentPage) > keepRadius()) {
      active.cancelled = true
      active.task?.cancel()
    }
  }

  function setDocument(doc: PDFDocumentProxy | null): void {
    cancelAll()
    pdf = doc
    rendered.clear()
    failed.clear()
  }

  function registerCanvas(page: number, canvas: HTMLCanvasElement): void {
    canvases.set(page, canvas)
  }

  function updateWindow(page: number): void {
    currentPage = page
    cancelStale()
    evictFarPages()
    void pump()
  }

  function cancelAll(): void {
    if (active) {
      active.cancelled = true
      active.task?.cancel()
      active = null
    }
  }

  function reset(): void {
    cancelAll()
    pdf = null
    canvases.clear()
    rendered.clear()
    failed.clear()
    currentPage = 1
  }

  return {
    setDocument,
    registerCanvas,
    updateWindow,
    cancelAll,
    reset,
    isRendered: (page: number) => rendered.has(page),
  }
}
