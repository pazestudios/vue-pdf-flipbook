var Oe = Object.defineProperty;
var Ie = (i, e, t) => e in i ? Oe(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var W = (i, e, t) => Ie(i, typeof e != "symbol" ? e + "" : e, t);
import { shallowRef as ge, ref as z, computed as Z, defineComponent as xe, openBlock as K, createElementBlock as J, normalizeClass as G, createElementVNode as X, toDisplayString as oe, unref as Y, createCommentVNode as ne, onMounted as Re, onBeforeUnmount as We, watch as ze, readonly as ae, normalizeStyle as te, renderSlot as re, normalizeProps as ve, mergeProps as me, createVNode as be, withDirectives as Be, withModifiers as $e, vShow as Ye, nextTick as De } from "vue";
function le() {
  return typeof window < "u" && typeof document < "u";
}
function ye(i) {
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
function Ae() {
  if (!le()) return;
  ye(Map.prototype), ye(WeakMap.prototype), typeof Math.sumPrecise != "function" && Object.defineProperty(Math, "sumPrecise", {
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
let Se, we = !1;
function Xe(i) {
  Se = i;
}
function Ge(i) {
  return `https://cdn.jsdelivr.net/npm/pdfjs-dist@${i.version}/build/pdf.worker.min.mjs`;
}
function Ee(i) {
  i.GlobalWorkerOptions.workerSrc = Ge(i), we || (we = !0, console.warn(
    '[vue-pdf-flipbook] Falling back to loading the pdf.js worker from jsdelivr. For offline or CSP-restricted environments, pass a `workerSrc` prop or plugin option (e.g. in Vite: `import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"`).'
  ));
}
async function Ze(i) {
  try {
    const e = await fetch(i, { method: "HEAD" });
    return e.ok ? (e.headers.get("content-type") ?? "").includes("javascript") : !1;
  } catch {
    return !1;
  }
}
async function Ne(i, e) {
  if (!le()) return !0;
  const t = e ?? Se;
  if (t)
    return i.GlobalWorkerOptions.workerSrc = t, !0;
  if (i.GlobalWorkerOptions.workerSrc) return !0;
  const n = "pdfjs-dist/build/pdf.worker.min.mjs";
  try {
    const s = new URL(n, import.meta.url).toString();
    if (s.startsWith("http") && await Ze(s))
      return i.GlobalWorkerOptions.workerSrc = s, !1;
  } catch {
  }
  return Ee(i), !1;
}
function Ce(i) {
  return typeof i == "string" || i instanceof URL ? { url: i.toString() } : i instanceof ArrayBuffer ? { data: new Uint8Array(i.slice(0)) } : { data: i.slice() };
}
function He(i) {
  const e = i instanceof Error ? i.message : String(i);
  return /worker/i.test(e) || /import/i.test(e);
}
function Te() {
  const i = ge(null), e = z(0), t = z(!1), n = z(0), s = ge(null);
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
    if (!le()) return null;
    t.value = !0, s.value = null, n.value = 0, await c();
    const p = o;
    try {
      Ae();
      const v = await import("pdfjs-dist"), x = await Ne(v, l.workerSrc);
      if (p !== o) return null;
      const S = { ...Ce(u), ...l.pdfOptions }, C = () => {
        const y = v.getDocument(S);
        return y.onProgress = (k) => {
          p === o && k.total > 0 && (n.value = Math.min(1, k.loaded / k.total));
        }, a = y, y.promise;
      };
      let m;
      try {
        m = await C();
      } catch (y) {
        if (x || !He(y)) throw y;
        Ee(v), Object.assign(S, Ce(u)), m = await C();
      }
      return p !== o ? (m.destroy().catch(() => {
      }), null) : (i.value = m, e.value = m.numPages, m);
    } catch (v) {
      return p === o && (s.value = v instanceof Error ? v : new Error(String(v))), null;
    } finally {
      p === o && (t.value = !1);
    }
  }
  return { pdf: i, totalPages: e, loading: t, progress: n, error: s, load: h, teardown: c };
}
function je(i) {
  return i instanceof Error && i.name === "RenderingCancelledException";
}
function Ve(i) {
  let e = null;
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set(), s = /* @__PURE__ */ new Set();
  let o = 1, a = null, c = !1;
  function h() {
    return Math.min(typeof window < "u" && window.devicePixelRatio || 1, 2);
  }
  function u() {
    const d = i.renderRange();
    return d === 1 / 0 ? 1 / 0 : Math.max(2, d * 2 + 1);
  }
  function l() {
    if (!e) return [];
    const d = e.numPages, L = u(), I = [];
    for (let g = 1; g <= d; g++)
      Math.abs(g - o) <= L && !n.has(g) && !s.has(g) && t.has(g) && I.push(g);
    return I.sort((g, b) => {
      const E = Math.abs(g - o), P = Math.abs(b - o);
      return E === P ? b - g : E - P;
    }), I;
  }
  function p() {
    const d = u();
    if (d !== 1 / 0) {
      for (const L of n)
        if (Math.abs(L - o) > d * 2) {
          const I = t.get(L);
          I && (I.width = 0, I.height = 0), n.delete(L);
        }
    }
  }
  async function v(d) {
    var b, E;
    if (!e) return;
    const L = t.get(d);
    if (!L) return;
    const I = e, g = { page: d, task: null, cancelled: !1 };
    a = g;
    try {
      const P = await I.getPage(d);
      if (g.cancelled || e !== I) return;
      const R = P.getViewport({ scale: i.renderScale() * h() });
      if (L.width = Math.floor(R.width), L.height = Math.floor(R.height), g.task = P.render({ canvas: L, viewport: R }), await g.task.promise, g.cancelled || e !== I) return;
      n.add(d), (b = i.onRendered) == null || b.call(i, d);
    } catch (P) {
      !je(P) && !g.cancelled && (s.add(d), (E = i.onError) == null || E.call(i, d, P instanceof Error ? P : new Error(String(P))));
    } finally {
      a === g && (a = null);
    }
  }
  function x() {
    return new Promise((d) => {
      typeof requestIdleCallback == "function" ? requestIdleCallback(() => d()) : setTimeout(d, 16);
    });
  }
  async function S() {
    if (!c) {
      c = !0;
      try {
        const d = i.renderRange() === 1 / 0;
        let L;
        for (; e && (L = l()[0]) !== void 0; )
          d && await x(), await v(L);
      } finally {
        c = !1;
      }
    }
  }
  function C() {
    var d;
    a && Math.abs(a.page - o) > u() && (a.cancelled = !0, (d = a.task) == null || d.cancel());
  }
  function m(d) {
    O(), e = d, n.clear(), s.clear();
  }
  function y(d, L) {
    t.set(d, L);
  }
  function k(d) {
    o = d, C(), p(), S();
  }
  function O() {
    var d;
    a && (a.cancelled = !0, (d = a.task) == null || d.cancel(), a = null);
  }
  function B() {
    O(), e = null, t.clear(), n.clear(), s.clear(), o = 1;
  }
  return {
    setDocument: m,
    registerCanvas: y,
    updateWindow: k,
    cancelAll: O,
    reset: B,
    isRendered: (d) => n.has(d)
  };
}
function q(i) {
  return `${+(i * 100).toFixed(2)}%`;
}
function Ue(i) {
  return i < 0.5 ? 2 * i * i : 1 - (-2 * i + 2) ** 2 / 2;
}
function ke() {
  return typeof performance < "u" ? performance.now() : Date.now();
}
class Q {
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
    return t === "left" ? Q.bendGradient("left", 1 - 0.65 * s) : Q.bendGradient("right", 0.35 + 0.65 * s);
  }
  /**
   * The gutter-side shading the page in `slot` shows once `spreadIndex` is at
   * rest: the page-bend gradient on an open spread, the binding crease on a
   * lone cover/back cover, or '' for an empty slot.
   */
  gutterShadingFor(e, t) {
    const { left: n, right: s } = this.slotPages(e);
    return n && s ? this.bendFor(e, t) : (t === "right" ? s : n) ? Q.closedSpineGradient(t === "right" ? "to right" : "to left") : "";
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
      return t.shadowLeft = o ? 0.5 : 0, t.shadowWidth = 0.5, t.coverSpineOpacity = 1, t.coverSpineLeft = o ? 0.5 : 0, t.coverSpineBg = Q.closedSpineGradient(o ? "to right" : "to left"), t;
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
  stepChrome(e, t, n, s, o, a) {
    const c = this.chrome;
    if (!c) return;
    const h = Math.cos(Math.PI * a), u = 0.5 * Math.max(h, 0), l = 0.5 * Math.max(-h, 0), p = s ? 0.5 : n === 1 ? l : u, v = o ? 0.5 : n === 1 ? u : l, x = c.shadow.style;
    x.left = q(0.5 - p), x.width = q(p + v), x.opacity = String(e.shadowOpacity + (t.shadowOpacity - e.shadowOpacity) * a);
    const S = Math.max(0, 2 * a - 1), C = Math.max(0, 1 - 2 * a), m = (B, d) => String(d > B ? B + (d - B) * S : d + (B - d) * C), y = a >= 0.5;
    c.spine.style.opacity = m(e.spineOpacity, t.spineOpacity);
    const k = m(e.bendOpacity, t.bendOpacity);
    c.bendLeft.style.opacity = k, c.bendRight.style.opacity = k, c.bendLeft.style.background = y ? t.bendLeftBg : e.bendLeftBg, c.bendRight.style.background = y ? t.bendRightBg : e.bendRightBg;
    const O = c.coverSpine.style;
    O.opacity = m(e.coverSpineOpacity, t.coverSpineOpacity), O.left = q(y ? t.coverSpineLeft : e.coverSpineLeft), O.background = y ? t.coverSpineBg : e.coverSpineBg;
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
    var k, O, B, d, L, I, g;
    if (this.destroyed || this.anim || e < 0 || e >= this.spreads.length || e === this.spreadIndex) return;
    const t = e > this.spreadIndex ? 1 : -1, n = ((k = this.spreads[e]) == null ? void 0 : k[0]) ?? this.getCurrentPage();
    (B = (O = this.opts).onFlipStart) == null || B.call(O, this.getCurrentPage(), n);
    let s, o;
    const a = [];
    if (this.orientation === "portrait")
      s = (d = this.spreads[this.spreadIndex]) == null ? void 0 : d[0], o = (L = this.spreads[e]) == null ? void 0 : L[0];
    else {
      const b = this.slotPages(this.spreadIndex), E = this.slotPages(e);
      t === 1 ? (s = b.right, o = E.left, a.push({ page: b.left, slot: "left" }, { page: E.right, slot: "right" })) : (s = b.left, o = E.right, a.push({ page: b.right, slot: "right" }, { page: E.left, slot: "left" }));
    }
    const c = s ? this.pageEl(s) : void 0, h = o ? this.pageEl(o) : void 0;
    if (!c || !h) {
      this.spreadIndex = e, this.layout(), (g = (I = this.opts).onFlip) == null || g.call(I, this.getCurrentPage());
      return;
    }
    this.hideAll();
    for (const { page: b, slot: E } of a)
      b && this.showAt(b, E);
    let u = null;
    if (this.chrome)
      if (this.orientation === "portrait")
        this.updateChrome(e);
      else {
        const b = a.some(($) => $.page !== void 0 && $.slot === "left"), E = a.some(($) => $.page !== void 0 && $.slot === "right"), P = this.chromeStateFor(this.spreadIndex), R = this.chromeStateFor(e);
        u = ($) => this.stepChrome(P, R, t, b, E, $);
      }
    const { leaf: l, shadows: p } = this.buildLeaf(t, c, h, e);
    this.stage.appendChild(l);
    const v = Math.max(0, this.opts.flippingTime ?? 800), x = t === 1 ? -180 : 180, S = this.opts.maxShadowOpacity ?? 0.4, C = ke(), m = {
      leaf: l,
      movedPages: [c, h],
      shadows: p,
      chrome: u,
      targetSpread: e,
      endAngle: x,
      raf: 0
    };
    this.anim = m;
    const y = () => {
      var R;
      if (this.destroyed || this.anim !== m) return;
      const b = v === 0 ? 1 : Math.min(1, (ke() - C) / v), E = Ue(b);
      l.style.transform = `rotateY(${x * E}deg)`, (R = m.chrome) == null || R.call(m, E);
      const P = Math.sin(Math.PI * E) * S;
      for (const $ of m.shadows) $.style.opacity = String(P);
      b < 1 ? m.raf = requestAnimationFrame(y) : this.finishFlip(m);
    };
    y();
  }
  buildLeaf(e, t, n, s) {
    const o = this.orientation === "landscape", a = document.createElement("div");
    a.className = "vpf-leaf";
    const c = a.style;
    c.position = "absolute", c.top = "0", c.height = "100%", c.width = o ? "50%" : "100%", c.left = o && e === 1 ? "50%" : "0", c.transformOrigin = o ? e === 1 ? "left center" : "right center" : "center center", c.transformStyle = "preserve-3d", c.zIndex = "10", c.pointerEvents = "none", c.willChange = "transform";
    const h = [], u = e === 1 ? "right" : "left", l = (p, v) => {
      const x = document.createElement("div"), S = x.style;
      S.position = "absolute", S.inset = "0", S.backfaceVisibility = "hidden", S.overflow = "hidden", v && (S.transform = "rotateY(180deg)");
      const C = p.style;
      if (C.display = "block", C.position = "absolute", C.top = "0", C.left = "0", C.width = "100%", C.height = "100%", x.appendChild(p), this.opts.drawShadow !== !1 && o) {
        const m = e === 1 !== v ? "right" : "left", y = this.gutterShadingFor(v ? s : this.spreadIndex, m);
        if (y) {
          const k = document.createElement("div");
          k.className = "vpf-leaf-bend";
          const O = k.style;
          O.position = "absolute", O.inset = "0", O.pointerEvents = "none", O.background = y, x.appendChild(k);
        }
      }
      if (this.opts.drawShadow !== !1) {
        const m = document.createElement("div"), y = m.style;
        y.position = "absolute", y.inset = "0", y.pointerEvents = "none", y.opacity = "0", y.background = `linear-gradient(to ${u}, rgba(0,0,0,0.65), rgba(0,0,0,0) 65%)`, x.appendChild(m), h.push(m);
      }
      return x;
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
function qe(i) {
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
function Ke(i) {
  let e = null, t = [], n = null;
  async function s(u, l) {
    return o(), n = u, t = qe(l), e = new Q(u, {
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
function Je(i, e) {
  const t = z(1), n = z(0), s = z(0), o = Z(() => t.value === 1 ? {} : {
    transform: `translate(${n.value}px, ${s.value}px) scale(${t.value})`,
    transformOrigin: "0 0",
    willChange: "transform"
  });
  let a = null, c = null, h = null, u = null, l = null, p = !1, v = null;
  const x = () => {
    var r;
    return e.maxZoom() > 1 && (((r = e.allowZoom) == null ? void 0 : r.call(e)) ?? !0);
  };
  function S(r) {
    return Math.min(Math.max(r, 1), Math.max(e.maxZoom(), 1));
  }
  function C() {
    a && (n.value = Math.min(0, Math.max(a.clientWidth * (1 - t.value), n.value)), s.value = Math.min(0, Math.max(a.clientHeight * (1 - t.value), s.value)));
  }
  function m(r, w, D) {
    var M;
    const A = S(r), T = t.value;
    A !== T && (n.value = w - (w - n.value) / T * A, s.value = D - (D - s.value) / T * A, t.value = A, A === 1 ? (n.value = 0, s.value = 0, u = null, l = null) : C(), B(), (M = e.onChange) == null || M.call(e, A));
  }
  function y(r, w) {
    n.value += r, s.value += w, C();
  }
  function k(r) {
    a && m(r, a.clientWidth / 2, a.clientHeight / 2);
  }
  function O() {
    var r;
    h = null, u = null, l = null, t.value !== 1 && (t.value = 1, n.value = 0, s.value = 0, B(), (r = e.onChange) == null || r.call(e, 1));
  }
  function B() {
    a && (a.style.touchAction = t.value > 1 ? "none" : "", a.style.cursor = t.value > 1 ? u ? "grabbing" : "grab" : "");
  }
  function d(r, w) {
    const D = a.getBoundingClientRect();
    return { x: r - D.left, y: w - D.top };
  }
  const L = (r) => {
    if (!a || !x()) return;
    const w = r.ctrlKey || r.metaKey, D = r.deltaMode === 1 ? r.deltaY * 16 : r.deltaY, A = S(t.value * Math.exp(-D * (w ? 0.01 : 22e-4)));
    if (A === t.value && !w) return;
    r.preventDefault();
    const { x: T, y: M } = d(r.clientX, r.clientY);
    m(A, T, M);
  }, I = (r) => Math.hypot(
    r[0].clientX - r[1].clientX,
    r[0].clientY - r[1].clientY
  ), g = (r) => d(
    (r[0].clientX + r[1].clientX) / 2,
    (r[0].clientY + r[1].clientY) / 2
  ), b = (r) => {
    if (x())
      if (r.touches.length === 2) {
        r.preventDefault(), u = null, l = null;
        const w = g(r.touches);
        h = {
          startDist: I(r.touches),
          startZoom: t.value,
          lastMidX: w.x,
          lastMidY: w.y
        };
      } else r.touches.length === 1 && t.value > 1 && (l = { lastX: r.touches[0].clientX, lastY: r.touches[0].clientY });
  }, E = (r) => {
    if (h && r.touches.length >= 2) {
      r.preventDefault();
      const w = g(r.touches);
      y(w.x - h.lastMidX, w.y - h.lastMidY), h.lastMidX = w.x, h.lastMidY = w.y, m(h.startZoom * I(r.touches) / h.startDist, w.x, w.y);
    } else if (l && r.touches.length === 1 && t.value > 1) {
      r.preventDefault();
      const w = r.touches[0];
      y(w.clientX - l.lastX, w.clientY - l.lastY), l.lastX = w.clientX, l.lastY = w.clientY;
    }
  }, P = (r) => {
    h && r.touches.length < 2 && (h = null, p = !0), r.touches.length === 1 && t.value > 1 ? l = { lastX: r.touches[0].clientX, lastY: r.touches[0].clientY } : l = null;
  }, R = (r) => {
    var w;
    p = !1, !(t.value <= 1) && (r.stopPropagation(), r.pointerType !== "touch" && (u = { pointerId: r.pointerId, lastX: r.clientX, lastY: r.clientY }, (w = a == null ? void 0 : a.setPointerCapture) == null || w.call(a, r.pointerId)), B());
  }, $ = (r) => {
    !u || r.pointerId !== u.pointerId || h || (y(r.clientX - u.lastX, r.clientY - u.lastY), u.lastX = r.clientX, u.lastY = r.clientY);
  }, V = (r) => {
    (t.value > 1 || h) && r.stopPropagation(), u && r.pointerId === u.pointerId && (u = null, B());
  }, N = (r) => {
    (t.value > 1 || p) && (p = !1, r.stopPropagation(), r.preventDefault());
  }, H = (r) => {
    x() && (r.preventDefault(), v = t.value);
  }, _ = (r) => {
    if (!x() || (r.preventDefault(), h || v === null)) return;
    const { x: w, y: D } = d(r.clientX, r.clientY);
    m(v * r.scale, w, D);
  }, U = (r) => {
    r.preventDefault(), v = null;
  };
  function se() {
    ee(), a = i(), a && (a.addEventListener("wheel", L, { passive: !1 }), a.addEventListener("touchstart", b, { passive: !1 }), a.addEventListener("touchmove", E, { passive: !1 }), a.addEventListener("touchend", P), a.addEventListener("touchcancel", P), a.addEventListener("pointerdown", R, { capture: !0 }), a.addEventListener("pointermove", $), a.addEventListener("pointerup", V, { capture: !0 }), a.addEventListener("pointercancel", V, { capture: !0 }), a.addEventListener("click", N, { capture: !0 }), a.addEventListener("gesturestart", H, { passive: !1 }), a.addEventListener("gesturechange", _, { passive: !1 }), a.addEventListener("gestureend", U, { passive: !1 }), typeof ResizeObserver < "u" && (c = new ResizeObserver(() => C()), c.observe(a)));
  }
  function ee() {
    a && (a.removeEventListener("wheel", L), a.removeEventListener("touchstart", b), a.removeEventListener("touchmove", E), a.removeEventListener("touchend", P), a.removeEventListener("touchcancel", P), a.removeEventListener("pointerdown", R, { capture: !0 }), a.removeEventListener("pointermove", $), a.removeEventListener("pointerup", V, { capture: !0 }), a.removeEventListener("pointercancel", V, { capture: !0 }), a.removeEventListener("click", N, { capture: !0 }), a.removeEventListener("gesturestart", H), a.removeEventListener("gesturechange", _), a.removeEventListener("gestureend", U), c == null || c.disconnect(), c = null, h = null, u = null, l = null, a = null);
  }
  return { zoom: t, contentStyle: o, setZoom: k, reset: O, listen: se, unlisten: ee };
}
function Fe() {
  if (!le()) return !1;
  const i = document;
  return !!(i.fullscreenEnabled ?? i.webkitFullscreenEnabled);
}
function Qe(i, e) {
  const t = z(!1);
  function n() {
    const l = document;
    return l.fullscreenElement ?? l.webkitFullscreenElement ?? null;
  }
  function s() {
    const l = i(), p = l !== null && n() === l;
    p !== t.value && (t.value = p, e == null || e(p));
  }
  function o() {
    document.addEventListener("fullscreenchange", s), document.addEventListener("webkitfullscreenchange", s);
  }
  function a() {
    document.removeEventListener("fullscreenchange", s), document.removeEventListener("webkitfullscreenchange", s);
  }
  async function c() {
    var p, v;
    const l = i();
    if (!(!l || t.value))
      try {
        await (((p = l.requestFullscreen) == null ? void 0 : p.call(l)) ?? ((v = l.webkitRequestFullscreen) == null ? void 0 : v.call(l)));
      } catch {
      }
  }
  async function h() {
    var p, v;
    if (!n()) return;
    const l = document;
    try {
      await (((p = l.exitFullscreen) == null ? void 0 : p.call(l)) ?? ((v = l.webkitExitFullscreen) == null ? void 0 : v.call(l)));
    } catch {
    }
  }
  async function u() {
    t.value ? await h() : await c();
  }
  return { isFullscreen: t, enter: c, exit: h, toggle: u, listen: o, unlisten: a };
}
const _e = ["disabled"], et = ["disabled"], tt = ["aria-label"], Pe = /* @__PURE__ */ xe({
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
    const e = i, t = Fe(), n = Z(() => {
      var o;
      const s = (o = e.visiblePages) != null && o.length ? e.visiblePages : [e.currentPage];
      return s.length >= 2 ? `${s[0]}–${s[s.length - 1]}` : String(s[0] ?? e.currentPage);
    });
    return (s, o) => (K(), J("div", {
      class: G(["vpf-controls", i.controlsClass]),
      "data-pdf-flipbook-controls": ""
    }, [
      X("button", {
        type: "button",
        class: G(["vpf-button", i.buttonClass]),
        disabled: !i.canGoPrev,
        "aria-label": "Previous page",
        "data-pdf-flipbook-prev": "",
        onClick: o[0] || (o[0] = (a) => s.$emit("prev"))
      }, " ‹ ", 10, _e),
      X("span", {
        class: G(["vpf-indicator", i.pageIndicatorClass]),
        "data-pdf-flipbook-indicator": ""
      }, oe(n.value) + " / " + oe(i.totalPages), 3),
      X("button", {
        type: "button",
        class: G(["vpf-button", i.buttonClass]),
        disabled: !i.canGoNext,
        "aria-label": "Next page",
        "data-pdf-flipbook-next": "",
        onClick: o[1] || (o[1] = (a) => s.$emit("next"))
      }, " › ", 10, et),
      Y(t) ? (K(), J("button", {
        key: 0,
        type: "button",
        class: G(["vpf-button", i.buttonClass]),
        "aria-label": i.isFullscreen ? "Exit full screen" : "Enter full screen",
        "data-pdf-flipbook-fullscreen": "",
        onClick: o[2] || (o[2] = (a) => s.$emit("toggle-fullscreen"))
      }, oe(i.isFullscreen ? "⤡" : "⤢"), 11, tt)) : ne("", !0)
    ], 2));
  }
}), nt = ["data-fullscreen", "data-controls-position"], st = /* @__PURE__ */ xe({
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
    const n = i, s = t, o = z(null), a = z(null), c = z(null), h = z(!1), u = z(1), l = z([1]), p = z(1), v = z("landscape"), x = z(null), S = Qe(
      () => o.value,
      (f) => {
        s("fullscreen-changed", f), requestAnimationFrame(() => {
          var F;
          return (F = b.getInstance()) == null ? void 0 : F.update();
        }), !f && n.pinchZoom === "fullscreen" && g.reset();
      }
    ), C = S.isFullscreen, m = z(!1), { pdf: y, totalPages: k, loading: O, progress: B, error: d, load: L, teardown: I } = Te(), g = Je(() => a.value, {
      maxZoom: () => n.maxZoom,
      allowZoom: () => n.pinchZoom !== !1 && (n.pinchZoom !== "fullscreen" || C.value),
      onChange: (f) => s("zoom-changed", f)
    }), b = Ke({
      onFlip(f) {
        E(), p.value = f, P.updateWindow(u.value), s("page-changed", { page: u.value, totalPages: k.value });
      },
      onFlipStart(f, F) {
        p.value = F, s("flip-start", {
          fromPage: Math.min(f, k.value),
          toPage: Math.min(F, k.value)
        });
      },
      onOrientationChange(f) {
        v.value = f, E(), P.updateWindow(u.value), s("orientation-changed", f);
      }
    });
    function E() {
      var j;
      const f = (j = b.getInstance()) == null ? void 0 : j.getCurrentSpread();
      if (!(f != null && f.length)) return;
      const F = f.filter((ie) => ie <= k.value);
      l.value = F.length ? F : [k.value], u.value = l.value[0];
    }
    const P = Ve({
      renderScale: () => n.renderScale,
      renderRange: () => n.renderRange,
      onRendered: (f) => s("rendered", { page: f }),
      onError: (f, F) => s("error", F)
    });
    let R = 0;
    async function $() {
      var he;
      const f = ++R;
      h.value = !1, m.value = !1, g.reset(), P.reset(), b.destroy();
      const F = await L(n.src, {
        workerSrc: n.workerSrc,
        pdfOptions: n.pdfOptions
      });
      if (f !== R) return;
      if (!F) {
        d.value && s("error", d.value);
        return;
      }
      const j = await F.getPage(1);
      if (f !== R) return;
      const ie = j.getViewport({ scale: 1 }), ce = n.width, ue = n.height ?? Math.round(ce * (ie.height / ie.width));
      await De();
      const de = c.value;
      if (f !== R || !de) return;
      const fe = n.showCover && F.numPages % 2 === 1, Le = await b.init(de, {
        pageCount: F.numPages + (fe ? 1 : 0),
        trailingBlank: fe,
        pageWidth: ce,
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
      if (f !== R) {
        b.destroy();
        return;
      }
      P.setDocument(F), Le.forEach((pe, Me) => {
        pe.canvas && P.registerCanvas(Me + 1, pe.canvas);
      }), E(), p.value = u.value, x.value = { width: ce, height: ue }, v.value = ((he = b.getInstance()) == null ? void 0 : he.getOrientation()) ?? v.value, P.updateWindow(u.value), h.value = !0, requestAnimationFrame(() => {
        f === R && (m.value = !0);
      }), s("loaded", { totalPages: F.numPages, pdf: F });
    }
    function V() {
      R++, h.value = !1, P.reset(), b.destroy(), I();
    }
    Re(() => {
      S.listen(), g.listen(), $();
    }), We(() => {
      S.unlisten(), g.unlisten(), V();
    }), ze(
      () => n.src,
      () => void $()
    );
    function N() {
      b.next();
    }
    function H() {
      b.prev();
    }
    function _(f) {
      b.goToPage(f);
    }
    async function U() {
      await $();
    }
    const se = Z(() => !h.value || v.value !== "landscape" ? null : n.showCover && p.value <= 1 ? "-25%" : p.value >= k.value ? "25%" : null), ee = Z(() => {
      var f;
      return Math.max(0, ((f = n.flipOptions) == null ? void 0 : f.flippingTime) ?? 800);
    }), r = Z(() => {
      const f = { position: "relative", width: "100%" };
      if (m.value && ee.value > 0 && (f.transition = `transform ${ee.value}ms ease`), se.value && (f.transform = `translateX(${se.value})`), C.value && x.value) {
        const j = (v.value === "landscape" ? 2 : 1) * x.value.width / x.value.height;
        f.maxWidth = `min(100%, calc((100vh - 6rem) * ${j}))`, f.marginLeft = "auto", f.marginRight = "auto";
      }
      return f;
    }), w = Z(() => ({
      position: "relative",
      width: "100%",
      overflow: g.zoom.value > 1 ? "hidden" : "visible"
    })), D = Z(
      () => h.value && u.value === 1 && !C.value && g.zoom.value === 1 && Fe()
    ), A = Z(() => {
      const f = {
        position: "absolute",
        top: "0",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: "2"
      };
      return v.value === "portrait" ? (f.left = "0", f.width = "100%") : n.showCover ? (f.left = "50%", f.width = "50%") : (f.left = "0", f.width = "50%"), f;
    }), T = Z(
      () => C.value ? { display: "flex", flexDirection: "column", justifyContent: "center", overflow: "auto" } : void 0
    ), M = Z(() => ({
      currentPage: u.value,
      visiblePages: l.value,
      totalPages: k.value,
      next: N,
      prev: H,
      goToPage: _,
      canGoNext: u.value < k.value,
      canGoPrev: u.value > 1,
      isFullscreen: C.value,
      toggleFullscreen: () => void S.toggle(),
      zoom: g.zoom.value,
      setZoom: g.setZoom,
      resetZoom: g.reset
    }));
    return e({
      next: N,
      prev: H,
      goToPage: _,
      currentPage: ae(u),
      totalPages: ae(k),
      reload: U,
      isFullscreen: ae(C),
      enterFullscreen: S.enter,
      exitFullscreen: S.exit,
      toggleFullscreen: S.toggle,
      getPdfDocument: () => y.value,
      getFlipInstance: () => b.getInstance(),
      zoom: ae(g.zoom),
      setZoom: g.setZoom,
      resetZoom: g.reset
    }), (f, F) => (K(), J("div", {
      ref_key: "rootRef",
      ref: o,
      class: G(["vpf-container", [i.containerClass, Y(C) ? i.fullscreenClass : void 0]]),
      style: te(T.value),
      "data-fullscreen": Y(C) ? "" : void 0,
      "data-controls-position": i.controlsPosition,
      "data-pdf-flipbook": ""
    }, [
      Y(d) ? (K(), J("div", {
        key: 0,
        class: G(["vpf-error", i.errorClass]),
        "data-pdf-flipbook-error": ""
      }, [
        re(f.$slots, "error", {
          error: Y(d),
          retry: U
        }, () => [
          X("div", null, "Failed to load PDF: " + oe(Y(d).message), 1),
          X("button", {
            type: "button",
            class: G(["vpf-button", i.buttonClass]),
            onClick: U
          }, " Retry ", 2)
        ])
      ], 2)) : Y(O) ? (K(), J("div", {
        key: 1,
        class: G(["vpf-loading", i.loadingClass]),
        "data-pdf-flipbook-loading": ""
      }, [
        re(f.$slots, "loading", { progress: Y(B) }, () => [
          F[1] || (F[1] = X("div", null, "Loading…", -1))
        ])
      ], 2)) : ne("", !0),
      h.value && i.controlsPosition === "top" ? re(f.$slots, "controls", ve(me({ key: 2 }, M.value)), () => [
        be(Pe, {
          "current-page": M.value.currentPage,
          "visible-pages": M.value.visiblePages,
          "total-pages": M.value.totalPages,
          "can-go-next": M.value.canGoNext,
          "can-go-prev": M.value.canGoPrev,
          "is-fullscreen": M.value.isFullscreen,
          "controls-class": i.controlsClass,
          "button-class": i.buttonClass,
          "page-indicator-class": i.pageIndicatorClass,
          onNext: N,
          onPrev: H,
          onToggleFullscreen: M.value.toggleFullscreen
        }, null, 8, ["current-page", "visible-pages", "total-pages", "can-go-next", "can-go-prev", "is-fullscreen", "controls-class", "button-class", "page-indicator-class", "onToggleFullscreen"])
      ]) : ne("", !0),
      Be(X("div", {
        ref_key: "viewportRef",
        ref: a,
        class: "vpf-zoom-viewport",
        style: te(w.value),
        "data-pdf-flipbook-viewport": ""
      }, [
        X("div", {
          class: "vpf-zoom-content",
          style: te(Y(g).contentStyle.value),
          "data-pdf-flipbook-zoom": ""
        }, [
          X("div", {
            class: "vpf-book-shell",
            style: te(r.value),
            "data-pdf-flipbook-shell": ""
          }, [
            X("div", {
              ref_key: "bookRef",
              ref: c,
              class: G(["vpf-book", i.bookClass]),
              "data-pdf-flipbook-book": ""
            }, null, 2),
            D.value ? (K(), J("div", {
              key: 0,
              class: "vpf-fullscreen-hint",
              style: te(A.value),
              "data-pdf-flipbook-fullscreen-hint": ""
            }, [
              X("button", {
                type: "button",
                class: G(["vpf-button vpf-fullscreen-hint-button", i.buttonClass]),
                "data-pdf-flipbook-fullscreen-hint-button": "",
                onClick: F[0] || (F[0] = $e((j) => void Y(S).enter(), ["stop"]))
              }, " View in fullscreen ", 2)
            ], 4)) : ne("", !0)
          ], 4)
        ], 4)
      ], 4), [
        [Ye, !Y(d) && !Y(O)]
      ]),
      h.value && i.controlsPosition === "bottom" ? re(f.$slots, "controls", ve(me({ key: 3 }, M.value)), () => [
        be(Pe, {
          "current-page": M.value.currentPage,
          "visible-pages": M.value.visiblePages,
          "total-pages": M.value.totalPages,
          "can-go-next": M.value.canGoNext,
          "can-go-prev": M.value.canGoPrev,
          "is-fullscreen": M.value.isFullscreen,
          "controls-class": i.controlsClass,
          "button-class": i.buttonClass,
          "page-indicator-class": i.pageIndicatorClass,
          onNext: N,
          onPrev: H,
          onToggleFullscreen: M.value.toggleFullscreen
        }, null, 8, ["current-page", "visible-pages", "total-pages", "can-go-next", "can-go-prev", "is-fullscreen", "controls-class", "button-class", "page-indicator-class", "onToggleFullscreen"])
      ]) : ne("", !0)
    ], 14, nt));
  }
}), rt = {
  install(i, e) {
    e != null && e.workerSrc && Xe(e.workerSrc), i.component("PdfFlipbook", st);
  }
};
export {
  st as PdfFlipbook,
  rt as default,
  Xe as setGlobalWorkerSrc
};
