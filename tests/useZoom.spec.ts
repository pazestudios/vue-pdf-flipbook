import { afterEach, describe, expect, it, vi } from 'vitest'
import { useZoom } from '../src/composables/useZoom'

function makeViewport(width = 800, height = 500): HTMLElement {
  const el = document.createElement('div')
  Object.defineProperty(el, 'clientWidth', { configurable: true, value: width })
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: height })
  el.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: width, bottom: height, width, height, x: 0, y: 0 }) as DOMRect
  document.body.appendChild(el)
  return el
}

function makeZoom(maxZoom = 1.5, viewport = makeViewport()) {
  const onChange = vi.fn()
  const zoom = useZoom(() => viewport, { maxZoom: () => maxZoom, onChange })
  zoom.listen()
  return { viewport, zoom, onChange }
}

function wheel(el: HTMLElement, deltaY: number, opts: Partial<WheelEventInit> = {}): WheelEvent {
  const e = new WheelEvent('wheel', {
    deltaY,
    clientX: 400,
    clientY: 250,
    bubbles: true,
    cancelable: true,
    ...opts,
  })
  el.dispatchEvent(e)
  return e
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('useZoom', () => {
  it('zooms in on wheel-up and clamps at maxZoom', () => {
    const { viewport, zoom, onChange } = makeZoom(1.5)
    wheel(viewport, -100)
    expect(zoom.zoom.value).toBeGreaterThan(1)
    expect(onChange).toHaveBeenCalledWith(zoom.zoom.value)
    for (let i = 0; i < 50; i++) wheel(viewport, -200)
    expect(zoom.zoom.value).toBe(1.5)
  })

  it('never zooms below 1 and clears the transform at 1', () => {
    const { viewport, zoom } = makeZoom()
    wheel(viewport, -100)
    expect(zoom.contentStyle.value.transform).toContain('scale(')
    for (let i = 0; i < 50; i++) wheel(viewport, 300)
    expect(zoom.zoom.value).toBe(1)
    expect(zoom.contentStyle.value).toEqual({})
  })

  it('consumes the wheel while zooming but lets an inert wheel scroll the page', () => {
    const { viewport } = makeZoom()
    // At zoom 1, scrolling down cannot zoom out — the page should scroll.
    expect(wheel(viewport, 100).defaultPrevented).toBe(false)
    // Zooming in consumes the event.
    expect(wheel(viewport, -100).defaultPrevented).toBe(true)
    // A trackpad pinch (ctrl+wheel) is always consumed, even at the limit.
    expect(wheel(viewport, 100, { ctrlKey: true }).defaultPrevented).toBe(true)
  })

  it('does nothing when maxZoom is 1', () => {
    const { viewport, zoom, onChange } = makeZoom(1)
    const e = wheel(viewport, -100)
    expect(zoom.zoom.value).toBe(1)
    expect(e.defaultPrevented).toBe(false)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('keeps the pan offset within bounds (content always covers the viewport)', () => {
    const { viewport, zoom } = makeZoom(1.5, makeViewport(800, 500))
    zoom.setZoom(1.5)
    // Zoom centered on (400, 250) at 1.5x → offset -200/-125, the exact middle
    // of the allowed range [-400, 0] × [-250, 0].
    expect(zoom.contentStyle.value.transform).toBe('translate(-200px, -125px) scale(1.5)')
  })

  it('setZoom clamps to [1, maxZoom] and reset returns to 1', () => {
    const { zoom, onChange } = makeZoom(1.5)
    zoom.setZoom(4)
    expect(zoom.zoom.value).toBe(1.5)
    zoom.reset()
    expect(zoom.zoom.value).toBe(1)
    expect(zoom.contentStyle.value).toEqual({})
    expect(onChange).toHaveBeenLastCalledWith(1)
  })

  it('stops pointer and click events from reaching the book while zoomed', () => {
    const { viewport, zoom } = makeZoom()
    const inner = document.createElement('div')
    viewport.appendChild(inner)
    const innerClick = vi.fn()
    const innerPointerDown = vi.fn()
    inner.addEventListener('click', innerClick)
    inner.addEventListener('pointerdown', innerPointerDown)

    // Not zoomed: events pass through to the flip engine's territory.
    inner.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(innerClick).toHaveBeenCalledTimes(1)

    zoom.setZoom(1.5)
    inner.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }))
    inner.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(innerPointerDown).not.toHaveBeenCalled()
    expect(innerClick).toHaveBeenCalledTimes(1)
  })

  it('pans with a mouse drag while zoomed, clamped to the edges', () => {
    const { viewport, zoom } = makeZoom(1.5, makeViewport(800, 500))
    zoom.setZoom(1.5) // offsets at (-200, -125)
    viewport.dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 1, clientX: 400, clientY: 250, bubbles: true }),
    )
    viewport.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, clientX: 500, clientY: 200, bubbles: true }),
    )
    expect(zoom.contentStyle.value.transform).toBe('translate(-100px, -175px) scale(1.5)')
    // Drag far right: x clamps at 0.
    viewport.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, clientX: 900, clientY: 200, bubbles: true }),
    )
    expect(zoom.contentStyle.value.transform).toBe('translate(0px, -175px) scale(1.5)')
    viewport.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true }))
  })

  it('unlisten removes all handlers', () => {
    const { viewport, zoom } = makeZoom()
    zoom.unlisten()
    wheel(viewport, -100)
    expect(zoom.zoom.value).toBe(1)
  })
})
