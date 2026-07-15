import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [vue()],
  resolve: {
    // Most specific alias first: with @rollup/plugin-alias semantics the bare
    // package alias would otherwise also rewrite the /style.css subpath.
    alias: [
      {
        find: 'vue-pdf-flipbook/style.css',
        replacement: fileURLToPath(new URL('../src/styles/flipbook.css', import.meta.url)),
      },
      {
        find: 'vue-pdf-flipbook',
        replacement: fileURLToPath(new URL('../src/index.ts', import.meta.url)),
      },
    ],
  },
})
