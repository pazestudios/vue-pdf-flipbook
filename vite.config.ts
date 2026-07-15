import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: 'tsconfig.build.json',
      rollupTypes: true,
      cleanVueFileName: true,
    }),
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'vue-pdf-flipbook',
      cssFileName: 'vue-pdf-flipbook',
    },
    cssCodeSplit: false,
    rollupOptions: {
      // pdfjs-dist must stay external (including subpath worker imports) so the
      // consumer's bundler resolves and emits the pdf.js worker asset itself.
      external: ['vue', /^pdfjs-dist/],
      output: {
        globals: { vue: 'Vue' },
      },
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.spec.ts'],
    alias: {
      'pdfjs-dist': fileURLToPath(new URL('./tests/mocks/pdfjs-dist.ts', import.meta.url)),
    },
  },
})
