import { h, wordmark } from "./util.js";
export function mountFooter(host) {
    host.append(h("div", { class: "footer__inner" }, h("div", { class: "footer__brand" }, wordmark("wordmark--lg"), h("p", { class: "tagline" }, "TIME REDEFINED")), h("nav", { class: "footer__nav", "aria-label": "Footer" }, h("a", { href: "#/collection" }, "Collection"), h("a", { href: "#/story" }, "Story"), h("a", { href: "#/cart" }, "Cart"), h("a", { href: "#/checkout" }, "Checkout")), h("p", { class: "footer__note" }, "Sample catalogue: prices, sizes, stock, shipping and returns terms are placeholders and must be replaced with verified information before launch."), h("p", { class: "footer__copy" }, `© ${new Date().getFullYear()} NOT. All rights reserved.`)));
}
