import { h } from "./util.js";
import { catalog, collections, loadCatalog, onCatalog, stockStatus } from "./store.js";
import { productCard } from "./card.js";
export function collectionSection() {
    let filter = "All";
    let sort = "featured";
    let inStock = false;
    const chips = h("div", { class: "chips", role: "group", "aria-label": "Filter by collection" });
    const count = h("p", { class: "count", "aria-live": "polite" });
    const grid = h("div", { class: "grid" });
    const stockBox = h("input", { type: "checkbox", id: "instock" });
    stockBox.addEventListener("change", () => { inStock = stockBox.checked; paint(); });
    const select = h("select", { id: "sort", "aria-label": "Sort watches" }, h("option", { value: "featured" }, "Featured"), h("option", { value: "price-asc" }, "Price: low to high"), h("option", { value: "price-desc" }, "Price: high to low"));
    select.addEventListener("change", () => { sort = select.value; paint(); });
    const section = h("section", { class: "collection section", id: "collection", "aria-labelledby": "col-title" }, h("header", { class: "section__head", "data-reveal": "" }, h("p", { class: "eyebrow" }, "The collection"), h("h2", { id: "col-title" }, "Every watch, one point of view.")), h("div", { class: "toolbar", "data-reveal": "" }, chips, h("div", { class: "toolbar__right" }, h("label", { class: "check", for: "instock" }, stockBox, "In stock only"), h("label", { class: "sel", for: "sort" }, h("span", {}, "Sort"), select))), count, grid);
    function paintChips() {
        chips.replaceChildren(...["All", ...collections()].map((c) => h("button", { class: "chip", type: "button", "aria-pressed": String(c === filter), onClick: () => { filter = c; paintChips(); paint(); } }, c)));
    }
    function paint() {
        grid.replaceChildren();
        grid.removeAttribute("aria-busy");
        if (!catalog.ready) {
            grid.setAttribute("aria-busy", "true");
            for (let i = 0; i < 6; i++)
                grid.append(h("div", { class: "card card--skeleton", "aria-hidden": "true" }, h("div", { class: "sk sk--img" }), h("div", { class: "sk sk--l" }), h("div", { class: "sk sk--s" })));
            count.textContent = "Loading collection…";
            return;
        }
        if (catalog.error) {
            count.textContent = "";
            grid.append(h("div", { class: "state" }, h("p", { class: "state__t" }, "Something went wrong"), h("p", {}, catalog.error), h("button", { class: "btn btn--ghost", type: "button", onClick: () => { catalog.ready = false; paint(); void loadCatalog(); } }, "Try again")));
            return;
        }
        let list = catalog.products.filter((p) => (filter === "All" || p.collection === filter) && (!inStock || stockStatus(p) !== "out_of_stock"));
        if (sort === "price-asc")
            list = [...list].sort((a, b) => a.price - b.price);
        else if (sort === "price-desc")
            list = [...list].sort((a, b) => b.price - a.price);
        else
            list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
        count.textContent = `${list.length} watch${list.length === 1 ? "" : "es"}${filter === "All" ? "" : ` in ${filter}`}`;
        if (!list.length) {
            grid.append(h("div", { class: "state" }, h("p", { class: "state__t" }, "No watches match these filters"), h("p", {}, "Try another collection or include sold-out pieces."), h("button", { class: "btn btn--ghost", type: "button", onClick: () => { filter = "All"; inStock = false; stockBox.checked = false; paintChips(); paint(); } }, "Reset filters")));
            return;
        }
        list.forEach((p, i) => { const c = productCard(p, i < 3); c.setAttribute("data-reveal", ""); c.style.setProperty("--d", `${(i % 3) * 80}ms`); grid.append(c); });
        import("./motion.js").then((m) => m.observeReveals(grid));
    }
    const off = onCatalog(() => { if (!section.isConnected) {
        off();
        return;
    } paintChips(); paint(); });
    paintChips();
    paint();
    return section;
}
