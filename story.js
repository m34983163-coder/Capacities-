import { h } from "./util.js";
import { splitWords } from "./motion.js";
export function storySection() {
    const title = h("h2", { "data-split": "", "data-reveal": "" }, "DESIGNED TO STAND APART.");
    splitWords(title);
    const strip = [
        ["bg-mountain.jpg", "Dusk"], ["bg-green.jpg", "Verdant"], ["bg-rock.jpg", "Ember"], ["bg-ocean.jpg", "Tide"], ["bg-stripes.jpg", "Atelier"],
    ];
    return h("section", { class: "story section", id: "story", "aria-labelledby": "story-title" }, h("div", { class: "story__grid" }, h("div", { class: "story__text" }, h("p", { class: "eyebrow", "data-reveal": "" }, "The NOT point of view"), h("div", { id: "story-title" }, title), h("p", { class: "story__lead", "data-reveal": "" }, "Every detail has a purpose. Every second tells a story."), h("p", { class: "muted", "data-reveal": "" }, "NOT is a brand position, not a history lesson: restrained dials, honest materials and a quiet confidence that lets the watch do the talking."), h("a", { class: "btn btn--ghost", href: "#/collection", "data-reveal": "" }, "Explore collection")), h("div", { class: "story__media" }, h("figure", { class: "story__a", "data-reveal": "" }, h("img", { src: "detail-crown.jpg", alt: "Close-up of a brushed steel watch case with a knurled crown engraved NOT", width: 311, height: 304, loading: "lazy" })), h("figure", { class: "story__b", "data-reveal": "", style: "--d:140ms" }, h("img", { src: "detail-movement.jpg", alt: "Close-up of a watch caseback with visible mechanism and the NOT wordmark", width: 371, height: 304, loading: "lazy" })))), h("ul", { class: "strip", "aria-hidden": "true" }, ...strip.map(([src, label], i) => h("li", { "data-reveal": "", style: `--d:${i * 70}ms` }, h("img", { src, alt: "", width: 310, height: 139, loading: "lazy" }), h("span", {}, label)))));
}
