import { ref } from 'vue'
import { isClient } from '../utils/env'

/* Older Safari exposes the Fullscreen API only under webkit prefixes. */
interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null
  webkitFullscreenEnabled?: boolean
  webkitExitFullscreen?: () => Promise<void> | void
}

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void
}

export function fullscreenSupported(): boolean {
  if (!isClient()) return false
  const doc = document as FullscreenDocument
  return Boolean(doc.fullscreenEnabled ?? doc.webkitFullscreenEnabled)
}

export function useFullscreen(
  getElement: () => HTMLElement | null,
  onChange?: (isFullscreen: boolean) => void,
) {
  const isFullscreen = ref(false)

  function fullscreenElement(): Element | null {
    const doc = document as FullscreenDocument
    return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null
  }

  function handleChange(): void {
    const el = getElement()
    const active = el !== null && fullscreenElement() === el
    if (active !== isFullscreen.value) {
      isFullscreen.value = active
      onChange?.(active)
    }
  }

  function listen(): void {
    document.addEventListener('fullscreenchange', handleChange)
    document.addEventListener('webkitfullscreenchange', handleChange)
  }

  function unlisten(): void {
    document.removeEventListener('fullscreenchange', handleChange)
    document.removeEventListener('webkitfullscreenchange', handleChange)
  }

  async function enter(): Promise<void> {
    const el = getElement() as FullscreenElement | null
    if (!el || isFullscreen.value) return
    try {
      await (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.())
    } catch {
      // denied by the browser (permissions, no user gesture) — stay windowed
    }
  }

  async function exit(): Promise<void> {
    if (!fullscreenElement()) return
    const doc = document as FullscreenDocument
    try {
      await (doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.())
    } catch {
      // already exited
    }
  }

  async function toggle(): Promise<void> {
    if (isFullscreen.value) await exit()
    else await enter()
  }

  return { isFullscreen, enter, exit, toggle, listen, unlisten }
}
