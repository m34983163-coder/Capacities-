import { announce, h, icon, money } from "./util.js";
import { addToCart, firstAvailable, stockStatus } from "./store.js";
import { openQuickView } from "./quickView.js";
import { openCartDrawer } from "./cartDrawer.js";
export function productCard(p, eager = false) {
    const status = stockStatus(p);
    const v = firstAvailable(p);
    const badge = status === "out_of_stock" ? "Sold out" : status === "low_stock" ? "Low stock" : p.featured ? "Featured" : "";
    return h("article", { class: "card", "data-status": status }, h("a", { class: "card__media", href: `#/product/${p.id}`, "aria-label": `${p.name}, ${money(p.price)}` }, h("img", { src: p.image, alt: `NOT ${p.name} watch — ${p.shortDescription}`, width: 540, height: 675, loading: eager ? "eager" : "lazy", decoding: "async" }), badge ? h("span", { class: "tag" }, badge) : null), h("div", { class: "card__body" }, h("p", { class: "card__col" }, p.collection), h("h3", { class: "card__name" }, h("a", { href: `#/product/${p.id}` }, p.name)), h("p", { class: "card__price" }, money(p.price)), h("p", { class: "card__var" }, p.variants.map((x) => x.label).join(" · "))), h("div", { class: "card__actions" }, h("button", { class: "btn btn--ghost btn--sm", type: "button", onClick: () => openQuickView(p.id), "aria-label": `Quick view ${p.name}` }, icon("eye", 16), "Quick view"), h("button", { class: "btn btn--solid btn--sm", type: "button", disabled: !v, "aria-label": v ? `Add ${p.name} to cart` : `${p.name} is sold out`, onClick: () => {
            if (!v)
                return;
            const r = addToCart(p.id, v.id, 1);
            if (r.ok)
                openCartDrawer();
            else
                announce(r.message);
        } }, v ? "Add to cart" : "Sold out")));
}
