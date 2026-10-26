import { reducedMotion } from "./util.js";
const layers = [];
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
function syncLock() {
    document.documentElement.classList.toggle("lock", layers.length > 0);
}
/** Opens an overlay layer (drawer, modal, search, menu) with focus trap, Esc, and scroll lock. */
export function openLayer(root, opts) {
    const host = document.getElementById("overlays");
    if (!host)
        throw new Error("#overlays missing");
    const opener = document.activeElement;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", opts.label);
    host.append(root);
    void root.offsetWidth; // commit initial styles so the transition runs
    root.classList.add("is-open");
    let closed = false;
    const onKey = (e) => {
        if (layers[layers.length - 1]?.root !== root)
            return;
        if (e.key === "Escape") {
            e.stopPropagation();
            close();
            return;
        }
        if (e.key !== "Tab")
            return;
        const f = [...root.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
        if (!f.length)
            return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        }
        else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    };
    const close = () => {
        if (closed)
            return;
        closed = true;
        document.removeEventListener("keydown", onKey, true);
        const i = layers.findIndex((l) => l.root === root);
        if (i >= 0)
            layers.splice(i, 1);
        root.classList.remove("is-open");
        root.classList.add("is-closing");
        const done = () => { root.remove(); syncLock(); opts.onClose?.(); if (opener && document.contains(opener))
            opener.focus({ preventScroll: true }); };
        if (reducedMotion())
            done();
        else
            setTimeout(done, 420);
        syncLock();
    };
    layers.push({ root, close });
    document.addEventListener("keydown", onKey, true);
    syncLock();
    queueMicrotask(() => {
        const target = (opts.initialFocus ? root.querySelector(opts.initialFocus) : null) ?? root.querySelector(FOCUSABLE);
        target?.focus({ preventScroll: true });
    });
    return close;
}
export function closeAllLayers() {
    [...layers].reverse().forEach((l) => l.close());
}
