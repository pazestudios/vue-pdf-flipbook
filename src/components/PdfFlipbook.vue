<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, readonly, ref, watch } from 'vue'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import type {
  ControlsSlotProps,
  PdfFlipbookEmits,
  PdfFlipbookProps,
  PageFlipInstance,
} from '../types'
import { usePdfDocument } from '../composables/usePdfDocument'
import { usePdfRenderer } from '../composables/usePdfRenderer'
import { usePageFlip } from '../composables/usePageFlip'
import { useFullscreen } from '../composables/useFullscreen'
import DefaultControls from './DefaultControls.vue'

const props = withDefaults(defineProps<PdfFlipbookProps>(), {
  width: 550,
  responsive: true,
  startPage: 1,
  mode: 'auto',
  showCover: true,
  renderScale: 1.5,
  renderRange: 2,
})

const emit = defineEmits<PdfFlipbookEmits>()

const rootRef = ref<HTMLElement | null>(null)
const bookRef = ref<HTMLElement | null>(null)
const ready = ref(false)
const currentPage = ref(1)
/** Page used for cover/back-cover centering; updates at flip-start so the shift runs with the flip. */
const shiftPage = ref(1)
const orientation = ref<'portrait' | 'landscape'>('landscape')
const pageDims = ref<{ width: number; height: number } | null>(null)

const fullscreen = useFullscreen(
  () => rootRef.value,
  (active) => {
    emit('fullscreen-changed', active)
    // The flip engine observes the container, but re-check layout on the next
    // frame in case the fullscreen resize lands after the observer settles.
    requestAnimationFrame(() => flip.getInstance()?.update())
  },
)
const isFullscreen = fullscreen.isFullscreen
/* The centering shift must not animate on first paint — only on flips. */
const animateShift = ref(false)

const { pdf, totalPages, loading, progress, error, load, teardown } = usePdfDocument()

const flip = usePageFlip({
  onFlip(page) {
    currentPage.value = page
    shiftPage.value = page
    renderer.updateWindow(page)
    emit('page-changed', { page, totalPages: totalPages.value })
  },
  onFlipStart(fromPage, toPage) {
    // Start the centering shift immediately so it runs in parallel with the flip.
    shiftPage.value = toPage
    emit('flip-start', { fromPage, toPage })
  },
  onOrientationChange(value) {
    orientation.value = value
    emit('orientation-changed', value)
  },
})

const renderer = usePdfRenderer({
  renderScale: () => props.renderScale,
  renderRange: () => props.renderRange,
  onRendered: (page) => emit('rendered', { page }),
  onError: (_page, err) => emit('error', err),
})

let setupEpoch = 0

async function setup(): Promise<void> {
  const my = ++setupEpoch
  ready.value = false
  animateShift.value = false
  renderer.reset()
  flip.destroy()

  const doc = await load(props.src, {
    workerSrc: props.workerSrc,
    pdfOptions: props.pdfOptions,
  })
  if (my !== setupEpoch) return
  if (!doc) {
    if (error.value) emit('error', error.value)
    return
  }

  const firstPage = await doc.getPage(1)
  if (my !== setupEpoch) return
  const viewport = firstPage.getViewport({ scale: 1 })
  const pageWidth = props.width
  const pageHeight = props.height ?? Math.round(pageWidth * (viewport.height / viewport.width))

  await nextTick()
  const bookEl = bookRef.value
  if (my !== setupEpoch || !bookEl) return

  const pages = await flip.init(bookEl, {
    pageCount: doc.numPages,
    pageWidth,
    pageHeight,
    startPage: props.startPage,
    mode: props.mode,
    showCover: props.showCover,
    responsive: props.responsive,
    minWidth: props.minWidth,
    maxWidth: props.maxWidth,
    minHeight: props.minHeight,
    maxHeight: props.maxHeight,
    flipOptions: props.flipOptions,
    pageClass: props.pageClass,
  })
  if (my !== setupEpoch) {
    flip.destroy()
    return
  }

  renderer.setDocument(doc)
  pages.forEach((page, i) => renderer.registerCanvas(i + 1, page.canvas))
  currentPage.value = Math.min(Math.max(props.startPage, 1), doc.numPages)
  shiftPage.value = currentPage.value
  pageDims.value = { width: pageWidth, height: pageHeight }
  orientation.value = flip.getInstance()?.getOrientation() ?? orientation.value
  renderer.updateWindow(currentPage.value)
  ready.value = true
  requestAnimationFrame(() => {
    if (my === setupEpoch) animateShift.value = true
  })
  emit('loaded', { totalPages: doc.numPages, pdf: doc })
}

function destroyAll(): void {
  setupEpoch++
  ready.value = false
  renderer.reset()
  flip.destroy()
  void teardown()
}

onMounted(() => {
  fullscreen.listen()
  void setup()
})
onBeforeUnmount(() => {
  fullscreen.unlisten()
  destroyAll()
})
watch(
  () => props.src,
  () => void setup(),
)

function next(): void {
  flip.next()
}
function prev(): void {
  flip.prev()
}
function goToPage(page: number): void {
  flip.goToPage(page)
}
async function reload(): Promise<void> {
  await setup()
}

/**
 * In landscape, the flip engine anchors a lone cover to the right half of the
 * book box and a lone back cover to the left half. Shifting the book by a
 * quarter of its width centers the visible page. Uses `shiftPage` (updated at
 * flip-start) so the translate runs in parallel with the page-turn animation.
 */
const singleShift = computed<string | null>(() => {
  if (!ready.value || orientation.value !== 'landscape') return null
  if (props.showCover && shiftPage.value <= 1) return '-25%'
  if (shiftPage.value >= totalPages.value) return '25%'
  return null
})

const shiftDurationMs = computed(() => Math.max(0, props.flipOptions?.flippingTime ?? 800))

const bookStyle = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {}
  if (animateShift.value && shiftDurationMs.value > 0) {
    style.transition = `transform ${shiftDurationMs.value}ms ease`
  }
  if (singleShift.value) style.transform = `translateX(${singleShift.value})`
  if (isFullscreen.value && pageDims.value) {
    // Cap the stretched book so its height fits the screen (with room for
    // controls), and keep it horizontally centered under that cap.
    const pagesAcross = orientation.value === 'landscape' ? 2 : 1
    const aspect = (pagesAcross * pageDims.value.width) / pageDims.value.height
    style.maxWidth = `min(100%, calc((100vh - 6rem) * ${aspect}))`
    style.marginLeft = 'auto'
    style.marginRight = 'auto'
  }
  return style
})

const containerStyle = computed<Record<string, string> | undefined>(() =>
  isFullscreen.value
    ? { display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'auto' }
    : undefined,
)

const controlsCtx = computed<ControlsSlotProps>(() => ({
  currentPage: currentPage.value,
  totalPages: totalPages.value,
  next,
  prev,
  goToPage,
  canGoNext: currentPage.value < totalPages.value,
  canGoPrev: currentPage.value > 1,
  isFullscreen: isFullscreen.value,
  toggleFullscreen: () => void fullscreen.toggle(),
}))

defineExpose({
  next,
  prev,
  goToPage,
  currentPage: readonly(currentPage),
  totalPages: readonly(totalPages),
  reload,
  isFullscreen: readonly(isFullscreen),
  enterFullscreen: fullscreen.enter,
  exitFullscreen: fullscreen.exit,
  toggleFullscreen: fullscreen.toggle,
  getPdfDocument: (): PDFDocumentProxy | null => pdf.value,
  getFlipInstance: (): PageFlipInstance | null => flip.getInstance(),
})
</script>

<template>
  <div
    ref="rootRef"
    class="vpf-container"
    :class="[containerClass, isFullscreen ? fullscreenClass : undefined]"
    :style="containerStyle"
    :data-fullscreen="isFullscreen ? '' : undefined"
    data-pdf-flipbook
  >
    <div v-if="error" class="vpf-error" :class="errorClass" data-pdf-flipbook-error>
      <slot name="error" :error="error" :retry="reload">
        <div>Failed to load PDF: {{ error.message }}</div>
        <button type="button" class="vpf-button" :class="buttonClass" @click="reload">
          Retry
        </button>
      </slot>
    </div>
    <div v-else-if="loading" class="vpf-loading" :class="loadingClass" data-pdf-flipbook-loading>
      <slot name="loading" :progress="progress">
        <div>Loading&hellip;</div>
      </slot>
    </div>
    <!-- Always rendered (v-show) so the flip engine's mount target exists during
         setup. The engine owns everything inside; Vue must never render children here. -->
    <div
      v-show="!error && !loading"
      ref="bookRef"
      class="vpf-book"
      :class="bookClass"
      :style="bookStyle"
      data-pdf-flipbook-book
    ></div>
    <slot v-if="ready" name="controls" v-bind="controlsCtx">
      <DefaultControls
        :current-page="controlsCtx.currentPage"
        :total-pages="controlsCtx.totalPages"
        :can-go-next="controlsCtx.canGoNext"
        :can-go-prev="controlsCtx.canGoPrev"
        :is-fullscreen="controlsCtx.isFullscreen"
        :controls-class="controlsClass"
        :button-class="buttonClass"
        :page-indicator-class="pageIndicatorClass"
        @next="next"
        @prev="prev"
        @toggle-fullscreen="controlsCtx.toggleFullscreen"
      />
    </slot>
  </div>
</template>
