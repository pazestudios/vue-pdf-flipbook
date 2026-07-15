import type { App, Plugin } from 'vue'
import PdfFlipbook from './components/PdfFlipbook.vue'
import { setGlobalWorkerSrc } from './utils/worker'
import type { PluginOptions } from './types'
import './styles/flipbook.css'

export { PdfFlipbook }
export * from './types'
export { setGlobalWorkerSrc }

const VuePdfFlipbook: Plugin<[PluginOptions?]> = {
  install(app: App, options?: PluginOptions) {
    if (options?.workerSrc) setGlobalWorkerSrc(options.workerSrc)
    app.component('PdfFlipbook', PdfFlipbook)
  },
}

export default VuePdfFlipbook
