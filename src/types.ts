import type { Ref } from 'vue'
import type { PDFDocumentProxy } from 'pdfjs-dist'

/** PDF source: a URL or raw bytes. Byte buffers are copied before being handed to pdf.js. */
export type PdfSource = string | URL | ArrayBuffer | Uint8Array

/** Page display mode. `auto` switches between single-page and spread based on available width. */
export type FlipMode = 'auto' | 'single' | 'spread'

/** Where default (and slotted) controls render relative to the book. */
export type ControlsPosition = 'top' | 'bottom'

/** Tuning options for the built-in flip animation. */
export interface FlipOptions {
  /** Flip animation duration in ms (default 800). 0 flips instantly. */
  flippingTime?: number
  /** Draw a moving shadow on the turning page. Default true. */
  drawShadow?: boolean
  /** Peak opacity of the flip shadow (default 0.4). */
  maxShadowOpacity?: number
  /** Enable click/swipe navigation on the book. Default true. */
  useMouseEvents?: boolean
  /** Minimum horizontal swipe distance in px to trigger a flip (default 30). */
  swipeDistance?: number
  /** Disable flipping by clicking on the page halves. Default false. */
  disableFlipByClick?: boolean
}

/** The flip engine instance returned by `getFlipInstance()`. */
export interface PageFlipInstance {
  flipNext(): void
  flipPrev(): void
  /** Flip to the spread containing `page` (1-based, clamped). */
  flip(page: number): void
  getPageCount(): number
  /** First page of the current spread, 1-based. */
  getCurrentPage(): number
  /** Pages currently visible in the spread, 1-based (one or two). */
  getCurrentSpread(): number[]
  getOrientation(): 'portrait' | 'landscape'
  /** Re-measure the container and re-apply layout. */
  update(): void
  destroy(): void
}

export interface PdfFlipbookProps {
  /** PDF source. Reactive: swapping it tears down and reloads the book. */
  src: PdfSource
  /** Extra parameters forwarded to pdf.js `getDocument` (cMapUrl, httpHeaders, ...). */
  pdfOptions?: Record<string, unknown>
  /** Override the pdf.js worker URL (recommended for offline/CSP environments). */
  workerSrc?: string

  /** Base single-page width in px (default 550). */
  width?: number
  /** Base single-page height in px. Defaults to the PDF's own aspect ratio. */
  height?: number
  /** Scale the book to its container (StPageFlip `size: 'stretch'`). Default true. */
  responsive?: boolean
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number

  /** Initial page, 1-based. Default 1. */
  startPage?: number
  /** 'auto' | 'single' | 'spread'. Default 'auto'. */
  mode?: FlipMode
  /**
   * Show the first page alone (centered) like a book cover, and end the book
   * on a lone, centered back cover. PDFs with an odd page count get one blank
   * filler page (`.vpf-page-blank`) appended so the book can always close;
   * page numbers in events, controls, and slots never include it. Set to
   * false to always open on a full two-page spread. Default true.
   */
  showCover?: boolean
  /** Pass-through StPageFlip settings. */
  flipOptions?: FlipOptions

  /** pdf.js viewport scale multiplier (multiplied by capped devicePixelRatio). Default 1.5. */
  renderScale?: number
  /**
   * Lazy-render window: number of spreads kept rendered on each side of the
   * current one. Use Infinity to render every page. Default 2.
   */
  renderRange?: number
  /** Place controls above or below the book. Default `'bottom'`. */
  controlsPosition?: ControlsPosition
  /**
   * Maximum pinch/scroll zoom level (1 = fit). Zoom in with a touch pinch,
   * trackpad pinch, or the mouse wheel over the book; drag to pan while
   * zoomed. Set to 1 to disable zooming. Default 2.
   */
  maxZoom?: number

  /* Headless styling hooks — pass Tailwind (or any) classes. */
  containerClass?: string
  /** Extra classes applied to the container while in fullscreen. */
  fullscreenClass?: string
  bookClass?: string
  pageClass?: string
  controlsClass?: string
  buttonClass?: string
  pageIndicatorClass?: string
  loadingClass?: string
  errorClass?: string
}

export interface PdfFlipbookEmits {
  (e: 'loaded', payload: { totalPages: number; pdf: PDFDocumentProxy }): void
  (e: 'error', error: Error): void
  (e: 'page-changed', payload: { page: number; totalPages: number }): void
  (e: 'flip-start', payload: { fromPage: number; toPage: number }): void
  (e: 'orientation-changed', orientation: 'portrait' | 'landscape'): void
  (e: 'rendered', payload: { page: number }): void
  (e: 'fullscreen-changed', isFullscreen: boolean): void
  (e: 'zoom-changed', zoom: number): void
}

/** Slot props for the `controls` slot. */
export interface ControlsSlotProps {
  /** First page of the current spread, 1-based. */
  currentPage: number
  /** Pages currently visible (one page, or both pages of a landscape spread). */
  visiblePages: number[]
  totalPages: number
  next: () => void
  prev: () => void
  goToPage: (page: number) => void
  canGoNext: boolean
  canGoPrev: boolean
  isFullscreen: boolean
  toggleFullscreen: () => void
  /** Current zoom level (1 = fit). */
  zoom: number
  /** Set the zoom level (clamped to [1, maxZoom]), centered on the viewport. */
  setZoom: (level: number) => void
  resetZoom: () => void
}

/** Methods and state exposed via template ref. */
export interface PdfFlipbookExpose {
  next: () => void
  prev: () => void
  goToPage: (page: number) => void
  currentPage: Readonly<Ref<number>>
  totalPages: Readonly<Ref<number>>
  reload: () => Promise<void>
  isFullscreen: Readonly<Ref<boolean>>
  enterFullscreen: () => Promise<void>
  exitFullscreen: () => Promise<void>
  toggleFullscreen: () => Promise<void>
  getPdfDocument: () => PDFDocumentProxy | null
  getFlipInstance: () => PageFlipInstance | null
  /** Current zoom level (1 = fit). */
  zoom: Readonly<Ref<number>>
  /** Set the zoom level (clamped to [1, maxZoom]), centered on the viewport. */
  setZoom: (level: number) => void
  resetZoom: () => void
}

export interface PluginOptions {
  /** pdf.js worker URL applied globally for all PdfFlipbook instances. */
  workerSrc?: string
}
