import { reducedMotion } from "./util.js";
let io = null;
/** Fades/raises any [data-reveal] element as it enters the viewport. */
export function observeReveals(root = document) {
    const els = [...root.querySelectorAll("[data-reveal]:not(.in)")];
    if (reducedMotion() || !("IntersectionObserver" in window)) {
        els.forEach((e) => e.classList.add("in"));
        return;
    }
    io ??= new IntersectionObserver((entries) => {
        for (const en of entries)
            if (en.isIntersecting) {
                en.target.classList.add("in");
                io?.unobserve(en.target);
            }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    els.forEach((e) => io.observe(e));
}
/** Splits a heading into masked words that rise in sequence. */
export function splitWords(el) {
    const text = el.textContent ?? "";
    el.setAttribute("aria-label", text);
    el.textContent = "";
    text.split(/(\s+)/).forEach((part, i) => {
        if (/^\s+$/.test(part)) {
            el.append(document.createTextNode(" "));
            return;
        }
        if (!part)
            return;
        const w = document.createElement("span");
        w.className = "w";
        w.setAttribute("aria-hidden", "true");
        const inner = document.createElement("span");
        inner.className = "wi";
        inner.textContent = part;
        inner.style.setProperty("--i", String(i / 2));
        w.append(inner);
        el.append(w);
    });
}
