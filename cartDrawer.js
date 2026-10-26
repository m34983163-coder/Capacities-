import { h, icon, money } from "./util.js";
import { cartCount, FREE_SHIPPING_OVER, onCart, resolvedLines, shippingFor, subtotal } from "./store.js";
import { openLayer } from "./layer.js";
import { cartLineView } from "./cartLines.js";
let open = false;
export function openCartDrawer() {
    if (open)
        return;
    open = true;
    const list = h("ul", { class: "lines" });
    const foot = h("div", { class: "drawer__foot" });
    const title = h("h2", { id: "cart-title" }, "Your cart");
    const root = h("div", { class: "drawer" }, h("div", { class: "drawer__backdrop", onClick: () => close() }), h("aside", { class: "drawer__panel", "aria-labelledby": "cart-title" }, h("header", { class: "drawer__head" }, title, h("button", { class: "icon-btn", type: "button", "aria-label": "Close cart", onClick: () => close() }, icon("close"))), h("div", { class: "drawer__body" }, list), foot));
    const render = () => {
        const rl = resolvedLines();
        title.textContent = `Your cart (${cartCount()})`;
        list.replaceChildren(...rl.map((r) => cartLineView(r, () => close())));
        foot.replaceChildren();
        if (!rl.length) {
            list.replaceChildren(h("li", { class: "empty" }, h("p", { class: "empty__t" }, "Your cart is empty"), h("p", {}, "Discover a new perspective on time."), h("a", { class: "btn btn--ghost", href: "#/collection", onClick: () => close() }, "Explore collection")));
            return;
        }
        const sub = subtotal(), ship = shippingFor(sub);
        foot.append(h("dl", { class: "totals" }, h("div", {}, h("dt", {}, "Subtotal"), h("dd", {}, money(sub))), h("div", {}, h("dt", {}, "Shipping"), h("dd", {}, ship === 0 ? "Free" : money(ship)))), h("p", { class: "note" }, sub < FREE_SHIPPING_OVER ? `Sample rule: free shipping over ${money(FREE_SHIPPING_OVER)}.` : "Sample rule: free shipping applied."), h("a", { class: "btn btn--solid btn--block", href: "#/checkout", onClick: () => close() }, "Checkout"), h("a", { class: "link-btn center", href: "#/cart", onClick: () => close() }, "View cart"));
    };
    const off = onCart(render);
    render();
    const close = openLayer(root, { label: "Shopping cart", onClose: () => { open = false; off(); } });
}
