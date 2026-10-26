import { h, reducedMotion, wordmark } from "./util.js";
import { catalog, loadCatalog } from "./store.js";
import { currentPath, isHomeFamily, match } from "./router.js";
import { mountNav } from "./nav.js";
import { mountFooter } from "./footer.js";
import { observeReveals } from "./motion.js";
import { closeAllLayers } from "./layer.js";
import { homePage } from "./home.js";
import { productPage } from "./product.js";
import { cartPage } from "./cart.js";
import { checkoutPage } from "./checkout.js";
import { orderPage } from "./order.js";
const app = document.getElementById("app");
let lastName = "";
function renderRoute() {
    closeAllLayers();
    const m = match(currentPath());
    document.title = "NOT — Time, redefined";
    const sameHome = isHomeFamily(lastName) && isHomeFamily(m.name) && app.children.length > 0;
    if (!sameHome) {
        let page;
        switch (m.name) {
            case "home":
            case "collection":
            case "story":
                page = homePage();
                break;
            case "product":
                page = productPage(m.params.id ?? "");
                break;
            case "cart":
                page = cartPage();
                break;
            case "checkout":
                page = checkoutPage();
                break;
            case "order":
                page = orderPage(m.params.id ?? "");
                break;
            default: page = h("div", { class: "page page--narrow" }, h("div", { class: "state" }, h("p", { class: "state__t" }, "Page not found"), h("a", { class: "btn btn--ghost", href: "#/" }, "Back home")));
        }
        app.replaceChildren(page);
        page.classList.add("page-in");
        observeReveals(page);
    }
    lastName = m.name;
    const smooth = reducedMotion() ? "auto" : "smooth";
    if (m.name === "collection" || m.name === "story") {
        requestAnimationFrame(() => document.getElementById(m.name)?.scrollIntoView({ behavior: sameHome ? smooth : "auto", block: "start" }));
    }
    else if (m.name === "home")
        window.scrollTo({ top: 0, behavior: sameHome ? smooth : "auto" });
    else
        window.scrollTo({ top: 0 });
    const h1 = app.querySelector("h1");
    if (h1 && m.name !== "home") {
        h1.setAttribute("tabindex", "-1");
        h1.focus({ preventScroll: true });
    }
}
function boot() {
    mountNav(document.getElementById("nav"));
    mountFooter(document.getElementById("footer"));
    window.addEventListener("hashchange", renderRoute);
    const loader = document.getElementById("loader");
    loader?.append(wordmark("wordmark--lg"), h("p", { class: "tagline" }, "TIME REDEFINED"));
    const finish = () => {
        document.documentElement.classList.add("ready");
        loader?.classList.add("done");
        setTimeout(() => loader?.remove(), 900);
    };
    let finished = false;
    const once = () => { if (!finished) {
        finished = true;
        finish();
    } };
    void loadCatalog().then(() => {
        renderRoute();
        const first = catalog.products[0]?.heroImage;
        const wait = first && match(currentPath()).name === "home"
            ? new Promise((r) => { const i = new Image(); i.onload = i.onerror = () => r(); i.src = first; })
            : Promise.resolve();
        Promise.race([wait, new Promise((r) => setTimeout(r, 1800))]).then(() => setTimeout(once, 350));
    });
    setTimeout(once, 3500); // never trap the user behind the loader
}
boot();
