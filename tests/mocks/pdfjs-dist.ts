/**
 * Alias-mock for `pdfjs-dist` (see vite.config.ts `test.alias`).
 * happy-dom has no real canvas and pdf.js needs DOMMatrix/Path2D, so the
 * real library cannot run in the test environment.
 */

export const GlobalWorkerOptions = { workerSrc: '' }
export const version = '0.0.0-mock'

interface MockState {
  numPages: number
  failNext: Error | null
  pageAspect: number
  renderDelayMs: number
  /** Pages whose render() call always throws synchronously. */
  failRenderPages: number[]
}

const state: MockState = {
  numPages: 10,
  failNext: null,
  pageAspect: 4 / 3,
  renderDelayMs: 0,
  failRenderPages: [],
}

export const __renderCalls: number[] = []
export const __cancelledRenders: number[] = []
export const __destroyedDocs: MockPdfDocument[] = []

export function __reset(options: Partial<MockState> = {}): void {
  state.numPages = options.numPages ?? 10
  state.failNext = options.failNext ?? null
  state.pageAspect = options.pageAspect ?? 4 / 3
  state.renderDelayMs = options.renderDelayMs ?? 0
  state.failRenderPages = options.failRenderPages ?? []
  __renderCalls.length = 0
  __cancelledRenders.length = 0
  __destroyedDocs.length = 0
  GlobalWorkerOptions.workerSrc = ''
}

class MockRenderTask {
  promise: Promise<void>
  private rejectFn!: (err: Error) => void
  private settled = false

  constructor(private pageNumber: number) {
    this.promise = new Promise<void>((resolve, reject) => {
      this.rejectFn = reject
      setTimeout(() => {
        if (!this.settled) {
          this.settled = true
          resolve()
        }
      }, state.renderDelayMs)
    })
  }

  cancel(): void {
    if (this.settled) return
    this.settled = true
    __cancelledRenders.push(this.pageNumber)
    const err = new Error('Rendering cancelled')
    err.name = 'RenderingCancelledException'
    this.rejectFn(err)
  }
}

class MockPdfPage {
  constructor(private pageNumber: number) {}

  getViewport({ scale }: { scale: number }) {
    return { width: 600 * scale, height: 600 * state.pageAspect * scale, scale }
  }

  render(_params: { canvas: HTMLCanvasElement; viewport: unknown }) {
    __renderCalls.push(this.pageNumber)
    if (state.failRenderPages.includes(this.pageNumber)) {
      throw new Error(`render failed for page ${this.pageNumber}`)
    }
    return new MockRenderTask(this.pageNumber)
  }
}

export class MockPdfDocument {
  numPages = state.numPages
  destroyed = false

  getPage(n: number): Promise<MockPdfPage> {
    return Promise.resolve(new MockPdfPage(n))
  }

  destroy(): Promise<void> {
    this.destroyed = true
    __destroyedDocs.push(this)
    return Promise.resolve()
  }
}

export function getDocument(_params: Record<string, unknown>) {
  const doc = new MockPdfDocument()
  let task: {
    onProgress?: (data: { loaded: number; total: number }) => void
    promise: Promise<MockPdfDocument>
    destroy: () => Promise<void>
  }
  const promise = new Promise<MockPdfDocument>((resolve, reject) => {
    setTimeout(() => {
      task.onProgress?.({ loaded: 100, total: 100 })
      if (state.failNext) {
        const err = state.failNext
        state.failNext = null
        reject(err)
      } else {
        resolve(doc)
      }
    }, 0)
  })
  task = {
    promise,
    destroy: () => doc.destroy(),
  }
  return task
}
