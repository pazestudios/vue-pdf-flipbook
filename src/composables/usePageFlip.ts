import { FlipEngine } from '../flip/FlipEngine'
import type { FlipMode, FlipOptions } from '../types'

export interface PageFlipInit {
  pageCount: number
  pageWidth: number
  pageHeight: number
  startPage: number
  mode: FlipMode
  showCover: boolean
  responsive: boolean
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  flipOptions?: FlipOptions
  pageClass?: string
  /**
   * Append one synthetic blank page (no canvas) after the real pages so an
   * odd-count book can end on a lone back cover. `pageCount` must already
   * include it.
   */
  trailingBlank?: boolean
}

export interface PageFlipCallbacks {
  onFlip: (page: number) => void
  onFlipStart: (fromPage: number, toPage: number) => void
  onOrientationChange: (orientation: 'portrait' | 'landscape') => void
}

export interface PageElement {
  root: HTMLElement
  /** null for the synthetic trailing blank page — it has no PDF content. */
  canvas: HTMLCanvasElement | null
}

/**
 * The flip engine owns and repositions the page elements it is given, so they
 * must be created imperatively — never rendered by a Vue template, or Vue's
 * patching would fight the engine's DOM surgery.
 */
export function createPageElements(init: PageFlipInit): PageElement[] {
  const elements: PageElement[] = []
  for (let i = 0; i < init.pageCount; i++) {
    const isBlank = Boolean(init.trailingBlank) && i === init.pageCount - 1
    const root = document.createElement('div')
    const classes = ['vpf-page']
    if (isBlank) classes.push('vpf-page-blank')
    if (init.pageClass) classes.push(init.pageClass)
    root.className = classes.join(' ')
    const isCover = init.showCover && (i === 0 || i === init.pageCount - 1)
    root.dataset.density = isCover ? 'hard' : 'soft'
    // Critical layout styles are inlined so the book renders correctly even
    // when the consumer skips the optional style.css.
    root.style.overflow = 'hidden'
    if (!init.pageClass) root.style.background = '#fff'
    if (isBlank) {
      root.setAttribute('data-pdf-flipbook-blank', '')
      elements.push({ root, canvas: null })
      continue
    }
    root.setAttribute('data-pdf-flipbook-page', String(i + 1))
    const canvas = document.createElement('canvas')
    canvas.className = 'vpf-canvas'
    canvas.setAttribute('data-pdf-flipbook-canvas', '')
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    root.appendChild(canvas)
    elements.push({ root, canvas })
  }
  return elements
}

export function usePageFlip(callbacks: PageFlipCallbacks) {
  let instance: FlipEngine | null = null
  let pages: PageElement[] = []
  let bookEl: HTMLElement | null = null

  async function init(el: HTMLElement, options: PageFlipInit): Promise<PageElement[]> {
    destroy()
    bookEl = el
    pages = createPageElements(options)
    instance = new FlipEngine(el, {
      pages: pages.map((p) => p.root),
      pageWidth: options.pageWidth,
      pageHeight: options.pageHeight,
      startPage: options.startPage,
      mode: options.mode,
      showCover: options.showCover,
      responsive: options.responsive,
      minWidth: options.minWidth,
      maxWidth: options.maxWidth,
      minHeight: options.minHeight,
      maxHeight: options.maxHeight,
      trailingBlank: options.trailingBlank,
      ...options.flipOptions,
      onFlip: callbacks.onFlip,
      onFlipStart: callbacks.onFlipStart,
      onOrientationChange: callbacks.onOrientationChange,
    })
    return pages
  }

  function destroy(): void {
    instance?.destroy()
    instance = null
    pages = []
    if (bookEl) {
      while (bookEl.firstChild) bookEl.removeChild(bookEl.firstChild)
      bookEl = null
    }
  }

  function next(): void {
    instance?.flipNext()
  }

  function prev(): void {
    instance?.flipPrev()
  }

  /** page is 1-based */
  function goToPage(page: number): void {
    instance?.flip(page)
  }

  return {
    init,
    destroy,
    next,
    prev,
    goToPage,
    getInstance: () => instance,
    getPages: () => pages,
  }
}
