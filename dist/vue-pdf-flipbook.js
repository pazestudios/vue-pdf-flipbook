var Re = Object.defineProperty;
var We = (i, e, t) => e in i ? Re(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var W = (i, e, t) => We(i, typeof e != "symbol" ? e + "" : e, t);
import { shallowRef as ve, ref as z, computed as N, defineComponent as Se, openBlock as Q, createElementBlock as _, normalizeClass as Z, createElementVNode as G, toDisplayString as le, unref as D, createCommentVNode as ne, onMounted as ze, onBeforeUnmount as Be, watch as $e, readonly as re, normalizeStyle as te, renderSlot as oe, normalizeProps as me, mergeProps as be, createVNode as ye, withDirectives as Ye, withModifiers as De, vShow as Ae, nextTick as Xe } from "vue";
function ce() {
  return typeof window < "u" && typeof document < "u";
}
function we(i) {
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
function Ge() {
  if (!ce()) return;
  we(Map.prototype), we(WeakMap.prototype), typeof Math.sumPrecise != "function" && Object.defineProperty(Math, "sumPrecise", {
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
let Ee, Ce = !1;
function Ze(i) {
  Ee = i;
}
function Ne(i) {
  return `https://cdn.jsdelivr.net/npm/pdfjs-dist@${i.version}/build/pdf.worker.min.mjs`;
}
function Fe(i) {
  i.GlobalWorkerOptions.workerSrc = Ne(i), Ce || (Ce = !0, console.warn(
    '[vue-pdf-flipbook] Falling back to loading the pdf.js worker from jsdelivr. For offline or CSP-restricted environments, pass a `workerSrc` prop or plugin option (e.g. in Vite: `import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"`).'
  ));
}
async function He(i) {
  try {
    const e = await fetch(i, { method: "HEAD" });
    return e.ok ? (e.headers.get("content-type") ?? "").includes("javascript") : !1;
  } catch {
    return !1;
  }
}
async function Te(i, e) {
  if (!ce()) return !0;
  const t = e ?? Ee;
  if (t)
    return i.GlobalWorkerOptions.workerSrc = t, !0;
  if (i.GlobalWorkerOptions.workerSrc) return !0;
  const n = "pdfjs-dist/build/pdf.worker.min.mjs";
  try {
    const s = new URL(n, import.meta.url).toString();
    if (s.startsWith("http") && await He(s))
      return i.GlobalWorkerOptions.workerSrc = s, !1;
  } catch {
  }
  return Fe(i), !1;
}
function ke(i) {
  return typeof i == "string" || i instanceof URL ? { url: i.toString() } : i instanceof ArrayBuffer ? { data: new Uint8Array(i.slice(0)) } : { data: i.slice() };
}
function je(i) {
  const e = i instanceof Error ? i.message : String(i);
  return /worker/i.test(e) || /import/i.test(e);
}
function Ve() {
  const i = ve(null), e = z(0), t = z(!1), n = z(0), s = ve(null);
  let o = 0, a = null;
  async function c() {
    o++;
    const u = a, l = i.value;
    a = null, i.value = null, e.value = 0;
    try {
      u ? await u.destroy() : l && await l.destroy();
    } catch {
    }
  }
  async function h(u, l = {}) {
    if (!ce()) return null;
    t.value = !0, s.value = null, n.value = 0, await c();
    const v = o;
    try {
      Ge();
      const b = await import("pdfjs-dist"), C = await Te(b, l.workerSrc);
      if (v !== o) return null;
      const P = { ...ke(u), ...l.pdfOptions }, x = () => {
        const g = b.getDocument(P);
        return g.onProgress = (O) => {
          v === o && O.total > 0 && (n.value = Math.min(1, O.loaded / O.total));
        }, a = g, g.promise;
      };
      let p;
      try {
        p = await x();
      } catch (g) {
        if (C || !je(g)) throw g;
        Fe(b), Object.assign(P, ke(u)), p = await x();
      }
      return v !== o ? (p.destroy().catch(() => {
      }), null) : (i.value = p, e.value = p.numPages, p);
    } catch (b) {
      return v === o && (s.value = b instanceof Error ? b : new Error(String(b))), null;
    } finally {
      v === o && (t.value = !1);
    }
  }
  return { pdf: i, totalPages: e, loading: t, progress: n, error: s, load: h, teardown: c };
}
function Ue(i) {
  return i instanceof Error && i.name === "RenderingCancelledException";
}
function qe(i) {
  let e = null;
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
  let o = 1, a = null, c = !1;
  function h() {
    return Math.min(typeof window < "u" && window.devicePixelRatio || 1, 2);
  }
  function u() {
    const f = i.renderRange();
    return f === 1 / 0 ? 1 / 0 : Math.max(2, f * 2 + 1);
  }
  function l() {
    if (!e) return [];
    const f = e.numPages, L = u(), E = [];
    for (let k = 1; k <= f; k++)
      Math.abs(k - o) <= L && !n.has(k) && !s.has(k) && t.has(k) && E.push(k);
    return E.sort((k, M) => {
      const m = Math.abs(k - o), w = Math.abs(M - o);
      return m === w ? M - k : m - w;
    }), E;
  }
  function v() {
    const f = u();
    if (f !== 1 / 0) {
      for (const L of n)
        if (Math.abs(L - o) > f * 2) {
          const E = t.get(L);
          E && (E.width = 0, E.height = 0), n.delete(L);
        }
    }
  }
  async function b(f) {
    var M, m;
    if (!e) return;
    const L = t.get(f);
    if (!L) return;
    const E = e, k = { page: f, task: null, cancelled: !1 };
    a = k;
    try {
      const w = await E.getPage(f);
      if (k.cancelled || e !== E) return;
      const $ = w.getViewport({ scale: i.renderScale() * h() });
      if (L.width = Math.floor($.width), L.height = Math.floor($.height), k.task = w.render({ canvas: L, viewport: $ }), await k.task.promise, k.cancelled || e !== E) return;
      n.add(f), (M = i.onRendered) == null || M.call(i, f);
    } catch (w) {
      !Ue(w) && !k.cancelled && (s.add(f), (m = i.onError) == null || m.call(i, f, w instanceof Error ? w : new Error(String(w))));
    } finally {
      a === k && (a = null);
    }
  }
  function C() {
    return new Promise((f) => {
      typeof requestIdleCallback == "function" ? requestIdleCallback(() => f()) : setTimeout(f, 16);
    });
  }
  async function P() {
    if (!c) {
      c = !0;
      try {
        const f = i.renderRange() === 1 / 0;
        let L;
        for (; e && (L = l()[0]) !== void 0; )
          f && await C(), await b(L);
      } finally {
        c = !1;
      }
    }
  }
  function x() {
    var f;
    a && Math.abs(a.page - o) > u() && (a.cancelled = !0, (f = a.task) == null || f.cancel());
  }
  function p(f) {
    R(), e = f, n.clear(), s.clear();
  }
  function g(f, L) {
    t.set(f, L);
  }
  function O(f) {
    o = f, x(), v(), P();
  }
  function R() {
    var f;
    a && (a.cancelled = !0, (f = a.task) == null || f.cancel(), a = null);
  }
  function S() {
    R(), e = null, t.clear(), n.clear(), s.clear(), o = 1;
  }
  return {
    setDocument: p,
    registerCanvas: g,
    updateWindow: O,
    cancelAll: R,
    reset: S,
    isRendered: (f) => n.has(f)
  };
}
function J(i) {
  return `${+(i * 100).toFixed(2)}%`;
}
function Ke(i) {
  return i < 0.5 ? 2 * i * i : 1 - (-2 * i + 2) ** 2 / 2;
}
function Pe() {
  return typeof performance < "u" ? performance.now() : Date.now();
}
class ee {
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
      const n = e.clientX - t.x, s = e.clientY - t.y, o = this.opts.swipeDistance ?? 30;
      Math.abs(n) >= o && Math.abs(n) > Math.abs(s) && (this.suppressClick = !0, n < 0 ? this.flipNext() : this.flipPrev());
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
    for (const o of this.pages)
      o.style.display = "none", this.stage.appendChild(o);
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
    const o = e("vpf-page-bend vpf-page-bend-right");
    o.style.left = "50%", o.style.width = "50%";
    const a = e("vpf-cover-spine");
    a.style.width = "50%";
    for (const c of [n, s, o, a]) c.style.zIndex = "3";
    return this.stage.insertBefore(t, this.stage.firstChild), this.stage.append(n, s, o, a), { shadow: t, spine: n, bendLeft: s, bendRight: o, coverSpine: a };
  }
  /**
   * Shading that makes a page look like it bends down into the gutter:
   * a shadow that deepens toward the spine, then a faint highlight where the
   * paper crests back up. `k` scales the whole effect (0..1).
   */
  static bendGradient(e, t) {
    const n = (o) => (o * t).toFixed(3);
    return `linear-gradient(${e === "left" ? "to left" : "to right"}, rgba(0,0,0,${n(0.22)}) 0%, rgba(0,0,0,${n(0.06)}) 5%, rgba(255,255,255,${n(0.1)}) 8%, rgba(255,255,255,0) 16%)`;
  }
  /** Binding-edge shading for a closed book: dark crease, highlight, falloff. */
  static closedSpineGradient(e) {
    return `linear-gradient(${e}, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.1) 0.8%, rgba(255,255,255,0.1) 1.8%, rgba(0,0,0,0.05) 2.8%, rgba(0,0,0,0) 5%)`;
  }
  /** Bend gradient for one side of an open spread at `spreadIndex`. */
  bendFor(e, t) {
    const n = this.spreads.length, s = n > 1 ? e / (n - 1) : 0.5;
    return t === "left" ? ee.bendGradient("left", 1 - 0.65 * s) : ee.bendGradient("right", 0.35 + 0.65 * s);
  }
  /**
   * The gutter-side shading the page in `slot` shows once `spreadIndex` is at
   * rest: the page-bend gradient on an open spread, the binding crease on a
   * lone cover/back cover, or '' for an empty slot.
   */
  gutterShadingFor(e, t) {
    const { left: n, right: s } = this.slotPages(e);
    return n && s ? this.bendFor(e, t) : (t === "right" ? s : n) ? ee.closedSpineGradient(t === "right" ? "to right" : "to left") : "";
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
      const o = !!s;
      return t.shadowLeft = o ? 0.5 : 0, t.shadowWidth = 0.5, t.coverSpineOpacity = 1, t.coverSpineLeft = o ? 0.5 : 0, t.coverSpineBg = ee.closedSpineGradient(o ? "to right" : "to left"), t;
    }
    return t.shadowOpacity = 0, t;
  }
  applyChromeState(e) {
    const t = this.chrome;
    if (!t) return;
    const n = t.shadow.style;
    n.left = J(e.shadowLeft), n.width = J(e.shadowWidth), n.opacity = String(e.shadowOpacity), t.spine.style.opacity = String(e.spineOpacity), t.bendLeft.style.opacity = String(e.bendOpacity), t.bendRight.style.opacity = String(e.bendOpacity), t.bendLeft.style.background = e.bendLeftBg, t.bendRight.style.background = e.bendRightBg;
    const s = t.coverSpine.style;
    s.opacity = String(e.coverSpineOpacity), s.left = J(e.coverSpineLeft), s.background = e.coverSpineBg;
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
  stepChrome(e, t, n, s, o, a) {
    const c = this.chrome;
    if (!c) return;
    const h = Math.cos(Math.PI * a), u = 0.5 * Math.max(h, 0), l = 0.5 * Math.max(-h, 0), v = s ? 0.5 : n === 1 ? l : u, b = o ? 0.5 : n === 1 ? u : l, C = c.shadow.style;
    C.left = J(0.5 - v), C.width = J(v + b), C.opacity = String(e.shadowOpacity + (t.shadowOpacity - e.shadowOpacity) * a);
    const P = Math.max(0, 2 * a - 1), x = Math.max(0, 1 - 2 * a), p = (S, f) => String(f > S ? S + (f - S) * P : f + (S - f) * x), g = a >= 0.5;
    c.spine.style.opacity = p(e.spineOpacity, t.spineOpacity);
    const O = p(e.bendOpacity, t.bendOpacity);
    c.bendLeft.style.opacity = O, c.bendRight.style.opacity = O, c.bendLeft.style.background = g ? t.bendLeftBg : e.bendLeftBg, c.bendRight.style.background = g ? t.bendRightBg : e.bendRightBg;
    const R = c.coverSpine.style;
    R.opacity = p(e.coverSpineOpacity, t.coverSpineOpacity), R.left = J(g ? t.coverSpineLeft : e.coverSpineLeft), R.background = g ? t.coverSpineBg : e.coverSpineBg;
  }
  applyStageSize() {
    const { pageWidth: e, pageHeight: t } = this.opts, n = this.orientation === "landscape" ? 2 : 1, s = n * e / t, o = this.stage.style;
    if (o.aspectRatio = String(s), o.perspective = `${Math.round(n * e * 2.5)}px`, o.marginLeft = "auto", o.marginRight = "auto", this.opts.responsive === !1) {
      o.width = `${n * e}px`, o.maxWidth = "", o.minWidth = "";
      return;
    }
    o.width = "100%";
    const a = Math.min(
      (this.opts.maxWidth ?? e * 2) * n,
      (this.opts.maxHeight ?? t * 2) * s
    );
    o.maxWidth = `${Math.round(a)}px`;
    const c = Math.max((this.opts.minWidth ?? 0) * n, (this.opts.minHeight ?? 0) * s);
    o.minWidth = c > 0 ? `${Math.round(c)}px` : "";
  }
  /* --------------------------------------------------------------- flipping */
  flipToSpread(e) {
    var O, R, S, f, L, E, k;
    if (this.destroyed || this.anim || e < 0 || e >= this.spreads.length || e === this.spreadIndex) return;
    const t = e > this.spreadIndex ? 1 : -1, n = ((O = this.spreads[e]) == null ? void 0 : O[0]) ?? this.getCurrentPage();
    (S = (R = this.opts).onFlipStart) == null || S.call(R, this.getCurrentPage(), n);
    let s, o;
    const a = [];
    if (this.orientation === "portrait")
      s = (f = this.spreads[this.spreadIndex]) == null ? void 0 : f[0], o = (L = this.spreads[e]) == null ? void 0 : L[0];
    else {
      const M = this.slotPages(this.spreadIndex), m = this.slotPages(e);
      t === 1 ? (s = M.right, o = m.left, a.push({ page: M.left, slot: "left" }, { page: m.right, slot: "right" })) : (s = M.left, o = m.right, a.push({ page: M.right, slot: "right" }, { page: m.left, slot: "left" }));
    }
    const c = s ? this.pageEl(s) : void 0, h = o ? this.pageEl(o) : void 0;
    if (!c || !h) {
      this.spreadIndex = e, this.layout(), (k = (E = this.opts).onFlip) == null || k.call(E, this.getCurrentPage());
      return;
    }
    this.hideAll();
    for (const { page: M, slot: m } of a)
      M && this.showAt(M, m);
    let u = null;
    if (this.chrome)
      if (this.orientation === "portrait")
        this.updateChrome(e);
      else {
        const M = a.some((I) => I.page !== void 0 && I.slot === "left"), m = a.some((I) => I.page !== void 0 && I.slot === "right"), w = this.chromeStateFor(this.spreadIndex), $ = this.chromeStateFor(e);
        u = (I) => this.stepChrome(w, $, t, M, m, I);
      }
    const { leaf: l, shadows: v } = this.buildLeaf(t, c, h, e);
    this.stage.appendChild(l);
    const b = Math.max(0, this.opts.flippingTime ?? 800), C = t === 1 ? -180 : 180, P = this.opts.maxShadowOpacity ?? 0.4, x = Pe(), p = {
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
      var $;
      if (this.destroyed || this.anim !== p) return;
      const M = b === 0 ? 1 : Math.min(1, (Pe() - x) / b), m = Ke(M);
      l.style.transform = `rotateY(${C * m}deg)`, ($ = p.chrome) == null || $.call(p, m);
      const w = Math.sin(Math.PI * m) * P;
      for (const I of p.shadows) I.style.opacity = String(w);
      M < 1 ? p.raf = requestAnimationFrame(g) : this.finishFlip(p);
    };
    g();
  }
  buildLeaf(e, t, n, s) {
    const o = this.orientation === "landscape", a = document.createElement("div");
    a.className = "vpf-leaf";
    const c = a.style;
    c.position = "absolute", c.top = "0", c.height = "100%", c.width = o ? "50%" : "100%", c.left = o && e === 1 ? "50%" : "0", c.transformOrigin = o ? e === 1 ? "left center" : "right center" : "center center", c.transformStyle = "preserve-3d", c.zIndex = "10", c.pointerEvents = "none", c.willChange = "transform";
    const h = [], u = e === 1 ? "right" : "left", l = (v, b) => {
      const C = document.createElement("div"), P = C.style;
      P.position = "absolute", P.inset = "0", P.backfaceVisibility = "hidden", P.overflow = "hidden", b && (P.transform = "rotateY(180deg)");
      const x = v.style;
      if (x.display = "block", x.position = "absolute", x.top = "0", x.left = "0", x.width = "100%", x.height = "100%", C.appendChild(v), this.opts.drawShadow !== !1 && o) {
        const p = e === 1 !== b ? "right" : "left", g = this.gutterShadingFor(b ? s : this.spreadIndex, p);
        if (g) {
          const O = document.createElement("div");
          O.className = "vpf-leaf-bend";
          const R = O.style;
          R.position = "absolute", R.inset = "0", R.pointerEvents = "none", R.background = g, C.appendChild(O);
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
function Je(i) {
  const e = [];
  for (let t = 0; t < i.pageCount; t++) {
    const n = !!i.trailingBlank && t === i.pageCount - 1, s = document.createElement("div"), o = ["vpf-page"];
    n && o.push("vpf-page-blank"), i.pageClass && o.push(i.pageClass), s.className = o.join(" ");
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
function Qe(i) {
  let e = null, t = [], n = null;
  async function s(u, l) {
    return o(), n = u, t = Je(l), e = new ee(u, {
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
  function o() {
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
    destroy: o,
    next: a,
    prev: c,
    goToPage: h,
    getInstance: () => e,
    getPages: () => t
  };
}
function _e(i, e) {
  const t = z(1), n = z(0), s = z(0), o = N(() => t.value === 1 ? {} : {
    transform: `translate(${n.value}px, ${s.value}px) scale(${t.value})`,
    transformOrigin: "0 0",
    willChange: "transform"
  });
  let a = null, c = null, h = null, u = null, l = null, v = !1, b = null;
  const C = () => {
    var r;
    return e.maxZoom() > 1 && (((r = e.allowZoom) == null ? void 0 : r.call(e)) ?? !0);
  };
  function P(r) {
    return Math.min(Math.max(r, 1), Math.max(e.maxZoom(), 1));
  }
  function x() {
    a && (n.value = Math.min(0, Math.max(a.clientWidth * (1 - t.value), n.value)), s.value = Math.min(0, Math.max(a.clientHeight * (1 - t.value), s.value)));
  }
  function p(r, y, A) {
    var K;
    const X = P(r), j = t.value;
    X !== j && (n.value = y - (y - n.value) / j * X, s.value = A - (A - s.value) / j * X, t.value = X, X === 1 ? (n.value = 0, s.value = 0, u = null, l = null) : x(), S(), (K = e.onChange) == null || K.call(e, X));
  }
  function g(r, y) {
    n.value += r, s.value += y, x();
  }
  function O(r) {
    a && p(r, a.clientWidth / 2, a.clientHeight / 2);
  }
  function R() {
    var r;
    h = null, u = null, l = null, t.value !== 1 && (t.value = 1, n.value = 0, s.value = 0, S(), (r = e.onChange) == null || r.call(e, 1));
  }
  function S() {
    a && (a.style.touchAction = t.value > 1 ? "none" : "", a.style.cursor = t.value > 1 ? u ? "grabbing" : "grab" : "");
  }
  function f(r, y) {
    const A = a.getBoundingClientRect();
    return { x: r - A.left, y: y - A.top };
  }
  const L = (r) => {
    if (!a || !C()) return;
    const y = r.ctrlKey || r.metaKey, A = r.deltaMode === 1 ? r.deltaY * 16 : r.deltaY, X = P(t.value * Math.exp(-A * (y ? 0.01 : 22e-4)));
    if (X === t.value && !y) return;
    r.preventDefault();
    const { x: j, y: K } = f(r.clientX, r.clientY);
    p(X, j, K);
  }, E = (r) => Math.hypot(
    r[0].clientX - r[1].clientX,
    r[0].clientY - r[1].clientY
  ), k = (r) => f(
    (r[0].clientX + r[1].clientX) / 2,
    (r[0].clientY + r[1].clientY) / 2
  ), M = (r) => {
    if (C())
      if (r.touches.length === 2) {
        r.preventDefault(), u = null, l = null;
        const y = k(r.touches);
        h = {
          startDist: E(r.touches),
          startZoom: t.value,
          lastMidX: y.x,
          lastMidY: y.y
        };
      } else r.touches.length === 1 && t.value > 1 && (l = { lastX: r.touches[0].clientX, lastY: r.touches[0].clientY });
  }, m = (r) => {
    if (h && r.touches.length >= 2) {
      r.preventDefault();
      const y = k(r.touches);
      g(y.x - h.lastMidX, y.y - h.lastMidY), h.lastMidX = y.x, h.lastMidY = y.y, p(h.startZoom * E(r.touches) / h.startDist, y.x, y.y);
    } else if (l && r.touches.length === 1 && t.value > 1) {
      r.preventDefault();
      const y = r.touches[0];
      g(y.clientX - l.lastX, y.clientY - l.lastY), l.lastX = y.clientX, l.lastY = y.clientY;
    }
  }, w = (r) => {
    h && r.touches.length < 2 && (h = null, v = !0), r.touches.length === 1 && t.value > 1 ? l = { lastX: r.touches[0].clientX, lastY: r.touches[0].clientY } : l = null;
  }, $ = (r) => {
    var y;
    v = !1, !(t.value <= 1) && (r.stopPropagation(), r.pointerType !== "touch" && (u = { pointerId: r.pointerId, lastX: r.clientX, lastY: r.clientY }, (y = a == null ? void 0 : a.setPointerCapture) == null || y.call(a, r.pointerId)), S());
  }, I = (r) => {
    !u || r.pointerId !== u.pointerId || h || (g(r.clientX - u.lastX, r.clientY - u.lastY), u.lastX = r.clientX, u.lastY = r.clientY);
  }, Y = (r) => {
    (t.value > 1 || h) && r.stopPropagation(), u && r.pointerId === u.pointerId && (u = null, S());
  }, U = (r) => {
    (t.value > 1 || v) && (v = !1, r.stopPropagation(), r.preventDefault());
  }, se = (r) => {
    C() && (r.preventDefault(), b = t.value);
  }, H = (r) => {
    if (!C() || (r.preventDefault(), h || b === null)) return;
    const { x: y, y: A } = f(r.clientX, r.clientY);
    p(b * r.scale, y, A);
  }, T = (r) => {
    r.preventDefault(), b = null;
  };
  function ie() {
    q(), a = i(), a && (a.addEventListener("wheel", L, { passive: !1 }), a.addEventListener("touchstart", M, { passive: !1 }), a.addEventListener("touchmove", m, { passive: !1 }), a.addEventListener("touchend", w), a.addEventListener("touchcancel", w), a.addEventListener("pointerdown", $, { capture: !0 }), a.addEventListener("pointermove", I), a.addEventListener("pointerup", Y, { capture: !0 }), a.addEventListener("pointercancel", Y, { capture: !0 }), a.addEventListener("click", U, { capture: !0 }), a.addEventListener("gesturestart", se, { passive: !1 }), a.addEventListener("gesturechange", H, { passive: !1 }), a.addEventListener("gestureend", T, { passive: !1 }), typeof ResizeObserver < "u" && (c = new ResizeObserver(() => x()), c.observe(a)));
  }
  function q() {
    a && (a.removeEventListener("wheel", L), a.removeEventListener("touchstart", M), a.removeEventListener("touchmove", m), a.removeEventListener("touchend", w), a.removeEventListener("touchcancel", w), a.removeEventListener("pointerdown", $, { capture: !0 }), a.removeEventListener("pointermove", I), a.removeEventListener("pointerup", Y, { capture: !0 }), a.removeEventListener("pointercancel", Y, { capture: !0 }), a.removeEventListener("click", U, { capture: !0 }), a.removeEventListener("gesturestart", se), a.removeEventListener("gesturechange", H), a.removeEventListener("gestureend", T), c == null || c.disconnect(), c = null, h = null, u = null, l = null, a = null);
  }
  return { zoom: t, contentStyle: o, setZoom: O, reset: R, listen: ie, unlisten: q };
}
function Le() {
  if (!ce()) return !1;
  const i = document;
  return !!(i.fullscreenEnabled ?? i.webkitFullscreenEnabled);
}
function et(i, e) {
  const t = z(!1);
  function n() {
    const l = document;
    return l.fullscreenElement ?? l.webkitFullscreenElement ?? null;
  }
  function s() {
    const l = i(), v = l !== null && n() === l;
    v !== t.value && (t.value = v, e == null || e(v));
  }
  function o() {
    document.addEventListener("fullscreenchange", s), document.addEventListener("webkitfullscreenchange", s);
  }
  function a() {
    document.removeEventListener("fullscreenchange", s), document.removeEventListener("webkitfullscreenchange", s);
  }
  async function c() {
    var v, b;
    const l = i();
    if (!(!l || t.value))
      try {
        await (((v = l.requestFullscreen) == null ? void 0 : v.call(l)) ?? ((b = l.webkitRequestFullscreen) == null ? void 0 : b.call(l)));
      } catch {
      }
  }
  async function h() {
    var v, b;
    if (!n()) return;
    const l = document;
    try {
      await (((v = l.exitFullscreen) == null ? void 0 : v.call(l)) ?? ((b = l.webkitExitFullscreen) == null ? void 0 : b.call(l)));
    } catch {
    }
  }
  async function u() {
    t.value ? await h() : await c();
  }
  return { isFullscreen: t, enter: c, exit: h, toggle: u, listen: o, unlisten: a };
}
const tt = ["disabled"], nt = ["disabled"], st = ["aria-label"], xe = /* @__PURE__ */ Se({
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
    const e = i, t = Le(), n = N(() => {
      var o;
      const s = (o = e.visiblePages) != null && o.length ? e.visiblePages : [e.currentPage];
      return s.length >= 2 ? `${s[0]}–${s[s.length - 1]}` : String(s[0] ?? e.currentPage);
    });
    return (s, o) => (Q(), _("div", {
      class: Z(["vpf-controls", i.controlsClass]),
      "data-pdf-flipbook-controls": ""
    }, [
      G("button", {
        type: "button",
        class: Z(["vpf-button", i.buttonClass]),
        disabled: !i.canGoPrev,
        "aria-label": "Previous page",
        "data-pdf-flipbook-prev": "",
        onClick: o[0] || (o[0] = (a) => s.$emit("prev"))
      }, " ‹ ", 10, tt),
      G("span", {
        class: Z(["vpf-indicator", i.pageIndicatorClass]),
        "data-pdf-flipbook-indicator": ""
      }, le(n.value) + " / " + le(i.totalPages), 3),
      G("button", {
        type: "button",
        class: Z(["vpf-button", i.buttonClass]),
        disabled: !i.canGoNext,
        "aria-label": "Next page",
        "data-pdf-flipbook-next": "",
        onClick: o[1] || (o[1] = (a) => s.$emit("next"))
      }, " › ", 10, nt),
      D(t) ? (Q(), _("button", {
        key: 0,
        type: "button",
        class: Z(["vpf-button", i.buttonClass]),
        "aria-label": i.isFullscreen ? "Exit full screen" : "Enter full screen",
        "data-pdf-flipbook-fullscreen": "",
        onClick: o[2] || (o[2] = (a) => s.$emit("toggle-fullscreen"))
      }, le(i.isFullscreen ? "⤡" : "⤢"), 11, st)) : ne("", !0)
    ], 2));
  }
}), it = ["data-fullscreen", "data-controls-position"], at = /* @__PURE__ */ Se({
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
    const n = i, s = t, o = z(null), a = z(null), c = z(null), h = z(!1), u = z(1), l = z([1]), v = z(1), b = z(!1), C = z(1), P = z("landscape"), x = z(null), p = et(
      () => o.value,
      (d) => {
        s("fullscreen-changed", d), requestAnimationFrame(() => {
          var F;
          return (F = w.getInstance()) == null ? void 0 : F.update();
        }), !d && n.pinchZoom === "fullscreen" && m.reset();
      }
    ), g = p.isFullscreen, O = z(!1), { pdf: R, totalPages: S, loading: f, progress: L, error: E, load: k, teardown: M } = Ve(), m = _e(() => a.value, {
      maxZoom: () => n.maxZoom,
      allowZoom: () => n.pinchZoom !== !1 && (n.pinchZoom !== "fullscreen" || g.value),
      onChange: (d) => s("zoom-changed", d)
    }), w = Qe({
      onFlip(d) {
        b.value = !1, $(), C.value = d, I.updateWindow(u.value), s("page-changed", { page: u.value, totalPages: S.value });
      },
      onFlipStart(d, F) {
        b.value = !0, C.value = F, s("flip-start", {
          fromPage: Math.min(d, S.value),
          toPage: Math.min(F, S.value)
        });
      },
      onOrientationChange(d) {
        P.value = d, $(), I.updateWindow(u.value), s("orientation-changed", d);
      }
    });
    function $() {
      var V;
      const d = (V = w.getInstance()) == null ? void 0 : V.getCurrentSpread();
      if (!(d != null && d.length)) return;
      v.value = d[0];
      const F = d.filter((ae) => ae <= S.value);
      l.value = F.length ? F : [S.value], u.value = l.value[0];
    }
    const I = qe({
      renderScale: () => n.renderScale,
      renderRange: () => n.renderRange,
      onRendered: (d) => s("rendered", { page: d }),
      onError: (d, F) => s("error", F)
    });
    let Y = 0;
    async function U() {
      var pe;
      const d = ++Y;
      h.value = !1, O.value = !1, b.value = !1, m.reset(), I.reset(), w.destroy();
      const F = await k(n.src, {
        workerSrc: n.workerSrc,
        pdfOptions: n.pdfOptions
      });
      if (d !== Y) return;
      if (!F) {
        E.value && s("error", E.value);
        return;
      }
      const V = await F.getPage(1);
      if (d !== Y) return;
      const ae = V.getViewport({ scale: 1 }), ue = n.width, de = n.height ?? Math.round(ue * (ae.height / ae.width));
      await Xe();
      const fe = c.value;
      if (d !== Y || !fe) return;
      const he = n.showCover && F.numPages % 2 === 1, Oe = await w.init(fe, {
        pageCount: F.numPages + (he ? 1 : 0),
        trailingBlank: he,
        pageWidth: ue,
        pageHeight: de,
        startPage: n.startPage,
        mode: n.mode,
        showCover: n.showCover,
        responsive: n.responsive,
        minWidth: n.minWidth,
        maxWidth: n.maxWidth,
        minHeight: n.minHeight,
        maxHeight: n.maxHeight,
        flipOptions: n.flipOptions,
        pageClass: n.pageClass
      });
      if (d !== Y) {
        w.destroy();
        return;
      }
      I.setDocument(F), Oe.forEach((ge, Ie) => {
        ge.canvas && I.registerCanvas(Ie + 1, ge.canvas);
      }), $(), C.value = u.value, x.value = { width: ue, height: de }, P.value = ((pe = w.getInstance()) == null ? void 0 : pe.getOrientation()) ?? P.value, I.updateWindow(u.value), h.value = !0, requestAnimationFrame(() => {
        d === Y && (O.value = !0);
      }), s("loaded", { totalPages: F.numPages, pdf: F });
    }
    function se() {
      Y++, h.value = !1, I.reset(), w.destroy(), M();
    }
    ze(() => {
      p.listen(), m.listen(), U();
    }), Be(() => {
      p.unlisten(), m.unlisten(), se();
    }), $e(
      () => n.src,
      () => void U()
    );
    function H() {
      w.next();
    }
    function T() {
      w.prev();
    }
    function ie(d) {
      w.goToPage(d);
    }
    async function q() {
      await U();
    }
    const r = N(() => !h.value || P.value !== "landscape" ? null : n.showCover && C.value <= 1 ? "-25%" : C.value >= S.value ? "25%" : null), y = N(() => {
      var d;
      return Math.max(0, ((d = n.flipOptions) == null ? void 0 : d.flippingTime) ?? 800);
    }), A = N(() => {
      const d = { position: "relative", width: "100%" };
      if (O.value && y.value > 0 && (d.transition = `transform ${y.value}ms ease`), r.value && (d.transform = `translateX(${r.value})`), g.value && x.value) {
        const V = (P.value === "landscape" ? 2 : 1) * x.value.width / x.value.height;
        d.maxWidth = `min(100%, calc((100vh - 6rem) * ${V}))`, d.marginLeft = "auto", d.marginRight = "auto";
      }
      return d;
    }), X = N(() => ({
      position: "relative",
      width: "100%",
      overflow: m.zoom.value > 1 ? "hidden" : "visible"
    })), j = N(
      () => h.value && !b.value && v.value === 1 && !g.value && m.zoom.value === 1 && Le()
    ), K = N(() => {
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
      return P.value === "portrait" ? (d.left = "0", d.width = "100%") : n.showCover ? (d.left = "50%", d.width = "50%") : (d.left = "0", d.width = "50%"), d;
    }), Me = N(
      () => g.value ? { display: "flex", flexDirection: "column", justifyContent: "center", overflow: "auto" } : void 0
    ), B = N(() => ({
      currentPage: u.value,
      visiblePages: l.value,
      totalPages: S.value,
      next: H,
      prev: T,
      goToPage: ie,
      canGoNext: u.value < S.value,
      canGoPrev: u.value > 1,
      isFullscreen: g.value,
      toggleFullscreen: () => void p.toggle(),
      zoom: m.zoom.value,
      setZoom: m.setZoom,
      resetZoom: m.reset
    }));
    return e({
      next: H,
      prev: T,
      goToPage: ie,
      currentPage: re(u),
      totalPages: re(S),
      reload: q,
      isFullscreen: re(g),
      enterFullscreen: p.enter,
      exitFullscreen: p.exit,
      toggleFullscreen: p.toggle,
      getPdfDocument: () => R.value,
      getFlipInstance: () => w.getInstance(),
      zoom: re(m.zoom),
      setZoom: m.setZoom,
      resetZoom: m.reset
    }), (d, F) => (Q(), _("div", {
      ref_key: "rootRef",
      ref: o,
      class: Z(["vpf-container", [i.containerClass, D(g) ? i.fullscreenClass : void 0]]),
      style: te(Me.value),
      "data-fullscreen": D(g) ? "" : void 0,
      "data-controls-position": i.controlsPosition,
      "data-pdf-flipbook": ""
    }, [
      D(E) ? (Q(), _("div", {
        key: 0,
        class: Z(["vpf-error", i.errorClass]),
        "data-pdf-flipbook-error": ""
      }, [
        oe(d.$slots, "error", {
          error: D(E),
          retry: q
        }, () => [
          G("div", null, "Failed to load PDF: " + le(D(E).message), 1),
          G("button", {
            type: "button",
            class: Z(["vpf-button", i.buttonClass]),
            onClick: q
          }, " Retry ", 2)
        ])
      ], 2)) : D(f) ? (Q(), _("div", {
        key: 1,
        class: Z(["vpf-loading", i.loadingClass]),
        "data-pdf-flipbook-loading": ""
      }, [
        oe(d.$slots, "loading", { progress: D(L) }, () => [
          F[1] || (F[1] = G("div", null, "Loading…", -1))
        ])
      ], 2)) : ne("", !0),
      h.value && i.controlsPosition === "top" ? oe(d.$slots, "controls", me(be({ key: 2 }, B.value)), () => [
        ye(xe, {
          "current-page": B.value.currentPage,
          "visible-pages": B.value.visiblePages,
          "total-pages": B.value.totalPages,
          "can-go-next": B.value.canGoNext,
          "can-go-prev": B.value.canGoPrev,
          "is-fullscreen": B.value.isFullscreen,
          "controls-class": i.controlsClass,
          "button-class": i.buttonClass,
          "page-indicator-class": i.pageIndicatorClass,
          onNext: H,
          onPrev: T,
          onToggleFullscreen: B.value.toggleFullscreen
        }, null, 8, ["current-page", "visible-pages", "total-pages", "can-go-next", "can-go-prev", "is-fullscreen", "controls-class", "button-class", "page-indicator-class", "onToggleFullscreen"])
      ]) : ne("", !0),
      Ye(G("div", {
        ref_key: "viewportRef",
        ref: a,
        class: "vpf-zoom-viewport",
        style: te(X.value),
        "data-pdf-flipbook-viewport": ""
      }, [
        G("div", {
          class: "vpf-zoom-content",
          style: te(D(m).contentStyle.value),
          "data-pdf-flipbook-zoom": ""
        }, [
          G("div", {
            class: "vpf-book-shell",
            style: te(A.value),
            "data-pdf-flipbook-shell": ""
          }, [
            G("div", {
              ref_key: "bookRef",
              ref: c,
              class: Z(["vpf-book", i.bookClass]),
              "data-pdf-flipbook-book": ""
            }, null, 2),
            j.value ? (Q(), _("div", {
              key: 0,
              class: "vpf-fullscreen-hint",
              style: te(K.value),
              "data-pdf-flipbook-fullscreen-hint": ""
            }, [
              G("button", {
                type: "button",
                class: Z(["vpf-button vpf-fullscreen-hint-button", i.buttonClass]),
                "data-pdf-flipbook-fullscreen-hint-button": "",
                onClick: F[0] || (F[0] = De((V) => void D(p).enter(), ["stop"]))
              }, " View in fullscreen ", 2)
            ], 4)) : ne("", !0)
          ], 4)
        ], 4)
      ], 4), [
        [Ae, !D(E) && !D(f)]
      ]),
      h.value && i.controlsPosition === "bottom" ? oe(d.$slots, "controls", me(be({ key: 3 }, B.value)), () => [
        ye(xe, {
          "current-page": B.value.currentPage,
          "visible-pages": B.value.visiblePages,
          "total-pages": B.value.totalPages,
          "can-go-next": B.value.canGoNext,
          "can-go-prev": B.value.canGoPrev,
          "is-fullscreen": B.value.isFullscreen,
          "controls-class": i.controlsClass,
          "button-class": i.buttonClass,
          "page-indicator-class": i.pageIndicatorClass,
          onNext: H,
          onPrev: T,
          onToggleFullscreen: B.value.toggleFullscreen
        }, null, 8, ["current-page", "visible-pages", "total-pages", "can-go-next", "can-go-prev", "is-fullscreen", "controls-class", "button-class", "page-indicator-class", "onToggleFullscreen"])
      ]) : ne("", !0)
    ], 14, it));
  }
}), lt = {
  install(i, e) {
    e != null && e.workerSrc && Ze(e.workerSrc), i.component("PdfFlipbook", at);
  }
};
export {
  at as PdfFlipbook,
  lt as default,
  Ze as setGlobalWorkerSrc
};
