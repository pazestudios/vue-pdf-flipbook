var Ge = Object.defineProperty;
var He = (i, e, t) => e in i ? Ge(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var I = (i, e, t) => He(i, typeof e != "symbol" ? e + "" : e, t);
import { shallowRef as Ce, ref as R, computed as V, defineComponent as Oe, openBlock as te, createElementBlock as ne, normalizeClass as T, createElementVNode as N, toDisplayString as ue, unref as H, createCommentVNode as oe, onMounted as Ne, onBeforeUnmount as Te, watch as Ze, readonly as le, normalizeStyle as ae, renderSlot as ce, normalizeProps as Pe, mergeProps as ke, createVNode as Se, withDirectives as je, withModifiers as Ve, vShow as Ue, nextTick as qe } from "vue";
function de() {
  return typeof window < "u" && typeof document < "u";
}
function xe(i) {
  typeof i.getOrInsertComputed != "function" && Object.defineProperty(i, "getOrInsertComputed", {
    value(e, t) {
      if (this.has(e)) return this.get(e);
      const n = t(e);
      return this.set(e, n), n;
    },
    writable: !0,
    configurable: !0,
    enumerable: !1
  });
}
function Ke() {
  if (!de()) return;
  xe(Map.prototype), xe(WeakMap.prototype), typeof Math.sumPrecise != "function" && Object.defineProperty(Math, "sumPrecise", {
    // Plain summation: pdf.js only uses this for text-layer buffer offsets,
    // where full Neumaier precision is irrelevant.
    value: (e) => {
      let t = 0;
      for (const n of e) t += n;
      return t;
    },
    writable: !0,
    configurable: !0,
    enumerable: !1
  });
}
let Ie, Ee = !1;
function Je(i) {
  Ie = i;
}
function Qe(i) {
  return `https://cdn.jsdelivr.net/npm/pdfjs-dist@${i.version}/build/pdf.worker.min.mjs`;
}
function Re(i) {
  i.GlobalWorkerOptions.workerSrc = Qe(i), Ee || (Ee = !0, console.warn(
    '[vue-pdf-flipbook] Falling back to loading the pdf.js worker from jsdelivr. For offline or CSP-restricted environments, pass a `workerSrc` prop or plugin option (e.g. in Vite: `import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"`).'
  ));
}
async function _e(i) {
  try {
    const e = await fetch(i, { method: "HEAD" });
    return e.ok ? (e.headers.get("content-type") ?? "").includes("javascript") : !1;
  } catch {
    return !1;
  }
}
async function et(i, e) {
  if (!de()) return !0;
  const t = e ?? Ie;
  if (t)
    return i.GlobalWorkerOptions.workerSrc = t, !0;
  if (i.GlobalWorkerOptions.workerSrc) return !0;
  const n = "pdfjs-dist/build/pdf.worker.min.mjs";
  try {
    const s = new URL(n, import.meta.url).toString();
    if (s.startsWith("http") && await _e(s))
      return i.GlobalWorkerOptions.workerSrc = s, !1;
  } catch {
  }
  return Re(i), !1;
}
function Fe(i) {
  return typeof i == "string" || i instanceof URL ? { url: i.toString() } : i instanceof ArrayBuffer ? { data: new Uint8Array(i.slice(0)) } : { data: i.slice() };
}
function tt(i) {
  const e = i instanceof Error ? i.message : String(i);
  return /worker/i.test(e) || /import/i.test(e);
}
function nt() {
  const i = Ce(null), e = R(0), t = R(!1), n = R(0), s = Ce(null);
  let r = 0, a = null;
  async function c() {
    r++;
    const u = a, l = i.value;
    a = null, i.value = null, e.value = 0;
    try {
      u ? await u.destroy() : l && await l.destroy();
    } catch {
    }
  }
  async function h(u, l = {}) {
    if (!de()) return null;
    t.value = !0, s.value = null, n.value = 0, await c();
    const v = r;
    try {
      Ke();
      const m = await import("pdfjs-dist"), P = await et(m, l.workerSrc);
      if (v !== r) return null;
      const E = { ...Fe(u), ...l.pdfOptions }, F = () => {
        const g = m.getDocument(E);
        return g.onProgress = (C) => {
          v === r && C.total > 0 && (n.value = Math.min(1, C.loaded / C.total));
        }, a = g, g.promise;
      };
      let p;
      try {
        p = await F();
      } catch (g) {
        if (P || !tt(g)) throw g;
        Re(m), Object.assign(E, Fe(u)), p = await F();
      }
      return v !== r ? (p.destroy().catch(() => {
      }), null) : (i.value = p, e.value = p.numPages, p);
    } catch (m) {
      return v === r && (s.value = m instanceof Error ? m : new Error(String(m))), null;
    } finally {
      v === r && (t.value = !1);
    }
  }
  return { pdf: i, totalPages: e, loading: t, progress: n, error: s, load: h, teardown: c };
}
function st(i) {
  return i instanceof Error && i.name === "RenderingCancelledException";
}
function it(i) {
  let e = null;
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
  let r = 1, a = null, c = !1;
  function h() {
    return Math.min(typeof window < "u" && window.devicePixelRatio || 1, 2);
  }
  function u() {
    const f = i.renderRange();
    return f === 1 / 0 ? 1 / 0 : Math.max(2, f * 2 + 1);
  }
  function l() {
    if (!e) return [];
    const f = e.numPages, M = u(), W = [];
    for (let w = 1; w <= f; w++)
      Math.abs(w - r) <= M && !n.has(w) && !s.has(w) && t.has(w) && W.push(w);
    return W.sort((w, S) => {
      const L = Math.abs(w - r), b = Math.abs(S - r);
      return L === b ? S - w : L - b;
    }), W;
  }
  function v() {
    const f = u();
    if (f !== 1 / 0) {
      for (const M of n)
        if (Math.abs(M - r) > f * 2) {
          const W = t.get(M);
          W && (W.width = 0, W.height = 0), n.delete(M);
        }
    }
  }
  async function m(f) {
    var S, L;
    if (!e) return;
    const M = t.get(f);
    if (!M) return;
    const W = e, w = { page: f, task: null, cancelled: !1 };
    a = w;
    try {
      const b = await W.getPage(f);
      if (w.cancelled || e !== W) return;
      const x = b.getViewport({ scale: i.renderScale() * h() });
      if (M.width = Math.floor(x.width), M.height = Math.floor(x.height), w.task = b.render({ canvas: M, viewport: x }), await w.task.promise, w.cancelled || e !== W) return;
      n.add(f), (S = i.onRendered) == null || S.call(i, f);
    } catch (b) {
      !st(b) && !w.cancelled && (s.add(f), (L = i.onError) == null || L.call(i, f, b instanceof Error ? b : new Error(String(b))));
    } finally {
      a === w && (a = null);
    }
  }
  function P() {
    return new Promise((f) => {
      typeof requestIdleCallback == "function" ? requestIdleCallback(() => f()) : setTimeout(f, 16);
    });
  }
  async function E() {
    if (!c) {
      c = !0;
      try {
        const f = i.renderRange() === 1 / 0;
        let M;
        for (; e && (M = l()[0]) !== void 0; )
          f && await P(), await m(M);
      } finally {
        c = !1;
      }
    }
  }
  function F() {
    var f;
    a && Math.abs(a.page - r) > u() && (a.cancelled = !0, (f = a.task) == null || f.cancel());
  }
  function p(f) {
    O(), e = f, n.clear(), s.clear();
  }
  function g(f, M) {
    t.set(f, M);
  }
  function C(f) {
    r = f, F(), v(), E();
  }
  function O() {
    var f;
    a && (a.cancelled = !0, (f = a.task) == null || f.cancel(), a = null);
  }
  function z() {
    O(), e = null, t.clear(), n.clear(), s.clear(), r = 1;
  }
  return {
    setDocument: p,
    registerCanvas: g,
    updateWindow: C,
    cancelAll: O,
    reset: z,
    isRendered: (f) => n.has(f)
  };
}
function q(i) {
  return `${+(i * 100).toFixed(2)}%`;
}
function at(i) {
  return i < 0.5 ? 2 * i * i : 1 - (-2 * i + 2) ** 2 / 2;
}
function Me() {
  return typeof performance < "u" ? performance.now() : Date.now();
}
class se {
  constructor(e, t) {
    I(this, "root");
    I(this, "stage");
    I(this, "pages");
    I(this, "opts");
    I(this, "orientation");
    I(this, "fillMode", !1);
    I(this, "chrome", null);
    I(this, "spreads", []);
    I(this, "spreadIndex", 0);
    I(this, "anim", null);
    I(this, "destroyed", !1);
    I(this, "resizeObserver", null);
    I(this, "usesWindowResize", !1);
    I(this, "pointerStart", null);
    I(this, "suppressClick", !1);
    /* ------------------------------------------------------------ interaction */
    I(this, "handleResize", () => {
      var n, s;
      if (this.destroyed) return;
      const e = this.detectOrientation();
      if (e === this.orientation) return;
      this.anim && this.finishFlip(this.anim);
      const t = this.getCurrentPage();
      this.orientation = e, this.applyStageSize(), this.spreads = this.computeSpreads(), this.spreadIndex = this.spreadIndexForPage(this.clampPage(t)), this.layout(), (s = (n = this.opts).onOrientationChange) == null || s.call(n, e);
    });
    I(this, "handlePointerDown", (e) => {
      if (!e.isPrimary) {
        this.pointerStart = null;
        return;
      }
      this.suppressClick = !1, this.pointerStart = { x: e.clientX, y: e.clientY };
    });
    I(this, "handlePointerUp", (e) => {
      if (!e.isPrimary) return;
      const t = this.pointerStart;
      if (this.pointerStart = null, !t) return;
      const n = e.clientX - t.x, s = e.clientY - t.y, r = this.opts.swipeDistance ?? 30;
      Math.abs(n) >= r && Math.abs(n) > Math.abs(s) && (this.suppressClick = !0, n < 0 ? this.flipNext() : this.flipPrev());
    });
    I(this, "handleClick", (e) => {
      if (this.suppressClick) {
        this.suppressClick = !1;
        return;
      }
      if (this.opts.disableFlipByClick) return;
      const t = this.stage.getBoundingClientRect();
      if (!t.width) return;
      (e.clientX - t.left) / t.width < 0.5 ? this.flipPrev() : this.flipNext();
    });
    this.root = e, this.opts = t, this.pages = t.pages, this.stage = document.createElement("div"), this.stage.className = "vpf-stage", this.stage.setAttribute("data-pdf-flipbook-stage", "");
    const n = this.stage.style;
    n.position = "relative", n.touchAction = "pan-y";
    for (const r of this.pages)
      r.style.display = "none", this.stage.appendChild(r);
    e.appendChild(this.stage), t.drawShadow !== !1 && (this.chrome = this.buildChrome()), this.orientation = this.detectOrientation(), this.applyStageSize(), this.spreads = this.computeSpreads();
    const s = this.clampPage(t.startPage ?? 1);
    this.spreadIndex = this.spreadIndexForPage(s), this.layout(), t.useMouseEvents !== !1 && (this.stage.addEventListener("pointerdown", this.handlePointerDown), this.stage.addEventListener("pointerup", this.handlePointerUp), this.stage.addEventListener("click", this.handleClick)), typeof ResizeObserver < "u" ? (this.resizeObserver = new ResizeObserver(this.handleResize), this.resizeObserver.observe(e)) : typeof window < "u" && (this.usesWindowResize = !0, window.addEventListener("resize", this.handleResize));
  }
  /* ------------------------------------------------------------- public API */
  flipNext() {
    this.flipToSpread(this.spreadIndex + 1);
  }
  flipPrev() {
    this.flipToSpread(this.spreadIndex - 1);
  }
  /** Flip to the spread containing `page` (1-based, clamped). */
  flip(e) {
    this.flipToSpread(this.spreadIndexForPage(this.clampPage(e)));
  }
  getPageCount() {
    return this.pages.length;
  }
  /** First page of the current spread, 1-based. */
  getCurrentPage() {
    var e;
    return ((e = this.spreads[this.spreadIndex]) == null ? void 0 : e[0]) ?? 1;
  }
  /** Pages currently visible in the spread, 1-based (one or two). */
  getCurrentSpread() {
    return [...this.spreads[this.spreadIndex] ?? [1]];
  }
  getOrientation() {
    return this.orientation;
  }
  /**
   * Grow the book to whatever the container offers, ignoring the configured
   * size caps. Fullscreen turns this on: `maxWidth`/`maxHeight` (and a fixed
   * `responsive: false` width) describe how big the book may get *inside the
   * page*, and applying them on a screen many times larger would strand it at
   * its inline size — the one thing fullscreen exists to undo. The caller
   * still bounds the stage by the height fullscreen actually leaves.
   */
  setFillMode(e) {
    this.destroyed || this.fillMode === e || (this.fillMode = e, this.applyStageSize());
  }
  /** Re-measure the container and re-apply layout. */
  update() {
    this.handleResize(), this.applyStageSize(), this.anim || this.layout();
  }
  destroy() {
    var e;
    this.destroyed || (this.destroyed = !0, this.anim && (cancelAnimationFrame(this.anim.raf), this.anim = null), (e = this.resizeObserver) == null || e.disconnect(), this.resizeObserver = null, this.usesWindowResize && window.removeEventListener("resize", this.handleResize), this.stage.removeEventListener("pointerdown", this.handlePointerDown), this.stage.removeEventListener("pointerup", this.handlePointerUp), this.stage.removeEventListener("click", this.handleClick), this.stage.remove());
  }
  /* ------------------------------------------------------- spreads & layout */
  /** Pages the current orientation can show: portrait skips a trailing blank. */
  effectivePageCount() {
    const e = this.pages.length;
    return this.opts.trailingBlank && this.orientation === "portrait" ? e - 1 : e;
  }
  clampPage(e) {
    return Math.min(Math.max(e, 1), Math.max(this.effectivePageCount(), 1));
  }
  detectOrientation() {
    if (this.opts.mode === "single") return "portrait";
    if (this.opts.mode === "spread") return "landscape";
    const e = this.root.clientWidth || this.root.getBoundingClientRect().width;
    if (!e) return "landscape";
    const t = this.opts.minWidth ?? this.opts.pageWidth / 2;
    return e >= t * 2 ? "landscape" : "portrait";
  }
  computeSpreads() {
    const e = this.effectivePageCount(), t = [];
    if (this.orientation === "portrait") {
      for (let s = 1; s <= e; s++) t.push([s]);
      return t;
    }
    let n = 1;
    for (this.opts.showCover && e > 0 && (t.push([1]), n = 2); n <= e; n += 2)
      t.push(n + 1 <= e ? [n, n + 1] : [n]);
    return t;
  }
  spreadIndexForPage(e) {
    const t = this.spreads.findIndex((n) => n.includes(e));
    return t === -1 ? 0 : t;
  }
  /** Which half a lone page occupies in landscape: cover right, back cover left. */
  loneSlot(e) {
    return e === 0 && this.opts.showCover ? "right" : "left";
  }
  slotPages(e) {
    const t = this.spreads[e];
    return !t || t.length === 0 ? {} : t.length === 2 ? { left: t[0], right: t[1] } : this.loneSlot(e) === "left" ? { left: t[0] } : { right: t[0] };
  }
  pageEl(e) {
    return this.pages[e - 1];
  }
  showAt(e, t) {
    const n = this.pageEl(e);
    if (!n) return;
    const s = n.style;
    s.display = "block", s.position = "absolute", s.top = "0", s.height = "100%", t === "full" ? (s.left = "0", s.width = "100%") : (s.width = "50%", s.left = t === "left" ? "0" : "50%");
  }
  hideAll() {
    for (const e of this.pages) e.style.display = "none";
  }
  layout() {
    var n;
    if (this.hideAll(), this.orientation === "portrait") {
      const s = (n = this.spreads[this.spreadIndex]) == null ? void 0 : n[0];
      s && this.showAt(s, "full"), this.updateChrome(this.spreadIndex);
      return;
    }
    const { left: e, right: t } = this.slotPages(this.spreadIndex);
    e && this.showAt(e, "left"), t && this.showAt(t, "right"), this.updateChrome(this.spreadIndex);
  }
  /* ------------------------------------------------------------ book chrome */
  buildChrome() {
    const e = (c) => {
      const h = document.createElement("div");
      h.className = c;
      const u = h.style;
      return u.position = "absolute", u.top = "0", u.height = "100%", u.pointerEvents = "none", u.opacity = "0", h;
    }, t = e("vpf-book-shadow");
    t.style.boxShadow = [
      "0 0 4px rgba(0, 0, 0, 0.12)",
      "0 4px 10px rgba(0, 0, 0, 0.16)",
      "0 14px 28px rgba(0, 0, 0, 0.2)",
      "0 28px 56px rgba(0, 0, 0, 0.16)"
    ].join(", ");
    const n = e("vpf-book-spine");
    n.style.left = "47%", n.style.width = "6%", n.style.background = "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.14) 35%, rgba(0,0,0,0.28) 50%, rgba(0,0,0,0.14) 65%, rgba(0,0,0,0) 100%)";
    const s = e("vpf-page-bend vpf-page-bend-left");
    s.style.left = "0", s.style.width = "50%";
    const r = e("vpf-page-bend vpf-page-bend-right");
    r.style.left = "50%", r.style.width = "50%";
    const a = e("vpf-cover-spine");
    a.style.width = "50%";
    for (const c of [n, s, r, a]) c.style.zIndex = "3";
    return this.stage.insertBefore(t, this.stage.firstChild), this.stage.append(n, s, r, a), { shadow: t, spine: n, bendLeft: s, bendRight: r, coverSpine: a };
  }
  /**
   * Shading that makes a page look like it bends down into the gutter:
   * a shadow that deepens toward the spine, then a faint highlight where the
   * paper crests back up. `k` scales the whole effect (0..1).
   */
  static bendGradient(e, t) {
    const n = (r) => (r * t).toFixed(3);
    return `linear-gradient(${e === "left" ? "to left" : "to right"}, rgba(0,0,0,${n(0.22)}) 0%, rgba(0,0,0,${n(0.06)}) 5%, rgba(255,255,255,${n(0.1)}) 8%, rgba(255,255,255,0) 16%)`;
  }
  /** Binding-edge shading for a closed book: dark crease, highlight, falloff. */
  static closedSpineGradient(e) {
    return `linear-gradient(${e}, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.1) 0.8%, rgba(255,255,255,0.1) 1.8%, rgba(0,0,0,0.05) 2.8%, rgba(0,0,0,0) 5%)`;
  }
  /** Bend gradient for one side of an open spread at `spreadIndex`. */
  bendFor(e, t) {
    const n = this.spreads.length, s = n > 1 ? e / (n - 1) : 0.5;
    return t === "left" ? se.bendGradient("left", 1 - 0.65 * s) : se.bendGradient("right", 0.35 + 0.65 * s);
  }
  /**
   * The gutter-side shading the page in `slot` shows once `spreadIndex` is at
   * rest: the page-bend gradient on an open spread, the binding crease on a
   * lone cover/back cover, or '' for an empty slot.
   */
  gutterShadingFor(e, t) {
    const { left: n, right: s } = this.slotPages(e);
    return n && s ? this.bendFor(e, t) : (t === "right" ? s : n) ? se.closedSpineGradient(t === "right" ? "to right" : "to left") : "";
  }
  /** Resolve what the chrome should look like once `spreadIndex` is at rest. */
  chromeStateFor(e) {
    const t = {
      shadowLeft: 0,
      shadowWidth: 1,
      shadowOpacity: 1,
      spineOpacity: 0,
      bendOpacity: 0,
      bendLeftBg: "",
      bendRightBg: "",
      coverSpineOpacity: 0,
      coverSpineLeft: 0,
      coverSpineBg: ""
    };
    if (this.orientation === "portrait") return t;
    const { left: n, right: s } = this.slotPages(e);
    if (n && s)
      return t.spineOpacity = 1, t.bendOpacity = 1, t.bendLeftBg = this.bendFor(e, "left"), t.bendRightBg = this.bendFor(e, "right"), t;
    if (n || s) {
      const r = !!s;
      return t.shadowLeft = r ? 0.5 : 0, t.shadowWidth = 0.5, t.coverSpineOpacity = 1, t.coverSpineLeft = r ? 0.5 : 0, t.coverSpineBg = se.closedSpineGradient(r ? "to right" : "to left"), t;
    }
    return t.shadowOpacity = 0, t;
  }
  applyChromeState(e) {
    const t = this.chrome;
    if (!t) return;
    const n = t.shadow.style;
    n.left = q(e.shadowLeft), n.width = q(e.shadowWidth), n.opacity = String(e.shadowOpacity), t.spine.style.opacity = String(e.spineOpacity), t.bendLeft.style.opacity = String(e.bendOpacity), t.bendRight.style.opacity = String(e.bendOpacity), t.bendLeft.style.background = e.bendLeftBg, t.bendRight.style.background = e.bendRightBg;
    const s = t.coverSpine.style;
    s.opacity = String(e.coverSpineOpacity), s.left = q(e.coverSpineLeft), s.background = e.coverSpineBg;
  }
  /** Repaint the book chrome instantly for a spread at rest. */
  updateChrome(e) {
    this.chrome && this.applyChromeState(this.chromeStateFor(e));
  }
  /**
   * Per-frame chrome update during a landscape flip. The shadow footprint is
   * re-derived from what actually covers the stage right now — the static
   * pages plus the leaf's horizontal projection (cos of its angle) — so the
   * shadow never appears under a half the page hasn't reached yet. Overlays
   * fade out over the first half of the turn (while the leaf uncovers the old
   * state) and fade in over the second half (as it covers the new one).
   */
  stepChrome(e, t, n, s, r, a) {
    const c = this.chrome;
    if (!c) return;
    const h = Math.cos(Math.PI * a), u = 0.5 * Math.max(h, 0), l = 0.5 * Math.max(-h, 0), v = s ? 0.5 : n === 1 ? l : u, m = r ? 0.5 : n === 1 ? u : l, P = c.shadow.style;
    P.left = q(0.5 - v), P.width = q(v + m), P.opacity = String(e.shadowOpacity + (t.shadowOpacity - e.shadowOpacity) * a);
    const E = Math.max(0, 2 * a - 1), F = Math.max(0, 1 - 2 * a), p = (z, f) => String(f > z ? z + (f - z) * E : f + (z - f) * F), g = a >= 0.5;
    c.spine.style.opacity = p(e.spineOpacity, t.spineOpacity);
    const C = p(e.bendOpacity, t.bendOpacity);
    c.bendLeft.style.opacity = C, c.bendRight.style.opacity = C, c.bendLeft.style.background = g ? t.bendLeftBg : e.bendLeftBg, c.bendRight.style.background = g ? t.bendRightBg : e.bendRightBg;
    const O = c.coverSpine.style;
    O.opacity = p(e.coverSpineOpacity, t.coverSpineOpacity), O.left = q(g ? t.coverSpineLeft : e.coverSpineLeft), O.background = g ? t.coverSpineBg : e.coverSpineBg;
  }
  /**
   * Per-frame chrome update during a portrait (single-page) flip. The leaf is
   * a full-width card turning about its own centre, so its footprint narrows
   * with the cosine of the angle and vanishes edge-on. The drop shadow follows
   * it instead of staying full width under a page that is no longer there, and
   * fades as it narrows so the collapsing box-shadow blur doesn't pile up into
   * a dark bar at the halfway point.
   */
  stepPortraitChrome(e) {
    const t = this.chrome;
    if (!t) return;
    const n = Math.abs(Math.cos(Math.PI * e)), s = t.shadow.style;
    s.left = q((1 - n) / 2), s.width = q(n), s.opacity = String(0.2 + 0.8 * n);
  }
  applyStageSize() {
    const { pageWidth: e, pageHeight: t } = this.opts, n = this.orientation === "landscape" ? 2 : 1, s = n * e / t, r = this.stage.style;
    if (r.aspectRatio = String(s), r.perspective = `${Math.round(e * 5)}px`, r.marginLeft = "auto", r.marginRight = "auto", this.fillMode) {
      r.width = "100%", r.maxWidth = "", r.minWidth = "";
      return;
    }
    if (this.opts.responsive === !1) {
      r.width = `${n * e}px`, r.maxWidth = "", r.minWidth = "";
      return;
    }
    r.width = "100%";
    const a = Math.min(
      (this.opts.maxWidth ?? e * 2) * n,
      (this.opts.maxHeight ?? t * 2) * s
    );
    r.maxWidth = `${Math.round(a)}px`;
    const c = Math.max((this.opts.minWidth ?? 0) * n, (this.opts.minHeight ?? 0) * s);
    r.minWidth = c > 0 ? `${Math.round(c)}px` : "";
  }
  /* --------------------------------------------------------------- flipping */
  flipToSpread(e) {
    var C, O, z, f, M, W, w;
    if (this.destroyed || this.anim || e < 0 || e >= this.spreads.length || e === this.spreadIndex) return;
    const t = e > this.spreadIndex ? 1 : -1, n = ((C = this.spreads[e]) == null ? void 0 : C[0]) ?? this.getCurrentPage();
    (z = (O = this.opts).onFlipStart) == null || z.call(O, this.getCurrentPage(), n);
    let s, r;
    const a = [];
    if (this.orientation === "portrait")
      s = (f = this.spreads[this.spreadIndex]) == null ? void 0 : f[0], r = (M = this.spreads[e]) == null ? void 0 : M[0];
    else {
      const S = this.slotPages(this.spreadIndex), L = this.slotPages(e);
      t === 1 ? (s = S.right, r = L.left, a.push({ page: S.left, slot: "left" }, { page: L.right, slot: "right" })) : (s = S.left, r = L.right, a.push({ page: S.right, slot: "right" }, { page: L.left, slot: "left" }));
    }
    const c = s ? this.pageEl(s) : void 0, h = r ? this.pageEl(r) : void 0;
    if (!c || !h) {
      this.spreadIndex = e, this.layout(), (w = (W = this.opts).onFlip) == null || w.call(W, this.getCurrentPage());
      return;
    }
    this.hideAll();
    for (const { page: S, slot: L } of a)
      S && this.showAt(S, L);
    let u = null;
    if (this.chrome)
      if (this.orientation === "portrait")
        u = (S) => this.stepPortraitChrome(S);
      else {
        const S = a.some((B) => B.page !== void 0 && B.slot === "left"), L = a.some((B) => B.page !== void 0 && B.slot === "right"), b = this.chromeStateFor(this.spreadIndex), x = this.chromeStateFor(e);
        u = (B) => this.stepChrome(b, x, t, S, L, B);
      }
    const { leaf: l, shadows: v } = this.buildLeaf(t, c, h, e);
    this.stage.appendChild(l);
    const m = Math.max(0, this.opts.flippingTime ?? 800), P = t === 1 ? -180 : 180, E = this.opts.maxShadowOpacity ?? 0.4, F = Me(), p = {
      leaf: l,
      movedPages: [c, h],
      shadows: v,
      chrome: u,
      targetSpread: e,
      endAngle: P,
      raf: 0
    };
    this.anim = p;
    const g = () => {
      var x;
      if (this.destroyed || this.anim !== p) return;
      const S = m === 0 ? 1 : Math.min(1, (Me() - F) / m), L = at(S);
      l.style.transform = `rotateY(${P * L}deg)`, (x = p.chrome) == null || x.call(p, L);
      const b = Math.sin(Math.PI * L) * E;
      for (const B of p.shadows) B.style.opacity = String(b);
      S < 1 ? p.raf = requestAnimationFrame(g) : this.finishFlip(p);
    };
    g();
  }
  buildLeaf(e, t, n, s) {
    const r = this.orientation === "landscape", a = document.createElement("div");
    a.className = "vpf-leaf";
    const c = a.style;
    c.position = "absolute", c.top = "0", c.height = "100%", c.width = r ? "50%" : "100%", c.left = r && e === 1 ? "50%" : "0", c.transformOrigin = r ? e === 1 ? "left center" : "right center" : "center center", c.transformStyle = "preserve-3d", c.zIndex = "10", c.pointerEvents = "none", c.willChange = "transform";
    const h = [], u = e === 1 ? "right" : "left", l = (v, m) => {
      const P = document.createElement("div"), E = P.style;
      E.position = "absolute", E.inset = "0", E.backfaceVisibility = "hidden", E.overflow = "hidden", m && (E.transform = "rotateY(180deg)");
      const F = v.style;
      if (F.display = "block", F.position = "absolute", F.top = "0", F.left = "0", F.width = "100%", F.height = "100%", P.appendChild(v), this.opts.drawShadow !== !1 && r) {
        const p = e === 1 !== m ? "right" : "left", g = this.gutterShadingFor(m ? s : this.spreadIndex, p);
        if (g) {
          const C = document.createElement("div");
          C.className = "vpf-leaf-bend";
          const O = C.style;
          O.position = "absolute", O.inset = "0", O.pointerEvents = "none", O.background = g, P.appendChild(C);
        }
      }
      if (this.opts.drawShadow !== !1) {
        const p = document.createElement("div"), g = p.style;
        g.position = "absolute", g.inset = "0", g.pointerEvents = "none", g.opacity = "0", g.background = `linear-gradient(to ${u}, rgba(0,0,0,0.65), rgba(0,0,0,0) 65%)`, P.appendChild(p), h.push(p);
      }
      return P;
    };
    return a.append(l(t, !1), l(n, !0)), { leaf: a, shadows: h };
  }
  finishFlip(e) {
    var t, n;
    cancelAnimationFrame(e.raf);
    for (const s of e.movedPages) this.stage.appendChild(s);
    e.leaf.remove(), this.anim = null, this.spreadIndex = e.targetSpread, this.layout(), (n = (t = this.opts).onFlip) == null || n.call(t, this.getCurrentPage());
  }
}
function ot(i) {
  const e = [];
  for (let t = 0; t < i.pageCount; t++) {
    const n = !!i.trailingBlank && t === i.pageCount - 1, s = document.createElement("div"), r = ["vpf-page"];
    n && r.push("vpf-page-blank"), i.pageClass && r.push(i.pageClass), s.className = r.join(" ");
    const a = i.showCover && (t === 0 || t === i.pageCount - 1);
    if (s.dataset.density = a ? "hard" : "soft", s.style.overflow = "hidden", i.pageClass || (s.style.background = "#fff"), n) {
      s.setAttribute("data-pdf-flipbook-blank", ""), e.push({ root: s, canvas: null });
      continue;
    }
    s.setAttribute("data-pdf-flipbook-page", String(t + 1));
    const c = document.createElement("canvas");
    c.className = "vpf-canvas", c.setAttribute("data-pdf-flipbook-canvas", ""), c.style.display = "block", c.style.width = "100%", c.style.height = "100%", s.appendChild(c), e.push({ root: s, canvas: c });
  }
  return e;
}
function rt(i) {
  let e = null, t = [], n = null;
  async function s(u, l) {
    return r(), n = u, t = ot(l), e = new se(u, {
      pages: t.map((v) => v.root),
      pageWidth: l.pageWidth,
      pageHeight: l.pageHeight,
      startPage: l.startPage,
      mode: l.mode,
      showCover: l.showCover,
      responsive: l.responsive,
      minWidth: l.minWidth,
      maxWidth: l.maxWidth,
      minHeight: l.minHeight,
      maxHeight: l.maxHeight,
      trailingBlank: l.trailingBlank,
      ...l.flipOptions,
      onFlip: i.onFlip,
      onFlipStart: i.onFlipStart,
      onOrientationChange: i.onOrientationChange
    }), t;
  }
  function r() {
    if (e == null || e.destroy(), e = null, t = [], n) {
      for (; n.firstChild; ) n.removeChild(n.firstChild);
      n = null;
    }
  }
  function a() {
    e == null || e.flipNext();
  }
  function c() {
    e == null || e.flipPrev();
  }
  function h(u) {
    e == null || e.flip(u);
  }
  return {
    init: s,
    destroy: r,
    next: a,
    prev: c,
    goToPage: h,
    getInstance: () => e,
    getPages: () => t
  };
}
function lt(i, e) {
  const t = R(1), n = R(0), s = R(0), r = V(() => t.value === 1 ? {} : {
    transform: `translate(${n.value}px, ${s.value}px) scale(${t.value})`,
    transformOrigin: "0 0",
    willChange: "transform"
  });
  let a = null, c = null, h = null, u = null, l = null, v = !1, m = null;
  const P = () => {
    var o;
    return e.maxZoom() > 1 && (((o = e.allowZoom) == null ? void 0 : o.call(e)) ?? !0);
  };
  function E(o) {
    return Math.min(Math.max(o, 1), Math.max(e.maxZoom(), 1));
  }
  function F() {
    a && (n.value = Math.min(0, Math.max(a.clientWidth * (1 - t.value), n.value)), s.value = Math.min(0, Math.max(a.clientHeight * (1 - t.value), s.value)));
  }
  function p(o, y, G) {
    var _;
    const A = E(o), D = t.value;
    A !== D && (n.value = y - (y - n.value) / D * A, s.value = G - (G - s.value) / D * A, t.value = A, A === 1 ? (n.value = 0, s.value = 0, u = null, l = null) : F(), z(), (_ = e.onChange) == null || _.call(e, A));
  }
  function g(o, y) {
    n.value += o, s.value += y, F();
  }
  function C(o) {
    a && p(o, a.clientWidth / 2, a.clientHeight / 2);
  }
  function O() {
    var o;
    h = null, u = null, l = null, t.value !== 1 && (t.value = 1, n.value = 0, s.value = 0, z(), (o = e.onChange) == null || o.call(e, 1));
  }
  function z() {
    a && (a.style.touchAction = t.value > 1 ? "none" : "", a.style.cursor = t.value > 1 ? u ? "grabbing" : "grab" : "");
  }
  function f(o, y) {
    const G = a.getBoundingClientRect();
    return { x: o - G.left, y: y - G.top };
  }
  const M = (o) => {
    if (!a || !P()) return;
    const y = o.ctrlKey || o.metaKey, G = o.deltaMode === 1 ? o.deltaY * 16 : o.deltaY, A = E(t.value * Math.exp(-G * (y ? 0.01 : 22e-4)));
    if (A === t.value && !y) return;
    o.preventDefault();
    const { x: D, y: _ } = f(o.clientX, o.clientY);
    p(A, D, _);
  }, W = (o) => Math.hypot(
    o[0].clientX - o[1].clientX,
    o[0].clientY - o[1].clientY
  ), w = (o) => f(
    (o[0].clientX + o[1].clientX) / 2,
    (o[0].clientY + o[1].clientY) / 2
  ), S = (o) => {
    if (P())
      if (o.touches.length === 2) {
        o.preventDefault(), u = null, l = null;
        const y = w(o.touches);
        h = {
          startDist: W(o.touches),
          startZoom: t.value,
          lastMidX: y.x,
          lastMidY: y.y
        };
      } else o.touches.length === 1 && t.value > 1 && (l = { lastX: o.touches[0].clientX, lastY: o.touches[0].clientY });
  }, L = (o) => {
    if (h && o.touches.length >= 2) {
      o.preventDefault();
      const y = w(o.touches);
      g(y.x - h.lastMidX, y.y - h.lastMidY), h.lastMidX = y.x, h.lastMidY = y.y, p(h.startZoom * W(o.touches) / h.startDist, y.x, y.y);
    } else if (l && o.touches.length === 1 && t.value > 1) {
      o.preventDefault();
      const y = o.touches[0];
      g(y.clientX - l.lastX, y.clientY - l.lastY), l.lastX = y.clientX, l.lastY = y.clientY;
    }
  }, b = (o) => {
    h && o.touches.length < 2 && (h = null, v = !0), o.touches.length === 1 && t.value > 1 ? l = { lastX: o.touches[0].clientX, lastY: o.touches[0].clientY } : l = null;
  }, x = (o) => {
    var y;
    v = !1, !(t.value <= 1) && (o.stopPropagation(), o.pointerType !== "touch" && (u = { pointerId: o.pointerId, lastX: o.clientX, lastY: o.clientY }, (y = a == null ? void 0 : a.setPointerCapture) == null || y.call(a, o.pointerId)), z());
  }, B = (o) => {
    !u || o.pointerId !== u.pointerId || h || (g(o.clientX - u.lastX, o.clientY - u.lastY), u.lastX = o.clientX, u.lastY = o.clientY);
  }, X = (o) => {
    (t.value > 1 || h) && o.stopPropagation(), u && o.pointerId === u.pointerId && (u = null, z());
  }, Z = (o) => {
    (t.value > 1 || v) && (v = !1, o.stopPropagation(), o.preventDefault());
  }, J = (o) => {
    P() && (o.preventDefault(), m = t.value);
  }, re = (o) => {
    if (!P() || (o.preventDefault(), h || m === null)) return;
    const { x: y, y: G } = f(o.clientX, o.clientY);
    p(m * o.scale, y, G);
  }, K = (o) => {
    o.preventDefault(), m = null;
  };
  function Q() {
    ie(), a = i(), a && (a.addEventListener("wheel", M, { passive: !1 }), a.addEventListener("touchstart", S, { passive: !1 }), a.addEventListener("touchmove", L, { passive: !1 }), a.addEventListener("touchend", b), a.addEventListener("touchcancel", b), a.addEventListener("pointerdown", x, { capture: !0 }), a.addEventListener("pointermove", B), a.addEventListener("pointerup", X, { capture: !0 }), a.addEventListener("pointercancel", X, { capture: !0 }), a.addEventListener("click", Z, { capture: !0 }), a.addEventListener("gesturestart", J, { passive: !1 }), a.addEventListener("gesturechange", re, { passive: !1 }), a.addEventListener("gestureend", K, { passive: !1 }), typeof ResizeObserver < "u" && (c = new ResizeObserver(() => F()), c.observe(a)));
  }
  function ie() {
    a && (a.removeEventListener("wheel", M), a.removeEventListener("touchstart", S), a.removeEventListener("touchmove", L), a.removeEventListener("touchend", b), a.removeEventListener("touchcancel", b), a.removeEventListener("pointerdown", x, { capture: !0 }), a.removeEventListener("pointermove", B), a.removeEventListener("pointerup", X, { capture: !0 }), a.removeEventListener("pointercancel", X, { capture: !0 }), a.removeEventListener("click", Z, { capture: !0 }), a.removeEventListener("gesturestart", J), a.removeEventListener("gesturechange", re), a.removeEventListener("gestureend", K), c == null || c.disconnect(), c = null, h = null, u = null, l = null, a = null);
  }
  return { zoom: t, contentStyle: r, setZoom: C, reset: O, listen: Q, unlisten: ie };
}
function We() {
  if (!de()) return !1;
  const i = document;
  return !!(i.fullscreenEnabled ?? i.webkitFullscreenEnabled);
}
function ct(i, e) {
  const t = R(!1);
  function n() {
    const l = document;
    return l.fullscreenElement ?? l.webkitFullscreenElement ?? null;
  }
  function s() {
    const l = i(), v = l !== null && n() === l;
    v !== t.value && (t.value = v, e == null || e(v));
  }
  function r() {
    document.addEventListener("fullscreenchange", s), document.addEventListener("webkitfullscreenchange", s);
  }
  function a() {
    document.removeEventListener("fullscreenchange", s), document.removeEventListener("webkitfullscreenchange", s);
  }
  async function c() {
    var v, m;
    const l = i();
    if (!(!l || t.value))
      try {
        await (((v = l.requestFullscreen) == null ? void 0 : v.call(l)) ?? ((m = l.webkitRequestFullscreen) == null ? void 0 : m.call(l)));
      } catch {
      }
  }
  async function h() {
    var v, m;
    if (!n()) return;
    const l = document;
    try {
      await (((v = l.exitFullscreen) == null ? void 0 : v.call(l)) ?? ((m = l.webkitExitFullscreen) == null ? void 0 : m.call(l)));
    } catch {
    }
  }
  async function u() {
    t.value ? await h() : await c();
  }
  return { isFullscreen: t, enter: c, exit: h, toggle: u, listen: r, unlisten: a };
}
const ut = ["disabled"], dt = ["disabled"], ft = ["aria-label"], Le = /* @__PURE__ */ Oe({
  __name: "DefaultControls",
  props: {
    currentPage: {},
    visiblePages: {},
    totalPages: {},
    canGoNext: { type: Boolean },
    canGoPrev: { type: Boolean },
    isFullscreen: { type: Boolean },
    controlsClass: {},
    buttonClass: {},
    pageIndicatorClass: {}
  },
  emits: ["next", "prev", "toggle-fullscreen"],
  setup(i) {
    const e = i, t = We(), n = V(() => {
      var r;
      const s = (r = e.visiblePages) != null && r.length ? e.visiblePages : [e.currentPage];
      return s.length >= 2 ? `${s[0]}–${s[s.length - 1]}` : String(s[0] ?? e.currentPage);
    });
    return (s, r) => (te(), ne("div", {
      class: T(["vpf-controls", i.controlsClass]),
      "data-pdf-flipbook-controls": ""
    }, [
      N("button", {
        type: "button",
        class: T(["vpf-button", i.buttonClass]),
        disabled: !i.canGoPrev,
        "aria-label": "Previous page",
        "data-pdf-flipbook-prev": "",
        onClick: r[0] || (r[0] = (a) => s.$emit("prev"))
      }, " ‹ ", 10, ut),
      N("span", {
        class: T(["vpf-indicator", i.pageIndicatorClass]),
        "data-pdf-flipbook-indicator": ""
      }, ue(n.value) + " / " + ue(i.totalPages), 3),
      N("button", {
        type: "button",
        class: T(["vpf-button", i.buttonClass]),
        disabled: !i.canGoNext,
        "aria-label": "Next page",
        "data-pdf-flipbook-next": "",
        onClick: r[1] || (r[1] = (a) => s.$emit("next"))
      }, " › ", 10, dt),
      H(t) ? (te(), ne("button", {
        key: 0,
        type: "button",
        class: T(["vpf-button", i.buttonClass]),
        "aria-label": i.isFullscreen ? "Exit full screen" : "Enter full screen",
        "data-pdf-flipbook-fullscreen": "",
        onClick: r[2] || (r[2] = (a) => s.$emit("toggle-fullscreen"))
      }, ue(i.isFullscreen ? "⤡" : "⤢"), 11, ft)) : oe("", !0)
    ], 2));
  }
}), ht = ["data-fullscreen", "data-controls-position"], pt = /* @__PURE__ */ Oe({
  __name: "PdfFlipbook",
  props: {
    src: {},
    pdfOptions: {},
    workerSrc: {},
    width: { default: 550 },
    height: {},
    responsive: { type: Boolean, default: !0 },
    minWidth: {},
    maxWidth: {},
    minHeight: {},
    maxHeight: {},
    startPage: { default: 1 },
    mode: { default: "auto" },
    isVertical: { type: Boolean, default: void 0 },
    showCover: { type: Boolean, default: !0 },
    flipOptions: {},
    renderScale: { default: 1.5 },
    renderRange: { default: 2 },
    controlsPosition: { default: "bottom" },
    maxZoom: { default: 2 },
    pinchZoom: { type: [Boolean, String], default: "fullscreen" },
    containerClass: {},
    fullscreenClass: {},
    bookClass: {},
    pageClass: {},
    controlsClass: {},
    buttonClass: {},
    pageIndicatorClass: {},
    loadingClass: {},
    errorClass: {}
  },
  emits: ["loaded", "error", "page-changed", "flip-start", "orientation-changed", "rendered", "fullscreen-changed", "zoom-changed"],
  setup(i, { expose: e, emit: t }) {
    const n = i, s = t, r = R(null), a = R(null), c = R(null), h = R(!1), u = R(1), l = R([1]), v = R(1), m = R(!1), P = R(1), E = R("landscape"), F = R(null), p = R(0), g = ct(
      () => r.value,
      (d) => {
        var k;
        s("fullscreen-changed", d), (k = x.getInstance()) == null || k.setFillMode(d), requestAnimationFrame(() => {
          var Y;
          (Y = x.getInstance()) == null || Y.update(), A();
        }), d ? _() : fe(), !d && n.pinchZoom === "fullscreen" && b.reset();
      }
    ), C = g.isFullscreen, O = R(!1), { pdf: z, totalPages: f, loading: M, progress: W, error: w, load: S, teardown: L } = nt(), b = lt(() => a.value, {
      maxZoom: () => n.maxZoom,
      allowZoom: () => n.pinchZoom !== !1 && (n.pinchZoom !== "fullscreen" || C.value),
      onChange: (d) => s("zoom-changed", d)
    }), x = rt({
      onFlip(d) {
        m.value = !1, B(), P.value = d, X.updateWindow(u.value), s("page-changed", { page: u.value, totalPages: f.value });
      },
      onFlipStart(d, k) {
        m.value = !0, P.value = k, s("flip-start", {
          fromPage: Math.min(d, f.value),
          toPage: Math.min(k, f.value)
        });
      },
      onOrientationChange(d) {
        E.value = d, B(), X.updateWindow(u.value), s("orientation-changed", d);
      }
    });
    function B() {
      var Y;
      const d = (Y = x.getInstance()) == null ? void 0 : Y.getCurrentSpread();
      if (!(d != null && d.length)) return;
      v.value = d[0];
      const k = d.filter((j) => j <= f.value);
      l.value = k.length ? k : [f.value], u.value = l.value[0];
    }
    const X = it({
      renderScale: () => n.renderScale,
      renderRange: () => n.renderRange,
      onRendered: (d) => s("rendered", { page: d }),
      onError: (d, k) => s("error", k)
    });
    let Z = 0;
    async function J() {
      var be, ye;
      const d = ++Z;
      h.value = !1, O.value = !1, m.value = !1, b.reset(), X.reset(), x.destroy();
      const k = await S(n.src, {
        workerSrc: n.workerSrc,
        pdfOptions: n.pdfOptions
      });
      if (d !== Z) return;
      if (!k) {
        w.value && s("error", w.value);
        return;
      }
      const Y = await k.getPage(1);
      if (d !== Z) return;
      const j = Y.getViewport({ scale: 1 }), ee = n.isVertical ?? j.height >= j.width, U = n.mode === "auto" && !ee ? "single" : n.mode, he = !ee && U === "single" ? 2 : 1, pe = n.width * he, ge = (n.height ?? Math.round(n.width * (j.height / j.width))) * he;
      await qe();
      const ve = c.value;
      if (d !== Z || !ve) return;
      const me = n.showCover && U !== "single" && k.numPages % 2 === 1, De = await x.init(ve, {
        pageCount: k.numPages + (me ? 1 : 0),
        trailingBlank: me,
        pageWidth: pe,
        pageHeight: ge,
        startPage: n.startPage,
        mode: U,
        showCover: n.showCover,
        responsive: n.responsive,
        minWidth: n.minWidth,
        maxWidth: n.maxWidth,
        minHeight: n.minHeight,
        maxHeight: n.maxHeight,
        flipOptions: n.flipOptions,
        pageClass: n.pageClass
      });
      if (d !== Z) {
        x.destroy();
        return;
      }
      C.value && ((be = x.getInstance()) == null || be.setFillMode(!0)), X.setDocument(k), De.forEach((we, Xe) => {
        we.canvas && X.registerCanvas(Xe + 1, we.canvas);
      }), B(), P.value = u.value, F.value = { width: pe, height: ge }, E.value = ((ye = x.getInstance()) == null ? void 0 : ye.getOrientation()) ?? E.value, X.updateWindow(u.value), h.value = !0, requestAnimationFrame(() => {
        d === Z && (O.value = !0, A());
      }), s("loaded", { totalPages: k.numPages, pdf: k });
    }
    function re() {
      Z++, h.value = !1, X.reset(), x.destroy(), L();
    }
    Ne(() => {
      g.listen(), b.listen(), J();
    }), Te(() => {
      g.unlisten(), b.unlisten(), fe(), re();
    }), Ze(
      () => n.src,
      () => void J()
    );
    function K() {
      x.next();
    }
    function Q() {
      x.prev();
    }
    function ie(d) {
      x.goToPage(d);
    }
    async function o() {
      await J();
    }
    const y = V(() => !h.value || E.value !== "landscape" ? null : n.showCover && P.value <= 1 ? "-25%" : P.value >= f.value ? "25%" : null), G = V(() => {
      var d;
      return Math.max(0, ((d = n.flipOptions) == null ? void 0 : d.flippingTime) ?? 800);
    });
    function A() {
      const d = r.value, k = a.value;
      if (!C.value || !d || !k || typeof getComputedStyle != "function") {
        p.value = 0;
        return;
      }
      const Y = getComputedStyle(d);
      let j = d.clientHeight - parseFloat(Y.paddingTop) - parseFloat(Y.paddingBottom);
      for (const ee of Array.from(d.children)) {
        if (ee === k) continue;
        const U = getComputedStyle(ee);
        U.position === "absolute" || U.position === "fixed" || (j -= ee.getBoundingClientRect().height + parseFloat(U.marginTop) + parseFloat(U.marginBottom));
      }
      p.value = Number.isFinite(j) ? Math.max(0, j) : 0;
    }
    let D = null;
    function _() {
      D || typeof ResizeObserver > "u" || !r.value || (D = new ResizeObserver(() => A()), D.observe(r.value));
    }
    function fe() {
      D == null || D.disconnect(), D = null, p.value = 0;
    }
    const ze = V(() => {
      const d = { position: "relative", width: "100%" };
      if (O.value && G.value > 0 && (d.transition = `transform ${G.value}ms ease`), y.value && (d.transform = `translateX(${y.value})`), C.value && F.value) {
        const Y = (E.value === "landscape" ? 2 : 1) * F.value.width / F.value.height;
        d.maxWidth = p.value ? `min(100%, ${(p.value * Y).toFixed(2)}px)` : `min(100%, calc((100vh - 6rem) * ${Y}))`, d.marginLeft = "auto", d.marginRight = "auto";
      }
      return d;
    }), Be = V(() => ({
      position: "relative",
      width: "100%",
      overflow: b.zoom.value > 1 ? "hidden" : "visible"
    })), $e = V(
      () => h.value && !m.value && v.value === 1 && !C.value && b.zoom.value === 1 && We()
    ), Ye = V(() => {
      const d = {
        position: "absolute",
        top: "0",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: "2"
      };
      return E.value === "portrait" ? (d.left = "0", d.width = "100%") : n.showCover ? (d.left = "50%", d.width = "50%") : (d.left = "0", d.width = "50%"), d;
    }), Ae = V(
      () => C.value ? { display: "flex", flexDirection: "column", justifyContent: "flex-start", overflow: "auto" } : void 0
    ), $ = V(() => ({
      currentPage: u.value,
      visiblePages: l.value,
      totalPages: f.value,
      next: K,
      prev: Q,
      goToPage: ie,
      canGoNext: u.value < f.value,
      canGoPrev: u.value > 1,
      isFullscreen: C.value,
      toggleFullscreen: () => void g.toggle(),
      zoom: b.zoom.value,
      setZoom: b.setZoom,
      resetZoom: b.reset
    }));
    return e({
      next: K,
      prev: Q,
      goToPage: ie,
      currentPage: le(u),
      totalPages: le(f),
      reload: o,
      isFullscreen: le(C),
      enterFullscreen: g.enter,
      exitFullscreen: g.exit,
      toggleFullscreen: g.toggle,
      getPdfDocument: () => z.value,
      getFlipInstance: () => x.getInstance(),
      zoom: le(b.zoom),
      setZoom: b.setZoom,
      resetZoom: b.reset
    }), (d, k) => (te(), ne("div", {
      ref_key: "rootRef",
      ref: r,
      class: T(["vpf-container", [i.containerClass, H(C) ? i.fullscreenClass : void 0]]),
      style: ae(Ae.value),
      "data-fullscreen": H(C) ? "" : void 0,
      "data-controls-position": i.controlsPosition,
      "data-pdf-flipbook": ""
    }, [
      H(w) ? (te(), ne("div", {
        key: 0,
        class: T(["vpf-error", i.errorClass]),
        "data-pdf-flipbook-error": ""
      }, [
        ce(d.$slots, "error", {
          error: H(w),
          retry: o
        }, () => [
          N("div", null, "Failed to load PDF: " + ue(H(w).message), 1),
          N("button", {
            type: "button",
            class: T(["vpf-button", i.buttonClass]),
            onClick: o
          }, " Retry ", 2)
        ])
      ], 2)) : H(M) ? (te(), ne("div", {
        key: 1,
        class: T(["vpf-loading", i.loadingClass]),
        "data-pdf-flipbook-loading": ""
      }, [
        ce(d.$slots, "loading", { progress: H(W) }, () => [
          k[1] || (k[1] = N("div", null, "Loading…", -1))
        ])
      ], 2)) : oe("", !0),
      h.value && i.controlsPosition === "top" ? ce(d.$slots, "controls", Pe(ke({ key: 2 }, $.value)), () => [
        Se(Le, {
          "current-page": $.value.currentPage,
          "visible-pages": $.value.visiblePages,
          "total-pages": $.value.totalPages,
          "can-go-next": $.value.canGoNext,
          "can-go-prev": $.value.canGoPrev,
          "is-fullscreen": $.value.isFullscreen,
          "controls-class": i.controlsClass,
          "button-class": i.buttonClass,
          "page-indicator-class": i.pageIndicatorClass,
          onNext: K,
          onPrev: Q,
          onToggleFullscreen: $.value.toggleFullscreen
        }, null, 8, ["current-page", "visible-pages", "total-pages", "can-go-next", "can-go-prev", "is-fullscreen", "controls-class", "button-class", "page-indicator-class", "onToggleFullscreen"])
      ]) : oe("", !0),
      je(N("div", {
        ref_key: "viewportRef",
        ref: a,
        class: "vpf-zoom-viewport",
        style: ae(Be.value),
        "data-pdf-flipbook-viewport": ""
      }, [
        N("div", {
          class: "vpf-zoom-content",
          style: ae(H(b).contentStyle.value),
          "data-pdf-flipbook-zoom": ""
        }, [
          N("div", {
            class: "vpf-book-shell",
            style: ae(ze.value),
            "data-pdf-flipbook-shell": ""
          }, [
            N("div", {
              ref_key: "bookRef",
              ref: c,
              class: T(["vpf-book", i.bookClass]),
              "data-pdf-flipbook-book": ""
            }, null, 2),
            $e.value ? (te(), ne("div", {
              key: 0,
              class: "vpf-fullscreen-hint",
              style: ae(Ye.value),
              "data-pdf-flipbook-fullscreen-hint": ""
            }, [
              N("button", {
                type: "button",
                class: T(["vpf-button vpf-fullscreen-hint-button", i.buttonClass]),
                "data-pdf-flipbook-fullscreen-hint-button": "",
                onClick: k[0] || (k[0] = Ve((Y) => void H(g).enter(), ["stop"]))
              }, " View in fullscreen ", 2)
            ], 4)) : oe("", !0)
          ], 4)
        ], 4)
      ], 4), [
        [Ue, !H(w) && !H(M)]
      ]),
      h.value && i.controlsPosition === "bottom" ? ce(d.$slots, "controls", Pe(ke({ key: 3 }, $.value)), () => [
        Se(Le, {
          "current-page": $.value.currentPage,
          "visible-pages": $.value.visiblePages,
          "total-pages": $.value.totalPages,
          "can-go-next": $.value.canGoNext,
          "can-go-prev": $.value.canGoPrev,
          "is-fullscreen": $.value.isFullscreen,
          "controls-class": i.controlsClass,
          "button-class": i.buttonClass,
          "page-indicator-class": i.pageIndicatorClass,
          onNext: K,
          onPrev: Q,
          onToggleFullscreen: $.value.toggleFullscreen
        }, null, 8, ["current-page", "visible-pages", "total-pages", "can-go-next", "can-go-prev", "is-fullscreen", "controls-class", "button-class", "page-indicator-class", "onToggleFullscreen"])
      ]) : oe("", !0)
    ], 14, ht));
  }
}), mt = {
  install(i, e) {
    e != null && e.workerSrc && Je(e.workerSrc), i.component("PdfFlipbook", pt);
  }
};
export {
  pt as PdfFlipbook,
  mt as default,
  Je as setGlobalWorkerSrc
};
