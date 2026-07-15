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
  /** Draw the flip-leaf shadow and the book chrome (drop shadow, spine, page bend). Default true. */
  drawShadow?: boolean
  maxShadowOpacity?: number
  useMouseEvents?: boolean
  swipeDistance?: number
  disableFlipByClick?: boolean
}

type Orientation = 'portrait' | 'landscape'
type Slot = 'left' | 'right' | 'full'

/**
 * Decorative overlays that make the stage read as a physical book: a drop
 * shadow under the book's current footprint, a gutter spine when open, a
 * binding-edge gradient when closed, and per-page bend shading.
 */
interface ChromeElements {
  shadow: HTMLElement
  spine: HTMLElement
  bendLeft: HTMLElement
  bendRight: HTMLElement
  coverSpine: HTMLElement
}

/** Resolved chrome appearance for one spread; interpolated during flips. */
interface ChromeState {
  /** Book-shadow footprint as stage-width fractions. */
  shadowLeft: number
  shadowWidth: number
  shadowOpacity: number
  spineOpacity: number
  bendOpacity: number
  bendLeftBg: string
  bendRightBg: string
  coverSpineOpacity: number
  coverSpineLeft: number
  coverSpineBg: string
}

interface ActiveFlip {
  leaf: HTMLElement
  movedPages: HTMLElement[]
  shadows: HTMLElement[]
  chrome: ((eased: number) => void) | null
  targetSpread: number
  endAngle: number
  raf: number
}

function pct(v: number): string {
  return `${+(v * 100).toFixed(2)}%`
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
  private chrome: ChromeElements | null = null
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

    if (options.drawShadow !== false) this.chrome = this.buildChrome()
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

  /** Pages currently visible in the spread, 1-based (one or two). */
  getCurrentSpread(): number[] {
    return [...(this.spreads[this.spreadIndex] ?? [1])]
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
    // Need room for two pages at least ~half the base page width each
    // (default pageWidth 550 → switch below ~550px, i.e. typical phones).
    const minWidth = this.opts.minWidth ?? this.opts.pageWidth / 2
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
      this.updateChrome(this.spreadIndex)
      return
    }
    const { left, right } = this.slotPages(this.spreadIndex)
    if (left) this.showAt(left, 'left')
    if (right) this.showAt(right, 'right')
    this.updateChrome(this.spreadIndex)
  }

  /* ------------------------------------------------------------ book chrome */

  private buildChrome(): ChromeElements {
    const make = (className: string): HTMLElement => {
      const el = document.createElement('div')
      el.className = className
      const s = el.style
      s.position = 'absolute'
      s.top = '0'
      s.height = '100%'
      s.pointerEvents = 'none'
      s.opacity = '0'
      return el
    }
    // The shadow sits behind the pages (first child, painted under later
    // siblings); during flips its footprint is re-derived every frame so it
    // never leads or trails the rotating leaf. The overlays sit above the
    // pages but below a flipping leaf.
    const shadow = make('vpf-book-shadow')
    shadow.style.boxShadow = [
      '0 0 4px rgba(0, 0, 0, 0.12)',
      '0 4px 10px rgba(0, 0, 0, 0.16)',
      '0 14px 28px rgba(0, 0, 0, 0.2)',
      '0 28px 56px rgba(0, 0, 0, 0.16)',
    ].join(', ')
    const spine = make('vpf-book-spine')
    spine.style.left = '47%'
    spine.style.width = '6%'
    spine.style.background =
      'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.14) 35%, ' +
      'rgba(0,0,0,0.28) 50%, rgba(0,0,0,0.14) 65%, rgba(0,0,0,0) 100%)'
    const bendLeft = make('vpf-page-bend vpf-page-bend-left')
    bendLeft.style.left = '0'
    bendLeft.style.width = '50%'
    const bendRight = make('vpf-page-bend vpf-page-bend-right')
    bendRight.style.left = '50%'
    bendRight.style.width = '50%'
    const coverSpine = make('vpf-cover-spine')
    coverSpine.style.width = '50%'
    for (const el of [spine, bendLeft, bendRight, coverSpine]) el.style.zIndex = '3'
    this.stage.insertBefore(shadow, this.stage.firstChild)
    this.stage.append(spine, bendLeft, bendRight, coverSpine)
    return { shadow, spine, bendLeft, bendRight, coverSpine }
  }

  /**
   * Shading that makes a page look like it bends down into the gutter:
   * a shadow that deepens toward the spine, then a faint highlight where the
   * paper crests back up. `k` scales the whole effect (0..1).
   */
  private static bendGradient(side: 'left' | 'right', k: number): string {
    const a = (v: number): string => (v * k).toFixed(3)
    const dir = side === 'left' ? 'to left' : 'to right'
    return (
      `linear-gradient(${dir}, rgba(0,0,0,${a(0.22)}) 0%, rgba(0,0,0,${a(0.06)}) 5%, ` +
      `rgba(255,255,255,${a(0.1)}) 8%, rgba(255,255,255,0) 16%)`
    )
  }

  /** Binding-edge shading for a closed book: dark crease, highlight, falloff. */
  private static closedSpineGradient(dir: 'to right' | 'to left'): string {
    return (
      `linear-gradient(${dir}, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.1) 0.8%, ` +
      `rgba(255,255,255,0.1) 1.8%, rgba(0,0,0,0.05) 2.8%, rgba(0,0,0,0) 5%)`
    )
  }

  /** Bend gradient for one side of an open spread at `spreadIndex`. */
  private bendFor(spreadIndex: number, side: 'left' | 'right'): string {
    const total = this.spreads.length
    const t = total > 1 ? spreadIndex / (total - 1) : 0.5
    return side === 'left'
      ? FlipEngine.bendGradient('left', 1 - 0.65 * t)
      : FlipEngine.bendGradient('right', 0.35 + 0.65 * t)
  }

  /**
   * The gutter-side shading the page in `slot` shows once `spreadIndex` is at
   * rest: the page-bend gradient on an open spread, the binding crease on a
   * lone cover/back cover, or '' for an empty slot.
   */
  private gutterShadingFor(spreadIndex: number, slot: 'left' | 'right'): string {
    const { left, right } = this.slotPages(spreadIndex)
    if (left && right) return this.bendFor(spreadIndex, slot)
    if (slot === 'right' ? right : left) {
      return FlipEngine.closedSpineGradient(slot === 'right' ? 'to right' : 'to left')
    }
    return ''
  }

  /** Resolve what the chrome should look like once `spreadIndex` is at rest. */
  private chromeStateFor(spreadIndex: number): ChromeState {
    const state: ChromeState = {
      shadowLeft: 0,
      shadowWidth: 1,
      shadowOpacity: 1,
      spineOpacity: 0,
      bendOpacity: 0,
      bendLeftBg: '',
      bendRightBg: '',
      coverSpineOpacity: 0,
      coverSpineLeft: 0,
      coverSpineBg: '',
    }
    if (this.orientation === 'portrait') return state
    const { left, right } = this.slotPages(spreadIndex)
    if (left && right) {
      // Open book: gutter spine and page-bend shading. A page over a thin
      // stack dips steeply into the gutter while a thick stack keeps it
      // nearly flat, so each side's bend eases off as its stack grows.
      state.spineOpacity = 1
      state.bendOpacity = 1
      state.bendLeftBg = this.bendFor(spreadIndex, 'left')
      state.bendRightBg = this.bendFor(spreadIndex, 'right')
      return state
    }
    if (left || right) {
      // Closed book (lone cover or back cover): half-width shadow plus a
      // binding-edge gradient on the spine side, which always faces center.
      const onRight = Boolean(right)
      state.shadowLeft = onRight ? 0.5 : 0
      state.shadowWidth = 0.5
      state.coverSpineOpacity = 1
      state.coverSpineLeft = onRight ? 0.5 : 0
      state.coverSpineBg = FlipEngine.closedSpineGradient(onRight ? 'to right' : 'to left')
      return state
    }
    state.shadowOpacity = 0
    return state
  }

  private applyChromeState(state: ChromeState): void {
    const chrome = this.chrome
    if (!chrome) return
    const ss = chrome.shadow.style
    ss.left = pct(state.shadowLeft)
    ss.width = pct(state.shadowWidth)
    ss.opacity = String(state.shadowOpacity)
    chrome.spine.style.opacity = String(state.spineOpacity)
    chrome.bendLeft.style.opacity = String(state.bendOpacity)
    chrome.bendRight.style.opacity = String(state.bendOpacity)
    chrome.bendLeft.style.background = state.bendLeftBg
    chrome.bendRight.style.background = state.bendRightBg
    const cs = chrome.coverSpine.style
    cs.opacity = String(state.coverSpineOpacity)
    cs.left = pct(state.coverSpineLeft)
    cs.background = state.coverSpineBg
  }

  /** Repaint the book chrome instantly for a spread at rest. */
  private updateChrome(spreadIndex: number): void {
    if (this.chrome) this.applyChromeState(this.chromeStateFor(spreadIndex))
  }

  /**
   * Per-frame chrome update during a landscape flip. The shadow footprint is
   * re-derived from what actually covers the stage right now — the static
   * pages plus the leaf's horizontal projection (cos of its angle) — so the
   * shadow never appears under a half the page hasn't reached yet. Overlays
   * fade out over the first half of the turn (while the leaf uncovers the old
   * state) and fade in over the second half (as it covers the new one).
   */
  private stepChrome(
    from: ChromeState,
    to: ChromeState,
    dir: 1 | -1,
    staticLeft: boolean,
    staticRight: boolean,
    eased: number,
  ): void {
    const chrome = this.chrome
    if (!chrome) return
    const cos = Math.cos(Math.PI * eased)
    const sourceCover = 0.5 * Math.max(cos, 0)
    const destCover = 0.5 * Math.max(-cos, 0)
    const leftCovered = staticLeft ? 0.5 : dir === 1 ? destCover : sourceCover
    const rightCovered = staticRight ? 0.5 : dir === 1 ? sourceCover : destCover
    const ss = chrome.shadow.style
    ss.left = pct(0.5 - leftCovered)
    ss.width = pct(leftCovered + rightCovered)
    ss.opacity = String(from.shadowOpacity + (to.shadowOpacity - from.shadowOpacity) * eased)

    const fadeIn = Math.max(0, 2 * eased - 1)
    const fadeOut = Math.max(0, 1 - 2 * eased)
    const cross = (fromO: number, toO: number): string =>
      String(toO > fromO ? fromO + (toO - fromO) * fadeIn : toO + (fromO - toO) * fadeOut)
    const late = eased >= 0.5
    chrome.spine.style.opacity = cross(from.spineOpacity, to.spineOpacity)
    const bendOpacity = cross(from.bendOpacity, to.bendOpacity)
    chrome.bendLeft.style.opacity = bendOpacity
    chrome.bendRight.style.opacity = bendOpacity
    chrome.bendLeft.style.background = late ? to.bendLeftBg : from.bendLeftBg
    chrome.bendRight.style.background = late ? to.bendRightBg : from.bendRightBg
    const cs = chrome.coverSpine.style
    cs.opacity = cross(from.coverSpineOpacity, to.coverSpineOpacity)
    cs.left = pct(late ? to.coverSpineLeft : from.coverSpineLeft)
    cs.background = late ? to.coverSpineBg : from.coverSpineBg
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

    let chromeStep: ((eased: number) => void) | null = null
    if (this.chrome) {
      if (this.orientation === 'portrait') {
        // Portrait chrome is a constant full-width shadow; no need to animate.
        this.updateChrome(target)
      } else {
        const staticLeft = statics.some((s) => s.page !== undefined && s.slot === 'left')
        const staticRight = statics.some((s) => s.page !== undefined && s.slot === 'right')
        const fromState = this.chromeStateFor(this.spreadIndex)
        const toState = this.chromeStateFor(target)
        chromeStep = (eased) =>
          this.stepChrome(fromState, toState, dir, staticLeft, staticRight, eased)
      }
    }

    const { leaf, shadows } = this.buildLeaf(dir, frontEl, backEl, target)
    this.stage.appendChild(leaf)

    const duration = Math.max(0, this.opts.flippingTime ?? 800)
    const endAngle = dir === 1 ? -180 : 180
    const maxShadow = this.opts.maxShadowOpacity ?? 0.4
    const startTime = now()
    const anim: ActiveFlip = {
      leaf,
      movedPages: [frontEl, backEl],
      shadows,
      chrome: chromeStep,
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
      anim.chrome?.(eased)
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
    targetSpread: number,
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
      if (this.opts.drawShadow !== false && landscape) {
        // Carry the page's resting gutter shading (bend or binding crease) on
        // the face itself, so the page doesn't lose its spine shadow the
        // moment it starts moving. The front face shows the outgoing state,
        // the back face the destination state; both vanish with the leaf.
        // The back face's rotateY(180deg) mirror cancels the left/right slot
        // swap, so the rest-state gradient string is correct on it as-is.
        const slot = (dir === 1) !== isBack ? 'right' : 'left'
        const shading = this.gutterShadingFor(isBack ? targetSpread : this.spreadIndex, slot)
        if (shading) {
          const bend = document.createElement('div')
          bend.className = 'vpf-leaf-bend'
          const bs = bend.style
          bs.position = 'absolute'
          bs.inset = '0'
          bs.pointerEvents = 'none'
          bs.background = shading
          face.appendChild(bend)
        }
      }
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
    // A second touch means a multi-finger gesture (pinch zoom) — never a swipe.
    if (!e.isPrimary) {
      this.pointerStart = null
      return
    }
    this.suppressClick = false
    this.pointerStart = { x: e.clientX, y: e.clientY }
  }

  private handlePointerUp = (e: PointerEvent): void => {
    if (!e.isPrimary) return
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
