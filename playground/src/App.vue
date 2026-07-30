<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import type { PdfFlipbookExpose } from 'vue-pdf-flipbook'

const src = ref('/sample.pdf')
const book = useTemplateRef<PdfFlipbookExpose>('book')
const mode = ref<'auto' | 'single' | 'spread'>('auto')
/** '' leaves the page aspect to auto-detection. */
const isVertical = ref<'' | 'true' | 'false'>('')
const useCustomControls = ref(true)
const lastEvent = ref('—')

// mode and isVertical are read while the book is built, so changing either
// has to remount the component; src is reactive on its own.
const bookKey = computed(() => `${src.value}|${mode.value}|${isVertical.value}`)
const isVerticalProp = computed(() =>
  isVertical.value === '' ? undefined : isVertical.value === 'true',
)

function log(name: string, payload?: unknown) {
  lastEvent.value = `${name} ${payload ? JSON.stringify(payload) : ''}`
  console.log('[playground]', name, payload)
}
</script>

<template>
  <div class="mx-auto max-w-4xl p-6 space-y-4">
    <h1 class="text-2xl font-bold text-slate-800">vue-pdf-flipbook playground</h1>

    <div class="flex flex-wrap items-center gap-3 text-sm">
      <label class="flex items-center gap-1">
        PDF:
        <select v-model="src" class="rounded border border-slate-300 px-2 py-1">
          <option value="/sample.pdf">portrait (14pp paper)</option>
          <option value="/sample-wide.pdf">landscape (8pp brochure)</option>
        </select>
      </label>
      <label class="flex items-center gap-1">
        Mode:
        <select v-model="mode" class="rounded border border-slate-300 px-2 py-1">
          <option value="auto">auto</option>
          <option value="single">single</option>
          <option value="spread">spread</option>
        </select>
      </label>
      <label class="flex items-center gap-1">
        isVertical:
        <select v-model="isVertical" class="rounded border border-slate-300 px-2 py-1">
          <option value="">detect</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      </label>
      <label class="flex items-center gap-1">
        <input v-model="useCustomControls" type="checkbox" /> Custom Tailwind controls slot
      </label>
      <button
        class="rounded bg-slate-700 px-3 py-1 text-white hover:bg-slate-600"
        @click="book?.goToPage(5)"
      >
        goToPage(5)
      </button>
      <span class="text-slate-500">last event: {{ lastEvent }}</span>
    </div>

    <PdfFlipbook
      ref="book"
      :key="bookKey"
      :src="src"
      :mode="mode"
      :is-vertical="isVerticalProp"
      controls-position="top"
      container-class="rounded-xl bg-white p-6 shadow-lg"
      fullscreen-class="!bg-slate-900 !rounded-none"
      button-class="rounded-md bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-500 disabled:opacity-40"
      page-indicator-class="font-mono text-sm text-slate-600"
      @loaded="log('loaded', { totalPages: $event.totalPages })"
      @page-changed="log('page-changed', $event)"
      @flip-start="log('flip-start', $event)"
      @orientation-changed="log('orientation-changed', $event)"
      @error="log('error', $event.message)"
    >
      <template
        v-if="useCustomControls"
        #controls="{ visiblePages, totalPages, next, prev, canGoNext, canGoPrev, isFullscreen, toggleFullscreen }"
      >
        <div class="mt-4 flex items-center justify-center gap-4">
          <button
            class="rounded-full bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-500 disabled:opacity-30"
            :disabled="!canGoPrev"
            @click="prev"
          >
            ← Prev
          </button>
          <span class="rounded bg-slate-200 px-3 py-1 font-mono text-sm">
            {{ visiblePages.length > 1 ? `${visiblePages[0]}–${visiblePages[1]}` : visiblePages[0] }}
            / {{ totalPages }}
          </span>
          <button
            class="rounded-full bg-emerald-600 px-4 py-2 text-white shadow hover:bg-emerald-500 disabled:opacity-30"
            :disabled="!canGoNext"
            @click="next"
          >
            Next →
          </button>
          <button
            class="rounded-full bg-slate-700 px-4 py-2 text-white shadow hover:bg-slate-600"
            @click="toggleFullscreen"
          >
            {{ isFullscreen ? 'Exit fullscreen' : 'Fullscreen' }}
          </button>
        </div>
      </template>
      <template #loading="{ progress }">
        <div class="p-10 text-center text-slate-500">
          Loading PDF… {{ Math.round(progress * 100) }}%
        </div>
      </template>
    </PdfFlipbook>
  </div>
</template>
