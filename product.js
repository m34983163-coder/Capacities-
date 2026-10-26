import { announce, h, icon, money } from "./util.js";
import { addToCart, catalog, firstAvailable, getProduct, stockStatus } from "./store.js";
import { openCartDrawer } from "./cartDrawer.js";
import { productCard } from "./card.js";
import { qtyPicker, stockLabel, variantPicker } from "./pickers.js";
import { reducedMotion } from "./util.js";
export function productPage(id) {
    const p = getProduct(id);
    if (!p) {
        return h("div", { class: "page page--narrow" }, h("div", { class: "state" }, h("p", { class: "state__t" }, "Watch not found"), h("p", {}, "This watch isn't part of the collection."), h("a", { class: "btn btn--ghost", href: "#/collection" }, "Back to collection")));
    }
    document.title = `${p.name} — NOT`;
    /* gallery */
    let gi = 0;
    const main = h("img", { class: "gal__main", src: p.gallery[0].src, alt: p.gallery[0].alt, width: 1100, height: 900, decoding: "async" });
    const thumbs = p.gallery.map((g, i) => h("button", { class: "gal__thumb", type: "button", "aria-label": `Show image ${i + 1} of ${p.gallery.length}`, "aria-pressed": String(i === 0), onClick: () => show(i) }, h("img", { src: g.src, alt: "", width: 96, height: 96, loading: "lazy" })));
    const count = h("p", { class: "gal__count" }, `1 / ${p.gallery.length}`);
    function show(i) {
        const n = (i + p.gallery.length) % p.gallery.length;
        if (n === gi)
            return;
        const dir = n > gi ? 1 : -1;
        gi = n;
        const g = p.gallery[n];
        main.src = g.src;
        main.alt = g.alt;
        if (!reducedMotion())
            main.animate([{ opacity: 0, transform: `translateX(${28 * dir}px)` }, { opacity: 1, transform: "none" }], { duration: 650, easing: "cubic-bezier(.16,1,.3,1)" });
        thumbs.forEach((t, k) => t.setAttribute("aria-pressed", String(k === n)));
        count.textContent = `${n + 1} / ${p.gallery.length}`;
    }
    const frame = h("div", { class: "gal__frame" }, main, h("button", { class: "arrow gal__prev", type: "button", "aria-label": "Previous image", onClick: () => show(gi - 1) }, icon("left", 22)), h("button", { class: "arrow gal__next", type: "button", "aria-label": "Next image", onClick: () => show(gi + 1) }, icon("right", 22)), count);
    let sx = 0, sy = 0, down = false;
    frame.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; down = true; });
    frame.addEventListener("pointerup", (e) => { if (!down)
        return; down = false; const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4)
        show(gi + (dx < 0 ? 1 : -1)); });
    frame.addEventListener("pointercancel", () => { down = false; });
    frame.setAttribute("tabindex", "0");
    frame.addEventListener("keydown", (e) => { if (e.key === "ArrowRight")
        show(gi + 1); if (e.key === "ArrowLeft")
        show(gi - 1); });
    /* buy box */
    const picker = variantPicker(p, firstAvailable(p)?.id);
    const qty = qtyPicker(() => picker.selected()?.stock ?? 0);
    const status = h("p", { class: `stock stock--${stockStatus(p)}`, role: "status" }, stockLabel(p, picker.selected()));
    const msg = h("p", { class: "form-msg", role: "status" });
    const add = h("button", { class: "btn btn--solid btn--block", type: "button", disabled: !picker.selected(), onClick: () => {
            const v = picker.selected();
            if (!v) {
                msg.textContent = "Select a case size first.";
                return;
            }
            const r = addToCart(p.id, v.id, qty.value());
            if (r.ok) {
                msg.textContent = "";
                openCartDrawer();
            }
            else {
                msg.textContent = r.message;
                announce(r.message);
            }
        } }, picker.selected() ? "Add to cart" : "Sold out");
    picker.onChange(() => {
        const v = picker.selected();
        qty.refresh();
        status.textContent = stockLabel(p, v);
        add.disabled = !v || v.stock <= 0;
        msg.textContent = "";
    });
    const dl = h("dl", { class: "specs" }, ...p.specs.map((s) => h("div", {}, h("dt", {}, s.label), h("dd", {}, s.value))));
    const related = [...catalog.products].filter((x) => x.id !== p.id).sort((a, b) => Number(b.collection === p.collection) - Number(a.collection === p.collection)).slice(0, 3);
    return h("div", { class: "page product" }, h("nav", { class: "crumbs", "aria-label": "Breadcrumb" }, h("a", { href: "#/" }, "Home"), " / ", h("a", { href: "#/collection" }, "Collection"), " / ", h("span", { "aria-current": "page" }, p.name)), h("div", { class: "product__grid" }, h("div", { class: "gal" }, frame, h("div", { class: "gal__thumbs" }, ...thumbs)), h("div", { class: "product__info" }, h("p", { class: "eyebrow" }, p.collection), h("h1", {}, p.name), h("p", { class: "price" }, money(p.price)), h("p", { class: "lead" }, p.shortDescription), h("p", { class: "muted" }, p.description), h("p", { class: "label" }, `Colour: ${p.colors.map((c) => c.name).join(", ")}`), picker.el, qty.el, status, add, msg, h("p", { class: "sample-note" }, "Sample product data — price, sizes and specifications are placeholders."), h("details", { class: "acc", open: true }, h("summary", {}, "Specifications"), dl, h("p", { class: "muted small" }, `Materials: ${p.materials.join("; ")}.`)), h("details", { class: "acc" }, h("summary", {}, "Shipping"), h("p", { class: "muted" }, "Sample policy: tracked, insured delivery. Flat $25 shipping, free on orders over $2,500. Delivery times to be confirmed per country.")), h("details", { class: "acc" }, h("summary", {}, "Returns"), h("p", { class: "muted" }, "Sample policy: unworn watches may be returned within 14 days in original packaging. Final terms to be confirmed before launch.")))), h("section", { class: "related", "aria-labelledby": "rel" }, h("h2", { id: "rel" }, "You may also like"), h("div", { class: "grid" }, ...related.map((r) => productCard(r)))));
}
