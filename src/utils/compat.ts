import { isClient } from './env'

/**
 * pdf.js v5 builds target bleeding-edge engines and call proposal-stage
 * built-ins that slightly older (but otherwise modern) Chromium versions lack
 * — notably Electron webviews such as in-IDE browsers. Without these, every
 * page render throws `... getOrInsertComputed is not a function`. Install
 * spec-shaped fallbacks, only where missing, before pdf.js is imported.
 */

interface UpsertMethods {
  getOrInsertComputed?: (key: unknown, compute: (key: unknown) => unknown) => unknown
}

function installGetOrInsertComputed(proto: object): void {
  if (typeof (proto as UpsertMethods).getOrInsertComputed === 'function') return
  Object.defineProperty(proto, 'getOrInsertComputed', {
    value(this: Map<unknown, unknown>, key: unknown, compute: (key: unknown) => unknown) {
      if (this.has(key)) return this.get(key)
      const value = compute(key)
      this.set(key, value)
      return value
    },
    writable: true,
    configurable: true,
    enumerable: false,
  })
}

export function installPdfJsCompat(): void {
  if (!isClient()) return
  installGetOrInsertComputed(Map.prototype)
  installGetOrInsertComputed(WeakMap.prototype)
  const math = Math as Math & { sumPrecise?: (values: Iterable<number>) => number }
  if (typeof math.sumPrecise !== 'function') {
    Object.defineProperty(Math, 'sumPrecise', {
      // Plain summation: pdf.js only uses this for text-layer buffer offsets,
      // where full Neumaier precision is irrelevant.
      value: (values: Iterable<number>) => {
        let sum = 0
        for (const value of values) sum += value
        return sum
      },
      writable: true,
      configurable: true,
      enumerable: false,
    })
  }
}
