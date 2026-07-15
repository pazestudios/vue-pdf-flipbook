var Me = Object.defineProperty;
var Oe = (s, e, t) => e in s ? Me(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var W = (s, e, t) => Oe(s, typeof e != "symbol" ? e + "" : e, t);
import { shallowRef as fe, ref as z, computed as N, defineComponent as xe, openBlock as q, createElementBlock as K, normalizeClass as G, createElementVNode as X, toDisplayString as re, unref as Y, createCommentVNode as te, onMounted as Ie, onBeforeUnmount as Re, watch as We, readonly as ie, normalizeStyle as ee, renderSlot as ae, normalizeProps as pe, mergeProps as ge, createVNode as ve, withDirectives as ze, withModifiers as $e, vShow as Be, nextTick as Ye } from "vue";
function oe() {
  return typeof window < "u" && typeof document < "u";
}
function me(s) {
  typeof s.getOrInsertComputed != "function" && Object.defineProperty(s, "getOrInsertComputed", {
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
function De() {
  if (!oe()) return;
  me(Map.prototype), me(WeakMap.prototype), typeof Math.sumPrecise != "function" && Object.defineProperty(Math, "sumPrecise", {
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
let Pe, be = !1;
function Ae(s) {
  Pe = s;
}
function Xe(s) {
  return `https://cdn.jsdelivr.net/npm/pdfjs-dist@${s.version}/build/pdf.worker.min.mjs`;
}
function ke(s) {
  s.GlobalWorkerOptions.workerSrc = Xe(s), be || (be = !0, console.warn(
    '[vue-pdf-flipbook] Falling back to loading the pdf.js worker from jsdelivr. For offline or CSP-restricted environments, pass a `workerSrc` prop or plugin option (e.g. in Vite: `import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"`).'
  ));
}
async function Ge(s) {
  try {
    const e = await fetch(s, { method: "HEAD" });
    return e.ok ? (e.headers.get("content-type") ?? "").includes("javascript") : !1;
  } catch {
    return !1;
  }
}
async function Ne(s, e) {
  if (!oe()) return !0;
  const t = e ?? Pe;
  if (t)
    return s.GlobalWorkerOptions.workerSrc = t, !0;
  if (s.GlobalWorkerOptions.workerSrc) return !0;
  const n = "pdfjs-dist/build/pdf.worker.min.mjs";
  try {
    const i = new URL(n, import.meta.url).toString();
    if (i.startsWith("http") && await Ge(i))
      return s.GlobalWorkerOptions.workerSrc = i, !1;
  } catch {
  }
  return ke(s), !1;
}
function ye(s) {
  return typeof s == "string" || s instanceof URL ? { url: s.toString() } : s instanceof ArrayBuffer ? { data: new Uint8Array(s.slice(0)) } : { data: s.slice() };
}
function He(s) {
  const e = s instanceof Error ? s.message : String(s);
  return /worker/i.test(e) || /import/i.test(e);
}
function Te() {
  const s = fe(null), e = z(0), t = z(!1), n = z(0), i = fe(null);
  let r = 0, a = null;
  async function d() {
    r++;
    const c = a, l = s.value;
    a = null, s.value = null, e.value = 0;
    try {
      c ? await c.destroy() : l && await l.destroy();
    } catch {
    }
  }
  async function f(c, l = {}) {
    if (!oe()) return null;
    t.value = !0, i.value = null, n.value = 0, await d();
    const p = r;
    try {
      De();
      const v = await import("pdfjs-dist"), P = await Ne(v, l.workerSrc);
      if (p !== r) return null;
      const k = { ...ye(c), ...l.pdfOptions }, C = () => {
        const y = v.getDocument(k);
        return y.onProgress = (E) => {
          p === r && E.total > 0 && (n.value = Math.min(1, E.loaded / E.total));
        }, a = y, y.promise;
      };
      let m;
      try {
        m = await C();
      } catch (y) {
        if (P || !He(y)) throw y;
        ke(v), Object.assign(k, ye(c)), m = await C();
      }
      return p !== r ? (m.destroy().catch(() => {
      }), null) : (s.value = m, e.value = m.numPages, m);
    } catch (v) {
      return p === r && (i.value = v instanceof Error ? v : new Error(String(v))), null;
    } finally {
      p === r && (t.value = !1);
    }
  }
  return { pdf: s, totalPages: e, loading: t, progress: n, error: i, load: f, teardown: d };
}
function Ze(s) {
  return s instanceof Error && s.name === "RenderingCancelledException";
}
function je(s) {
  let e = null;
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
  let r = 1, a = null, d = !1;
  function f() {
    return Math.min(typeof window < "u" && window.devicePixelRatio || 1, 2);
  }
  function c() {
    const u = s.renderRange();
    return u === 1 / 0 ? 1 / 0 : Math.max(2, u * 2 + 1);
  }
  function l() {
    if (!e) return [];
    const u = e.numPages, F = c(), I = [];
    for (let g = 1; g <= u; g++)
      Math.abs(g - r) <= F && !n.has(g) && !i.has(g) && t.has(g) && I.push(g);
    return I.sort((g, b) => {
      const S = Math.abs(g - r), x = Math.abs(b - r);
      return S === x ? b - g : S - x;
    }), I;
  }
  function p() {
    const u = c();
    if (u !== 1 / 0) {
      for (const F of n)
        if (Math.abs(F - r) > u * 2) {
          const I = t.get(F);
          I && (I.width = 0, I.height = 0), n.delete(F);
        }
    }
  }
  async function v(u) {
    var b, S;
    if (!e) return;
    const F = t.get(u);
    if (!F) return;
    const I = e, g = { page: u, task: null, cancelled: !1 };
    a = g;
    try {
      const x = await I.getPage(u);
      if (g.cancelled || e !== I) return;
      const R = x.getViewport({ scale: s.renderScale() * f() });
      if (F.width = Math.floor(R.width), F.height = Math.floor(R.height), g.task = x.render({ canvas: F, viewport: R }), await g.task.promise, g.cancelled || e !== I) return;
      n.add(u), (b = s.onRendered) == null || b.call(s, u);
    } catch (x) {
      !Ze(x) && !g.cancelled && (i.add(u), (S = s.onError) == null || S.call(s, u, x instanceof Error ? x : new Error(String(x))));
    } finally {
      a === g && (a = null);
    }
  }
  function P() {
    return new Promise((u) => {
      typeof requestIdleCallback == "function" ? requestIdleCallback(() => u()) : setTimeout(u, 16);
    });
  }
  async function k() {
    if (!d) {
      d = !0;
      try {
        const u = s.renderRange() === 1 / 0;
        let F;
        for (; e && (F = l()[0]) !== void 0; )
          u && await P(), await v(F);
      } finally {
        d = !1;
      }
    }
  }
  function C() {
    var u;
    a && Math.abs(a.page - r) > c() && (a.cancelled = !0, (u = a.task) == null || u.cancel());
  }
  function m(u) {
    O(), e = u, n.clear(), i.clear();
  }
  function y(u, F) {
    t.set(u, F);
  }
  function E(u) {
    r = u, C(), p(), k();
  }
  function O() {
    var u;
    a && (a.cancelled = !0, (u = a.task) == null || u.cancel(), a = null);
  }
  function $() {
    O(), e = null, t.clear(), n.clear(), i.clear(), r = 1;
  }
  return {
    setDocument: m,
    registerCanvas: y,
    updateWindow: E,
    cancelAll: O,
    reset: $,
    isRendered: (u) => n.has(u)
  };
}
function U(s) {
  return `${+(s * 100).toFixed(2)}%`;
}
function Ve(s) {
  return s < 0.5 ? 2 * s * s : 1 - (-2 * s + 2) ** 2 / 2;
}
function we() {
  return typeof performance < "u" ? performance.now() : Date.now();
}
class J {
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
      var n, i;
      if (this.destroyed) return;
      const e = this.detectOrientation();
      if (e === this.orientation) return;
      this.anim && this.finishFlip(this.anim);
      const t = this.getCurrentPage();
      this.orientation = e, this.applyStageSize(), this.spreads = this.computeSpreads(), this.spreadIndex = this.spreadIndexForPage(t), this.layout(), (i = (n = this.opts).onOrientationChange) == null || i.call(n, e);
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
      const n = e.clientX - t.x, i = e.clientY - t.y, r = this.opts.swipeDistance ?? 30;
      Math.abs(n) >= r && Math.abs(n) > Math.abs(i) && (this.suppressClick = !0, n < 0 ? this.flipNext() : this.flipPrev());
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
    const i = this.clampPage(t.startPage ?? 1);
    this.spreadIndex = this.spreadIndexForPage(i), this.layout(), t.useMouseEvents !== !1 && (this.stage.addEventListener("pointerdown", this.handlePointerDown), this.stage.addEventListener("pointerup", this.handlePointerUp), this.stage.addEventListener("click", this.handleClick)), typeof ResizeObserver < "u" ? (this.resizeObserver = new ResizeObserver(this.handleResize), this.resizeObserver.observe(e)) : typeof window < "u" && (this.usesWindowResize = !0, window.addEventListener("resize", this.handleResize));
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
  clampPage(e) {
    return Math.min(Math.max(e, 1), Math.max(this.pages.length, 1));
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
    const e = this.pages.length, t = [];
    if (this.orientation === "portrait") {
      for (let i = 1; i <= e; i++) t.push([i]);
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
    const i = n.style;
    i.display = "block", i.position = "absolute", i.top = "0", i.height = "100%", t === "full" ? (i.left = "0", i.width = "100%") : (i.width = "50%", i.left = t === "left" ? "0" : "50%");
  }
  hideAll() {
    for (const e of this.pages) e.style.display = "none";
  }
  layout() {
    var n;
    if (this.hideAll(), this.orientation === "portrait") {
      const i = (n = this.spreads[this.spreadIndex]) == null ? void 0 : n[0];
      i && this.showAt(i, "full"), this.updateChrome(this.spreadIndex);
      return;
    }
    const { left: e, right: t } = this.slotPages(this.spreadIndex);
    e && this.showAt(e, "left"), t && this.showAt(t, "right"), this.updateChrome(this.spreadIndex);
  }
  /* ------------------------------------------------------------ book chrome */
  buildChrome() {
    const e = (d) => {
      const f = document.createElement("div");
      f.className = d;
      const c = f.style;
      return c.position = "absolute", c.top = "0", c.height = "100%", c.pointerEvents = "none", c.opacity = "0", f;
    }, t = e("vpf-book-shadow");
    t.style.boxShadow = [
      "0 0 4px rgba(0, 0, 0, 0.12)",
      "0 4px 10px rgba(0, 0, 0, 0.16)",
      "0 14px 28px rgba(0, 0, 0, 0.2)",
      "0 28px 56px rgba(0, 0, 0, 0.16)"
    ].join(", ");
    const n = e("vpf-book-spine");
    n.style.left = "47%", n.style.width = "6%", n.style.background = "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.14) 35%, rgba(0,0,0,0.28) 50%, rgba(0,0,0,0.14) 65%, rgba(0,0,0,0) 100%)";
    const i = e("vpf-page-bend vpf-page-bend-left");
    i.style.left = "0", i.style.width = "50%";
    const r = e("vpf-page-bend vpf-page-bend-right");
    r.style.left = "50%", r.style.width = "50%";
    const a = e("vpf-cover-spine");
    a.style.width = "50%";
    for (const d of [n, i, r, a]) d.style.zIndex = "3";
    return this.stage.insertBefore(t, this.stage.firstChild), this.stage.append(n, i, r, a), { shadow: t, spine: n, bendLeft: i, bendRight: r, coverSpine: a };
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
    const n = this.spreads.length, i = n > 1 ? e / (n - 1) : 0.5;
    return t === "left" ? J.bendGradient("left", 1 - 0.65 * i) : J.bendGradient("right", 0.35 + 0.65 * i);
  }
  /**
   * The gutter-side shading the page in `slot` shows once `spreadIndex` is at
   * rest: the page-bend gradient on an open spread, the binding crease on a
   * lone cover/back cover, or '' for an empty slot.
   */
  gutterShadingFor(e, t) {
    const { left: n, right: i } = this.slotPages(e);
    return n && i ? this.bendFor(e, t) : (t === "right" ? i : n) ? J.closedSpineGradient(t === "right" ? "to right" : "to left") : "";
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
    const { left: n, right: i } = this.slotPages(e);
    if (n && i)
      return t.spineOpacity = 1, t.bendOpacity = 1, t.bendLeftBg = this.bendFor(e, "left"), t.bendRightBg = this.bendFor(e, "right"), t;
    if (n || i) {
      const r = !!i;
      return t.shadowLeft = r ? 0.5 : 0, t.shadowWidth = 0.5, t.coverSpineOpacity = 1, t.coverSpineLeft = r ? 0.5 : 0, t.coverSpineBg = J.closedSpineGradient(r ? "to right" : "to left"), t;
    }
    return t.shadowOpacity = 0, t;
  }
  applyChromeState(e) {
    const t = this.chrome;
    if (!t) return;
    const n = t.shadow.style;
    n.left = U(e.shadowLeft), n.width = U(e.shadowWidth), n.opacity = String(e.shadowOpacity), t.spine.style.opacity = String(e.spineOpacity), t.bendLeft.style.opacity = String(e.bendOpacity), t.bendRight.style.opacity = String(e.bendOpacity), t.bendLeft.style.background = e.bendLeftBg, t.bendRight.style.background = e.bendRightBg;
    const i = t.coverSpine.style;
    i.opacity = String(e.coverSpineOpacity), i.left = U(e.coverSpineLeft), i.background = e.coverSpineBg;
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
  stepChrome(e, t, n, i, r, a) {
    const d = this.chrome;
    if (!d) return;
    const f = Math.cos(Math.PI * a), c = 0.5 * Math.max(f, 0), l = 0.5 * Math.max(-f, 0), p = i ? 0.5 : n === 1 ? l : c, v = r ? 0.5 : n === 1 ? c : l, P = d.shadow.style;
    P.left = U(0.5 - p), P.width = U(p + v), P.opacity = String(e.shadowOpacity + (t.shadowOpacity - e.shadowOpacity) * a);
    const k = Math.max(0, 2 * a - 1), C = Math.max(0, 1 - 2 * a), m = ($, u) => String(u > $ ? $ + (u - $) * k : u + ($ - u) * C), y = a >= 0.5;
    d.spine.style.opacity = m(e.spineOpacity, t.spineOpacity);
    const E = m(e.bendOpacity, t.bendOpacity);
    d.bendLeft.style.opacity = E, d.bendRight.style.opacity = E, d.bendLeft.style.background = y ? t.bendLeftBg : e.bendLeftBg, d.bendRight.style.background = y ? t.bendRightBg : e.bendRightBg;
    const O = d.coverSpine.style;
    O.opacity = m(e.coverSpineOpacity, t.coverSpineOpacity), O.left = U(y ? t.coverSpineLeft : e.coverSpineLeft), O.background = y ? t.coverSpineBg : e.coverSpineBg;
  }
  applyStageSize() {
    const { pageWidth: e, pageHeight: t } = this.opts, n = this.orientation === "landscape" ? 2 : 1, i = n * e / t, r = this.stage.style;
    if (r.aspectRatio = String(i), r.perspective = `${Math.round(n * e * 2.5)}px`, r.marginLeft = "auto", r.marginRight = "auto", this.opts.responsive === !1) {
      r.width = `${n * e}px`, r.maxWidth = "", r.minWidth = "";
      return;
    }
    r.width = "100%";
    const a = Math.min(
      (this.opts.maxWidth ?? e * 2) * n,
      (this.opts.maxHeight ?? t * 2) * i
    );
    r.maxWidth = `${Math.round(a)}px`;
    const d = Math.max((this.opts.minWidth ?? 0) * n, (this.opts.minHeight ?? 0) * i);
    r.minWidth = d > 0 ? `${Math.round(d)}px` : "";
  }
  /* --------------------------------------------------------------- flipping */
  flipToSpread(e) {
    var E, O, $, u, F, I, g;
    if (this.destroyed || this.anim || e < 0 || e >= this.spreads.length || e === this.spreadIndex) return;
    const t = e > this.spreadIndex ? 1 : -1, n = ((E = this.spreads[e]) == null ? void 0 : E[0]) ?? this.getCurrentPage();
    ($ = (O = this.opts).onFlipStart) == null || $.call(O, this.getCurrentPage(), n);
    let i, r;
    const a = [];
    if (this.orientation === "portrait")
      i = (u = this.spreads[this.spreadIndex]) == null ? void 0 : u[0], r = (F = this.spreads[e]) == null ? void 0 : F[0];
    else {
      const b = this.slotPages(this.spreadIndex), S = this.slotPages(e);
      t === 1 ? (i = b.right, r = S.left, a.push({ page: b.left, slot: "left" }, { page: S.right, slot: "right" })) : (i = b.left, r = S.right, a.push({ page: b.right, slot: "right" }, { page: S.left, slot: "left" }));
    }
    const d = i ? this.pageEl(i) : void 0, f = r ? this.pageEl(r) : void 0;
    if (!d || !f) {
      this.spreadIndex = e, this.layout(), (g = (I = this.opts).onFlip) == null || g.call(I, this.getCurrentPage());
      return;
    }
    this.hideAll();
    for (const { page: b, slot: S } of a)
      b && this.showAt(b, S);
    let c = null;
    if (this.chrome)
      if (this.orientation === "portrait")
        this.updateChrome(e);
      else {
        const b = a.some((B) => B.page !== void 0 && B.slot === "left"), S = a.some((B) => B.page !== void 0 && B.slot === "right"), x = this.chromeStateFor(this.spreadIndex), R = this.chromeStateFor(e);
        c = (B) => this.stepChrome(x, R, t, b, S, B);
      }
    const { leaf: l, shadows: p } = this.buildLeaf(t, d, f, e);
    this.stage.appendChild(l);
    const v = Math.max(0, this.opts.flippingTime ?? 800), P = t === 1 ? -180 : 180, k = this.opts.maxShadowOpacity ?? 0.4, C = we(), m = {
      leaf: l,
      movedPages: [d, f],
      shadows: p,
      chrome: c,
      targetSpread: e,
      endAngle: P,
      raf: 0
    };
    this.anim = m;
    const y = () => {
      var R;
      if (this.destroyed || this.anim !== m) return;
      const b = v === 0 ? 1 : Math.min(1, (we() - C) / v), S = Ve(b);
      l.style.transform = `rotateY(${P * S}deg)`, (R = m.chrome) == null || R.call(m, S);
      const x = Math.sin(Math.PI * S) * k;
      for (const B of m.shadows) B.style.opacity = String(x);
      b < 1 ? m.raf = requestAnimationFrame(y) : this.finishFlip(m);
    };
    y();
  }
  buildLeaf(e, t, n, i) {
    const r = this.orientation === "landscape", a = document.createElement("div");
    a.className = "vpf-leaf";
    const d = a.style;
    d.position = "absolute", d.top = "0", d.height = "100%", d.width = r ? "50%" : "100%", d.left = r && e === 1 ? "50%" : "0", d.transformOrigin = r ? e === 1 ? "left center" : "right center" : "center center", d.transformStyle = "preserve-3d", d.zIndex = "10", d.pointerEvents = "none", d.willChange = "transform";
    const f = [], c = e === 1 ? "right" : "left", l = (p, v) => {
      const P = document.createElement("div"), k = P.style;
      k.position = "absolute", k.inset = "0", k.backfaceVisibility = "hidden", k.overflow = "hidden", v && (k.transform = "rotateY(180deg)");
      const C = p.style;
      if (C.display = "block", C.position = "absolute", C.top = "0", C.left = "0", C.width = "100%", C.height = "100%", P.appendChild(p), this.opts.drawShadow !== !1 && r) {
        const m = e === 1 !== v ? "right" : "left", y = this.gutterShadingFor(v ? i : this.spreadIndex, m);
        if (y) {
          const E = document.createElement("div");
          E.className = "vpf-leaf-bend";
          const O = E.style;
          O.position = "absolute", O.inset = "0", O.pointerEvents = "none", O.background = y, P.appendChild(E);
        }
      }
      if (this.opts.drawShadow !== !1) {
        const m = document.createElement("div"), y = m.style;
        y.position = "absolute", y.inset = "0", y.pointerEvents = "none", y.opacity = "0", y.background = `linear-gradient(to ${c}, rgba(0,0,0,0.65), rgba(0,0,0,0) 65%)`, P.appendChild(m), f.push(m);
      }
      return P;
    };
    return a.append(l(t, !1), l(n, !0)), { leaf: a, shadows: f };
  }
  finishFlip(e) {
    var t, n;
    cancelAnimationFrame(e.raf);
    for (const i of e.movedPages) this.stage.appendChild(i);
    e.leaf.remove(), this.anim = null, this.spreadIndex = e.targetSpread, this.layout(), (n = (t = this.opts).onFlip) == null || n.call(t, this.getCurrentPage());
  }
}
function Ue(s) {
  const e = [];
  for (let t = 0; t < s.pageCount; t++) {
    const n = document.createElement("div");
    n.className = s.pageClass ? `vpf-page ${s.pageClass}` : "vpf-page";
    const i = s.showCover && (t === 0 || t === s.pageCount - 1);
    n.dataset.density = i ? "hard" : "soft", n.setAttribute("data-pdf-flipbook-page", String(t + 1)), n.style.overflow = "hidden", s.pageClass || (n.style.background = "#fff");
    const r = document.createElement("canvas");
    r.className = "vpf-canvas", r.setAttribute("data-pdf-flipbook-canvas", ""), r.style.display = "block", r.style.width = "100%", r.style.height = "100%", n.appendChild(r), e.push({ root: n, canvas: r });
  }
  return e;
}
function qe(s) {
  let e = null, t = [], n = null;
  async function i(c, l) {
    return r(), n = c, t = Ue(l), e = new J(c, {
      pages: t.map((p) => p.root),
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
      ...l.flipOptions,
      onFlip: s.onFlip,
      onFlipStart: s.onFlipStart,
      onOrientationChange: s.onOrientationChange
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
  function d() {
    e == null || e.flipPrev();
  }
  function f(c) {
    e == null || e.flip(c);
  }
  return {
    init: i,
    destroy: r,
    next: a,
    prev: d,
    goToPage: f,
    getInstance: () => e,
    getPages: () => t
  };
}
function Ke(s, e) {
  const t = z(1), n = z(0), i = z(0), r = N(() => t.value === 1 ? {} : {
    transform: `translate(${n.value}px, ${i.value}px) scale(${t.value})`,
    transformOrigin: "0 0",
    willChange: "transform"
  });
  let a = null, d = null, f = null, c = null, l = null, p = !1, v = null;
  const P = () => e.maxZoom() > 1;
  function k(o) {
    return Math.min(Math.max(o, 1), Math.max(e.maxZoom(), 1));
  }
  function C() {
    a && (n.value = Math.min(0, Math.max(a.clientWidth * (1 - t.value), n.value)), i.value = Math.min(0, Math.max(a.clientHeight * (1 - t.value), i.value)));
  }
  function m(o, w, D) {
    var M;
    const A = k(o), Z = t.value;
    A !== Z && (n.value = w - (w - n.value) / Z * A, i.value = D - (D - i.value) / Z * A, t.value = A, A === 1 ? (n.value = 0, i.value = 0, c = null, l = null) : C(), $(), (M = e.onChange) == null || M.call(e, A));
  }
  function y(o, w) {
    n.value += o, i.value += w, C();
  }
  function E(o) {
    a && m(o, a.clientWidth / 2, a.clientHeight / 2);
  }
  function O() {
    var o;
    f = null, c = null, l = null, t.value !== 1 && (t.value = 1, n.value = 0, i.value = 0, $(), (o = e.onChange) == null || o.call(e, 1));
  }
  function $() {
    a && (a.style.touchAction = t.value > 1 ? "none" : "", a.style.cursor = t.value > 1 ? c ? "grabbing" : "grab" : "");
  }
  function u(o, w) {
    const D = a.getBoundingClientRect();
    return { x: o - D.left, y: w - D.top };
  }
  const F = (o) => {
    if (!a || !P()) return;
    const w = o.ctrlKey || o.metaKey, D = o.deltaMode === 1 ? o.deltaY * 16 : o.deltaY, A = k(t.value * Math.exp(-D * (w ? 0.01 : 22e-4)));
    if (A === t.value && !w) return;
    o.preventDefault();
    const { x: Z, y: M } = u(o.clientX, o.clientY);
    m(A, Z, M);
  }, I = (o) => Math.hypot(
    o[0].clientX - o[1].clientX,
    o[0].clientY - o[1].clientY
  ), g = (o) => u(
    (o[0].clientX + o[1].clientX) / 2,
    (o[0].clientY + o[1].clientY) / 2
  ), b = (o) => {
    if (P())
      if (o.touches.length === 2) {
        o.preventDefault(), c = null, l = null;
        const w = g(o.touches);
        f = {
          startDist: I(o.touches),
          startZoom: t.value,
          lastMidX: w.x,
          lastMidY: w.y
        };
      } else o.touches.length === 1 && t.value > 1 && (l = { lastX: o.touches[0].clientX, lastY: o.touches[0].clientY });
  }, S = (o) => {
    if (f && o.touches.length >= 2) {
      o.preventDefault();
      const w = g(o.touches);
      y(w.x - f.lastMidX, w.y - f.lastMidY), f.lastMidX = w.x, f.lastMidY = w.y, m(f.startZoom * I(o.touches) / f.startDist, w.x, w.y);
    } else if (l && o.touches.length === 1 && t.value > 1) {
      o.preventDefault();
      const w = o.touches[0];
      y(w.clientX - l.lastX, w.clientY - l.lastY), l.lastX = w.clientX, l.lastY = w.clientY;
    }
  }, x = (o) => {
    f && o.touches.length < 2 && (f = null, p = !0), o.touches.length === 1 && t.value > 1 ? l = { lastX: o.touches[0].clientX, lastY: o.touches[0].clientY } : l = null;
  }, R = (o) => {
    var w;
    p = !1, !(t.value <= 1) && (o.stopPropagation(), o.pointerType !== "touch" && (c = { pointerId: o.pointerId, lastX: o.clientX, lastY: o.clientY }, (w = a == null ? void 0 : a.setPointerCapture) == null || w.call(a, o.pointerId)), $());
  }, B = (o) => {
    !c || o.pointerId !== c.pointerId || f || (y(o.clientX - c.lastX, o.clientY - c.lastY), c.lastX = o.clientX, c.lastY = o.clientY);
  }, j = (o) => {
    (t.value > 1 || f) && o.stopPropagation(), c && o.pointerId === c.pointerId && (c = null, $());
  }, H = (o) => {
    (t.value > 1 || p) && (p = !1, o.stopPropagation(), o.preventDefault());
  }, T = (o) => {
    P() && (o.preventDefault(), v = t.value);
  }, Q = (o) => {
    if (!P() || (o.preventDefault(), f || v === null)) return;
    const { x: w, y: D } = u(o.clientX, o.clientY);
    m(v * o.scale, w, D);
  }, V = (o) => {
    o.preventDefault(), v = null;
  };
  function ne() {
    _(), a = s(), a && (a.addEventListener("wheel", F, { passive: !1 }), a.addEventListener("touchstart", b, { passive: !1 }), a.addEventListener("touchmove", S, { passive: !1 }), a.addEventListener("touchend", x), a.addEventListener("touchcancel", x), a.addEventListener("pointerdown", R, { capture: !0 }), a.addEventListener("pointermove", B), a.addEventListener("pointerup", j, { capture: !0 }), a.addEventListener("pointercancel", j, { capture: !0 }), a.addEventListener("click", H, { capture: !0 }), a.addEventListener("gesturestart", T, { passive: !1 }), a.addEventListener("gesturechange", Q, { passive: !1 }), a.addEventListener("gestureend", V, { passive: !1 }), typeof ResizeObserver < "u" && (d = new ResizeObserver(() => C()), d.observe(a)));
  }
  function _() {
    a && (a.removeEventListener("wheel", F), a.removeEventListener("touchstart", b), a.removeEventListener("touchmove", S), a.removeEventListener("touchend", x), a.removeEventListener("touchcancel", x), a.removeEventListener("pointerdown", R, { capture: !0 }), a.removeEventListener("pointermove", B), a.removeEventListener("pointerup", j, { capture: !0 }), a.removeEventListener("pointercancel", j, { capture: !0 }), a.removeEventListener("click", H, { capture: !0 }), a.removeEventListener("gesturestart", T), a.removeEventListener("gesturechange", Q), a.removeEventListener("gestureend", V), d == null || d.disconnect(), d = null, f = null, c = null, l = null, a = null);
  }
  return { zoom: t, contentStyle: r, setZoom: E, reset: O, listen: ne, unlisten: _ };
}
function Se() {
  if (!oe()) return !1;
  const s = document;
  return !!(s.fullscreenEnabled ?? s.webkitFullscreenEnabled);
}
function Je(s, e) {
  const t = z(!1);
  function n() {
    const l = document;
    return l.fullscreenElement ?? l.webkitFullscreenElement ?? null;
  }
  function i() {
    const l = s(), p = l !== null && n() === l;
    p !== t.value && (t.value = p, e == null || e(p));
  }
  function r() {
    document.addEventListener("fullscreenchange", i), document.addEventListener("webkitfullscreenchange", i);
  }
  function a() {
    document.removeEventListener("fullscreenchange", i), document.removeEventListener("webkitfullscreenchange", i);
  }
  async function d() {
    var p, v;
    const l = s();
    if (!(!l || t.value))
      try {
        await (((p = l.requestFullscreen) == null ? void 0 : p.call(l)) ?? ((v = l.webkitRequestFullscreen) == null ? void 0 : v.call(l)));
      } catch {
      }
  }
  async function f() {
    var p, v;
    if (!n()) return;
    const l = document;
    try {
      await (((p = l.exitFullscreen) == null ? void 0 : p.call(l)) ?? ((v = l.webkitExitFullscreen) == null ? void 0 : v.call(l)));
    } catch {
    }
  }
  async function c() {
    t.value ? await f() : await d();
  }
  return { isFullscreen: t, enter: d, exit: f, toggle: c, listen: r, unlisten: a };
}
const Qe = ["disabled"], _e = ["disabled"], et = ["aria-label"], Ce = /* @__PURE__ */ xe({
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
  setup(s) {
    const e = s, t = Se(), n = N(() => {
      var r;
      const i = (r = e.visiblePages) != null && r.length ? e.visiblePages : [e.currentPage];
      return i.length >= 2 ? `${i[0]}–${i[i.length - 1]}` : String(i[0] ?? e.currentPage);
    });
    return (i, r) => (q(), K("div", {
      class: G(["vpf-controls", s.controlsClass]),
      "data-pdf-flipbook-controls": ""
    }, [
      X("button", {
        type: "button",
        class: G(["vpf-button", s.buttonClass]),
        disabled: !s.canGoPrev,
        "aria-label": "Previous page",
        "data-pdf-flipbook-prev": "",
        onClick: r[0] || (r[0] = (a) => i.$emit("prev"))
      }, " ‹ ", 10, Qe),
      X("span", {
        class: G(["vpf-indicator", s.pageIndicatorClass]),
        "data-pdf-flipbook-indicator": ""
      }, re(n.value) + " / " + re(s.totalPages), 3),
      X("button", {
        type: "button",
        class: G(["vpf-button", s.buttonClass]),
        disabled: !s.canGoNext,
        "aria-label": "Next page",
        "data-pdf-flipbook-next": "",
        onClick: r[1] || (r[1] = (a) => i.$emit("next"))
      }, " › ", 10, _e),
      Y(t) ? (q(), K("button", {
        key: 0,
        type: "button",
        class: G(["vpf-button", s.buttonClass]),
        "aria-label": s.isFullscreen ? "Exit full screen" : "Enter full screen",
        "data-pdf-flipbook-fullscreen": "",
        onClick: r[2] || (r[2] = (a) => i.$emit("toggle-fullscreen"))
      }, re(s.isFullscreen ? "⤡" : "⤢"), 11, et)) : te("", !0)
    ], 2));
  }
}), tt = ["data-fullscreen", "data-controls-position"], nt = /* @__PURE__ */ xe({
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
  setup(s, { expose: e, emit: t }) {
    const n = s, i = t, r = z(null), a = z(null), d = z(null), f = z(!1), c = z(1), l = z([1]), p = z(1), v = z("landscape"), P = z(null), k = Je(
      () => r.value,
      (h) => {
        i("fullscreen-changed", h), requestAnimationFrame(() => {
          var L;
          return (L = b.getInstance()) == null ? void 0 : L.update();
        });
      }
    ), C = k.isFullscreen, m = z(!1), { pdf: y, totalPages: E, loading: O, progress: $, error: u, load: F, teardown: I } = Te(), g = Ke(() => a.value, {
      maxZoom: () => n.maxZoom,
      onChange: (h) => i("zoom-changed", h)
    }), b = qe({
      onFlip(h) {
        S(), p.value = c.value, x.updateWindow(h), i("page-changed", { page: h, totalPages: E.value });
      },
      onFlipStart(h, L) {
        p.value = L, i("flip-start", { fromPage: h, toPage: L });
      },
      onOrientationChange(h) {
        v.value = h, S(), x.updateWindow(c.value), i("orientation-changed", h);
      }
    });
    function S() {
      var L;
      const h = (L = b.getInstance()) == null ? void 0 : L.getCurrentSpread();
      h != null && h.length && (c.value = h[0], l.value = h);
    }
    const x = je({
      renderScale: () => n.renderScale,
      renderRange: () => n.renderRange,
      onRendered: (h) => i("rendered", { page: h }),
      onError: (h, L) => i("error", L)
    });
    let R = 0;
    async function B() {
      var he;
      const h = ++R;
      f.value = !1, m.value = !1, g.reset(), x.reset(), b.destroy();
      const L = await F(n.src, {
        workerSrc: n.workerSrc,
        pdfOptions: n.pdfOptions
      });
      if (h !== R) return;
      if (!L) {
        u.value && i("error", u.value);
        return;
      }
      const se = await L.getPage(1);
      if (h !== R) return;
      const ce = se.getViewport({ scale: 1 }), le = n.width, ue = n.height ?? Math.round(le * (ce.height / ce.width));
      await Ye();
      const de = d.value;
      if (h !== R || !de) return;
      const Ee = await b.init(de, {
        pageCount: L.numPages,
        pageWidth: le,
        pageHeight: ue,
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
      if (h !== R) {
        b.destroy();
        return;
      }
      x.setDocument(L), Ee.forEach((Fe, Le) => x.registerCanvas(Le + 1, Fe.canvas)), S(), p.value = c.value, P.value = { width: le, height: ue }, v.value = ((he = b.getInstance()) == null ? void 0 : he.getOrientation()) ?? v.value, x.updateWindow(c.value), f.value = !0, requestAnimationFrame(() => {
        h === R && (m.value = !0);
      }), i("loaded", { totalPages: L.numPages, pdf: L });
    }
    function j() {
      R++, f.value = !1, x.reset(), b.destroy(), I();
    }
    Ie(() => {
      k.listen(), g.listen(), B();
    }), Re(() => {
      k.unlisten(), g.unlisten(), j();
    }), We(
      () => n.src,
      () => void B()
    );
    function H() {
      b.next();
    }
    function T() {
      b.prev();
    }
    function Q(h) {
      b.goToPage(h);
    }
    async function V() {
      await B();
    }
    const ne = N(() => !f.value || v.value !== "landscape" ? null : n.showCover && p.value <= 1 ? "-25%" : p.value >= E.value ? "25%" : null), _ = N(() => {
      var h;
      return Math.max(0, ((h = n.flipOptions) == null ? void 0 : h.flippingTime) ?? 800);
    }), o = N(() => {
      const h = { position: "relative", width: "100%" };
      if (m.value && _.value > 0 && (h.transition = `transform ${_.value}ms ease`), ne.value && (h.transform = `translateX(${ne.value})`), C.value && P.value) {
        const se = (v.value === "landscape" ? 2 : 1) * P.value.width / P.value.height;
        h.maxWidth = `min(100%, calc((100vh - 6rem) * ${se}))`, h.marginLeft = "auto", h.marginRight = "auto";
      }
      return h;
    }), w = N(() => ({
      position: "relative",
      width: "100%",
      overflow: g.zoom.value > 1 ? "hidden" : "visible"
    })), D = N(
      () => f.value && c.value === 1 && !C.value && g.zoom.value === 1 && Se()
    ), A = N(() => {
      const h = {
        position: "absolute",
        top: "0",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: "2"
      };
      return v.value === "portrait" ? (h.left = "0", h.width = "100%") : n.showCover ? (h.left = "50%", h.width = "50%") : (h.left = "0", h.width = "50%"), h;
    }), Z = N(
      () => C.value ? { display: "flex", flexDirection: "column", justifyContent: "center", overflow: "auto" } : void 0
    ), M = N(() => ({
      currentPage: c.value,
      visiblePages: l.value,
      totalPages: E.value,
      next: H,
      prev: T,
      goToPage: Q,
      canGoNext: c.value < E.value,
      canGoPrev: c.value > 1,
      isFullscreen: C.value,
      toggleFullscreen: () => void k.toggle(),
      zoom: g.zoom.value,
      setZoom: g.setZoom,
      resetZoom: g.reset
    }));
    return e({
      next: H,
      prev: T,
      goToPage: Q,
      currentPage: ie(c),
      totalPages: ie(E),
      reload: V,
      isFullscreen: ie(C),
      enterFullscreen: k.enter,
      exitFullscreen: k.exit,
      toggleFullscreen: k.toggle,
      getPdfDocument: () => y.value,
      getFlipInstance: () => b.getInstance(),
      zoom: ie(g.zoom),
      setZoom: g.setZoom,
      resetZoom: g.reset
    }), (h, L) => (q(), K("div", {
      ref_key: "rootRef",
      ref: r,
      class: G(["vpf-container", [s.containerClass, Y(C) ? s.fullscreenClass : void 0]]),
      style: ee(Z.value),
      "data-fullscreen": Y(C) ? "" : void 0,
      "data-controls-position": s.controlsPosition,
      "data-pdf-flipbook": ""
    }, [
      Y(u) ? (q(), K("div", {
        key: 0,
        class: G(["vpf-error", s.errorClass]),
        "data-pdf-flipbook-error": ""
      }, [
        ae(h.$slots, "error", {
          error: Y(u),
          retry: V
        }, () => [
          X("div", null, "Failed to load PDF: " + re(Y(u).message), 1),
          X("button", {
            type: "button",
            class: G(["vpf-button", s.buttonClass]),
            onClick: V
          }, " Retry ", 2)
        ])
      ], 2)) : Y(O) ? (q(), K("div", {
        key: 1,
        class: G(["vpf-loading", s.loadingClass]),
        "data-pdf-flipbook-loading": ""
      }, [
        ae(h.$slots, "loading", { progress: Y($) }, () => [
          L[1] || (L[1] = X("div", null, "Loading…", -1))
        ])
      ], 2)) : te("", !0),
      f.value && s.controlsPosition === "top" ? ae(h.$slots, "controls", pe(ge({ key: 2 }, M.value)), () => [
        ve(Ce, {
          "current-page": M.value.currentPage,
          "visible-pages": M.value.visiblePages,
          "total-pages": M.value.totalPages,
          "can-go-next": M.value.canGoNext,
          "can-go-prev": M.value.canGoPrev,
          "is-fullscreen": M.value.isFullscreen,
          "controls-class": s.controlsClass,
          "button-class": s.buttonClass,
          "page-indicator-class": s.pageIndicatorClass,
          onNext: H,
          onPrev: T,
          onToggleFullscreen: M.value.toggleFullscreen
        }, null, 8, ["current-page", "visible-pages", "total-pages", "can-go-next", "can-go-prev", "is-fullscreen", "controls-class", "button-class", "page-indicator-class", "onToggleFullscreen"])
      ]) : te("", !0),
      ze(X("div", {
        ref_key: "viewportRef",
        ref: a,
        class: "vpf-zoom-viewport",
        style: ee(w.value),
        "data-pdf-flipbook-viewport": ""
      }, [
        X("div", {
          class: "vpf-zoom-content",
          style: ee(Y(g).contentStyle.value),
          "data-pdf-flipbook-zoom": ""
        }, [
          X("div", {
            class: "vpf-book-shell",
            style: ee(o.value),
            "data-pdf-flipbook-shell": ""
          }, [
            X("div", {
              ref_key: "bookRef",
              ref: d,
              class: G(["vpf-book", s.bookClass]),
              "data-pdf-flipbook-book": ""
            }, null, 2),
            D.value ? (q(), K("div", {
              key: 0,
              class: "vpf-fullscreen-hint",
              style: ee(A.value),
              "data-pdf-flipbook-fullscreen-hint": ""
            }, [
              X("button", {
                type: "button",
                class: G(["vpf-button vpf-fullscreen-hint-button", s.buttonClass]),
                "data-pdf-flipbook-fullscreen-hint-button": "",
                onClick: L[0] || (L[0] = $e((se) => void Y(k).enter(), ["stop"]))
              }, " View in fullscreen ", 2)
            ], 4)) : te("", !0)
          ], 4)
        ], 4)
      ], 4), [
        [Be, !Y(u) && !Y(O)]
      ]),
      f.value && s.controlsPosition === "bottom" ? ae(h.$slots, "controls", pe(ge({ key: 3 }, M.value)), () => [
        ve(Ce, {
          "current-page": M.value.currentPage,
          "visible-pages": M.value.visiblePages,
          "total-pages": M.value.totalPages,
          "can-go-next": M.value.canGoNext,
          "can-go-prev": M.value.canGoPrev,
          "is-fullscreen": M.value.isFullscreen,
          "controls-class": s.controlsClass,
          "button-class": s.buttonClass,
          "page-indicator-class": s.pageIndicatorClass,
          onNext: H,
          onPrev: T,
          onToggleFullscreen: M.value.toggleFullscreen
        }, null, 8, ["current-page", "visible-pages", "total-pages", "can-go-next", "can-go-prev", "is-fullscreen", "controls-class", "button-class", "page-indicator-class", "onToggleFullscreen"])
      ]) : te("", !0)
    ], 14, tt));
  }
}), at = {
  install(s, e) {
    e != null && e.workerSrc && Ae(e.workerSrc), s.component("PdfFlipbook", nt);
  }
};
export {
  nt as PdfFlipbook,
  at as default,
  Ae as setGlobalWorkerSrc
};
