import { h, money } from "./util.js";
import { fetchOrder } from "./api.js";
export function orderPage(id) {
    const root = h("div", { class: "page page--narrow order" }, h("p", { class: "muted", role: "status" }, "Loading your order…"));
    void (async () => {
        let order = await fetchOrder(id);
        if (!order) {
            try {
                order = JSON.parse(sessionStorage.getItem(`not.order.${id}`) ?? "null");
            }
            catch {
                order = null;
            }
        }
        if (!order) {
            root.replaceChildren(h("div", { class: "state" }, h("p", { class: "state__t" }, "Order not found"), h("p", {}, "We couldn't find this order."), h("a", { class: "btn btn--ghost", href: "#/collection" }, "Back to collection")));
            return;
        }
        const o = order;
        root.replaceChildren(h("p", { class: "eyebrow" }, "Order request received"), h("h1", {}, `Thank you, ${o.customer.name.split(" ")[0]}.`), h("p", { class: "lead" }, `Your order request ${o.id} was recorded by our server. Status: pending payment.`), h("div", { class: "notice" }, h("strong", {}, "No payment has been taken. "), "Online payment is not configured on this store yet, so this order is not paid. The store must contact you to arrange payment before anything ships."), h("ul", { class: "sum-lines" }, ...o.lines.map((l) => h("li", {}, h("div", {}, h("p", { class: "line__name" }, l.name), h("p", { class: "line__meta" }, `${l.variant} · Qty ${l.qty}`)), h("p", {}, money(l.unitPrice * l.qty))))), h("dl", { class: "totals" }, h("div", {}, h("dt", {}, "Subtotal"), h("dd", {}, money(o.subtotal))), h("div", {}, h("dt", {}, "Shipping"), h("dd", {}, o.shipping ? money(o.shipping) : "Free")), h("div", { class: "totals__total" }, h("dt", {}, "Total due"), h("dd", {}, money(o.total)))), h("p", { class: "muted" }, `Shipping to: ${o.customer.address}, ${o.customer.city}, ${o.customer.country}. Confirmation contact: ${o.customer.email}.`), h("a", { class: "btn btn--ghost", href: "#/collection" }, "Continue browsing"));
        root.querySelector("h1")?.focus();
    })();
    return root;
}
