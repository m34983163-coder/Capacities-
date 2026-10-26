import { announce, h, icon, money } from "./util.js";
import { addToCart, firstAvailable, getProduct, stockStatus } from "./store.js";
import { openLayer } from "./layer.js";
import { openCartDrawer } from "./cartDrawer.js";
import { variantPicker, qtyPicker, stockLabel } from "./pickers.js";
export function openQuickView(productId) {
    const p = getProduct(productId);
    if (!p)
        return;
    const picker = variantPicker(p, firstAvailable(p)?.id);
    const qty = qtyPicker(() => picker.selected()?.stock ?? 0);
    picker.onChange(() => { qty.refresh(); status.textContent = stockLabel(p, picker.selected()); add.disabled = !picker.selected() || picker.selected().stock <= 0; });
    const status = h("p", { class: `stock stock--${stockStatus(p)}` }, stockLabel(p, picker.selected()));
    const msg = h("p", { class: "form-msg", role: "status" });
    const add = h("button", { class: "btn btn--solid btn--block", type: "button", disabled: !picker.selected(), onClick: () => {
            const v = picker.selected();
            if (!v)
                return;
            const r = addToCart(p.id, v.id, qty.value());
            if (r.ok) {
                close();
                openCartDrawer();
            }
            else {
                msg.textContent = r.message;
                announce(r.message);
            }
        } }, "Add to cart");
    const root = h("div", { class: "modal" }, h("div", { class: "modal__backdrop", onClick: () => close() }), h("div", { class: "modal__panel" }, h("button", { class: "icon-btn modal__x", type: "button", "aria-label": "Close quick view", onClick: () => close() }, icon("close")), h("div", { class: "modal__media" }, h("img", { src: p.image, alt: `${p.name} by NOT`, width: 540, height: 675 })), h("div", { class: "modal__info" }, h("p", { class: "eyebrow" }, p.collection), h("h2", {}, p.name), h("p", { class: "price" }, money(p.price)), h("p", { class: "lead" }, p.shortDescription), h("p", { class: "muted" }, p.description), picker.el, qty.el, status, add, msg, h("a", { class: "link-btn", href: `#/product/${p.id}`, onClick: () => close() }, "Full details"))));
    const close = openLayer(root, { label: `Quick view: ${p.name}` });
}
