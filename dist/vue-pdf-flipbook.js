var De = Object.defineProperty;
var Xe = (i, e, t) => e in i ? De(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var W = (i, e, t) => Xe(i, typeof e != "symbol" ? e + "" : e, t);
import { shallowRef as be, ref as R, computed as V, defineComponent as Fe, openBlock as te, createElementBlock as ne, normalizeClass as T, createElementVNode as N, toDisplayString as ue, unref as G, createCommentVNode as oe, onMounted as Ge, onBeforeUnmount as He, watch as Ne, readonly as le, normalizeStyle as ae, renderSlot as ce, normalizeProps as ye, mergeProps as we, createVNode as Ce, withDirectives as Te, withModifiers as Ze, vShow as je, nextTick as Ve } from "vue";
function de() {
  return typeof window < "u" && typeof document < "u";
}
function ke(i) {
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
function Ue() {
  if (!de()) return;
  ke(Map.prototype), ke(WeakMap.prototype), typeof Math.sumPrecise != "function" && Object.defineProperty(Math, "sumPrecise", {
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
let Le, Pe = !1;
function qe(i) {
  Le = i;
}
function Ke(i) {
  return `https://cdn.jsdelivr.net/npm/pdfjs-dist@${i.version}/build/pdf.worker.min.mjs`;
}
function Me(i) {
  i.GlobalWorkerOptions.workerSrc = Ke(i), Pe || (Pe = !0, console.warn(
    '[vue-pdf-flipbook] Falling back to loading the pdf.js worker from jsdelivr. For offline or CSP-restricted environments, pass a `workerSrc` prop or plugin option (e.g. in Vite: `import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"`).'
  ));
}
async function Je(i) {
  try {
    const e = await fetch(i, { method: "HEAD" });
    return e.ok ? (e.headers.get("content-type") ?? "").includes("javascript") : !1;
  } catch {
    return !1;
  }
}
async function Qe(i, e) {
  if (!de()) return !0;
  const t = e ?? Le;
  if (t)
    return i.GlobalWorkerOptions.workerSrc = t, !0;
  if (i.GlobalWorkerOptions.workerSrc) return !0;
  const n = "pdfjs-dist/build/pdf.worker.min.mjs";
  try {
    const s = new URL(n, import.meta.url).toString();
    if (s.startsWith("http") && await Je(s))
      return i.GlobalWorkerOptions.workerSrc = s, !1;
  } catch {
  }
  return Me(i), !1;
}
function xe(i) {
  return typeof i == "string" || i instanceof URL ? { url: i.toString() } : i instanceof ArrayBuffer ? { data: new Uint8Array(i.slice(0)) } : { data: i.slice() };
}
function _e(i) {
  const e = i instanceof Error ? i.message : String(i);
  return /worker/i.test(e) || /import/i.test(e);
}
function et() {
  const i = be(null), e = R(0), t = R(!1), n = R(0), s = be(null);
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
      Ue();
      const m = await import("pdfjs-dist"), C = await Qe(m, l.workerSrc);
      if (v !== r) return null;
      const x = { ...xe(u), ...l.pdfOptions }, S = () => {
        const g = m.getDocument(x);
        return g.onProgress = (k) => {
          v === r && k.total > 0 && (n.value = Math.min(1, k.loaded / k.total));
        }, a = g, g.promise;
      };
      let p;
      try {
        p = await S();
      } catch (g) {
        if (C || !_e(g)) throw g;
        Me(m), Object.assign(x, xe(u)), p = await S();
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
function tt(i) {
  return i instanceof Error && i.name === "RenderingCancelledException";
}
function nt(i) {
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
    const f = e.numPages, E = u(), I = [];
    for (let w = 1; w <= f; w++)
      Math.abs(w - r) <= E && !n.has(w) && !s.has(w) && t.has(w) && I.push(w);
    return I.sort((w, F) => {
      const L = Math.abs(w - r), b = Math.abs(F - r);
      return L === b ? F - w : L - b;
    }), I;
  }
  function v() {
    const f = u();
    if (f !== 1 / 0) {
      for (const E of n)
        if (Math.abs(E - r) > f * 2) {
          const I = t.get(E);
          I && (I.width = 0, I.height = 0), n.delete(E);
        }
    }
  }
  async function m(f) {
    var F, L;
    if (!e) return;
    const E = t.get(f);
    if (!E) return;
    const I = e, w = { page: f, task: null, cancelled: !1 };
    a = w;
    try {
      const b = await I.getPage(f);
      if (w.cancelled || e !== I) return;
      const M = b.getViewport({ scale: i.renderScale() * h() });
      if (E.width = Math.floor(M.width), E.height = Math.floor(M.height), w.task = b.render({ canvas: E, viewport: M }), await w.task.promise, w.cancelled || e !== I) return;
      n.add(f), (F = i.onRendered) == null || F.call(i, f);
    } catch (b) {
      !tt(b) && !w.cancelled && (s.add(f), (L = i.onError) == null || L.call(i, f, b instanceof Error ? b : new Error(String(b))));
    } finally {
      a === w && (a = null);
    }
  }
  function C() {
    return new Promise((f) => {
      typeof requestIdleCallback == "function" ? requestIdleCallback(() => f()) : setTimeout(f, 16);
    });
  }
  async function x() {
    if (!c) {
      c = !0;
      try {
        const f = i.renderRange() === 1 / 0;
        let E;
        for (; e && (E = l()[0]) !== void 0; )
          f && await C(), await m(E);
      } finally {
        c = !1;
      }
    }
  }
  function S() {
    var f;
    a && Math.abs(a.page - r) > u() && (a.cancelled = !0, (f = a.task) == null || f.cancel());
  }
  function p(f) {
    O(), e = f, n.clear(), s.clear();
  }
  function g(f, E) {
    t.set(f, E);
  }
  function k(f) {
    r = f, S(), v(), x();
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
    updateWindow: k,
    cancelAll: O,
    reset: z,
    isRendered: (f) => n.has(f)
  };
}
function ee(i) {
  return `${+(i * 100).toFixed(2)}%`;
}
function st(i) {
  return i < 0.5 ? 2 * i * i : 1 - (-2 * i + 2) ** 2 / 2;
}
function Se() {
  return typeof performance < "u" ? performance.now() : Date.now();
}
class se {
  constructor(e, t) {
    W(this, "root");
    W(this, "stage");
    W(this, "pages");
    W(this, "opts");
    W(this, "orientation");
    W(this, "chrome", null);
    W(this, "spreads", []);
    W(this, "spreadIndex", 0);
    W(this, "anim", null);
    W(this, "destroyed", !1);
    W(this, "resizeObserver", null);
    W(this, "usesWindowResize", !1);
    W(this, "pointerStart", null);
    W(this, "suppressClick", !1);
    /* ------------------------------------------------------------ interaction */
    W(this, "handleResize", () => {
      var n, s;
      if (this.destroyed) return;
      const e = this.detectOrientation();
      if (e === this.orientation) return;
      this.anim && this.finishFlip(this.anim);
      const t = this.getCurrentPage();
      this.orientation = e, this.applyStageSize(), this.spreads = this.computeSpreads(), this.spreadIndex = this.spreadIndexForPage(this.clampPage(t)), this.layout(), (s = (n = this.opts).onOrientationChange) == null || s.call(n, e);
    });
    W(this, "handlePointerDown", (e) => {
      if (!e.isPrimary) {
        this.pointerStart = null;
        return;
      }
      this.suppressClick = !1, this.pointerStart = { x: e.clientX, y: e.clientY };
    });
    W(this, "handlePointerUp", (e) => {
      if (!e.isPrimary) return;
      const t = this.pointerStart;
      if (this.pointerStart = null, !t) return;
      const n = e.clientX - t.x, s = e.clientY - t.y, r = this.opts.swipeDistance ?? 30;
      Math.abs(n) >= r && Math.abs(n) > Math.abs(s) && (this.suppressClick = !0, n < 0 ? this.flipNext() : this.flipPrev());
    });
    W(this, "handleClick", (e) => {
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
    n.left = ee(e.shadowLeft), n.width = ee(e.shadowWidth), n.opacity = String(e.shadowOpacity), t.spine.style.opacity = String(e.spineOpacity), t.bendLeft.style.opacity = String(e.bendOpacity), t.bendRight.style.opacity = String(e.bendOpacity), t.bendLeft.style.background = e.bendLeftBg, t.bendRight.style.background = e.bendRightBg;
    const s = t.coverSpine.style;
    s.opacity = String(e.coverSpineOpacity), s.left = ee(e.coverSpineLeft), s.background = e.coverSpineBg;
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
    const h = Math.cos(Math.PI * a), u = 0.5 * Math.max(h, 0), l = 0.5 * Math.max(-h, 0), v = s ? 0.5 : n === 1 ? l : u, m = r ? 0.5 : n === 1 ? u : l, C = c.shadow.style;
    C.left = ee(0.5 - v), C.width = ee(v + m), C.opacity = String(e.shadowOpacity + (t.shadowOpacity - e.shadowOpacity) * a);
    const x = Math.max(0, 2 * a - 1), S = Math.max(0, 1 - 2 * a), p = (z, f) => String(f > z ? z + (f - z) * x : f + (z - f) * S), g = a >= 0.5;
    c.spine.style.opacity = p(e.spineOpacity, t.spineOpacity);
    const k = p(e.bendOpacity, t.bendOpacity);
    c.bendLeft.style.opacity = k, c.bendRight.style.opacity = k, c.bendLeft.style.background = g ? t.bendLeftBg : e.bendLeftBg, c.bendRight.style.background = g ? t.bendRightBg : e.bendRightBg;
    const O = c.coverSpine.style;
    O.opacity = p(e.coverSpineOpacity, t.coverSpineOpacity), O.left = ee(g ? t.coverSpineLeft : e.coverSpineLeft), O.background = g ? t.coverSpineBg : e.coverSpineBg;
  }
  applyStageSize() {
    const { pageWidth: e, pageHeight: t } = this.opts, n = this.orientation === "landscape" ? 2 : 1, s = n * e / t, r = this.stage.style;
    if (r.aspectRatio = String(s), r.perspective = `${Math.round(n * e * 2.5)}px`, r.marginLeft = "auto", r.marginRight = "auto", this.opts.responsive === !1) {
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
    var k, O, z, f, E, I, w;
    if (this.destroyed || this.anim || e < 0 || e >= this.spreads.length || e === this.spreadIndex) return;
    const t = e > this.spreadIndex ? 1 : -1, n = ((k = this.spreads[e]) == null ? void 0 : k[0]) ?? this.getCurrentPage();
    (z = (O = this.opts).onFlipStart) == null || z.call(O, this.getCurrentPage(), n);
    let s, r;
    const a = [];
    if (this.orientation === "portrait")
      s = (f = this.spreads[this.spreadIndex]) == null ? void 0 : f[0], r = (E = this.spreads[e]) == null ? void 0 : E[0];
    else {
      const F = this.slotPages(this.spreadIndex), L = this.slotPages(e);
      t === 1 ? (s = F.right, r = L.left, a.push({ page: F.left, slot: "left" }, { page: L.right, slot: "right" })) : (s = F.left, r = L.right, a.push({ page: F.right, slot: "right" }, { page: L.left, slot: "left" }));
    }
    const c = s ? this.pageEl(s) : void 0, h = r ? this.pageEl(r) : void 0;
    if (!c || !h) {
      this.spreadIndex = e, this.layout(), (w = (I = this.opts).onFlip) == null || w.call(I, this.getCurrentPage());
      return;
    }
    this.hideAll();
    for (const { page: F, slot: L } of a)
      F && this.showAt(F, L);
    let u = null;
    if (this.chrome)
      if (this.orientation === "portrait")
        this.updateChrome(e);
      else {
        const F = a.some((B) => B.page !== void 0 && B.slot === "left"), L = a.some((B) => B.page !== void 0 && B.slot === "right"), b = this.chromeStateFor(this.spreadIndex), M = this.chromeStateFor(e);
        u = (B) => this.stepChrome(b, M, t, F, L, B);
      }
    const { leaf: l, shadows: v } = this.buildLeaf(t, c, h, e);
    this.stage.appendChild(l);
    const m = Math.max(0, this.opts.flippingTime ?? 800), C = t === 1 ? -180 : 180, x = this.opts.maxShadowOpacity ?? 0.4, S = Se(), p = {
      leaf: l,
      movedPages: [c, h],
      shadows: v,
      chrome: u,
      targetSpread: e,
      endAngle: C,
      raf: 0
    };
    this.anim = p;
    const g = () => {
      var M;
      if (this.destroyed || this.anim !== p) return;
      const F = m === 0 ? 1 : Math.min(1, (Se() - S) / m), L = st(F);
      l.style.transform = `rotateY(${C * L}deg)`, (M = p.chrome) == null || M.call(p, L);
      const b = Math.sin(Math.PI * L) * x;
      for (const B of p.shadows) B.style.opacity = String(b);
      F < 1 ? p.raf = requestAnimationFrame(g) : this.finishFlip(p);
    };
    g();
  }
  buildLeaf(e, t, n, s) {
    const r = this.orientation === "landscape", a = document.createElement("div");
    a.className = "vpf-leaf";
    const c = a.style;
    c.position = "absolute", c.top = "0", c.height = "100%", c.width = r ? "50%" : "100%", c.left = r && e === 1 ? "50%" : "0", c.transformOrigin = r ? e === 1 ? "left center" : "right center" : "center center", c.transformStyle = "preserve-3d", c.zIndex = "10", c.pointerEvents = "none", c.willChange = "transform";
    const h = [], u = e === 1 ? "right" : "left", l = (v, m) => {
      const C = document.createElement("div"), x = C.style;
      x.position = "absolute", x.inset = "0", x.backfaceVisibility = "hidden", x.overflow = "hidden", m && (x.transform = "rotateY(180deg)");
      const S = v.style;
      if (S.display = "block", S.position = "absolute", S.top = "0", S.left = "0", S.width = "100%", S.height = "100%", C.appendChild(v), this.opts.drawShadow !== !1 && r) {
        const p = e === 1 !== m ? "right" : "left", g = this.gutterShadingFor(m ? s : this.spreadIndex, p);
        if (g) {
          const k = document.createElement("div");
          k.className = "vpf-leaf-bend";
          const O = k.style;
          O.position = "absolute", O.inset = "0", O.pointerEvents = "none", O.background = g, C.appendChild(k);
        }
      }
      if (this.opts.drawShadow !== !1) {
        const p = document.createElement("div"), g = p.style;
        g.position = "absolute", g.inset = "0", g.pointerEvents = "none", g.opacity = "0", g.background = `linear-gradient(to ${u}, rgba(0,0,0,0.65), rgba(0,0,0,0) 65%)`, C.appendChild(p), h.push(p);
      }
      return C;
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
function it(i) {
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
function at(i) {
  let e = null, t = [], n = null;
  async function s(u, l) {
    return r(), n = u, t = it(l), e = new se(u, {
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
function ot(i, e) {
  const t = R(1), n = R(0), s = R(0), r = V(() => t.value === 1 ? {} : {
    transform: `translate(${n.value}px, ${s.value}px) scale(${t.value})`,
    transformOrigin: "0 0",
    willChange: "transform"
  });
  let a = null, c = null, h = null, u = null, l = null, v = !1, m = null;
  const C = () => {
    var o;
    return e.maxZoom() > 1 && (((o = e.allowZoom) == null ? void 0 : o.call(e)) ?? !0);
  };
  function x(o) {
    return Math.min(Math.max(o, 1), Math.max(e.maxZoom(), 1));
  }
  function S() {
    a && (n.value = Math.min(0, Math.max(a.clientWidth * (1 - t.value), n.value)), s.value = Math.min(0, Math.max(a.clientHeight * (1 - t.value), s.value)));
  }
  function p(o, y, X) {
    var _;
    const Y = x(o), A = t.value;
    Y !== A && (n.value = y - (y - n.value) / A * Y, s.value = X - (X - s.value) / A * Y, t.value = Y, Y === 1 ? (n.value = 0, s.value = 0, u = null, l = null) : S(), z(), (_ = e.onChange) == null || _.call(e, Y));
  }
  function g(o, y) {
    n.value += o, s.value += y, S();
  }
  function k(o) {
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
    const X = a.getBoundingClientRect();
    return { x: o - X.left, y: y - X.top };
  }
  const E = (o) => {
    if (!a || !C()) return;
    const y = o.ctrlKey || o.metaKey, X = o.deltaMode === 1 ? o.deltaY * 16 : o.deltaY, Y = x(t.value * Math.exp(-X * (y ? 0.01 : 22e-4)));
    if (Y === t.value && !y) return;
    o.preventDefault();
    const { x: A, y: _ } = f(o.clientX, o.clientY);
    p(Y, A, _);
  }, I = (o) => Math.hypot(
    o[0].clientX - o[1].clientX,
    o[0].clientY - o[1].clientY
  ), w = (o) => f(
    (o[0].clientX + o[1].clientX) / 2,
    (o[0].clientY + o[1].clientY) / 2
  ), F = (o) => {
    if (C())
      if (o.touches.length === 2) {
        o.preventDefault(), u = null, l = null;
        const y = w(o.touches);
        h = {
          startDist: I(o.touches),
          startZoom: t.value,
          lastMidX: y.x,
          lastMidY: y.y
        };
      } else o.touches.length === 1 && t.value > 1 && (l = { lastX: o.touches[0].clientX, lastY: o.touches[0].clientY });
  }, L = (o) => {
    if (h && o.touches.length >= 2) {
      o.preventDefault();
      const y = w(o.touches);
      g(y.x - h.lastMidX, y.y - h.lastMidY), h.lastMidX = y.x, h.lastMidY = y.y, p(h.startZoom * I(o.touches) / h.startDist, y.x, y.y);
    } else if (l && o.touches.length === 1 && t.value > 1) {
      o.preventDefault();
      const y = o.touches[0];
      g(y.clientX - l.lastX, y.clientY - l.lastY), l.lastX = y.clientX, l.lastY = y.clientY;
    }
  }, b = (o) => {
    h && o.touches.length < 2 && (h = null, v = !0), o.touches.length === 1 && t.value > 1 ? l = { lastX: o.touches[0].clientX, lastY: o.touches[0].clientY } : l = null;
  }, M = (o) => {
    var y;
    v = !1, !(t.value <= 1) && (o.stopPropagation(), o.pointerType !== "touch" && (u = { pointerId: o.pointerId, lastX: o.clientX, lastY: o.clientY }, (y = a == null ? void 0 : a.setPointerCapture) == null || y.call(a, o.pointerId)), z());
  }, B = (o) => {
    !u || o.pointerId !== u.pointerId || h || (g(o.clientX - u.lastX, o.clientY - u.lastY), u.lastX = o.clientX, u.lastY = o.clientY);
  }, D = (o) => {
    (t.value > 1 || h) && o.stopPropagation(), u && o.pointerId === u.pointerId && (u = null, z());
  }, Z = (o) => {
    (t.value > 1 || v) && (v = !1, o.stopPropagation(), o.preventDefault());
  }, J = (o) => {
    C() && (o.preventDefault(), m = t.value);
  }, re = (o) => {
    if (!C() || (o.preventDefault(), h || m === null)) return;
    const { x: y, y: X } = f(o.clientX, o.clientY);
    p(m * o.scale, y, X);
  }, U = (o) => {
    o.preventDefault(), m = null;
  };
  function Q() {
    ie(), a = i(), a && (a.addEventListener("wheel", E, { passive: !1 }), a.addEventListener("touchstart", F, { passive: !1 }), a.addEventListener("touchmove", L, { passive: !1 }), a.addEventListener("touchend", b), a.addEventListener("touchcancel", b), a.addEventListener("pointerdown", M, { capture: !0 }), a.addEventListener("pointermove", B), a.addEventListener("pointerup", D, { capture: !0 }), a.addEventListener("pointercancel", D, { capture: !0 }), a.addEventListener("click", Z, { capture: !0 }), a.addEventListener("gesturestart", J, { passive: !1 }), a.addEventListener("gesturechange", re, { passive: !1 }), a.addEventListener("gestureend", U, { passive: !1 }), typeof ResizeObserver < "u" && (c = new ResizeObserver(() => S()), c.observe(a)));
  }
  function ie() {
    a && (a.removeEventListener("wheel", E), a.removeEventListener("touchstart", F), a.removeEventListener("touchmove", L), a.removeEventListener("touchend", b), a.removeEventListener("touchcancel", b), a.removeEventListener("pointerdown", M, { capture: !0 }), a.removeEventListener("pointermove", B), a.removeEventListener("pointerup", D, { capture: !0 }), a.removeEventListener("pointercancel", D, { capture: !0 }), a.removeEventListener("click", Z, { capture: !0 }), a.removeEventListener("gesturestart", J), a.removeEventListener("gesturechange", re), a.removeEventListener("gestureend", U), c == null || c.disconnect(), c = null, h = null, u = null, l = null, a = null);
  }
  return { zoom: t, contentStyle: r, setZoom: k, reset: O, listen: Q, unlisten: ie };
}
function Oe() {
  if (!de()) return !1;
  const i = document;
  return !!(i.fullscreenEnabled ?? i.webkitFullscreenEnabled);
}
function rt(i, e) {
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
const lt = ["disabled"], ct = ["disabled"], ut = ["aria-label"], Ee = /* @__PURE__ */ Fe({
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
    const e = i, t = Oe(), n = V(() => {
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
      }, " ‹ ", 10, lt),
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
      }, " › ", 10, ct),
      G(t) ? (te(), ne("button", {
        key: 0,
        type: "button",
        class: T(["vpf-button", i.buttonClass]),
        "aria-label": i.isFullscreen ? "Exit full screen" : "Enter full screen",
        "data-pdf-flipbook-fullscreen": "",
        onClick: r[2] || (r[2] = (a) => s.$emit("toggle-fullscreen"))
      }, ue(i.isFullscreen ? "⤡" : "⤢"), 11, ut)) : oe("", !0)
    ], 2));
  }
}), dt = ["data-fullscreen", "data-controls-position"], ft = /* @__PURE__ */ Fe({
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
    const n = i, s = t, r = R(null), a = R(null), c = R(null), h = R(!1), u = R(1), l = R([1]), v = R(1), m = R(!1), C = R(1), x = R("landscape"), S = R(null), p = R(0), g = rt(
      () => r.value,
      (d) => {
        s("fullscreen-changed", d), requestAnimationFrame(() => {
          var P;
          (P = M.getInstance()) == null || P.update(), Y();
        }), d ? _() : fe(), !d && n.pinchZoom === "fullscreen" && b.reset();
      }
    ), k = g.isFullscreen, O = R(!1), { pdf: z, totalPages: f, loading: E, progress: I, error: w, load: F, teardown: L } = et(), b = ot(() => a.value, {
      maxZoom: () => n.maxZoom,
      allowZoom: () => n.pinchZoom !== !1 && (n.pinchZoom !== "fullscreen" || k.value),
      onChange: (d) => s("zoom-changed", d)
    }), M = at({
      onFlip(d) {
        m.value = !1, B(), C.value = d, D.updateWindow(u.value), s("page-changed", { page: u.value, totalPages: f.value });
      },
      onFlipStart(d, P) {
        m.value = !0, C.value = P, s("flip-start", {
          fromPage: Math.min(d, f.value),
          toPage: Math.min(P, f.value)
        });
      },
      onOrientationChange(d) {
        x.value = d, B(), D.updateWindow(u.value), s("orientation-changed", d);
      }
    });
    function B() {
      var H;
      const d = (H = M.getInstance()) == null ? void 0 : H.getCurrentSpread();
      if (!(d != null && d.length)) return;
      v.value = d[0];
      const P = d.filter((j) => j <= f.value);
      l.value = P.length ? P : [f.value], u.value = l.value[0];
    }
    const D = nt({
      renderScale: () => n.renderScale,
      renderRange: () => n.renderRange,
      onRendered: (d) => s("rendered", { page: d }),
      onError: (d, P) => s("error", P)
    });
    let Z = 0;
    async function J() {
      var ve;
      const d = ++Z;
      h.value = !1, O.value = !1, m.value = !1, b.reset(), D.reset(), M.destroy();
      const P = await F(n.src, {
        workerSrc: n.workerSrc,
        pdfOptions: n.pdfOptions
      });
      if (d !== Z) return;
      if (!P) {
        w.value && s("error", w.value);
        return;
      }
      const H = await P.getPage(1);
      if (d !== Z) return;
      const j = H.getViewport({ scale: 1 }), q = n.width, K = n.height ?? Math.round(q * (j.height / j.width)), $e = n.isVertical ?? j.height >= j.width, he = n.mode === "auto" && !$e ? "single" : n.mode;
      await Ve();
      const pe = c.value;
      if (d !== Z || !pe) return;
      const ge = n.showCover && he !== "single" && P.numPages % 2 === 1, Ye = await M.init(pe, {
        pageCount: P.numPages + (ge ? 1 : 0),
        trailingBlank: ge,
        pageWidth: q,
        pageHeight: K,
        startPage: n.startPage,
        mode: he,
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
        M.destroy();
        return;
      }
      D.setDocument(P), Ye.forEach((me, Ae) => {
        me.canvas && D.registerCanvas(Ae + 1, me.canvas);
      }), B(), C.value = u.value, S.value = { width: q, height: K }, x.value = ((ve = M.getInstance()) == null ? void 0 : ve.getOrientation()) ?? x.value, D.updateWindow(u.value), h.value = !0, requestAnimationFrame(() => {
        d === Z && (O.value = !0, Y());
      }), s("loaded", { totalPages: P.numPages, pdf: P });
    }
    function re() {
      Z++, h.value = !1, D.reset(), M.destroy(), L();
    }
    Ge(() => {
      g.listen(), b.listen(), J();
    }), He(() => {
      g.unlisten(), b.unlisten(), fe(), re();
    }), Ne(
      () => n.src,
      () => void J()
    );
    function U() {
      M.next();
    }
    function Q() {
      M.prev();
    }
    function ie(d) {
      M.goToPage(d);
    }
    async function o() {
      await J();
    }
    const y = V(() => !h.value || x.value !== "landscape" ? null : n.showCover && C.value <= 1 ? "-25%" : C.value >= f.value ? "25%" : null), X = V(() => {
      var d;
      return Math.max(0, ((d = n.flipOptions) == null ? void 0 : d.flippingTime) ?? 800);
    });
    function Y() {
      const d = r.value, P = a.value;
      if (!k.value || !d || !P || typeof getComputedStyle != "function") {
        p.value = 0;
        return;
      }
      const H = getComputedStyle(d);
      let j = d.clientHeight - parseFloat(H.paddingTop) - parseFloat(H.paddingBottom);
      for (const q of Array.from(d.children)) {
        if (q === P) continue;
        const K = getComputedStyle(q);
        K.position === "absolute" || K.position === "fixed" || (j -= q.getBoundingClientRect().height + parseFloat(K.marginTop) + parseFloat(K.marginBottom));
      }
      p.value = Number.isFinite(j) ? Math.max(0, j) : 0;
    }
    let A = null;
    function _() {
      A || typeof ResizeObserver > "u" || !r.value || (A = new ResizeObserver(() => Y()), A.observe(r.value));
    }
    function fe() {
      A == null || A.disconnect(), A = null, p.value = 0;
    }
    const Re = V(() => {
      const d = { position: "relative", width: "100%" };
      if (O.value && X.value > 0 && (d.transition = `transform ${X.value}ms ease`), y.value && (d.transform = `translateX(${y.value})`), k.value && S.value) {
        const H = (x.value === "landscape" ? 2 : 1) * S.value.width / S.value.height;
        d.maxWidth = p.value ? `min(100%, ${(p.value * H).toFixed(2)}px)` : `min(100%, calc((100vh - 6rem) * ${H}))`, d.marginLeft = "auto", d.marginRight = "auto";
      }
      return d;
    }), Ie = V(() => ({
      position: "relative",
      width: "100%",
      overflow: b.zoom.value > 1 ? "hidden" : "visible"
    })), We = V(
      () => h.value && !m.value && v.value === 1 && !k.value && b.zoom.value === 1 && Oe()
    ), ze = V(() => {
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
      return x.value === "portrait" ? (d.left = "0", d.width = "100%") : n.showCover ? (d.left = "50%", d.width = "50%") : (d.left = "0", d.width = "50%"), d;
    }), Be = V(
      () => k.value ? { display: "flex", flexDirection: "column", justifyContent: "center", overflow: "auto" } : void 0
    ), $ = V(() => ({
      currentPage: u.value,
      visiblePages: l.value,
      totalPages: f.value,
      next: U,
      prev: Q,
      goToPage: ie,
      canGoNext: u.value < f.value,
      canGoPrev: u.value > 1,
      isFullscreen: k.value,
      toggleFullscreen: () => void g.toggle(),
      zoom: b.zoom.value,
      setZoom: b.setZoom,
      resetZoom: b.reset
    }));
    return e({
      next: U,
      prev: Q,
      goToPage: ie,
      currentPage: le(u),
      totalPages: le(f),
      reload: o,
      isFullscreen: le(k),
      enterFullscreen: g.enter,
      exitFullscreen: g.exit,
      toggleFullscreen: g.toggle,
      getPdfDocument: () => z.value,
      getFlipInstance: () => M.getInstance(),
      zoom: le(b.zoom),
      setZoom: b.setZoom,
      resetZoom: b.reset
    }), (d, P) => (te(), ne("div", {
      ref_key: "rootRef",
      ref: r,
      class: T(["vpf-container", [i.containerClass, G(k) ? i.fullscreenClass : void 0]]),
      style: ae(Be.value),
      "data-fullscreen": G(k) ? "" : void 0,
      "data-controls-position": i.controlsPosition,
      "data-pdf-flipbook": ""
    }, [
      G(w) ? (te(), ne("div", {
        key: 0,
        class: T(["vpf-error", i.errorClass]),
        "data-pdf-flipbook-error": ""
      }, [
        ce(d.$slots, "error", {
          error: G(w),
          retry: o
        }, () => [
          N("div", null, "Failed to load PDF: " + ue(G(w).message), 1),
          N("button", {
            type: "button",
            class: T(["vpf-button", i.buttonClass]),
            onClick: o
          }, " Retry ", 2)
        ])
      ], 2)) : G(E) ? (te(), ne("div", {
        key: 1,
        class: T(["vpf-loading", i.loadingClass]),
        "data-pdf-flipbook-loading": ""
      }, [
        ce(d.$slots, "loading", { progress: G(I) }, () => [
          P[1] || (P[1] = N("div", null, "Loading…", -1))
        ])
      ], 2)) : oe("", !0),
      h.value && i.controlsPosition === "top" ? ce(d.$slots, "controls", ye(we({ key: 2 }, $.value)), () => [
        Ce(Ee, {
          "current-page": $.value.currentPage,
          "visible-pages": $.value.visiblePages,
          "total-pages": $.value.totalPages,
          "can-go-next": $.value.canGoNext,
          "can-go-prev": $.value.canGoPrev,
          "is-fullscreen": $.value.isFullscreen,
          "controls-class": i.controlsClass,
          "button-class": i.buttonClass,
          "page-indicator-class": i.pageIndicatorClass,
          onNext: U,
          onPrev: Q,
          onToggleFullscreen: $.value.toggleFullscreen
        }, null, 8, ["current-page", "visible-pages", "total-pages", "can-go-next", "can-go-prev", "is-fullscreen", "controls-class", "button-class", "page-indicator-class", "onToggleFullscreen"])
      ]) : oe("", !0),
      Te(N("div", {
        ref_key: "viewportRef",
        ref: a,
        class: "vpf-zoom-viewport",
        style: ae(Ie.value),
        "data-pdf-flipbook-viewport": ""
      }, [
        N("div", {
          class: "vpf-zoom-content",
          style: ae(G(b).contentStyle.value),
          "data-pdf-flipbook-zoom": ""
        }, [
          N("div", {
            class: "vpf-book-shell",
            style: ae(Re.value),
            "data-pdf-flipbook-shell": ""
          }, [
            N("div", {
              ref_key: "bookRef",
              ref: c,
              class: T(["vpf-book", i.bookClass]),
              "data-pdf-flipbook-book": ""
            }, null, 2),
            We.value ? (te(), ne("div", {
              key: 0,
              class: "vpf-fullscreen-hint",
              style: ae(ze.value),
              "data-pdf-flipbook-fullscreen-hint": ""
            }, [
              N("button", {
                type: "button",
                class: T(["vpf-button vpf-fullscreen-hint-button", i.buttonClass]),
                "data-pdf-flipbook-fullscreen-hint-button": "",
                onClick: P[0] || (P[0] = Ze((H) => void G(g).enter(), ["stop"]))
              }, " View in fullscreen ", 2)
            ], 4)) : oe("", !0)
          ], 4)
        ], 4)
      ], 4), [
        [je, !G(w) && !G(E)]
      ]),
      h.value && i.controlsPosition === "bottom" ? ce(d.$slots, "controls", ye(we({ key: 3 }, $.value)), () => [
        Ce(Ee, {
          "current-page": $.value.currentPage,
          "visible-pages": $.value.visiblePages,
          "total-pages": $.value.totalPages,
          "can-go-next": $.value.canGoNext,
          "can-go-prev": $.value.canGoPrev,
          "is-fullscreen": $.value.isFullscreen,
          "controls-class": i.controlsClass,
          "button-class": i.buttonClass,
          "page-indicator-class": i.pageIndicatorClass,
          onNext: U,
          onPrev: Q,
          onToggleFullscreen: $.value.toggleFullscreen
        }, null, 8, ["current-page", "visible-pages", "total-pages", "can-go-next", "can-go-prev", "is-fullscreen", "controls-class", "button-class", "page-indicator-class", "onToggleFullscreen"])
      ]) : oe("", !0)
    ], 14, dt));
  }
}), gt = {
  install(i, e) {
    e != null && e.workerSrc && qe(e.workerSrc), i.component("PdfFlipbook", ft);
  }
};
export {
  ft as PdfFlipbook,
  gt as default,
  qe as setGlobalWorkerSrc
};
