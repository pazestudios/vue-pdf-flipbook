import { describe, expect, it, vi } from 'vitest'
import {
  createPageElements,
  usePageFlip,
  type PageFlipInit,
} from '../src/composables/usePageFlip'

function baseInit(overrides: Partial<PageFlipInit> = {}): PageFlipInit {
  return {
    pageCount: 6,
    pageWidth: 500,
    pageHeight: 700,
    startPage: 1,
    mode: 'auto',
    showCover: true,
    responsive: true,
    // Instant flips so navigation is synchronous in tests.
    flipOptions: { flippingTime: 0 },
    ...overrides,
  }
}

describe('createPageElements', () => {
  it('creates one element with a canvas per page, with stable data attributes', () => {
    const pages = createPageElements(baseInit())
    expect(pages).toHaveLength(6)
    expect(pages[2]!.root.getAttribute('data-pdf-flipbook-page')).toBe('3')
    expect(pages[2]!.root.contains(pages[2]!.canvas)).toBe(true)
    expect(pages[2]!.canvas!.hasAttribute('data-pdf-flipbook-canvas')).toBe(true)
  })

  it('marks first and last pages as hard covers when showCover is set', () => {
    const pages = createPageElements(baseInit({ showCover: true }))
    expect(pages[0]!.root.dataset.density).toBe('hard')
    expect(pages[5]!.root.dataset.density).toBe('hard')
    expect(pages[1]!.root.dataset.density).toBe('soft')

    const noCover = createPageElements(baseInit({ showCover: false }))
    expect(noCover[0]!.root.dataset.density).toBe('soft')
  })

  it('appends a canvas-less hard blank page when trailingBlank is set', () => {
    const pages = createPageElements(baseInit({ pageCount: 6, trailingBlank: true }))
    const blank = pages[5]!
    expect(blank.canvas).toBeNull()
    expect(blank.root.className).toBe('vpf-page vpf-page-blank')
    expect(blank.root.hasAttribute('data-pdf-flipbook-blank')).toBe(true)
    expect(blank.root.hasAttribute('data-pdf-flipbook-page')).toBe(false)
    // The blank acts as the book's back cover.
    expect(blank.root.dataset.density).toBe('hard')
    expect(pages[4]!.canvas).not.toBeNull()
    expect(pages[4]!.root.dataset.density).toBe('soft')
  })

  it('applies the consumer pageClass', () => {
    const pages = createPageElements(baseInit({ pageClass: 'rounded shadow' }))
    expect(pages[0]!.root.className).toBe('vpf-page rounded shadow')
  })
})

describe('usePageFlip', () => {
  function callbacks() {
    return {
      onFlip: vi.fn(),
      onFlipStart: vi.fn(),
      onOrientationChange: vi.fn(),
    }
  }

  it('mounts all page elements into the book and forwards events (1-based pages)', async () => {
    const cbs = callbacks()
    const flip = usePageFlip(cbs)
    const el = document.createElement('div')
    const pages = await flip.init(el, baseInit())

    expect(pages).toHaveLength(6)
    expect(el.querySelectorAll('[data-pdf-flipbook-page]')).toHaveLength(6)
    expect(el.contains(pages[0]!.root)).toBe(true)

    flip.next()
    expect(cbs.onFlipStart).toHaveBeenCalledWith(1, 2)
    // showCover spreads: [1], [2,3], [4,5], [6] — next lands on page 2.
    expect(cbs.onFlip).toHaveBeenCalledWith(2)
  })

  it('navigates via next/prev/goToPage with clamping', async () => {
    const cbs = callbacks()
    const flip = usePageFlip(cbs)
    await flip.init(document.createElement('div'), baseInit())
    const instance = flip.getInstance()!

    flip.next()
    expect(instance.getCurrentPage()).toBe(2)
    flip.prev()
    expect(instance.getCurrentPage()).toBe(1)
    flip.goToPage(4)
    expect(instance.getCurrentPage()).toBe(4)
    flip.goToPage(99)
    expect(instance.getCurrentPage()).toBe(6)
    flip.goToPage(-1)
    expect(instance.getCurrentPage()).toBe(1)
  })

  it('destroy tears down the instance and empties the mount element', async () => {
    const flip = usePageFlip(callbacks())
    const el = document.createElement('div')
    await flip.init(el, baseInit())
    expect(el.children.length).toBeGreaterThan(0)

    flip.destroy()
    expect(el.children.length).toBe(0)
    expect(flip.getInstance()).toBeNull()
  })

  it('re-init replaces the previous instance and its DOM', async () => {
    const flip = usePageFlip(callbacks())
    const first = document.createElement('div')
    await flip.init(first, baseInit())
    const firstInstance = flip.getInstance()

    const second = document.createElement('div')
    await flip.init(second, baseInit())
    expect(first.children.length).toBe(0)
    expect(second.children.length).toBeGreaterThan(0)
    expect(flip.getInstance()).not.toBe(firstInstance)
  })
})
