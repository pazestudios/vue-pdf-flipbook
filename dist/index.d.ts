import { ComponentOptionsMixin } from 'vue';
import { ComponentProvideOptions } from 'vue';
import { DefineComponent } from 'vue';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { Plugin as Plugin_2 } from 'vue';
import { PublicProps } from 'vue';
import { Ref } from 'vue';

declare const __VLS_component: DefineComponent<PdfFlipbookProps, {
next: typeof next;
prev: typeof prev;
goToPage: typeof goToPage;
currentPage: Readonly<Ref<number, number>>;
totalPages: Readonly<Ref<number, number>>;
reload: typeof reload;
isFullscreen: Readonly<Ref<boolean, boolean>>;
enterFullscreen: () => Promise<void>;
exitFullscreen: () => Promise<void>;
toggleFullscreen: () => Promise<void>;
getPdfDocument: () => PDFDocumentProxy | null;
getFlipInstance: () => PageFlipInstance | null;
zoom: Readonly<Ref<number, number>>;
setZoom: (level: number) => void;
resetZoom: () => void;
}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {} & {
loaded: (payload: {
totalPages: number;
pdf: PDFDocumentProxy;
}) => any;
error: (error: Error) => any;
"page-changed": (payload: {
page: number;
totalPages: number;
}) => any;
"flip-start": (payload: {
fromPage: number;
toPage: number;
}) => any;
"orientation-changed": (orientation: "portrait" | "landscape") => any;
rendered: (payload: {
page: number;
}) => any;
"fullscreen-changed": (isFullscreen: boolean) => any;
"zoom-changed": (zoom: number) => any;
}, string, PublicProps, Readonly<PdfFlipbookProps> & Readonly<{
onLoaded?: ((payload: {
totalPages: number;
pdf: PDFDocumentProxy;
}) => any) | undefined;
onError?: ((error: Error) => any) | undefined;
"onPage-changed"?: ((payload: {
page: number;
totalPages: number;
}) => any) | undefined;
"onFlip-start"?: ((payload: {
fromPage: number;
toPage: number;
}) => any) | undefined;
"onOrientation-changed"?: ((orientation: "portrait" | "landscape") => any) | undefined;
onRendered?: ((payload: {
page: number;
}) => any) | undefined;
"onFullscreen-changed"?: ((isFullscreen: boolean) => any) | undefined;
"onZoom-changed"?: ((zoom: number) => any) | undefined;
}>, {
startPage: number;
mode: FlipMode;
showCover: boolean;
responsive: boolean;
width: number;
renderScale: number;
renderRange: number;
controlsPosition: ControlsPosition;
maxZoom: number;
pinchZoom: boolean | "fullscreen";
}, {}, {}, {}, string, ComponentProvideOptions, false, {
rootRef: HTMLDivElement;
viewportRef: HTMLDivElement;
bookRef: HTMLDivElement;
}, HTMLDivElement>;

declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: {
        error?(_: {
            error: Error;
            retry: typeof reload;
        }): any;
        loading?(_: {
            progress: number;
        }): any;
        controls?(_: {
            currentPage: number;
            visiblePages: number[];
            totalPages: number;
            next: () => void;
            prev: () => void;
            goToPage: (page: number) => void;
            canGoNext: boolean;
            canGoPrev: boolean;
            isFullscreen: boolean;
            toggleFullscreen: () => void;
            zoom: number;
            setZoom: (level: number) => void;
            resetZoom: () => void;
        }): any;
        controls?(_: {
            currentPage: number;
            visiblePages: number[];
            totalPages: number;
            next: () => void;
            prev: () => void;
            goToPage: (page: number) => void;
            canGoNext: boolean;
            canGoPrev: boolean;
            isFullscreen: boolean;
            toggleFullscreen: () => void;
            zoom: number;
            setZoom: (level: number) => void;
            resetZoom: () => void;
        }): any;
    };
    refs: {
        rootRef: HTMLDivElement;
        viewportRef: HTMLDivElement;
        bookRef: HTMLDivElement;
    };
    rootEl: HTMLDivElement;
};

declare type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;

declare type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

/** Where default (and slotted) controls render relative to the book. */
export declare type ControlsPosition = 'top' | 'bottom';

/** Slot props for the `controls` slot. */
export declare interface ControlsSlotProps {
    /** First page of the current spread, 1-based. */
    currentPage: number;
    /** Pages currently visible (one page, or both pages of a landscape spread). */
    visiblePages: number[];
    totalPages: number;
    next: () => void;
    prev: () => void;
    goToPage: (page: number) => void;
    canGoNext: boolean;
    canGoPrev: boolean;
    isFullscreen: boolean;
    toggleFullscreen: () => void;
    /** Current zoom level (1 = fit). */
    zoom: number;
    /** Set the zoom level (clamped to [1, maxZoom]), centered on the viewport. */
    setZoom: (level: number) => void;
    resetZoom: () => void;
}

/** Page display mode. `auto` switches between single-page and spread based on available width. */
export declare type FlipMode = 'auto' | 'single' | 'spread';

/** Tuning options for the built-in flip animation. */
export declare interface FlipOptions {
    /** Flip animation duration in ms (default 800). 0 flips instantly. */
    flippingTime?: number;
    /** Draw a moving shadow on the turning page. Default true. */
    drawShadow?: boolean;
    /** Peak opacity of the flip shadow (default 0.4). */
    maxShadowOpacity?: number;
    /** Enable click/swipe navigation on the book. Default true. */
    useMouseEvents?: boolean;
    /** Minimum horizontal swipe distance in px to trigger a flip (default 30). */
    swipeDistance?: number;
    /** Disable flipping by clicking on the page halves. Default false. */
    disableFlipByClick?: boolean;
}

declare function goToPage(page: number): void;

declare function next(): void;

/** The flip engine instance returned by `getFlipInstance()`. */
export declare interface PageFlipInstance {
    flipNext(): void;
    flipPrev(): void;
    /** Flip to the spread containing `page` (1-based, clamped). */
    flip(page: number): void;
    getPageCount(): number;
    /** First page of the current spread, 1-based. */
    getCurrentPage(): number;
    /** Pages currently visible in the spread, 1-based (one or two). */
    getCurrentSpread(): number[];
    getOrientation(): 'portrait' | 'landscape';
    /** Re-measure the container and re-apply layout. */
    update(): void;
    destroy(): void;
}

export declare const PdfFlipbook: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;

export declare interface PdfFlipbookEmits {
    (e: 'loaded', payload: {
        totalPages: number;
        pdf: PDFDocumentProxy;
    }): void;
    (e: 'error', error: Error): void;
    (e: 'page-changed', payload: {
        page: number;
        totalPages: number;
    }): void;
    (e: 'flip-start', payload: {
        fromPage: number;
        toPage: number;
    }): void;
    (e: 'orientation-changed', orientation: 'portrait' | 'landscape'): void;
    (e: 'rendered', payload: {
        page: number;
    }): void;
    (e: 'fullscreen-changed', isFullscreen: boolean): void;
    (e: 'zoom-changed', zoom: number): void;
}

/** Methods and state exposed via template ref. */
export declare interface PdfFlipbookExpose {
    next: () => void;
    prev: () => void;
    goToPage: (page: number) => void;
    currentPage: Readonly<Ref<number>>;
    totalPages: Readonly<Ref<number>>;
    reload: () => Promise<void>;
    isFullscreen: Readonly<Ref<boolean>>;
    enterFullscreen: () => Promise<void>;
    exitFullscreen: () => Promise<void>;
    toggleFullscreen: () => Promise<void>;
    getPdfDocument: () => PDFDocumentProxy | null;
    getFlipInstance: () => PageFlipInstance | null;
    /** Current zoom level (1 = fit). */
    zoom: Readonly<Ref<number>>;
    /** Set the zoom level (clamped to [1, maxZoom]), centered on the viewport. */
    setZoom: (level: number) => void;
    resetZoom: () => void;
}

export declare interface PdfFlipbookProps {
    /** PDF source. Reactive: swapping it tears down and reloads the book. */
    src: PdfSource;
    /** Extra parameters forwarded to pdf.js `getDocument` (cMapUrl, httpHeaders, ...). */
    pdfOptions?: Record<string, unknown>;
    /** Override the pdf.js worker URL (recommended for offline/CSP environments). */
    workerSrc?: string;
    /** Base single-page width in px (default 550). */
    width?: number;
    /** Base single-page height in px. Defaults to the PDF's own aspect ratio. */
    height?: number;
    /** Scale the book to its container (StPageFlip `size: 'stretch'`). Default true. */
    responsive?: boolean;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    /** Initial page, 1-based. Default 1. */
    startPage?: number;
    /** 'auto' | 'single' | 'spread'. Default 'auto'. */
    mode?: FlipMode;
    /**
     * Show the first page alone (centered) like a book cover, and end the book
     * on a lone, centered back cover. PDFs with an odd page count get one blank
     * filler page (`.vpf-page-blank`) appended so the book can always close;
     * page numbers in events, controls, and slots never include it. Set to
     * false to always open on a full two-page spread. Default true.
     */
    showCover?: boolean;
    /** Pass-through StPageFlip settings. */
    flipOptions?: FlipOptions;
    /** pdf.js viewport scale multiplier (multiplied by capped devicePixelRatio). Default 1.5. */
    renderScale?: number;
    /**
     * Lazy-render window: number of spreads kept rendered on each side of the
     * current one. Use Infinity to render every page. Default 2.
     */
    renderRange?: number;
    /** Place controls above or below the book. Default `'bottom'`. */
    controlsPosition?: ControlsPosition;
    /**
     * Maximum pinch/scroll zoom level (1 = fit). Zoom in with a touch pinch,
     * trackpad pinch, or the mouse wheel over the book; drag to pan while
     * zoomed. Set to 1 to disable zooming. Default 2.
     */
    maxZoom?: number;
    /**
     * Controls when pinch/scroll zoom is active: `true` always (default),
     * `false` to disable it entirely, or `'fullscreen'` to only allow it while
     * the book is in fullscreen mode. Programmatic zoom (`setZoom`) still
     * works regardless of this setting.
     */
    pinchZoom?: boolean | 'fullscreen';
    containerClass?: string;
    /** Extra classes applied to the container while in fullscreen. */
    fullscreenClass?: string;
    bookClass?: string;
    pageClass?: string;
    controlsClass?: string;
    buttonClass?: string;
    pageIndicatorClass?: string;
    loadingClass?: string;
    errorClass?: string;
}

/** PDF source: a URL or raw bytes. Byte buffers are copied before being handed to pdf.js. */
export declare type PdfSource = string | URL | ArrayBuffer | Uint8Array;

export declare interface PluginOptions {
    /** pdf.js worker URL applied globally for all PdfFlipbook instances. */
    workerSrc?: string;
}

declare function prev(): void;

declare function reload(): Promise<void>;

/** Set a worker URL globally (used by the plugin's install options). */
export declare function setGlobalWorkerSrc(src: string): void;

declare const VuePdfFlipbook: Plugin_2<[PluginOptions?]>;
export default VuePdfFlipbook;

export { }
