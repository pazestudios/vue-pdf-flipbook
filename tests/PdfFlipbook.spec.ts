import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PdfFlipbook from '../src/components/PdfFlipbook.vue'
import { __destroyedDocs, __reset } from './mocks/pdfjs-dist'

function mountBook(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  return mount(PdfFlipbook, {
    props: {
      src: '/test.pdf',
      workerSrc: 'mock://pdf.worker.mjs',
      // Instant flips so page navigation settles synchronously in tests.
      flipOptions: { flippingTime: 0 },
      ...props,
    },
    ...options,
  })
}

async function whenReady(wrapper: ReturnType<typeof mountBook>) {
  await vi.waitFor(() => {
    expect(wrapper.find('[data-pdf-flipbook-controls]').exists()).toBe(true)
  })
}

describe('PdfFlipbook', () => {
  beforeEach(() => {
    __reset({ numPages: 8 })
  })

  it('shows the loading state, then the book with default controls', async () => {
    const wrapper = mountBook()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-pdf-flipbook-loading]').exists()).toBe(true)

    await whenReady(wrapper)
    expect(wrapper.find('[data-pdf-flipbook-loading]').exists()).toBe(false)
    expect(wrapper.find('[data-pdf-flipbook-indicator]').text()).toBe('1 / 8')
    expect(wrapper.emitted('loaded')![0]![0]).toMatchObject({ totalPages: 8 })
    expect(wrapper.findAll('[data-pdf-flipbook-page]')).toHaveLength(8)
    expect(wrapper.find('[data-pdf-flipbook-stage]').exists()).toBe(true)
  })

  it('applies class props to the container and default controls', async () => {
    const wrapper = mountBook({
      containerClass: 'rounded-xl shadow',
      buttonClass: 'bg-indigo-600',
      pageIndicatorClass: 'font-mono',
    })
    await whenReady(wrapper)
    expect(wrapper.classes()).toContain('rounded-xl')
    expect(wrapper.find('[data-pdf-flipbook-prev]').classes()).toContain('bg-indigo-600')
    expect(wrapper.find('[data-pdf-flipbook-indicator]').classes()).toContain('font-mono')
  })

  it('places controls above the book when controlsPosition is top', async () => {
    const wrapper = mountBook({ controlsPosition: 'top' })
    await whenReady(wrapper)
    expect(wrapper.attributes('data-controls-position')).toBe('top')
    const controls = wrapper.find('[data-pdf-flipbook-controls]').element
    const shell = wrapper.find('[data-pdf-flipbook-shell]').element
    expect(
      Boolean(controls.compareDocumentPosition(shell) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true)
  })

  it('places controls below the book by default', async () => {
    const wrapper = mountBook()
    await whenReady(wrapper)
    expect(wrapper.attributes('data-controls-position')).toBe('bottom')
    const controls = wrapper.find('[data-pdf-flipbook-controls]').element
    const shell = wrapper.find('[data-pdf-flipbook-shell]').element
    expect(
      Boolean(shell.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true)
  })

  it('renders a custom controls slot with working slot props', async () => {
    const wrapper = mountBook(
      {},
      {
        slots: {
          controls: `
            <template #controls="{ currentPage, totalPages, next, canGoPrev }">
              <div class="my-controls">
                <span id="state">{{ currentPage }}:{{ totalPages }}:{{ canGoPrev }}</span>
                <button id="go-next" @click="next">n</button>
              </div>
            </template>
          `,
        },
      },
    )
    await vi.waitFor(() => expect(wrapper.find('.my-controls').exists()).toBe(true))
    expect(wrapper.find('#state').text()).toBe('1:8:false')

    await wrapper.find('#go-next').trigger('click')
    // Default cover spreads: [1] [2,3] [4,5] ... — next lands on page 2.
    await vi.waitFor(() => expect(wrapper.find('#state').text()).toBe('2:8:true'))
    expect(wrapper.emitted('page-changed')).toBeTruthy()
  })

  it('emits page-changed and flip-start when navigating', async () => {
    const wrapper = mountBook()
    await whenReady(wrapper)
    const vm = wrapper.vm as unknown as { goToPage: (p: number) => void }
    // Default cover spreads: [1] [2,3] [4,5] [6,7] [8] — page 5 lives on spread [4,5].
    vm.goToPage(5)
    await vi.waitFor(() =>
      expect(wrapper.emitted('page-changed')!.at(-1)![0]).toEqual({ page: 4, totalPages: 8 }),
    )
    expect(wrapper.emitted('flip-start')!.at(-1)![0]).toEqual({ fromPage: 1, toPage: 4 })
    expect(wrapper.find('[data-pdf-flipbook-indicator]').text()).toBe('4–5 / 8')
  })

  it('shows both pages of a landscape spread in the indicator', async () => {
    const wrapper = mountBook()
    await whenReady(wrapper)
    expect(wrapper.find('[data-pdf-flipbook-indicator]').text()).toBe('1 / 8')
    ;(wrapper.vm as unknown as { next: () => void }).next()
    await vi.waitFor(() =>
      expect(wrapper.find('[data-pdf-flipbook-indicator]').text()).toBe('2–3 / 8'),
    )
  })

  it('shows a single page in the indicator when mode is single', async () => {
    const wrapper = mountBook({ mode: 'single' })
    await whenReady(wrapper)
    ;(wrapper.vm as unknown as { goToPage: (p: number) => void }).goToPage(2)
    await vi.waitFor(() =>
      expect(wrapper.find('[data-pdf-flipbook-indicator]').text()).toBe('2 / 8'),
    )
  })

  it('exposes navigation methods and state via template ref', async () => {
    const wrapper = mountBook()
    await whenReady(wrapper)
    const vm = wrapper.vm as unknown as {
      goToPage: (p: number) => void
      currentPage: number
      totalPages: number
      getFlipInstance: () => { getCurrentPage: () => number } | null
    }
    expect(vm.totalPages).toBe(8)
    // Page 3 lives on the [2,3] spread, so the current page lands on 2.
    vm.goToPage(3)
    await vi.waitFor(() => expect(vm.currentPage).toBe(2))
    expect(vm.getFlipInstance()?.getCurrentPage()).toBe(2)
  })

  it('shows the error slot and emits error when loading fails', async () => {
    __reset({ failNext: new Error('boom') })
    const wrapper = mountBook(
      {},
      {
        slots: {
          error: `
            <template #error="{ error, retry }">
              <div id="err">{{ error.message }}</div>
              <button id="retry" @click="retry">retry</button>
            </template>
          `,
        },
      },
    )
    await vi.waitFor(() => expect(wrapper.find('#err').exists()).toBe(true))
    expect(wrapper.find('#err').text()).toBe('boom')
    expect((wrapper.emitted('error')![0]![0] as Error).message).toBe('boom')

    // failNext is consumed by the first attempt, so retry succeeds
    await wrapper.find('#retry').trigger('click')
    await whenReady(wrapper)
  })

  it('tears down and rebuilds when src changes', async () => {
    const wrapper = mountBook()
    await whenReady(wrapper)
    expect(wrapper.emitted('loaded')).toHaveLength(1)

    await wrapper.setProps({ src: '/other.pdf' })
    await vi.waitFor(() => expect(wrapper.emitted('loaded')).toHaveLength(2))
    await whenReady(wrapper)
    expect(wrapper.findAll('[data-pdf-flipbook-stage]')).toHaveLength(1)
    expect(wrapper.findAll('[data-pdf-flipbook-page]')).toHaveLength(8)
    expect(__destroyedDocs.length).toBeGreaterThanOrEqual(1)
  })

  describe('single-page centering (landscape)', () => {
    function bookTransform(wrapper: ReturnType<typeof mountBook>) {
      return (wrapper.find('[data-pdf-flipbook-shell]').element as HTMLElement).style.transform
    }

    it('opens on a lone centered first page by default', async () => {
      const wrapper = mountBook()
      await whenReady(wrapper)
      expect(bookTransform(wrapper)).toBe('translateX(-25%)')
    })

    it('opens on a full spread with no shift when showCover is false', async () => {
      const wrapper = mountBook({ showCover: false })
      await whenReady(wrapper)
      expect(bookTransform(wrapper)).toBe('')
    })

    it('un-shifts when flipping from the cover to an inner spread', async () => {
      const wrapper = mountBook()
      await whenReady(wrapper)
      ;(wrapper.vm as unknown as { goToPage: (p: number) => void }).goToPage(3)
      await vi.waitFor(() => expect(bookTransform(wrapper)).toBe(''))
    })

    it('centers a lone last page by shifting the book right', async () => {
      const wrapper = mountBook()
      await whenReady(wrapper)
      // Spreads: [1] [2,3] [4,5] [6,7] [8] — page 8 is shown alone.
      ;(wrapper.vm as unknown as { goToPage: (p: number) => void }).goToPage(8)
      await vi.waitFor(() => expect(bookTransform(wrapper)).toBe('translateX(25%)'))
    })

    it('centers a lone last page even without a cover', async () => {
      __reset({ numPages: 7 })
      const wrapper = mountBook({ showCover: false })
      await whenReady(wrapper)
      // Spreads: [1,2] [3,4] [5,6] [7] — page 7 is shown alone.
      ;(wrapper.vm as unknown as { goToPage: (p: number) => void }).goToPage(7)
      await vi.waitFor(() => expect(bookTransform(wrapper)).toBe('translateX(25%)'))
    })
  })

  describe('blank back cover for odd page counts', () => {
    it('pads the book with a blank page but keeps public numbering to the PDF', async () => {
      __reset({ numPages: 7 })
      const wrapper = mountBook()
      await whenReady(wrapper)
      // Spreads: [1] [2,3] [4,5] [6,7] [blank].
      expect(wrapper.findAll('[data-pdf-flipbook-page]')).toHaveLength(7)
      expect(wrapper.find('[data-pdf-flipbook-blank]').exists()).toBe(true)

      const vm = wrapper.vm as unknown as { goToPage: (p: number) => void; next: () => void }
      vm.goToPage(7)
      await vi.waitFor(() =>
        expect(wrapper.find('[data-pdf-flipbook-indicator]').text()).toBe('6–7 / 7'),
      )

      vm.next()
      // The blank has no PDF page: the indicator and events report the last
      // real page, and the lone back cover is centered by the 25% shift.
      await vi.waitFor(() =>
        expect(wrapper.find('[data-pdf-flipbook-indicator]').text()).toBe('7 / 7'),
      )
      expect(wrapper.emitted('page-changed')!.at(-1)![0]).toEqual({ page: 7, totalPages: 7 })
      expect(wrapper.emitted('flip-start')!.at(-1)![0]).toEqual({ fromPage: 6, toPage: 7 })
      const shell = wrapper.find('[data-pdf-flipbook-shell]').element as HTMLElement
      expect(shell.style.transform).toBe('translateX(25%)')
      expect(wrapper.find('[data-pdf-flipbook-next]').attributes('disabled')).toBeDefined()
    })

    it('does not pad even books or books without a cover', async () => {
      const even = mountBook()
      await whenReady(even)
      expect(even.find('[data-pdf-flipbook-blank]').exists()).toBe(false)

      __reset({ numPages: 7 })
      const noCover = mountBook({ showCover: false })
      await whenReady(noCover)
      expect(noCover.find('[data-pdf-flipbook-blank]').exists()).toBe(false)
    })
  })

  describe('fullscreen', () => {
    afterEach(() => {
      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
        configurable: true,
      })
    })

    function setFullscreenElement(el: Element | null) {
      Object.defineProperty(document, 'fullscreenElement', { value: el, configurable: true })
      document.dispatchEvent(new Event('fullscreenchange'))
    }

    it('requests fullscreen on the container and tracks state', async () => {
      const wrapper = mountBook({ fullscreenClass: 'bg-black' })
      await whenReady(wrapper)
      const root = wrapper.element as HTMLElement & { requestFullscreen: () => Promise<void> }
      root.requestFullscreen = vi.fn().mockResolvedValue(undefined)

      const vm = wrapper.vm as unknown as {
        enterFullscreen: () => Promise<void>
        isFullscreen: boolean
      }
      await vm.enterFullscreen()
      expect(root.requestFullscreen).toHaveBeenCalled()

      setFullscreenElement(root)
      await vi.waitFor(() => expect(vm.isFullscreen).toBe(true))
      expect(wrapper.emitted('fullscreen-changed')![0]).toEqual([true])
      expect(wrapper.classes()).toContain('bg-black')
      expect(wrapper.attributes('data-fullscreen')).toBeDefined()

      setFullscreenElement(null)
      await vi.waitFor(() => expect(vm.isFullscreen).toBe(false))
      expect(wrapper.emitted('fullscreen-changed')![1]).toEqual([false])
      expect(wrapper.classes()).not.toContain('bg-black')
    })

    it('passes isFullscreen and toggleFullscreen to the controls slot', async () => {
      const wrapper = mountBook(
        {},
        {
          slots: {
            controls: `
              <template #controls="{ isFullscreen, toggleFullscreen }">
                <button id="fs" @click="toggleFullscreen">{{ isFullscreen }}</button>
              </template>
            `,
          },
        },
      )
      await vi.waitFor(() => expect(wrapper.find('#fs').exists()).toBe(true))
      expect(wrapper.find('#fs').text()).toBe('false')

      const root = wrapper.element as HTMLElement & { requestFullscreen: () => Promise<void> }
      root.requestFullscreen = vi.fn().mockResolvedValue(undefined)
      await wrapper.find('#fs').trigger('click')
      expect(root.requestFullscreen).toHaveBeenCalled()
    })

    it('shows a first-page fullscreen hint that enters fullscreen', async () => {
      Object.defineProperty(document, 'fullscreenEnabled', {
        value: true,
        configurable: true,
      })
      const wrapper = mountBook({ buttonClass: 'hint-btn' })
      await whenReady(wrapper)

      const hint = wrapper.find('[data-pdf-flipbook-fullscreen-hint-button]')
      expect(hint.exists()).toBe(true)
      expect(hint.text()).toBe('View in fullscreen')
      expect(hint.classes()).toContain('hint-btn')

      const root = wrapper.element as HTMLElement & { requestFullscreen: () => Promise<void> }
      root.requestFullscreen = vi.fn().mockResolvedValue(undefined)
      await hint.trigger('click')
      expect(root.requestFullscreen).toHaveBeenCalled()

      setFullscreenElement(root)
      await vi.waitFor(() =>
        expect(wrapper.find('[data-pdf-flipbook-fullscreen-hint-button]').exists()).toBe(false),
      )

      setFullscreenElement(null)
      await vi.waitFor(() =>
        expect(wrapper.find('[data-pdf-flipbook-fullscreen-hint-button]').exists()).toBe(true),
      )

      ;(wrapper.vm as unknown as { goToPage: (p: number) => void }).goToPage(2)
      await vi.waitFor(() =>
        expect(wrapper.find('[data-pdf-flipbook-fullscreen-hint-button]').exists()).toBe(false),
      )
    })

    it('hides the hint on the blank back cover of a 1-page book', async () => {
      Object.defineProperty(document, 'fullscreenEnabled', {
        value: true,
        configurable: true,
      })
      __reset({ numPages: 1 })
      const wrapper = mountBook()
      await whenReady(wrapper)
      // Spreads: [1] [blank]. Public numbering clamps the blank spread back to
      // page 1, but the hint must not reappear there.
      expect(wrapper.find('[data-pdf-flipbook-fullscreen-hint-button]').exists()).toBe(true)

      ;(wrapper.vm as unknown as { next: () => void }).next()
      await vi.waitFor(() =>
        expect(wrapper.find('[data-pdf-flipbook-fullscreen-hint-button]').exists()).toBe(false),
      )
      expect(wrapper.find('[data-pdf-flipbook-indicator]').text()).toBe('1 / 1')

      ;(wrapper.vm as unknown as { prev: () => void }).prev()
      await vi.waitFor(() =>
        expect(wrapper.find('[data-pdf-flipbook-fullscreen-hint-button]').exists()).toBe(true),
      )
    })
  })

  it('cleans up on unmount', async () => {
    const wrapper = mountBook()
    await whenReady(wrapper)
    const bookEl = wrapper.find('[data-pdf-flipbook-book]').element
    wrapper.unmount()
    expect(bookEl.children.length).toBe(0)
    await vi.waitFor(() => expect(__destroyedDocs.length).toBeGreaterThanOrEqual(1))
  })
})
