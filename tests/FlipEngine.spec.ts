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
    const { pages } = makeEngine({ showCover: true })
    expect(visiblePages(pages)).toEqual([1])
    expect(pages[0]!.style.left).toBe('50%')
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

  it('destroy removes everything from the mount element', () => {
    const { root, engine } = makeEngine()
    expect(root.children.length).toBe(1)
    engine.destroy()
    expect(root.children.length).toBe(0)
  })
})
