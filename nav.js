import { h, icon, wordmark } from "./util.js";
import { cartCount, onCart } from "./store.js";
import { openCartDrawer } from "./cartDrawer.js";
import { openSearch } from "./search.js";
import { openMenu } from "./menu.js";
import { currentPath } from "./router.js";
export function mountNav(host) {
    const count = h("span", { class: "badge", "aria-hidden": "true" }, "0");
    const cartBtn = h("button", { class: "icon-btn", type: "button", "aria-label": "Open cart", onClick: () => openCartDrawer() }, icon("bag"), count);
    const link = (href, label, key) => h("a", { href, "data-key": key }, label);
    const nav = h("nav", { class: "nav__inner", "aria-label": "Primary" }, h("div", { class: "nav__left" }, h("button", { class: "icon-btn nav__burger", type: "button", "aria-label": "Open menu", onClick: () => openMenu() }, icon("menu")), h("div", { class: "nav__links" }, link("#/collection", "Collection", "collection"), link("#/story", "Story", "story"))), h("a", { class: "nav__logo", href: "#/", "aria-label": "NOT — home" }, wordmark()), h("div", { class: "nav__right" }, h("button", { class: "icon-btn", type: "button", "aria-label": "Search watches", onClick: () => openSearch() }, icon("search")), cartBtn));
    host.append(nav);
    const sync = () => {
        const n = cartCount();
        count.textContent = String(n);
        count.classList.toggle("on", n > 0);
        cartBtn.setAttribute("aria-label", n ? `Open cart, ${n} item${n === 1 ? "" : "s"}` : "Open cart");
    };
    onCart(() => { sync(); count.animate([{ transform: "scale(1.5)" }, { transform: "scale(1)" }], { duration: 400, easing: "ease-out" }); });
    sync();
    // Solid background once the page has scrolled past the sentinel (no scroll handler).
    const sentinel = h("div", { class: "nav-sentinel", "aria-hidden": "true" });
    document.body.prepend(sentinel);
    new IntersectionObserver(([e]) => host.classList.toggle("scrolled", !e?.isIntersecting)).observe(sentinel);
    const mark = () => {
        const p = currentPath();
        nav.querySelectorAll(".nav__links a").forEach((a) => {
            const on = a.dataset.key === "collection" ? p === "/collection" : a.dataset.key === "story" && p === "/story";
            if (on)
                a.setAttribute("aria-current", "page");
            else
                a.removeAttribute("aria-current");
        });
    };
    window.addEventListener("hashchange", mark);
    mark();
}
