import { catalog, onCatalog } from "./store.js";
import { h } from "./util.js";
import { hero } from "./hero.js";
import { collectionSection } from "./collection.js";
import { storySection } from "./story.js";
export function homePage() {
    const heroHost = h("div", { class: "hero-host" });
    const mount = () => {
        const featured = [...catalog.products].sort((a, b) => Number(b.featured) - Number(a.featured));
        heroHost.replaceChildren(hero(featured));
    };
    if (catalog.ready && catalog.products.length)
        mount();
    else {
        heroHost.append(h("section", { class: "hero hero--loading", "aria-label": "Loading" }));
        const off = onCatalog(() => { off(); if (heroHost.isConnected && catalog.products.length)
            mount(); });
    }
    return h("div", { class: "page page--home" }, heroHost, collectionSection(), storySection(), h("section", { class: "closing section", "data-reveal": "" }, h("p", { class: "eyebrow" }, "NOT"), h("h2", {}, "Time, redefined."), h("a", { class: "btn btn--solid", href: "#/collection" }, "Explore collection")));
}
