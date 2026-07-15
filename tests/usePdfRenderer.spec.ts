import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { usePdfRenderer } from '../src/composables/usePdfRenderer'
import { MockPdfDocument, __cancelledRenders, __renderCalls, __reset } from './mocks/pdfjs-dist'

function makeRenderer(overrides: { renderRange?: number; onRendered?: (p: number) => void } = {}) {
  const renderedPages: number[] = []
  const renderer = usePdfRenderer({
    renderScale: () => 1,
    renderRange: () => overrides.renderRange ?? 2,
    onRendered: (p) => {
      renderedPages.push(p)
      overrides.onRendered?.(p)
    },
  })
  return { renderer, renderedPages }
}

function setup(numPages: number, renderRange?: number) {
  __reset({ numPages })
  const { renderer, renderedPages } = makeRenderer({ renderRange })
  const doc = new MockPdfDocument() as unknown as PDFDocumentProxy
  renderer.setDocument(doc)
  const canvases = new Map<number, HTMLCanvasElement>()
  for (let p = 1; p <= numPages; p++) {
    const canvas = document.createElement('canvas')
    canvases.set(p, canvas)
    renderer.registerCanvas(p, canvas)
  }
  return { renderer, renderedPages, canvases }
}

describe('usePdfRenderer', () => {
  beforeEach(() => __reset())

  it('renders pages nearest to the current page first, favoring the page ahead', async () => {
    const { renderer, renderedPages } = setup(20, 1) // keep radius = 3
    renderer.updateWindow(5)
    await vi.waitFor(() => expect(renderedPages.length).toBe(7))
    expect(__renderCalls).toEqual([5, 6, 4, 7, 3, 8, 2])
  })

  it('only renders pages within the window', async () => {
    const { renderer, renderedPages } = setup(50, 2) // keep radius = 5
    renderer.updateWindow(1)
    await vi.waitFor(() => expect(renderedPages.length).toBe(6))
    expect(Math.max(...renderedPages)).toBe(6)
    expect(renderer.isRendered(7)).toBe(false)
  })

  it('evicts far-away pages and re-renders them on approach', async () => {
    const { renderer, renderedPages, canvases } = setup(40, 1) // keep 3, evict beyond 6
    renderer.updateWindow(1)
    await vi.waitFor(() => expect(renderer.isRendered(1)).toBe(true))
    await vi.waitFor(() => expect(renderer.isRendered(4)).toBe(true))
    expect(canvases.get(1)!.width).toBeGreaterThan(0)

    renderer.updateWindow(20)
    await vi.waitFor(() => expect(renderer.isRendered(20)).toBe(true))
    expect(renderer.isRendered(1)).toBe(false)
    expect(canvases.get(1)!.width).toBe(0)

    renderer.updateWindow(2)
    await vi.waitFor(() => expect(renderer.isRendered(1)).toBe(true))
    expect(canvases.get(1)!.width).toBeGreaterThan(0)
    void renderedPages
  })

  it('cancels an in-flight render when the window moves away', async () => {
    __reset({ numPages: 40, renderDelayMs: 30 })
    const { renderer } = makeRenderer({ renderRange: 1 })
    renderer.setDocument(new MockPdfDocument() as unknown as PDFDocumentProxy)
    for (let p = 1; p <= 40; p++) renderer.registerCanvas(p, document.createElement('canvas'))

    renderer.updateWindow(1)
    await vi.waitFor(() => expect(__renderCalls).toContain(1))
    renderer.updateWindow(30)
    // whichever old-window page was in flight must have been cancelled
    await vi.waitFor(() => expect(__cancelledRenders.length).toBeGreaterThan(0))
    expect(__cancelledRenders[0]).toBeLessThan(5)
    await vi.waitFor(() => expect(renderer.isRendered(30)).toBe(true))
    expect(renderer.isRendered(1)).toBe(false)
  })

  it('does not endlessly retry a page whose render keeps failing', async () => {
    // A persistent sync render failure (e.g. canvas blocked in embedded
    // browsers) must not turn the render pump into an infinite loop.
    __reset({ numPages: 4, failRenderPages: [2] })
    const errors: number[] = []
    const renderedPages: number[] = []
    const renderer = usePdfRenderer({
      renderScale: () => 1,
      renderRange: () => 2,
      onRendered: (p) => renderedPages.push(p),
      onError: (p) => errors.push(p),
    })
    renderer.setDocument(new MockPdfDocument() as unknown as PDFDocumentProxy)
    for (let p = 1; p <= 4; p++) renderer.registerCanvas(p, document.createElement('canvas'))

    renderer.updateWindow(1)
    await vi.waitFor(() => expect(renderedPages.sort()).toEqual([1, 3, 4]))
    expect(errors).toEqual([2])
    expect(__renderCalls.filter((p) => p === 2)).toHaveLength(1)
    expect(renderer.isRendered(2)).toBe(false)

    // Moving the window around must not resurrect the failing page.
    renderer.updateWindow(3)
    await vi.waitFor(() => expect(renderer.isRendered(4)).toBe(true))
    expect(__renderCalls.filter((p) => p === 2)).toHaveLength(1)
  })

  it('reset stops rendering and clears state', async () => {
    const { renderer } = setup(10)
    renderer.updateWindow(1)
    await vi.waitFor(() => expect(renderer.isRendered(1)).toBe(true))
    renderer.reset()
    expect(renderer.isRendered(1)).toBe(false)
  })
})
