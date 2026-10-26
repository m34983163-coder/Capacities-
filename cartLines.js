import { announce, h, icon, money } from "./util.js";
import { MAX_PER_LINE, removeLine, setQty } from "./store.js";
export function cartLineView(r, onNavigate) {
    const { product: p, variant: v, line } = r;
    const max = Math.min(v.stock, MAX_PER_LINE);
    const msg = h("p", { class: "line__msg", role: "status" });
    const change = (q) => {
        const res = setQty(p.id, v.id, q);
        if (!res.ok) {
            msg.textContent = res.message;
            announce(res.message);
        }
    };
    return h("li", { class: "line" }, h("a", { class: "line__img", href: `#/product/${p.id}`, onClick: () => onNavigate?.(), "aria-label": p.name }, h("img", { src: p.image, alt: "", width: 84, height: 105, loading: "lazy" })), h("div", { class: "line__body" }, h("div", { class: "line__top" }, h("div", {}, h("a", { class: "line__name", href: `#/product/${p.id}`, onClick: () => onNavigate?.() }, p.name), h("p", { class: "line__meta" }, `${p.collection} · ${v.label}`)), h("p", { class: "line__price" }, money(r.lineTotal))), h("div", { class: "line__ctrl" }, h("div", { class: "qty", role: "group", "aria-label": `Quantity for ${p.name} ${v.label}` }, h("button", { type: "button", "aria-label": "Decrease quantity", onClick: () => change(line.qty - 1) }, icon("minus", 16)), h("output", { "aria-live": "polite" }, String(line.qty)), h("button", { type: "button", "aria-label": "Increase quantity", disabled: line.qty >= max, onClick: () => change(line.qty + 1) }, icon("plus", 16))), h("button", { class: "link-btn", type: "button", onClick: () => { removeLine(p.id, v.id); announce(`${p.name} removed`); } }, "Remove")), msg));
}
