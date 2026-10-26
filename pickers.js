import { h, icon } from "./util.js";
import { MAX_PER_LINE } from "./store.js";
let uid = 0;
export function variantPicker(p, initial) {
    const name = `variant-${++uid}`;
    let selected = p.variants.find((v) => v.id === initial);
    const listeners = [];
    const el = h("fieldset", { class: "variants" }, h("legend", {}, "Case size"));
    p.variants.forEach((v) => {
        const id = `${name}-${v.id}`;
        const input = h("input", { type: "radio", name, id, value: v.id, disabled: v.stock <= 0, checked: selected?.id === v.id });
        input.addEventListener("change", () => { selected = v; listeners.forEach((f) => f()); });
        el.append(h("div", { class: "variant" }, input, h("label", { for: id }, v.label, v.stock <= 0 ? h("small", {}, "Sold out") : null)));
    });
    return { el, selected: () => selected, onChange: (f) => { listeners.push(f); } };
}
export function stockLabel(p, v) {
    if (!v)
        return p.variants.every((x) => x.stock <= 0) ? "Currently sold out" : "Select a case size";
    if (v.stock <= 0)
        return "Sold out";
    if (v.stock <= 3)
        return `Only ${v.stock} left`;
    return "In stock";
}
export function qtyPicker(maxFn) {
    let value = 1;
    const out = h("output", { "aria-live": "polite" }, "1");
    const dec = h("button", { type: "button", "aria-label": "Decrease quantity" }, icon("minus", 16));
    const inc = h("button", { type: "button", "aria-label": "Increase quantity" }, icon("plus", 16));
    const max = () => Math.max(1, Math.min(maxFn(), MAX_PER_LINE));
    const refresh = () => { value = Math.min(Math.max(1, value), max()); out.textContent = String(value); dec.disabled = value <= 1; inc.disabled = value >= max(); };
    dec.addEventListener("click", () => { value--; refresh(); });
    inc.addEventListener("click", () => { value++; refresh(); });
    const el = h("div", { class: "qty-row" }, h("span", { class: "label" }, "Quantity"), h("div", { class: "qty", role: "group", "aria-label": "Quantity" }, dec, out, inc));
    refresh();
    return { el, value: () => value, refresh };
}
