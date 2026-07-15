import { createApp } from 'vue'
import VuePdfFlipbook from 'vue-pdf-flipbook'
import 'vue-pdf-flipbook/style.css'
// The recommended Vite recipe for the pdf.js worker:
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import App from './App.vue'

createApp(App).use(VuePdfFlipbook, { workerSrc: workerUrl }).mount('#app')
