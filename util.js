export function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (v === null || v === undefined || v === false)
            continue;
        if (k.startsWith("on") && typeof v === "function") {
            el.addEventListener(k.slice(2).toLowerCase(), v);
        }
        else if (k === "class") {
            el.className = String(v);
        }
        else if (k === "html") {
            el.innerHTML = String(v);
        }
        else {
            el.setAttribute(k, v === true ? "" : String(v));
        }
    }
    for (const c of children.flat()) {
        if (c === null || c === false || c === undefined)
            continue;
        el.append(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return el;
}
const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const money = (n) => fmt.format(n);
export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ICONS = {
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    bag: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    menu: '<path d="M4 8h16M4 16h16"/>',
    close: '<path d="m5 5 14 14M19 5 5 19"/>',
    left: '<path d="M15 5l-7 7 7 7"/>',
    right: '<path d="m9 5 7 7-7 7"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
};
export function icon(name, size = 20) {
    const s = h("span", { class: "icon", "aria-hidden": "true" });
    s.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] ?? ""}</svg>`;
    return s;
}
export function wordmark(cls = "") {
    return h("span", { class: `wordmark ${cls}`.trim(), "aria-label": "NOT" }, "NOT");
}
let live = null;
export function announce(msg) {
    live ??= document.getElementById("live");
    if (!live)
        return;
    live.textContent = "";
    setTimeout(() => { if (live)
        live.textContent = msg; }, 30);
}
export function el(sel, root = document) {
    const e = root.querySelector(sel);
    if (!e)
        throw new Error(`Missing element ${sel}`);
    return e;
}
