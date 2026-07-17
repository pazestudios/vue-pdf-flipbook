var Ie = Object.defineProperty;
var Re = (i, e, t) => e in i ? Ie(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var W = (i, e, t) => Re(i, typeof e != "symbol" ? e + "" : e, t);
import { shallowRef as ve, ref as z, computed as Z, defineComponent as Se, openBlock as K, createElementBlock as J, normalizeClass as G, createElementVNode as X, toDisplayString as le, unref as Y, createCommentVNode as se, onMounted as We, onBeforeUnmount as ze, watch as Be, readonly as re, normalizeStyle as ne, renderSlot as oe, normalizeProps as me, mergeProps as be, createVNode as ye, withDirectives as $e, withModifiers as Ye, vShow as De, nextTick as Ae } from "vue";
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
function Xe() {
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
function Ge(i) {
  Ee = i;
}
function Ze(i) {
  return `https://cdn.jsdelivr.net/npm/pdfjs-dist@${i.version}/build/pdf.worker.min.mjs`;
}
function Fe(i) {
  i.GlobalWorkerOptions.workerSrc = Ze(i), Ce || (Ce = !0, console.warn(
    '[vue-pdf-flipbook] Falling back to loading the pdf.js worker from jsdelivr. For offline or CSP-restricted environments, pass a `workerSrc` prop or plugin option (e.g. in Vite: `import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"`).'
  ));
}
async function Ne(i) {
  try {
    const e = await fetch(i, { method: "HEAD" });
    return e.ok ? (e.headers.get("content-type") ?? "").includes("javascript") : !1;
  } catch {
    return !1;
  }
}
async function He(i, e) {
  if (!ce()) return !0;
  const t = e ?? Ee;
  if (t)
    return i.GlobalWorkerOptions.workerSrc = t, !0;
  if (i.GlobalWorkerOptions.workerSrc) return !0;
  const n = "pdfjs-dist/build/pdf.worker.min.mjs";
  try {
    const s = new URL(n, import.meta.url).toString();
    if (s.startsWith("http") && await Ne(s))
      return i.GlobalWorkerOptions.workerSrc = s, !1;
  } catch {
  }
  return Fe(i), !1;
}
function ke(i) {
  return typeof i == "string" || i instanceof URL ? { url: i.toString() } : i instanceof ArrayBuffer ? { data: new Uint8Array(i.slice(0)) } : { data: i.slice() };
}
function Te(i) {
  const e = i instanceof Error ? i.message : String(i);
  return /worker/i.test(e) || /import/i.test(e);
}
function je() {
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
    const g = o;
    try {
      Xe();
      const v = await import("pdfjs-dist"), C = await He(v, l.workerSrc);
      if (g !== o) return null;
      const L = { ...ke(u), ...l.pdfOptions }, k = () => {
        const b = v.getDocument(L);
        return b.onProgress = (O) => {
          g === o && O.total > 0 && (n.value = Math.min(1, O.loaded / O.total));
        }, a = b, b.promise;
      };
      let p;
      try {
        p = await k();
      } catch (b) {
        if (C || !Te(b)) throw b;
        Fe(v), Object.assign(L, ke(u)), p = await k();
      }
      return g !== o ? (p.destroy().catch(() => {
      }), null) : (i.value = p, e.value = p.numPages, p);
    } catch (v) {
      return g === o && (s.value = v instanceof Error ? v : new Error(String(v))), null;
    } finally {
      g === o && (t.value = !1);
    }
  }
  return { pdf: i, totalPages: e, loading: t, progress: n, error: s, load: h, teardown: c };
}
function Ve(i) {
  return i instanceof Error && i.name === "RenderingCancelledException";
}
function Ue(i) {
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
    const f = e.numPages, P = u(), I = [];
    for (let S = 1; S <= f; S++)
      Math.abs(S - o) <= P && !n.has(S) && !s.has(S) && t.has(S) && I.push(S);
    return I.sort((S, m) => {
      const y = Math.abs(S - o), F = Math.abs(m - o);
      return y === F ? m - S : y - F;
    }), I;
  }
  function g() {
    const f = u();
    if (f !== 1 / 0) {
      for (const P of n)
        if (Math.abs(P - o) > f * 2) {
          const I = t.get(P);
          I && (I.width = 0, I.height = 0), n.delete(P);
        }
    }
  }
  async function v(f) {
    var m, y;
    if (!e) return;
    const P = t.get(f);
    if (!P) return;
    const I = e, S = { page: f, task: null, cancelled: !1 };
    a = S;
    try {
      const F = await I.getPage(f);
      if (S.cancelled || e !== I) return;
      const R = F.getViewport({ scale: i.renderScale() * h() });
      if (P.width = Math.floor(R.width), P.height = Math.floor(R.height), S.task = F.render({ canvas: P, viewport: R }), await S.task.promise, S.cancelled || e !== I) return;
      n.add(f), (m = i.onRendered) == null || m.call(i, f);
    } catch (F) {
      !Ve(F) && !S.cancelled && (s.add(f), (y = i.onError) == null || y.call(i, f, F instanceof Error ? F : new Error(String(F))));
    } finally {
      a === S && (a = null);
    }
  }
  function C() {
    return new Promise((f) => {
      typeof requestIdleCallback == "function" ? requestIdleCallback(() => f()) : setTimeout(f, 16);
    });
  }
  async function L() {
    if (!c) {
      c = !0;
      try {
        const f = i.renderRange() === 1 / 0;
        let P;
        for (; e && (P = l()[0]) !== void 0; )
          f && await C(), await v(P);
      } finally {
        c = !1;
      }
    }
  }
  function k() {
    var f;
    a && Math.abs(a.page - o) > u() && (a.cancelled = !0, (f = a.task) == null || f.cancel());
  }
  function p(f) {
    x(), e = f, n.clear(), s.clear();
  }
  function b(f, P) {
    t.set(f, P);
  }
  function O(f) {
    o = f, k(), g(), L();
  }
  function x() {
    var f;
    a && (a.cancelled = !0, (f = a.task) == null || f.cancel(), a = null);
  }
  function B() {
    x(), e = null, t.clear(), n.clear(), s.clear(), o = 1;
  }
  return {
    setDocument: p,
    registerCanvas: b,
    updateWindow: O,
    cancelAll: x,
    reset: B,
    isRendered: (f) => n.has(f)
  };
}
function q(i) {
  return `${+(i * 100).toFixed(2)}%`;
}
function qe(i) {
  return i < 0.5 ? 2 * i * i : 1 - (-2 * i + 2) ** 2 / 2;
}
function Pe() {
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
    const h = Math.cos(Math.PI * a), u = 0.5 * Math.max(h, 0), l = 0.5 * Math.max(-h, 0), g = s ? 0.5 : n === 1 ? l : u, v = o ? 0.5 : n === 1 ? u : l, C = c.shadow.style;
    C.left = q(0.5 - g), C.width = q(g + v), C.opacity = String(e.shadowOpacity + (t.shadowOpacity - e.shadowOpacity) * a);
    const L = Math.max(0, 2 * a - 1), k = Math.max(0, 1 - 2 * a), p = (B, f) => String(f > B ? B + (f - B) * L : f + (B - f) * k), b = a >= 0.5;
    c.spine.style.opacity = p(e.spineOpacity, t.spineOpacity);
    const O = p(e.bendOpacity, t.bendOpacity);
    c.bendLeft.style.opacity = O, c.bendRight.style.opacity = O, c.bendLeft.style.background = b ? t.bendLeftBg : e.bendLeftBg, c.bendRight.style.background = b ? t.bendRightBg : e.bendRightBg;
    const x = c.coverSpine.style;
    x.opacity = p(e.coverSpineOpacity, t.coverSpineOpacity), x.left = q(b ? t.coverSpineLeft : e.coverSpineLeft), x.background = b ? t.coverSpineBg : e.coverSpineBg;
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
    var O, x, B, f, P, I, S;
    if (this.destroyed || this.anim || e < 0 || e >= this.spreads.length || e === this.spreadIndex) return;
    const t = e > this.spreadIndex ? 1 : -1, n = ((O = this.spreads[e]) == null ? void 0 : O[0]) ?? this.getCurrentPage();
    (B = (x = this.opts).onFlipStart) == null || B.call(x, this.getCurrentPage(), n);
    let s, o;
    const a = [];
    if (this.orientation === "portrait")
      s = (f = this.spreads[this.spreadIndex]) == null ? void 0 : f[0], o = (P = this.spreads[e]) == null ? void 0 : P[0];
    else {
      const m = this.slotPages(this.spreadIndex), y = this.slotPages(e);
      t === 1 ? (s = m.right, o = y.left, a.push({ page: m.left, slot: "left" }, { page: y.right, slot: "right" })) : (s = m.left, o = y.right, a.push({ page: m.right, slot: "right" }, { page: y.left, slot: "left" }));
    }
    const c = s ? this.pageEl(s) : void 0, h = o ? this.pageEl(o) : void 0;
    if (!c || !h) {
      this.spreadIndex = e, this.layout(), (S = (I = this.opts).onFlip) == null || S.call(I, this.getCurrentPage());
      return;
    }
    this.hideAll();
    for (const { page: m, slot: y } of a)
      m && this.showAt(m, y);
    let u = null;
    if (this.chrome)
      if (this.orientation === "portrait")
        this.updateChrome(e);
      else {
        const m = a.some((M) => M.page !== void 0 && M.slot === "left"), y = a.some((M) => M.page !== void 0 && M.slot === "right"), F = this.chromeStateFor(this.spreadIndex), R = this.chromeStateFor(e);
        u = (M) => this.stepChrome(F, R, t, m, y, M);
      }
    const { leaf: l, shadows: g } = this.buildLeaf(t, c, h, e);
    this.stage.appendChild(l);
    const v = Math.max(0, this.opts.flippingTime ?? 800), C = t === 1 ? -180 : 180, L = this.opts.maxShadowOpacity ?? 0.4, k = Pe(), p = {
      leaf: l,
      movedPages: [c, h],
      shadows: g,
      chrome: u,
      targetSpread: e,
      endAngle: C,
      raf: 0
    };
    this.anim = p;
    const b = () => {
      var R;
      if (this.destroyed || this.anim !== p) return;
      const m = v === 0 ? 1 : Math.min(1, (Pe() - k) / v), y = qe(m);
      l.style.transform = `rotateY(${C * y}deg)`, (R = p.chrome) == null || R.call(p, y);
      const F = Math.sin(Math.PI * y) * L;
      for (const M of p.shadows) M.style.opacity = String(F);
      m < 1 ? p.raf = requestAnimationFrame(b) : this.finishFlip(p);
    };
    b();
  }
  buildLeaf(e, t, n, s) {
    const o = this.orientation === "landscape", a = document.createElement("div");
    a.className = "vpf-leaf";
    const c = a.style;
    c.position = "absolute", c.top = "0", c.height = "100%", c.width = o ? "50%" : "100%", c.left = o && e === 1 ? "50%" : "0", c.transformOrigin = o ? e === 1 ? "left center" : "right center" : "center center", c.transformStyle = "preserve-3d", c.zIndex = "10", c.pointerEvents = "none", c.willChange = "transform";
    const h = [], u = e === 1 ? "right" : "left", l = (g, v) => {
      const C = document.createElement("div"), L = C.style;
      L.position = "absolute", L.inset = "0", L.backfaceVisibility = "hidden", L.overflow = "hidden", v && (L.transform = "rotateY(180deg)");
      const k = g.style;
      if (k.display = "block", k.position = "absolute", k.top = "0", k.left = "0", k.width = "100%", k.height = "100%", C.appendChild(g), this.opts.drawShadow !== !1 && o) {
        const p = e === 1 !== v ? "right" : "left", b = this.gutterShadingFor(v ? s : this.spreadIndex, p);
        if (b) {
          const O = document.createElement("div");
          O.className = "vpf-leaf-bend";
          const x = O.style;
          x.position = "absolute", x.inset = "0", x.pointerEvents = "none", x.background = b, C.appendChild(O);
        }
      }
      if (this.opts.drawShadow !== !1) {
        const p = document.createElement("div"), b = p.style;
        b.position = "absolute", b.inset = "0", b.pointerEvents = "none", b.opacity = "0", b.background = `linear-gradient(to ${u}, rgba(0,0,0,0.65), rgba(0,0,0,0) 65%)`, C.appendChild(p), h.push(p);
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
function Ke(i) {
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
function Je(i) {
  let e = null, t = [], n = null;
  async function s(u, l) {
    return o(), n = u, t = Ke(l), e = new Q(u, {
      pages: t.map((g) => g.root),
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
function Qe(i, e) {
  const t = z(1), n = z(0), s = z(0), o = Z(() => t.value === 1 ? {} : {
    transform: `translate(${n.value}px, ${s.value}px) scale(${t.value})`,
    transformOrigin: "0 0",
    willChange: "transform"
  });
  let a = null, c = null, h = null, u = null, l = null, g = !1, v = null;
  const C = () => {
    var r;
    return e.maxZoom() > 1 && (((r = e.allowZoom) == null ? void 0 : r.call(e)) ?? !0);
  };
  function L(r) {
    return Math.min(Math.max(r, 1), Math.max(e.maxZoom(), 1));
  }
  function k() {
    a && (n.value = Math.min(0, Math.max(a.clientWidth * (1 - t.value), n.value)), s.value = Math.min(0, Math.max(a.clientHeight * (1 - t.value), s.value)));
  }
  function p(r, w, D) {
    var U;
    const A = L(r), j = t.value;
    A !== j && (n.value = w - (w - n.value) / j * A, s.value = D - (D - s.value) / j * A, t.value = A, A === 1 ? (n.value = 0, s.value = 0, u = null, l = null) : k(), B(), (U = e.onChange) == null || U.call(e, A));
  }
  function b(r, w) {
    n.value += r, s.value += w, k();
  }
  function O(r) {
    a && p(r, a.clientWidth / 2, a.clientHeight / 2);
  }
  function x() {
    var r;
    h = null, u = null, l = null, t.value !== 1 && (t.value = 1, n.value = 0, s.value = 0, B(), (r = e.onChange) == null || r.call(e, 1));
  }
  function B() {
    a && (a.style.touchAction = t.value > 1 ? "none" : "", a.style.cursor = t.value > 1 ? u ? "grabbing" : "grab" : "");
  }
  function f(r, w) {
    const D = a.getBoundingClientRect();
    return { x: r - D.left, y: w - D.top };
  }
  const P = (r) => {
    if (!a || !C()) return;
    const w = r.ctrlKey || r.metaKey, D = r.deltaMode === 1 ? r.deltaY * 16 : r.deltaY, A = L(t.value * Math.exp(-D * (w ? 0.01 : 22e-4)));
    if (A === t.value && !w) return;
    r.preventDefault();
    const { x: j, y: U } = f(r.clientX, r.clientY);
    p(A, j, U);
  }, I = (r) => Math.hypot(
    r[0].clientX - r[1].clientX,
    r[0].clientY - r[1].clientY
  ), S = (r) => f(
    (r[0].clientX + r[1].clientX) / 2,
    (r[0].clientY + r[1].clientY) / 2
  ), m = (r) => {
    if (C())
      if (r.touches.length === 2) {
        r.preventDefault(), u = null, l = null;
        const w = S(r.touches);
        h = {
          startDist: I(r.touches),
          startZoom: t.value,
          lastMidX: w.x,
          lastMidY: w.y
        };
      } else r.touches.length === 1 && t.value > 1 && (l = { lastX: r.touches[0].clientX, lastY: r.touches[0].clientY });
  }, y = (r) => {
    if (h && r.touches.length >= 2) {
      r.preventDefault();
      const w = S(r.touches);
      b(w.x - h.lastMidX, w.y - h.lastMidY), h.lastMidX = w.x, h.lastMidY = w.y, p(h.startZoom * I(r.touches) / h.startDist, w.x, w.y);
    } else if (l && r.touches.length === 1 && t.value > 1) {
      r.preventDefault();
      const w = r.touches[0];
      b(w.clientX - l.lastX, w.clientY - l.lastY), l.lastX = w.clientX, l.lastY = w.clientY;
    }
  }, F = (r) => {
    h && r.touches.length < 2 && (h = null, g = !0), r.touches.length === 1 && t.value > 1 ? l = { lastX: r.touches[0].clientX, lastY: r.touches[0].clientY } : l = null;
  }, R = (r) => {
    var w;
    g = !1, !(t.value <= 1) && (r.stopPropagation(), r.pointerType !== "touch" && (u = { pointerId: r.pointerId, lastX: r.clientX, lastY: r.clientY }, (w = a == null ? void 0 : a.setPointerCapture) == null || w.call(a, r.pointerId)), B());
  }, M = (r) => {
    !u || r.pointerId !== u.pointerId || h || (b(r.clientX - u.lastX, r.clientY - u.lastY), u.lastX = r.clientX, u.lastY = r.clientY);
  }, N = (r) => {
    (t.value > 1 || h) && r.stopPropagation(), u && r.pointerId === u.pointerId && (u = null, B());
  }, ie = (r) => {
    (t.value > 1 || g) && (g = !1, r.stopPropagation(), r.preventDefault());
  }, H = (r) => {
    C() && (r.preventDefault(), v = t.value);
  }, T = (r) => {
    if (!C() || (r.preventDefault(), h || v === null)) return;
    const { x: w, y: D } = f(r.clientX, r.clientY);
    p(v * r.scale, w, D);
  }, _ = (r) => {
    r.preventDefault(), v = null;
  };
  function ee() {
    te(), a = i(), a && (a.addEventListener("wheel", P, { passive: !1 }), a.addEventListener("touchstart", m, { passive: !1 }), a.addEventListener("touchmove", y, { passive: !1 }), a.addEventListener("touchend", F), a.addEventListener("touchcancel", F), a.addEventListener("pointerdown", R, { capture: !0 }), a.addEventListener("pointermove", M), a.addEventListener("pointerup", N, { capture: !0 }), a.addEventListener("pointercancel", N, { capture: !0 }), a.addEventListener("click", ie, { capture: !0 }), a.addEventListener("gesturestart", H, { passive: !1 }), a.addEventListener("gesturechange", T, { passive: !1 }), a.addEventListener("gestureend", _, { passive: !1 }), typeof ResizeObserver < "u" && (c = new ResizeObserver(() => k()), c.observe(a)));
  }
  function te() {
    a && (a.removeEventListener("wheel", P), a.removeEventListener("touchstart", m), a.removeEventListener("touchmove", y), a.removeEventListener("touchend", F), a.removeEventListener("touchcancel", F), a.removeEventListener("pointerdown", R, { capture: !0 }), a.removeEventListener("pointermove", M), a.removeEventListener("pointerup", N, { capture: !0 }), a.removeEventListener("pointercancel", N, { capture: !0 }), a.removeEventListener("click", ie, { capture: !0 }), a.removeEventListener("gesturestart", H), a.removeEventListener("gesturechange", T), a.removeEventListener("gestureend", _), c == null || c.disconnect(), c = null, h = null, u = null, l = null, a = null);
  }
  return { zoom: t, contentStyle: o, setZoom: O, reset: x, listen: ee, unlisten: te };
}
function Le() {
  if (!ce()) return !1;
  const i = document;
  return !!(i.fullscreenEnabled ?? i.webkitFullscreenEnabled);
}
function _e(i, e) {
  const t = z(!1);
  function n() {
    const l = document;
    return l.fullscreenElement ?? l.webkitFullscreenElement ?? null;
  }
  function s() {
    const l = i(), g = l !== null && n() === l;
    g !== t.value && (t.value = g, e == null || e(g));
  }
  function o() {
    document.addEventListener("fullscreenchange", s), document.addEventListener("webkitfullscreenchange", s);
  }
  function a() {
    document.removeEventListener("fullscreenchange", s), document.removeEventListener("webkitfullscreenchange", s);
  }
  async function c() {
    var g, v;
    const l = i();
    if (!(!l || t.value))
      try {
        await (((g = l.requestFullscreen) == null ? void 0 : g.call(l)) ?? ((v = l.webkitRequestFullscreen) == null ? void 0 : v.call(l)));
      } catch {
      }
  }
  async function h() {
    var g, v;
    if (!n()) return;
    const l = document;
    try {
      await (((g = l.exitFullscreen) == null ? void 0 : g.call(l)) ?? ((v = l.webkitExitFullscreen) == null ? void 0 : v.call(l)));
    } catch {
    }
  }
  async function u() {
    t.value ? await h() : await c();
  }
  return { isFullscreen: t, enter: c, exit: h, toggle: u, listen: o, unlisten: a };
}
const et = ["disabled"], tt = ["disabled"], nt = ["aria-label"], xe = /* @__PURE__ */ Se({
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
    const e = i, t = Le(), n = Z(() => {
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
      }, " ‹ ", 10, et),
      X("span", {
        class: G(["vpf-indicator", i.pageIndicatorClass]),
        "data-pdf-flipbook-indicator": ""
      }, le(n.value) + " / " + le(i.totalPages), 3),
      X("button", {
        type: "button",
        class: G(["vpf-button", i.buttonClass]),
        disabled: !i.canGoNext,
        "aria-label": "Next page",
        "data-pdf-flipbook-next": "",
        onClick: o[1] || (o[1] = (a) => s.$emit("next"))
      }, " › ", 10, tt),
      Y(t) ? (K(), J("button", {
        key: 0,
        type: "button",
        class: G(["vpf-button", i.buttonClass]),
        "aria-label": i.isFullscreen ? "Exit full screen" : "Enter full screen",
        "data-pdf-flipbook-fullscreen": "",
        onClick: o[2] || (o[2] = (a) => s.$emit("toggle-fullscreen"))
      }, le(i.isFullscreen ? "⤡" : "⤢"), 11, nt)) : se("", !0)
    ], 2));
  }
}), st = ["data-fullscreen", "data-controls-position"], it = /* @__PURE__ */ Se({
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
    const n = i, s = t, o = z(null), a = z(null), c = z(null), h = z(!1), u = z(1), l = z([1]), g = z(1), v = z(1), C = z("landscape"), L = z(null), k = _e(
      () => o.value,
      (d) => {
        s("fullscreen-changed", d), requestAnimationFrame(() => {
          var E;
          return (E = y.getInstance()) == null ? void 0 : E.update();
        }), !d && n.pinchZoom === "fullscreen" && m.reset();
      }
    ), p = k.isFullscreen, b = z(!1), { pdf: O, totalPages: x, loading: B, progress: f, error: P, load: I, teardown: S } = je(), m = Qe(() => a.value, {
      maxZoom: () => n.maxZoom,
      allowZoom: () => n.pinchZoom !== !1 && (n.pinchZoom !== "fullscreen" || p.value),
      onChange: (d) => s("zoom-changed", d)
    }), y = Je({
      onFlip(d) {
        F(), v.value = d, R.updateWindow(u.value), s("page-changed", { page: u.value, totalPages: x.value });
      },
      onFlipStart(d, E) {
        v.value = E, g.value = E, s("flip-start", {
          fromPage: Math.min(d, x.value),
          toPage: Math.min(E, x.value)
        });
      },
      onOrientationChange(d) {
        C.value = d, F(), R.updateWindow(u.value), s("orientation-changed", d);
      }
    });
    function F() {
      var V;
      const d = (V = y.getInstance()) == null ? void 0 : V.getCurrentSpread();
      if (!(d != null && d.length)) return;
      g.value = d[0];
      const E = d.filter((ae) => ae <= x.value);
      l.value = E.length ? E : [x.value], u.value = l.value[0];
    }
    const R = Ue({
      renderScale: () => n.renderScale,
      renderRange: () => n.renderRange,
      onRendered: (d) => s("rendered", { page: d }),
      onError: (d, E) => s("error", E)
    });
    let M = 0;
    async function N() {
      var pe;
      const d = ++M;
      h.value = !1, b.value = !1, m.reset(), R.reset(), y.destroy();
      const E = await I(n.src, {
        workerSrc: n.workerSrc,
        pdfOptions: n.pdfOptions
      });
      if (d !== M) return;
      if (!E) {
        P.value && s("error", P.value);
        return;
      }
      const V = await E.getPage(1);
      if (d !== M) return;
      const ae = V.getViewport({ scale: 1 }), ue = n.width, de = n.height ?? Math.round(ue * (ae.height / ae.width));
      await Ae();
      const fe = c.value;
      if (d !== M || !fe) return;
      const he = n.showCover && E.numPages % 2 === 1, Me = await y.init(fe, {
        pageCount: E.numPages + (he ? 1 : 0),
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
      if (d !== M) {
        y.destroy();
        return;
      }
      R.setDocument(E), Me.forEach((ge, Oe) => {
        ge.canvas && R.registerCanvas(Oe + 1, ge.canvas);
      }), F(), v.value = u.value, L.value = { width: ue, height: de }, C.value = ((pe = y.getInstance()) == null ? void 0 : pe.getOrientation()) ?? C.value, R.updateWindow(u.value), h.value = !0, requestAnimationFrame(() => {
        d === M && (b.value = !0);
      }), s("loaded", { totalPages: E.numPages, pdf: E });
    }
    function ie() {
      M++, h.value = !1, R.reset(), y.destroy(), S();
    }
    We(() => {
      k.listen(), m.listen(), N();
    }), ze(() => {
      k.unlisten(), m.unlisten(), ie();
    }), Be(
      () => n.src,
      () => void N()
    );
    function H() {
      y.next();
    }
    function T() {
      y.prev();
    }
    function _(d) {
      y.goToPage(d);
    }
    async function ee() {
      await N();
    }
    const te = Z(() => !h.value || C.value !== "landscape" ? null : n.showCover && v.value <= 1 ? "-25%" : v.value >= x.value ? "25%" : null), r = Z(() => {
      var d;
      return Math.max(0, ((d = n.flipOptions) == null ? void 0 : d.flippingTime) ?? 800);
    }), w = Z(() => {
      const d = { position: "relative", width: "100%" };
      if (b.value && r.value > 0 && (d.transition = `transform ${r.value}ms ease`), te.value && (d.transform = `translateX(${te.value})`), p.value && L.value) {
        const V = (C.value === "landscape" ? 2 : 1) * L.value.width / L.value.height;
        d.maxWidth = `min(100%, calc((100vh - 6rem) * ${V}))`, d.marginLeft = "auto", d.marginRight = "auto";
      }
      return d;
    }), D = Z(() => ({
      position: "relative",
      width: "100%",
      overflow: m.zoom.value > 1 ? "hidden" : "visible"
    })), A = Z(
      () => h.value && g.value === 1 && !p.value && m.zoom.value === 1 && Le()
    ), j = Z(() => {
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
      return C.value === "portrait" ? (d.left = "0", d.width = "100%") : n.showCover ? (d.left = "50%", d.width = "50%") : (d.left = "0", d.width = "50%"), d;
    }), U = Z(
      () => p.value ? { display: "flex", flexDirection: "column", justifyContent: "center", overflow: "auto" } : void 0
    ), $ = Z(() => ({
      currentPage: u.value,
      visiblePages: l.value,
      totalPages: x.value,
      next: H,
      prev: T,
      goToPage: _,
      canGoNext: u.value < x.value,
      canGoPrev: u.value > 1,
      isFullscreen: p.value,
      toggleFullscreen: () => void k.toggle(),
      zoom: m.zoom.value,
      setZoom: m.setZoom,
      resetZoom: m.reset
    }));
    return e({
      next: H,
      prev: T,
      goToPage: _,
      currentPage: re(u),
      totalPages: re(x),
      reload: ee,
      isFullscreen: re(p),
      enterFullscreen: k.enter,
      exitFullscreen: k.exit,
      toggleFullscreen: k.toggle,
      getPdfDocument: () => O.value,
      getFlipInstance: () => y.getInstance(),
      zoom: re(m.zoom),
      setZoom: m.setZoom,
      resetZoom: m.reset
    }), (d, E) => (K(), J("div", {
      ref_key: "rootRef",
      ref: o,
      class: G(["vpf-container", [i.containerClass, Y(p) ? i.fullscreenClass : void 0]]),
      style: ne(U.value),
      "data-fullscreen": Y(p) ? "" : void 0,
      "data-controls-position": i.controlsPosition,
      "data-pdf-flipbook": ""
    }, [
      Y(P) ? (K(), J("div", {
        key: 0,
        class: G(["vpf-error", i.errorClass]),
        "data-pdf-flipbook-error": ""
      }, [
        oe(d.$slots, "error", {
          error: Y(P),
          retry: ee
        }, () => [
          X("div", null, "Failed to load PDF: " + le(Y(P).message), 1),
          X("button", {
            type: "button",
            class: G(["vpf-button", i.buttonClass]),
            onClick: ee
          }, " Retry ", 2)
        ])
      ], 2)) : Y(B) ? (K(), J("div", {
        key: 1,
        class: G(["vpf-loading", i.loadingClass]),
        "data-pdf-flipbook-loading": ""
      }, [
        oe(d.$slots, "loading", { progress: Y(f) }, () => [
          E[1] || (E[1] = X("div", null, "Loading…", -1))
        ])
      ], 2)) : se("", !0),
      h.value && i.controlsPosition === "top" ? oe(d.$slots, "controls", me(be({ key: 2 }, $.value)), () => [
        ye(xe, {
          "current-page": $.value.currentPage,
          "visible-pages": $.value.visiblePages,
          "total-pages": $.value.totalPages,
          "can-go-next": $.value.canGoNext,
          "can-go-prev": $.value.canGoPrev,
          "is-fullscreen": $.value.isFullscreen,
          "controls-class": i.controlsClass,
          "button-class": i.buttonClass,
          "page-indicator-class": i.pageIndicatorClass,
          onNext: H,
          onPrev: T,
          onToggleFullscreen: $.value.toggleFullscreen
        }, null, 8, ["current-page", "visible-pages", "total-pages", "can-go-next", "can-go-prev", "is-fullscreen", "controls-class", "button-class", "page-indicator-class", "onToggleFullscreen"])
      ]) : se("", !0),
      $e(X("div", {
        ref_key: "viewportRef",
        ref: a,
        class: "vpf-zoom-viewport",
        style: ne(D.value),
        "data-pdf-flipbook-viewport": ""
      }, [
        X("div", {
          class: "vpf-zoom-content",
          style: ne(Y(m).contentStyle.value),
          "data-pdf-flipbook-zoom": ""
        }, [
          X("div", {
            class: "vpf-book-shell",
            style: ne(w.value),
            "data-pdf-flipbook-shell": ""
          }, [
            X("div", {
              ref_key: "bookRef",
              ref: c,
              class: G(["vpf-book", i.bookClass]),
              "data-pdf-flipbook-book": ""
            }, null, 2),
            A.value ? (K(), J("div", {
              key: 0,
              class: "vpf-fullscreen-hint",
              style: ne(j.value),
              "data-pdf-flipbook-fullscreen-hint": ""
            }, [
              X("button", {
                type: "button",
                class: G(["vpf-button vpf-fullscreen-hint-button", i.buttonClass]),
                "data-pdf-flipbook-fullscreen-hint-button": "",
                onClick: E[0] || (E[0] = Ye((V) => void Y(k).enter(), ["stop"]))
              }, " View in fullscreen ", 2)
            ], 4)) : se("", !0)
          ], 4)
        ], 4)
      ], 4), [
        [De, !Y(P) && !Y(B)]
      ]),
      h.value && i.controlsPosition === "bottom" ? oe(d.$slots, "controls", me(be({ key: 3 }, $.value)), () => [
        ye(xe, {
          "current-page": $.value.currentPage,
          "visible-pages": $.value.visiblePages,
          "total-pages": $.value.totalPages,
          "can-go-next": $.value.canGoNext,
          "can-go-prev": $.value.canGoPrev,
          "is-fullscreen": $.value.isFullscreen,
          "controls-class": i.controlsClass,
          "button-class": i.buttonClass,
          "page-indicator-class": i.pageIndicatorClass,
          onNext: H,
          onPrev: T,
          onToggleFullscreen: $.value.toggleFullscreen
        }, null, 8, ["current-page", "visible-pages", "total-pages", "can-go-next", "can-go-prev", "is-fullscreen", "controls-class", "button-class", "page-indicator-class", "onToggleFullscreen"])
      ]) : se("", !0)
    ], 14, st));
  }
}), ot = {
  install(i, e) {
    e != null && e.workerSrc && Ge(e.workerSrc), i.component("PdfFlipbook", it);
  }
};
export {
  it as PdfFlipbook,
  ot as default,
  Ge as setGlobalWorkerSrc
};
