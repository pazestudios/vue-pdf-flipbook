import { computed, ref } from 'vue'

export interface UseZoomOptions {
  /** Max zoom level; zooming is disabled when <= 1. */
  maxZoom: () => number
  onChange?: (zoom: number) => void
}

/** Safari-only pinch events (desktop trackpad); not in the standard DOM types. */
interface GestureEvent extends UIEvent {
  scale: number
  clientX: number
  clientY: number
}

/**
 * Pinch / scroll zoom for the book viewport.
 *
 * Applies a `translate + scale` transform to the viewport's content element
 * and lets the user pan while zoomed in (mouse or touch drag). While zoomed,
 * pointer/click events are stopped in the capture phase so the flip engine's
 * swipe/click navigation never fights a pan gesture; page turning stays
 * available through the controls.
 *
 * Input paths, in order of precedence:
 * - two-finger touch pinch (touch events; `preventDefault` keeps the browser
 *   from claiming the gesture and firing `pointercancel`)
 * - trackpad pinch (Chrome/Firefox report it as ctrl+wheel; Safari fires
 *   proprietary gesture* events)
 * - plain mouse wheel over the book
 */
export function useZoom(getViewport: () => HTMLElement | null, options: UseZoomOptions) {
  const zoom = ref(1)
  const offsetX = ref(0)
  const offsetY = ref(0)

  const contentStyle = computed((): Record<string, string> => {
    if (zoom.value === 1) return {}
    return {
      transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${zoom.value})`,
      transformOrigin: '0 0',
      willChange: 'transform',
    }
  })

  let el: HTMLElement | null = null
  let resizeObserver: ResizeObserver | null = null
  let pinch: { startDist: number; startZoom: number; lastMidX: number; lastMidY: number } | null =
    null
  /** Mouse/pen drag pan (pointer events). Touch pans via touch events. */
  let pan: { pointerId: number; lastX: number; lastY: number } | null = null
  /** Single-finger touch pan. */
  let touchPan: { lastX: number; lastY: number } | null = null
  /** Swallow the synthetic click that can follow a pinch ending at zoom 1. */
  let suppressNextClick = false
  let gestureBaseZoom: number | null = null

  const enabled = (): boolean => options.maxZoom() > 1

  function clampZoom(value: number): number {
    return Math.min(Math.max(value, 1), Math.max(options.maxZoom(), 1))
  }

  /** Keep the scaled content covering the viewport (no gaps at the edges). */
  function clampOffsets(): void {
    if (!el) return
    offsetX.value = Math.min(0, Math.max(el.clientWidth * (1 - zoom.value), offsetX.value))
    offsetY.value = Math.min(0, Math.max(el.clientHeight * (1 - zoom.value), offsetY.value))
  }

  /** Set zoom so the content point under viewport coords (x, y) stays put. */
  function zoomAtPoint(target: number, x: number, y: number): void {
    const next = clampZoom(target)
    const prev = zoom.value
    if (next === prev) return
    offsetX.value = x - ((x - offsetX.value) / prev) * next
    offsetY.value = y - ((y - offsetY.value) / prev) * next
    zoom.value = next
    if (next === 1) {
      offsetX.value = 0
      offsetY.value = 0
      pan = null
      touchPan = null
    } else {
      clampOffsets()
    }
    syncViewportStyle()
    options.onChange?.(next)
  }

  function panBy(dx: number, dy: number): void {
    offsetX.value += dx
    offsetY.value += dy
    clampOffsets()
  }

  function setZoom(level: number): void {
    if (!el) return
    zoomAtPoint(level, el.clientWidth / 2, el.clientHeight / 2)
  }

  function reset(): void {
    pinch = null
    pan = null
    touchPan = null
    if (zoom.value !== 1) {
      zoom.value = 1
      offsetX.value = 0
      offsetY.value = 0
      syncViewportStyle()
      options.onChange?.(1)
    }
  }

  function syncViewportStyle(): void {
    if (!el) return
    // touch-action none while zoomed so single-finger pans reach us as
    // pointermoves instead of scrolling the page.
    el.style.touchAction = zoom.value > 1 ? 'none' : ''
    el.style.cursor = zoom.value > 1 ? (pan ? 'grabbing' : 'grab') : ''
  }

  function localPoint(clientX: number, clientY: number): { x: number; y: number } {
    const rect = el!.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  /* ---------------------------------------------------------------- wheel */

  const onWheel = (e: WheelEvent): void => {
    if (!el || !enabled()) return
    const pinchGesture = e.ctrlKey || e.metaKey
    const deltaY = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
    // Trackpad pinches (ctrl+wheel) report fine-grained deltas; boost them.
    const target = clampZoom(zoom.value * Math.exp(-deltaY * (pinchGesture ? 0.01 : 0.0022)))
    // A wheel that can't change the zoom scrolls the page as usual — but a
    // pinch is always consumed, or the browser would zoom the whole page.
    if (target === zoom.value && !pinchGesture) return
    e.preventDefault()
    const { x, y } = localPoint(e.clientX, e.clientY)
    zoomAtPoint(target, x, y)
  }

  /* ---------------------------------------------------------------- touch */

  const touchDist = (touches: TouchList): number =>
    Math.hypot(
      touches[0]!.clientX - touches[1]!.clientX,
      touches[0]!.clientY - touches[1]!.clientY,
    )

  const touchMid = (touches: TouchList): { x: number; y: number } =>
    localPoint(
      (touches[0]!.clientX + touches[1]!.clientX) / 2,
      (touches[0]!.clientY + touches[1]!.clientY) / 2,
    )

  const onTouchStart = (e: TouchEvent): void => {
    if (!enabled()) return
    if (e.touches.length === 2) {
      // Claim the gesture before the browser does (scroll / native pinch-zoom).
      e.preventDefault()
      pan = null
      touchPan = null
      const mid = touchMid(e.touches)
      pinch = {
        startDist: touchDist(e.touches),
        startZoom: zoom.value,
        lastMidX: mid.x,
        lastMidY: mid.y,
      }
    } else if (e.touches.length === 1 && zoom.value > 1) {
      touchPan = { lastX: e.touches[0]!.clientX, lastY: e.touches[0]!.clientY }
    }
  }

  const onTouchMove = (e: TouchEvent): void => {
    if (pinch && e.touches.length >= 2) {
      e.preventDefault()
      const mid = touchMid(e.touches)
      panBy(mid.x - pinch.lastMidX, mid.y - pinch.lastMidY)
      pinch.lastMidX = mid.x
      pinch.lastMidY = mid.y
      zoomAtPoint((pinch.startZoom * touchDist(e.touches)) / pinch.startDist, mid.x, mid.y)
    } else if (touchPan && e.touches.length === 1 && zoom.value > 1) {
      e.preventDefault()
      const t = e.touches[0]!
      panBy(t.clientX - touchPan.lastX, t.clientY - touchPan.lastY)
      touchPan.lastX = t.clientX
      touchPan.lastY = t.clientY
    }
  }

  const onTouchEnd = (e: TouchEvent): void => {
    if (pinch && e.touches.length < 2) {
      pinch = null
      suppressNextClick = true
    }
    // A pinch that ends with one finger still down flows straight into a pan.
    if (e.touches.length === 1 && zoom.value > 1) {
      touchPan = { lastX: e.touches[0]!.clientX, lastY: e.touches[0]!.clientY }
    } else {
      touchPan = null
    }
  }

  /* ------------------------------------------------- pan & flip suppression */

  // Capture-phase handlers: they run before the flip engine's stage listeners
  // and stop propagation while zoomed, so drags pan instead of turning pages.
  const onPointerDownCapture = (e: PointerEvent): void => {
    suppressNextClick = false
    if (zoom.value <= 1) return
    e.stopPropagation()
    if (e.pointerType !== 'touch') {
      pan = { pointerId: e.pointerId, lastX: e.clientX, lastY: e.clientY }
      el?.setPointerCapture?.(e.pointerId)
    }
    syncViewportStyle()
  }

  const onPointerMove = (e: PointerEvent): void => {
    if (!pan || e.pointerId !== pan.pointerId || pinch) return
    panBy(e.clientX - pan.lastX, e.clientY - pan.lastY)
    pan.lastX = e.clientX
    pan.lastY = e.clientY
  }

  const onPointerUpCapture = (e: PointerEvent): void => {
    if (zoom.value > 1 || pinch) e.stopPropagation()
    if (pan && e.pointerId === pan.pointerId) {
      pan = null
      syncViewportStyle()
    }
  }

  const onClickCapture = (e: MouseEvent): void => {
    if (zoom.value > 1 || suppressNextClick) {
      suppressNextClick = false
      e.stopPropagation()
      e.preventDefault()
    }
  }

  /* ------------------------------------------------- Safari gesture events */

  const onGestureStart = (e: GestureEvent): void => {
    if (!enabled()) return
    e.preventDefault()
    gestureBaseZoom = zoom.value
  }

  const onGestureChange = (e: GestureEvent): void => {
    if (!enabled()) return
    e.preventDefault()
    // On iOS the touch handlers already drive the pinch; gesture events only
    // need preventDefault there. Desktop Safari has no touch events.
    if (pinch || gestureBaseZoom === null) return
    const { x, y } = localPoint(e.clientX, e.clientY)
    zoomAtPoint(gestureBaseZoom * e.scale, x, y)
  }

  const onGestureEnd = (e: GestureEvent): void => {
    e.preventDefault()
    gestureBaseZoom = null
  }

  /* ------------------------------------------------------------- lifecycle */

  function listen(): void {
    unlisten()
    el = getViewport()
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchcancel', onTouchEnd)
    el.addEventListener('pointerdown', onPointerDownCapture, { capture: true })
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUpCapture, { capture: true })
    el.addEventListener('pointercancel', onPointerUpCapture, { capture: true })
    el.addEventListener('click', onClickCapture, { capture: true })
    el.addEventListener('gesturestart', onGestureStart as EventListener, { passive: false })
    el.addEventListener('gesturechange', onGestureChange as EventListener, { passive: false })
    el.addEventListener('gestureend', onGestureEnd as EventListener, { passive: false })
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => clampOffsets())
      resizeObserver.observe(el)
    }
  }

  function unlisten(): void {
    if (!el) return
    el.removeEventListener('wheel', onWheel)
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchmove', onTouchMove)
    el.removeEventListener('touchend', onTouchEnd)
    el.removeEventListener('touchcancel', onTouchEnd)
    el.removeEventListener('pointerdown', onPointerDownCapture, { capture: true })
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerup', onPointerUpCapture, { capture: true })
    el.removeEventListener('pointercancel', onPointerUpCapture, { capture: true })
    el.removeEventListener('click', onClickCapture, { capture: true })
    el.removeEventListener('gesturestart', onGestureStart as EventListener)
    el.removeEventListener('gesturechange', onGestureChange as EventListener)
    el.removeEventListener('gestureend', onGestureEnd as EventListener)
    resizeObserver?.disconnect()
    resizeObserver = null
    pinch = null
    pan = null
    touchPan = null
    el = null
  }

  return { zoom, contentStyle, setZoom, reset, listen, unlisten }
}
