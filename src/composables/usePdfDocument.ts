import { ref, shallowRef } from 'vue'
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist'
import type { PdfSource } from '../types'
import { isClient } from '../utils/env'
import { installPdfJsCompat } from '../utils/compat'
import { applyCdnWorker, configureWorker } from '../utils/worker'

interface LoadOptions {
  workerSrc?: string
  pdfOptions?: Record<string, unknown>
}

function normalizeSrc(src: PdfSource): Record<string, unknown> {
  if (typeof src === 'string' || src instanceof URL) return { url: src.toString() }
  // Copy: pdf.js transfers the buffer to the worker, which would detach the
  // caller's original.
  if (src instanceof ArrayBuffer) return { data: new Uint8Array(src.slice(0)) }
  return { data: src.slice() }
}

function looksLikeWorkerFailure(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return /worker/i.test(msg) || /import/i.test(msg)
}

export function usePdfDocument() {
  const pdf = shallowRef<PDFDocumentProxy | null>(null)
  const totalPages = ref(0)
  const loading = ref(false)
  const progress = ref(0)
  const error = shallowRef<Error | null>(null)

  let epoch = 0
  let loadingTask: PDFDocumentLoadingTask | null = null

  async function teardown(): Promise<void> {
    epoch++
    const task = loadingTask
    const doc = pdf.value
    loadingTask = null
    pdf.value = null
    totalPages.value = 0
    try {
      // loadingTask.destroy() also destroys the document it produced
      if (task) await task.destroy()
      else if (doc) await doc.destroy()
    } catch {
      // already destroyed / never started — nothing to release
    }
  }

  async function load(src: PdfSource, options: LoadOptions = {}): Promise<PDFDocumentProxy | null> {
    if (!isClient()) return null
    loading.value = true
    error.value = null
    progress.value = 0
    await teardown()
    const myEpoch = epoch

    try {
      installPdfJsCompat()
      const pdfjs = await import('pdfjs-dist')
      const workerIsExplicit = await configureWorker(pdfjs, options.workerSrc)
      if (myEpoch !== epoch) return null

      const params = { ...normalizeSrc(src), ...options.pdfOptions }
      const start = () => {
        const task = pdfjs.getDocument(params as Parameters<typeof pdfjs.getDocument>[0])
        task.onProgress = (data: { loaded: number; total: number }) => {
          if (myEpoch === epoch && data.total > 0) {
            progress.value = Math.min(1, data.loaded / data.total)
          }
        }
        loadingTask = task
        return task.promise
      }

      let doc: PDFDocumentProxy
      try {
        doc = await start()
      } catch (err) {
        // A bundler-resolved worker URL can 404 at runtime; retry once from
        // the version-pinned CDN unless the consumer chose the URL themselves.
        if (workerIsExplicit || !looksLikeWorkerFailure(err)) throw err
        applyCdnWorker(pdfjs)
        // ArrayBuffer data was transferred (and detached) by the failed
        // attempt, so rebuild the params from the original source.
        Object.assign(params, normalizeSrc(src))
        doc = await start()
      }

      if (myEpoch !== epoch) {
        doc.destroy().catch(() => {})
        return null
      }
      pdf.value = doc
      totalPages.value = doc.numPages
      return doc
    } catch (err) {
      if (myEpoch === epoch) {
        error.value = err instanceof Error ? err : new Error(String(err))
      }
      return null
    } finally {
      if (myEpoch === epoch) loading.value = false
    }
  }

  return { pdf, totalPages, loading, progress, error, load, teardown }
}
