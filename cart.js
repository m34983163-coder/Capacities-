import { h, money } from "./util.js";
import { FREE_SHIPPING_OVER, onCart, resolvedLines, shippingFor, subtotal } from "./store.js";
import { cartLineView } from "./cartLines.js";
export function cartPage() {
    const root = h("div", { class: "page page--narrow cart" });
    const render = () => {
        if (!root.isConnected && root.dataset.mounted)
            return;
        root.dataset.mounted = "1";
        const rl = resolvedLines();
        root.replaceChildren(h("h1", {}, "Your cart"));
        if (!rl.length) {
            root.append(h("div", { class: "state" }, h("p", { class: "state__t" }, "Your cart is empty"), h("p", {}, "Discover a new perspective on time."), h("a", { class: "btn btn--ghost", href: "#/collection" }, "Explore collection")));
            return;
        }
        const sub = subtotal(), ship = shippingFor(sub);
        root.append(h("div", { class: "cart__grid" }, h("ul", { class: "lines" }, ...rl.map((r) => cartLineView(r))), h("aside", { class: "summary" }, h("h2", {}, "Order summary"), h("dl", { class: "totals" }, h("div", {}, h("dt", {}, "Subtotal"), h("dd", {}, money(sub))), h("div", {}, h("dt", {}, "Shipping"), h("dd", {}, ship === 0 ? "Free" : money(ship))), h("div", { class: "totals__total" }, h("dt", {}, "Total"), h("dd", {}, money(sub + ship)))), h("p", { class: "note" }, sub < FREE_SHIPPING_OVER ? `Sample rule: free shipping over ${money(FREE_SHIPPING_OVER)}.` : "Sample rule: free shipping applied."), h("a", { class: "btn btn--solid btn--block", href: "#/checkout" }, "Proceed to checkout"))));
    };
    const off = onCart(() => { if (!root.isConnected) {
        off();
        return;
    } render(); });
    render();
    return root;
}
