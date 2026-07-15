import type { FlipMode } from '../types'

export interface FlipEngineCallbacks {
  /** Fired after a flip lands, with the new current page (1-based). */
  onFlip?: (page: number) => void
  /**
   * Fired when a flip animation starts.
   * `fromPage` / `toPage` are the first page of the leaving / entering spread (1-based).
   */
  onFlipStart?: (fromPage: number, toPage: number) => void
  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void
}

export interface FlipEngineOptions extends FlipEngineCallbacks {
  /** Page root elements, in document order. The engine owns their layout. */
  pages: HTMLElement[]
  /** Base single-page size in px; only the aspect ratio matters for layout. */
  pageWidth: number
  pageHeight: number
  /** Initial page, 1-based. Default 1. */
  startPage?: number
  mode?: FlipMode
  showCover?: boolean
  responsive?: boolean
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  /** Flip animation duration in ms. 0 flips instantly. Default 800. */
  flippingTime?: number
  drawShadow?: boolean
  maxShadowOpacity?: number
  useMouseEvents?: boolean
  swipeDistance?: number
  disableFlipByClick?: boolean
}

type Orientation = 'portrait' | 'landscape'
type Slot = 'left' | 'right' | 'full'

interface ActiveFlip {
  leaf: HTMLElement
  movedPages: HTMLElement[]
  shadows: HTMLElement[]
  targetSpread: number
  endAngle: number
  raf: number
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

function now(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

/**
 * A minimal CSS-3D page flip engine: pages are absolutely positioned inside a
 * stage element, and a flip animates a temporary two-faced "leaf" rotating
 * around the spine. Basic by design — no page dragging or hard-cover physics.
 */
export class FlipEngine {
  private readonly root: HTMLElement
  private readonly stage: HTMLElement
  private readonly pages: HTMLElement[]
  private readonly opts: FlipEngineOptions

  private orientation: Orientation
  private spreads: number[][] = []
  private spreadIndex = 0
  private anim: ActiveFlip | null = null
  private destroyed = false
  private resizeObserver: ResizeObserver | null = null
  private usesWindowResize = false
  private pointerStart: { x: number; y: number } | null = null
  private suppressClick = false

  constructor(root: HTMLElement, options: FlipEngineOptions) {
    this.root = root
    this.opts = options
    this.pages = options.pages

    this.stage = document.createElement('div')
    this.stage.className = 'vpf-stage'
    this.stage.setAttribute('data-pdf-flipbook-stage', '')
    const s = this.stage.style
    s.position = 'relative'
    s.touchAction = 'pan-y'
    for (const page of this.pages) {
      page.style.display = 'none'
      this.stage.appendChild(page)
    }
    root.appendChild(this.stage)

    this.orientation = this.detectOrientation()
    this.applyStageSize()
    this.spreads = this.computeSpreads()
    const startPage = this.clampPage(options.startPage ?? 1)
    this.spreadIndex = this.spreadIndexForPage(startPage)
    this.layout()

    if (options.useMouseEvents !== false) {
      this.stage.addEventListener('pointerdown', this.handlePointerDown)
      this.stage.addEventListener('pointerup', this.handlePointerUp)
      this.stage.addEventListener('click', this.handleClick)
    }
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.handleResize)
      this.resizeObserver.observe(root)
    } else if (typeof window !== 'undefined') {
      this.usesWindowResize = true
      window.addEventListener('resize', this.handleResize)
    }
  }

  /* ------------------------------------------------------------- public API */

  flipNext(): void {
    this.flipToSpread(this.spreadIndex + 1)
  }

  flipPrev(): void {
    this.flipToSpread(this.spreadIndex - 1)
  }

  /** Flip to the spread containing `page` (1-based, clamped). */
  flip(page: number): void {
    this.flipToSpread(this.spreadIndexForPage(this.clampPage(page)))
  }

  getPageCount(): number {
    return this.pages.length
  }

  /** First page of the current spread, 1-based. */
  getCurrentPage(): number {
    return this.spreads[this.spreadIndex]?.[0] ?? 1
  }

  getOrientation(): Orientation {
    return this.orientation
  }

  /** Re-measure the container and re-apply layout. */
  update(): void {
    this.handleResize()
    this.applyStageSize()
    if (!this.anim) this.layout()
  }

  destroy(): void {
    if (this.destroyed) return
    this.destroyed = true
    if (this.anim) {
      cancelAnimationFrame(this.anim.raf)
      this.anim = null
    }
    this.resizeObserver?.disconnect()
    this.resizeObserver = null
    if (this.usesWindowResize) window.removeEventListener('resize', this.handleResize)
    this.stage.removeEventListener('pointerdown', this.handlePointerDown)
    this.stage.removeEventListener('pointerup', this.handlePointerUp)
    this.stage.removeEventListener('click', this.handleClick)
    this.stage.remove()
  }

  /* ------------------------------------------------------- spreads & layout */

  private clampPage(page: number): number {
    return Math.min(Math.max(page, 1), Math.max(this.pages.length, 1))
  }

  private detectOrientation(): Orientation {
    if (this.opts.mode === 'single') return 'portrait'
    if (this.opts.mode === 'spread') return 'landscape'
    const width = this.root.clientWidth || this.root.getBoundingClientRect().width
    // Unmeasurable container (hidden, or non-layout test DOM): assume wide.
    if (!width) return 'landscape'
    const minWidth = this.opts.minWidth ?? this.opts.pageWidth / 4
    return width >= minWidth * 2 ? 'landscape' : 'portrait'
  }

  private computeSpreads(): number[][] {
    const total = this.pages.length
    const spreads: number[][] = []
    if (this.orientation === 'portrait') {
      for (let p = 1; p <= total; p++) spreads.push([p])
      return spreads
    }
    let p = 1
    if (this.opts.showCover && total > 0) {
      spreads.push([1])
      p = 2
    }
    for (; p <= total; p += 2) {
      spreads.push(p + 1 <= total ? [p, p + 1] : [p])
    }
    return spreads
  }

  private spreadIndexForPage(page: number): number {
    const index = this.spreads.findIndex((spread) => spread.includes(page))
    return index === -1 ? 0 : index
  }

  /** Which half a lone page occupies in landscape: cover right, back cover left. */
  private loneSlot(spreadIndex: number): 'left' | 'right' {
    return spreadIndex === 0 && this.opts.showCover ? 'right' : 'left'
  }

  private slotPages(spreadIndex: number): { left?: number; right?: number } {
    const spread = this.spreads[spreadIndex]
    if (!spread || spread.length === 0) return {}
    if (spread.length === 2) return { left: spread[0], right: spread[1] }
    return this.loneSlot(spreadIndex) === 'left' ? { left: spread[0] } : { right: spread[0] }
  }

  private pageEl(page: number): HTMLElement | undefined {
    return this.pages[page - 1]
  }

  private showAt(page: number, slot: Slot): void {
    const el = this.pageEl(page)
    if (!el) return
    const s = el.style
    s.display = 'block'
    s.position = 'absolute'
    s.top = '0'
    s.height = '100%'
    if (slot === 'full') {
      s.left = '0'
      s.width = '100%'
    } else {
      s.width = '50%'
      s.left = slot === 'left' ? '0' : '50%'
    }
  }

  private hideAll(): void {
    for (const el of this.pages) el.style.display = 'none'
  }

  private layout(): void {
    this.hideAll()
    if (this.orientation === 'portrait') {
      const page = this.spreads[this.spreadIndex]?.[0]
      if (page) this.showAt(page, 'full')
      return
    }
    const { left, right } = this.slotPages(this.spreadIndex)
    if (left) this.showAt(left, 'left')
    if (right) this.showAt(right, 'right')
  }

  private applyStageSize(): void {
    const { pageWidth, pageHeight } = this.opts
    const across = this.orientation === 'landscape' ? 2 : 1
    const aspect = (across * pageWidth) / pageHeight
    const s = this.stage.style
    s.aspectRatio = String(aspect)
    s.perspective = `${Math.round(across * pageWidth * 2.5)}px`
    s.marginLeft = 'auto'
    s.marginRight = 'auto'
    if (this.opts.responsive === false) {
      s.width = `${across * pageWidth}px`
      s.maxWidth = ''
      s.minWidth = ''
      return
    }
    s.width = '100%'
    const maxW = Math.min(
      (this.opts.maxWidth ?? pageWidth * 2) * across,
      (this.opts.maxHeight ?? pageHeight * 2) * aspect,
    )
    s.maxWidth = `${Math.round(maxW)}px`
    const minW = Math.max((this.opts.minWidth ?? 0) * across, (this.opts.minHeight ?? 0) * aspect)
    s.minWidth = minW > 0 ? `${Math.round(minW)}px` : ''
  }

  /* --------------------------------------------------------------- flipping */

  private flipToSpread(target: number): void {
    if (this.destroyed || this.anim) return
    if (target < 0 || target >= this.spreads.length || target === this.spreadIndex) return
    const dir: 1 | -1 = target > this.spreadIndex ? 1 : -1
    const toPage = this.spreads[target]?.[0] ?? this.getCurrentPage()
    this.opts.onFlipStart?.(this.getCurrentPage(), toPage)

    let front: number | undefined
    let back: number | undefined
    const statics: Array<{ page: number | undefined; slot: Slot }> = []

    if (this.orientation === 'portrait') {
      front = this.spreads[this.spreadIndex]?.[0]
      back = this.spreads[target]?.[0]
    } else {
      const from = this.slotPages(this.spreadIndex)
      const to = this.slotPages(target)
      if (dir === 1) {
        front = from.right
        back = to.left
        statics.push({ page: from.left, slot: 'left' }, { page: to.right, slot: 'right' })
      } else {
        front = from.left
        back = to.right
        statics.push({ page: from.right, slot: 'right' }, { page: to.left, slot: 'left' })
      }
    }

    const frontEl = front ? this.pageEl(front) : undefined
    const backEl = back ? this.pageEl(back) : undefined
    if (!frontEl || !backEl) {
      // Nothing sensible to animate — jump straight to the target spread.
      this.spreadIndex = target
      this.layout()
      this.opts.onFlip?.(this.getCurrentPage())
      return
    }

    this.hideAll()
    for (const { page, slot } of statics) {
      if (page) this.showAt(page, slot)
    }

    const { leaf, shadows } = this.buildLeaf(dir, frontEl, backEl)
    this.stage.appendChild(leaf)

    const duration = Math.max(0, this.opts.flippingTime ?? 800)
    const endAngle = dir === 1 ? -180 : 180
    const maxShadow = this.opts.maxShadowOpacity ?? 0.4
    const startTime = now()
    const anim: ActiveFlip = {
      leaf,
      movedPages: [frontEl, backEl],
      shadows,
      targetSpread: target,
      endAngle,
      raf: 0,
    }
    this.anim = anim

    const step = (): void => {
      if (this.destroyed || this.anim !== anim) return
      const t = duration === 0 ? 1 : Math.min(1, (now() - startTime) / duration)
      const eased = easeInOutQuad(t)
      leaf.style.transform = `rotateY(${endAngle * eased}deg)`
      const shadowOpacity = Math.sin(Math.PI * eased) * maxShadow
      for (const shadow of anim.shadows) shadow.style.opacity = String(shadowOpacity)
      if (t < 1) anim.raf = requestAnimationFrame(step)
      else this.finishFlip(anim)
    }
    step()
  }

  private buildLeaf(
    dir: 1 | -1,
    frontEl: HTMLElement,
    backEl: HTMLElement,
  ): { leaf: HTMLElement; shadows: HTMLElement[] } {
    const landscape = this.orientation === 'landscape'
    const leaf = document.createElement('div')
    leaf.className = 'vpf-leaf'
    const s = leaf.style
    s.position = 'absolute'
    s.top = '0'
    s.height = '100%'
    s.width = landscape ? '50%' : '100%'
    s.left = landscape && dir === 1 ? '50%' : '0'
    // Landscape leaves rotate around the spine; portrait does a card flip.
    s.transformOrigin = landscape ? (dir === 1 ? 'left center' : 'right center') : 'center center'
    s.transformStyle = 'preserve-3d'
    s.zIndex = '10'
    s.pointerEvents = 'none'
    s.willChange = 'transform'

    const shadows: HTMLElement[] = []
    const spineEdge = dir === 1 ? 'right' : 'left'
    const makeFace = (pageEl: HTMLElement, isBack: boolean): HTMLElement => {
      const face = document.createElement('div')
      const fs = face.style
      fs.position = 'absolute'
      fs.inset = '0'
      fs.backfaceVisibility = 'hidden'
      fs.overflow = 'hidden'
      if (isBack) fs.transform = 'rotateY(180deg)'
      const ps = pageEl.style
      ps.display = 'block'
      ps.position = 'absolute'
      ps.top = '0'
      ps.left = '0'
      ps.width = '100%'
      ps.height = '100%'
      face.appendChild(pageEl)
      if (this.opts.drawShadow !== false) {
        const shadow = document.createElement('div')
        const ss = shadow.style
        ss.position = 'absolute'
        ss.inset = '0'
        ss.pointerEvents = 'none'
        ss.opacity = '0'
        ss.background = `linear-gradient(to ${spineEdge}, rgba(0,0,0,0.65), rgba(0,0,0,0) 65%)`
        face.appendChild(shadow)
        shadows.push(shadow)
      }
      return face
    }

    leaf.append(makeFace(frontEl, false), makeFace(backEl, true))
    return { leaf, shadows }
  }

  private finishFlip(anim: ActiveFlip): void {
    cancelAnimationFrame(anim.raf)
    for (const el of anim.movedPages) this.stage.appendChild(el)
    anim.leaf.remove()
    this.anim = null
    this.spreadIndex = anim.targetSpread
    this.layout()
    this.opts.onFlip?.(this.getCurrentPage())
  }

  /* ------------------------------------------------------------ interaction */

  private handleResize = (): void => {
    if (this.destroyed) return
    const next = this.detectOrientation()
    if (next === this.orientation) return
    if (this.anim) this.finishFlip(this.anim)
    const page = this.getCurrentPage()
    this.orientation = next
    this.applyStageSize()
    this.spreads = this.computeSpreads()
    this.spreadIndex = this.spreadIndexForPage(page)
    this.layout()
    this.opts.onOrientationChange?.(next)
  }

  private handlePointerDown = (e: PointerEvent): void => {
    this.suppressClick = false
    this.pointerStart = { x: e.clientX, y: e.clientY }
  }

  private handlePointerUp = (e: PointerEvent): void => {
    const start = this.pointerStart
    this.pointerStart = null
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    const distance = this.opts.swipeDistance ?? 30
    if (Math.abs(dx) >= distance && Math.abs(dx) > Math.abs(dy)) {
      this.suppressClick = true
      if (dx < 0) this.flipNext()
      else this.flipPrev()
    }
  }

  private handleClick = (e: MouseEvent): void => {
    if (this.suppressClick) {
      this.suppressClick = false
      return
    }
    if (this.opts.disableFlipByClick) return
    const rect = this.stage.getBoundingClientRect()
    if (!rect.width) return
    const x = (e.clientX - rect.left) / rect.width
    if (x < 0.5) this.flipPrev()
    else this.flipNext()
  }
}
