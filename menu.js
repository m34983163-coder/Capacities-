import { h, icon, wordmark } from "./util.js";
import { openLayer } from "./layer.js";
import { openSearch } from "./search.js";
export function openMenu() {
    const go = (href, label, i) => h("a", { href, style: `--i:${i}`, onClick: () => close() }, label);
    const root = h("div", { class: "menu" }, h("div", { class: "menu__top" }, h("a", { href: "#/", class: "nav__logo", onClick: () => close(), "aria-label": "NOT — home" }, wordmark()), h("button", { class: "icon-btn", type: "button", "aria-label": "Close menu", onClick: () => close() }, icon("close"))), h("nav", { class: "menu__links", "aria-label": "Mobile" }, go("#/", "Home", 0), go("#/collection", "Collection", 1), go("#/story", "Story", 2), go("#/cart", "Cart", 3), h("button", { type: "button", style: "--i:4", onClick: () => { close(); setTimeout(openSearch, 440); } }, "Search")), h("p", { class: "menu__foot" }, "TIME, REDEFINED."));
    const close = openLayer(root, { label: "Menu" });
}
