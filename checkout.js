import { announce, h, money } from "./util.js";
import { clearCart, FREE_SHIPPING_OVER, onCart, orderTotal, resolvedLines, shippingFor, subtotal } from "./store.js";
import { ApiError, createOrder } from "./api.js";
import { navigate } from "./router.js";
const COUNTRIES = ["Egypt", "Saudi Arabia", "United Arab Emirates", "Kuwait", "Qatar", "Jordan", "United Kingdom", "United States", "Canada", "France", "Germany", "Italy", "Spain", "Switzerland", "Netherlands", "Other"];
const validators = {
    name: (v) => (v.trim().length >= 2 ? "" : "Enter your full name."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter a valid email address."),
    phone: (v) => { const d = v.replace(/[\s()\-+.]/g, ""); return /^\d{7,15}$/.test(d) && /^[\d\s()\-+.]+$/.test(v) ? "" : "Enter a valid phone number (7–15 digits)."; },
    address: (v) => (v.trim().length >= 5 ? "" : "Enter your street address."),
    city: (v) => (v.trim().length >= 2 ? "" : "Enter your city."),
    country: (v) => (v ? "" : "Select your country."),
};
export function checkoutPage() {
    const root = h("div", { class: "page checkout" });
    const render = () => {
        const rl = resolvedLines();
        if (!rl.length) {
            root.replaceChildren(h("div", { class: "state" }, h("p", { class: "state__t" }, "Your cart is empty"), h("p", {}, "Add a watch before checking out."), h("a", { class: "btn btn--ghost", href: "#/collection" }, "Explore collection")));
            return;
        }
        if (root.querySelector("form")) {
            updateSummary();
            return;
        }
        buildForm();
    };
    const summaryHost = h("aside", { class: "summary" });
    function updateSummary() {
        const rl = resolvedLines();
        const sub = subtotal();
        const ship = shippingFor(sub);
        summaryHost.replaceChildren(h("h2", {}, "Order summary"), h("ul", { class: "sum-lines" }, ...rl.map((r) => h("li", {}, h("img", { src: r.product.image, alt: "", width: 56, height: 70 }), h("div", {}, h("p", { class: "line__name" }, r.product.name), h("p", { class: "line__meta" }, `${r.variant.label} · Qty ${r.line.qty}`)), h("p", {}, money(r.lineTotal))))), h("dl", { class: "totals" }, h("div", {}, h("dt", {}, "Subtotal"), h("dd", {}, money(sub))), h("div", {}, h("dt", {}, "Shipping"), h("dd", {}, ship === 0 ? "Free" : money(ship))), h("div", { class: "totals__total" }, h("dt", {}, "Total"), h("dd", {}, money(orderTotal())))), h("p", { class: "note" }, `Sample shipping rule: $25 flat, free over ${money(FREE_SHIPPING_OVER)}.`), h("a", { class: "link-btn", href: "#/cart" }, "Edit cart"));
    }
    function buildForm() {
        const errs = {};
        const inputs = {};
        const banner = h("div", { class: "alert", role: "alert", hidden: true });
        const field = (name, label, attrs = {}, control) => {
            const id = `f-${name}`;
            const input = control ?? h("input", { id, name, type: "text", required: true, ...attrs });
            if (control) {
                control.id = id;
                control.name = name;
                control.required = true;
            }
            input.setAttribute("aria-describedby", `${id}-err`);
            const err = h("p", { class: "field__err", id: `${id}-err` });
            errs[name] = err;
            inputs[name] = input;
            const check = () => {
                const m = validators[name](input.value);
                err.textContent = m;
                input.setAttribute("aria-invalid", m ? "true" : "false");
                return !m;
            };
            input.addEventListener("blur", check);
            input.addEventListener("input", () => { if (input.getAttribute("aria-invalid") === "true")
                check(); });
            input._check = check;
            return h("div", { class: "field" }, h("label", { for: id }, label), input, err);
        };
        const country = h("select", {}, h("option", { value: "" }, "Select country"), ...COUNTRIES.map((c) => h("option", { value: c }, c)));
        const submit = h("button", { class: "btn btn--solid btn--block", type: "submit" }, "Place order request");
        const form = h("form", { novalidate: true, class: "form", "aria-label": "Checkout" }, h("h2", {}, "Contact"), field("name", "Full name", { autocomplete: "name" }), h("div", { class: "row" }, field("email", "Email", { type: "email", autocomplete: "email", inputmode: "email" }), field("phone", "Phone", { type: "tel", autocomplete: "tel", inputmode: "tel" })), h("h2", {}, "Shipping address"), field("address", "Address", { autocomplete: "street-address" }), h("div", { class: "row" }, field("city", "City", { autocomplete: "address-level2" }), field("country", "Country", {}, country)), h("div", { class: "notice" }, h("strong", {}, "Payment is not enabled yet. "), "Submitting creates an order request on our server with status “pending payment”. No payment is taken and no card details are collected on this site."), banner, submit);
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            banner.hidden = true;
            const firstBad = [];
            let ok = true;
            Object.keys(validators).forEach((k) => {
                const i = inputs[k];
                if (i?._check && !i._check()) {
                    ok = false;
                    firstBad.push(i);
                }
            });
            if (!ok) {
                firstBad[0]?.focus();
                announce("Please correct the highlighted fields.");
                return;
            }
            const customer = Object.fromEntries(Object.keys(validators).map((k) => [k, inputs[k].value.trim()]));
            submit.disabled = true;
            submit.textContent = "Placing order…";
            try {
                const order = await createOrder({ customer, items: resolvedLines().map((r) => ({ productId: r.line.productId, variantId: r.line.variantId, qty: r.line.qty })) });
                try {
                    sessionStorage.setItem(`not.order.${order.id}`, JSON.stringify(order));
                }
                catch { /* ignore */ }
                clearCart();
                navigate(`/order/${order.id}`);
            }
            catch (err) {
                const ae = err instanceof ApiError ? err : new ApiError("Something went wrong. No order was placed.");
                banner.textContent = ae.message;
                banner.hidden = false;
                for (const [k, m] of Object.entries(ae.fields)) {
                    const f = k;
                    if (errs[f]) {
                        errs[f].textContent = m;
                        inputs[f]?.setAttribute("aria-invalid", "true");
                    }
                }
                submit.disabled = false;
                submit.textContent = "Place order request";
                banner.scrollIntoView({ block: "center", behavior: "smooth" });
            }
        });
        root.replaceChildren(h("h1", {}, "Checkout"), h("div", { class: "checkout__grid" }, form, summaryHost));
        updateSummary();
    }
    const off = onCart(() => { if (!root.isConnected) {
        off();
        return;
    } if (!root.querySelector("form") || resolvedLines().length === 0) {
        root.replaceChildren();
    } render(); });
    render();
    return root;
}
