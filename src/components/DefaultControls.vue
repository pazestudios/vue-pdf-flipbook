<script setup lang="ts">
import { fullscreenSupported } from '../composables/useFullscreen'

defineProps<{
  currentPage: number
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
      {{ currentPage }} / {{ totalPages }}
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
