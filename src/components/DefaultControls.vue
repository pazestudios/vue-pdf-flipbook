<script setup lang="ts">
import { computed } from 'vue'
import { fullscreenSupported } from '../composables/useFullscreen'

const props = defineProps<{
  currentPage: number
  /** Pages currently visible; when length is 2, the indicator shows a range. */
  visiblePages?: number[]
  totalPages: number
  canGoNext: boolean
  canGoPrev: boolean
  isFullscreen: boolean
  controlsClass?: string
  buttonClass?: string
  pageIndicatorClass?: string
}>()

defineEmits<{
  (e: 'next'): void
  (e: 'prev'): void
  (e: 'toggle-fullscreen'): void
}>()

const showFullscreen = fullscreenSupported()

const pageLabel = computed(() => {
  const pages = props.visiblePages?.length ? props.visiblePages : [props.currentPage]
  if (pages.length >= 2) return `${pages[0]}–${pages[pages.length - 1]}`
  return String(pages[0] ?? props.currentPage)
})
</script>

<template>
  <div class="vpf-controls" :class="controlsClass" data-pdf-flipbook-controls>
    <button
      type="button"
      class="vpf-button"
      :class="buttonClass"
      :disabled="!canGoPrev"
      aria-label="Previous page"
      data-pdf-flipbook-prev
      @click="$emit('prev')"
    >
      &lsaquo;
    </button>
    <span class="vpf-indicator" :class="pageIndicatorClass" data-pdf-flipbook-indicator>
      {{ pageLabel }} / {{ totalPages }}
    </span>
    <button
      type="button"
      class="vpf-button"
      :class="buttonClass"
      :disabled="!canGoNext"
      aria-label="Next page"
      data-pdf-flipbook-next
      @click="$emit('next')"
    >
      &rsaquo;
    </button>
    <button
      v-if="showFullscreen"
      type="button"
      class="vpf-button"
      :class="buttonClass"
      :aria-label="isFullscreen ? 'Exit full screen' : 'Enter full screen'"
      data-pdf-flipbook-fullscreen
      @click="$emit('toggle-fullscreen')"
    >
      {{ isFullscreen ? '⤡' : '⤢' }}
    </button>
  </div>
</template>
