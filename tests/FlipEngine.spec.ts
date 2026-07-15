import { describe, expect, it, vi } from 'vitest'
import { FlipEngine, type FlipEngineOptions } from '../src/flip/FlipEngine'

function makePages(count: number): HTMLElement[] {
  return Array.from({ length: count }, (_, i) => {
    const el = document.createElement('div')
    el.setAttribute('data-page', String(i + 1))
    return el
  })
}

function visiblePages(pages: HTMLElement[]): number[] {
  return pages
    .filter((el) => el.style.display !== 'none')
    .map((el) => Number(el.getAttribute('data-page')))
    .sort((a, b) => a - b)
}

function makeEngine(overrides: Partial<FlipEngineOptions> = {}) {
  const root = document.createElement('div')
  const pages = overrides.pages ?? makePages(6)
  const engine = new FlipEngine(root, {
    pages,
    pageWidth: 500,
    pageHeight: 700,
    flippingTime: 0,
    ...overrides,
  })
  return { root, pages, engine }
}

describe('FlipEngine', () => {
  it('lays out a two-page spread in landscape', () => {
    const { pages, engine } = makeEngine()
    expect(engine.getOrientation()).toBe('landscape')
    expect(engine.getCurrentPage()).toBe(1)
    expect(visiblePages(pages)).toEqual([1, 2])
    expect(pages[0]!.style.left).toBe('0px')
    expect(pages[1]!.style.left).toBe('50%')
  })

  it('shows a lone cover on the right half when showCover is set', () => {
    const { pages, engine } = makeEngine({ showCover: true })
    expect(visiblePages(pages)).toEqual([1])
    expect(engine.getCurrentSpread()).toEqual([1])
    expect(pages[0]!.style.left).toBe('50%')
    engine.flipNext()
    expect(engine.getCurrentSpread()).toEqual([2, 3])
  })

  it('shows one full-width page in single mode', () => {
    const { pages, engine } = makeEngine({ mode: 'single' })
    expect(engine.getOrientation()).toBe('portrait')
    expect(visiblePages(pages)).toEqual([1])
    expect(pages[0]!.style.width).toBe('100%')

    engine.flipNext()
    expect(engine.getCurrentPage()).toBe(2)
    expect(visiblePages(pages)).toEqual([2])
  })

  it('auto mode uses portrait on narrow containers (mobile)', () => {
    const { root, pages, engine } = makeEngine({ mode: 'auto' })
    Object.defineProperty(root, 'clientWidth', { configurable: true, value: 390 })
    engine.update()
    expect(engine.getOrientation()).toBe('portrait')
    expect(visiblePages(pages)).toEqual([1])
    expect(pages[0]!.style.width).toBe('100%')
  })

  it('auto mode uses landscape when the container fits two pages', () => {
    const { root, pages, engine } = makeEngine({ mode: 'auto', showCover: true })
    Object.defineProperty(root, 'clientWidth', { configurable: true, value: 900 })
    engine.update()
    expect(engine.getOrientation()).toBe('landscape')
    expect(visiblePages(pages)).toEqual([1])
    expect(pages[0]!.style.left).toBe('50%')
  })

  it('flips forward and backward through spreads', () => {
    const { pages, engine } = makeEngine()
    engine.flipNext()
    expect(engine.getCurrentPage()).toBe(3)
    expect(visiblePages(pages)).toEqual([3, 4])
    engine.flipPrev()
    expect(engine.getCurrentPage()).toBe(1)
    expect(visiblePages(pages)).toEqual([1, 2])
  })

  it('does not flip past the ends', () => {
    const { engine } = makeEngine()
    engine.flipPrev()
    expect(engine.getCurrentPage()).toBe(1)
    engine.flip(99)
    expect(engine.getCurrentPage()).toBe(5) // spread [5,6]
    engine.flipNext()
    expect(engine.getCurrentPage()).toBe(5)
  })

  it('shows a lone last page on the left half', () => {
    const { pages, engine } = makeEngine({ pages: makePages(5) })
    engine.flip(5)
    expect(visiblePages(pages)).toEqual([5])
    expect(pages[4]!.style.left).toBe('0px')
  })

  it('fires callbacks with 1-based pages', () => {
    const onFlip = vi.fn()
    const onFlipStart = vi.fn()
    const { engine } = makeEngine({ onFlip, onFlipStart })
    engine.flipNext()
    expect(onFlipStart).toHaveBeenCalledWith(1, 3)
    expect(onFlip).toHaveBeenCalledWith(3)
  })

  it('animates over time when flippingTime > 0, showing a leaf element', async () => {
    vi.useFakeTimers()
    const raf = vi
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((cb) => setTimeout(() => cb(performance.now()), 16) as unknown as number)
    try {
      const onFlip = vi.fn()
      const { root, engine } = makeEngine({ flippingTime: 100, onFlip })
      engine.flipNext()
      expect(root.querySelector('.vpf-leaf')).not.toBeNull()
      expect(onFlip).not.toHaveBeenCalled()

      await vi.advanceTimersByTimeAsync(300)
      expect(root.querySelector('.vpf-leaf')).toBeNull()
      expect(onFlip).toHaveBeenCalledWith(3)
      expect(engine.getCurrentPage()).toBe(3)
    } finally {
      raf.mockRestore()
      vi.useRealTimers()
    }
  })

  it('ignores navigation while a flip is in progress', async () => {
    vi.useFakeTimers()
    const raf = vi
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((cb) => setTimeout(() => cb(performance.now()), 16) as unknown as number)
    try {
      const { engine } = makeEngine({ flippingTime: 100 })
      engine.flipNext()
      engine.flipNext()
      await vi.advanceTimersByTimeAsync(300)
      expect(engine.getCurrentPage()).toBe(3)
    } finally {
      raf.mockRestore()
      vi.useRealTimers()
    }
  })

  it('shows a half-width book shadow and binding gradient while closed on the cover', () => {
    const { root } = makeEngine({ showCover: true })
    const shadow = root.querySelector<HTMLElement>('.vpf-book-shadow')!
    const coverSpine = root.querySelector<HTMLElement>('.vpf-cover-spine')!
    const spine = root.querySelector<HTMLElement>('.vpf-book-spine')!
    expect(shadow.style.left).toBe('50%')
    expect(shadow.style.width).toBe('50%')
    expect(shadow.style.opacity).toBe('1')
    expect(coverSpine.style.opacity).toBe('1')
    expect(spine.style.opacity).toBe('0')
  })

  it('shows a full-width shadow, center spine and page-bend overlays when open', () => {
    const { root, engine } = makeEngine({ showCover: true })
    engine.flipNext()
    const shadow = root.querySelector<HTMLElement>('.vpf-book-shadow')!
    expect(shadow.style.left).toBe('0%')
    expect(shadow.style.width).toBe('100%')
    expect(root.querySelector<HTMLElement>('.vpf-book-spine')!.style.opacity).toBe('1')
    expect(root.querySelector<HTMLElement>('.vpf-page-bend-left')!.style.opacity).toBe('1')
    expect(root.querySelector<HTMLElement>('.vpf-page-bend-right')!.style.opacity).toBe('1')
    expect(root.querySelector<HTMLElement>('.vpf-cover-spine')!.style.opacity).toBe('0')
  })

  it('moves the binding gradient to the back cover at the end of the book', () => {
    const { root, engine } = makeEngine({ pages: makePages(5) })
    engine.flip(5)
    const shadow = root.querySelector<HTMLElement>('.vpf-book-shadow')!
    const coverSpine = root.querySelector<HTMLElement>('.vpf-cover-spine')!
    expect(shadow.style.left).toBe('0%')
    expect(shadow.style.width).toBe('50%')
    expect(coverSpine.style.opacity).toBe('1')
    expect(coverSpine.style.left).toBe('0%')
  })

  it('hides spine and bend overlays in portrait, keeping the full shadow', () => {
    const { root } = makeEngine({ mode: 'single' })
    const shadow = root.querySelector<HTMLElement>('.vpf-book-shadow')!
    expect(shadow.style.left).toBe('0%')
    expect(shadow.style.width).toBe('100%')
    expect(root.querySelector<HTMLElement>('.vpf-book-spine')!.style.opacity).toBe('0')
    expect(root.querySelector<HTMLElement>('.vpf-page-bend-left')!.style.opacity).toBe('0')
    expect(root.querySelector<HTMLElement>('.vpf-cover-spine')!.style.opacity).toBe('0')
  })

  it('keeps the shadow on the cover half until the leaf actually covers the other half', async () => {
    vi.useFakeTimers()
    const raf = vi
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((cb) => setTimeout(() => cb(performance.now()), 16) as unknown as number)
    try {
      const { root, engine } = makeEngine({ showCover: true, flippingTime: 200 })
      const shadow = root.querySelector<HTMLElement>('.vpf-book-shadow')!
      engine.flipNext()
      // Early in the flip the leaf has not crossed the spine yet: the shadow
      // must still cover only the right (cover) half, not the full width.
      await vi.advanceTimersByTimeAsync(32)
      expect(shadow.style.left).toBe('50%')
      expect(shadow.style.width).toBe('50%')
      await vi.advanceTimersByTimeAsync(400)
      expect(shadow.style.left).toBe('0%')
      expect(shadow.style.width).toBe('100%')
    } finally {
      raf.mockRestore()
      vi.useRealTimers()
    }
  })

  it('keeps gutter shading on both faces of the moving leaf, removed when it lands', async () => {
    vi.useFakeTimers()
    const raf = vi
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((cb) => setTimeout(() => cb(performance.now()), 16) as unknown as number)
    try {
      const { root, engine } = makeEngine({ flippingTime: 100 })
      engine.flipNext()
      expect(root.querySelectorAll('.vpf-leaf-bend').length).toBe(2)
      await vi.advanceTimersByTimeAsync(300)
      expect(root.querySelectorAll('.vpf-leaf-bend').length).toBe(0)
    } finally {
      raf.mockRestore()
      vi.useRealTimers()
    }
  })

  it('renders no book chrome when drawShadow is false', () => {
    const { root } = makeEngine({ drawShadow: false })
    expect(root.querySelector('.vpf-book-shadow')).toBeNull()
    expect(root.querySelector('.vpf-book-spine')).toBeNull()
    expect(root.querySelector('.vpf-page-bend-left')).toBeNull()
  })

  it('destroy removes everything from the mount element', () => {
    const { root, engine } = makeEngine()
    expect(root.children.length).toBe(1)
    engine.destroy()
    expect(root.children.length).toBe(0)
  })
})
