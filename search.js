import { h, icon, money } from "./util.js";
import { catalog } from "./store.js";
import { openLayer } from "./layer.js";
export function searchProducts(q, list) {
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length)
        return [];
    return list.filter((p) => {
        const hay = `${p.name} ${p.collection}`.toLowerCase();
        return tokens.every((t) => hay.includes(t));
    });
}
export function openSearch() {
    const input = h("input", { type: "search", id: "q", placeholder: "Search by name or collection", autocomplete: "off", "aria-label": "Search watches" });
    const results = h("ul", { class: "search__results", "aria-live": "polite" });
    const hint = h("p", { class: "search__hint" }, "Try “diver”, “classic” or “green”.");
    const render = () => {
        const q = input.value.trim();
        results.replaceChildren();
        hint.hidden = true;
        if (!q) {
            hint.hidden = false;
            hint.textContent = "Try “diver”, “classic” or “essentials”.";
            return;
        }
        const found = searchProducts(q, catalog.products);
        if (!found.length) {
            hint.hidden = false;
            hint.textContent = `No watches match “${q}”. Check the spelling or browse the full collection.`;
            return;
        }
        found.forEach((p) => results.append(h("li", {}, h("a", { href: `#/product/${p.id}`, onClick: () => close() }, h("img", { src: p.thumb, alt: "", width: 56, height: 66, loading: "lazy" }), h("span", { class: "search__name" }, p.name, h("small", {}, p.collection)), h("span", { class: "search__price" }, money(p.price))))));
    };
    input.addEventListener("input", render);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter")
        results.querySelector("a")?.click(); });
    const root = h("div", { class: "search" }, h("div", { class: "search__bar" }, icon("search"), input, h("button", { class: "icon-btn", type: "button", "aria-label": "Close search", onClick: () => close() }, icon("close"))), hint, results);
    const close = openLayer(root, { label: "Search", initialFocus: "#q" });
    render();
}
