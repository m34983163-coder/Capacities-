import { h, icon, money, reducedMotion } from "./util.js";
import { splitWords } from "./motion.js";
const EASE_IN = "cubic-bezier(.16,1,.3,1)";
const EASE_IO = "cubic-bezier(.7,0,.2,1)";
const pad = (n) => String(n).padStart(2, "0");
export function hero(list) {
    const items = list.length ? list : [];
    let cur = 0, busy = false, act = 0;
    const imgs = [0, 1].map((i) => h("img", { class: "stage__img", alt: i === 0 && items[0] ? `NOT ${items[0].name}` : "", width: 1300, height: 900, decoding: "async", fetchpriority: i === 0 ? "high" : "auto", style: i === 1 ? "opacity:0" : "" }));
    if (items[0])
        imgs[0].src = items[0].heroImage;
    const idx = h("span", { class: "hero__idx" });
    const col = h("p", { class: "hero__col" });
    const name = h("h2", { class: "hero__name" });
    const price = h("p", { class: "hero__price" });
    const view = h("a", { class: "link-btn", href: "#/" }, "View watch");
    const info = h("div", { class: "hero__info", "aria-live": "polite" }, idx, col, name, price, view);
    const thumbs = items.map((p, i) => h("button", { class: "thumb", type: "button", "aria-pressed": String(i === 0), "aria-label": `${p.name}, ${p.collection}`, onClick: () => go(i) }, h("img", { src: p.thumb, alt: "", width: 89, height: 105, loading: "lazy" }), h("span", {}, p.name.split(" ")[0] ?? p.name)));
    const prev = h("button", { class: "arrow", type: "button", "aria-label": "Previous watch", onClick: () => go((cur - 1 + items.length) % items.length, -1) }, icon("left", 22));
    const next = h("button", { class: "arrow", type: "button", "aria-label": "Next watch", onClick: () => go((cur + 1) % items.length, 1) }, icon("right", 22));
    const title = h("h1", { class: "hero__title" }, "TIME, REDEFINED.");
    splitWords(title);
    const section = h("section", { class: "hero", id: "top", "aria-label": "Featured watches" }, h("div", { class: "hero__bg", "aria-hidden": "true" }), h("div", { class: "hero__stage", role: "img", "aria-label": "Featured NOT watch" }, h("div", { class: "stage__drift" }, ...imgs)), h("div", { class: "hero__copy" }, h("p", { class: "eyebrow hero__eyebrow" }, "NOT · Time redefined"), title, h("p", { class: "hero__lead" }, "Discover a new perspective on time. Precision, character, and timeless design — curated by NOT."), h("div", { class: "hero__cta" }, h("a", { class: "btn btn--solid", href: "#/collection" }, "Explore collection"), h("a", { class: "btn btn--ghost", href: "#/story" }, "Discover NOT"))), info, h("div", { class: "hero__nav" }, prev, next), h("div", { class: "hero__thumbs", role: "group", "aria-label": "Choose a watch" }, ...thumbs));
    function paintInfo(i) {
        const p = items[i];
        idx.textContent = `${pad(i + 1)} / ${pad(items.length)}`;
        col.textContent = p.collection;
        name.textContent = p.name;
        price.textContent = money(p.price);
        view.setAttribute("href", `#/product/${p.id}`);
        view.setAttribute("aria-label", `View ${p.name}`);
        thumbs.forEach((t, k) => t.setAttribute("aria-pressed", String(k === i)));
        section.style.setProperty("--accent", p.accent);
    }
    async function go(to, forcedDir) {
        if (busy || to === cur || !items.length)
            return;
        busy = true;
        const dir = forcedDir ?? (to > cur ? 1 : -1);
        const p = items[to];
        const out = imgs[act], inn = imgs[1 - act];
        inn.src = p.heroImage;
        inn.alt = `NOT ${p.name}`;
        try {
            await inn.decode();
        }
        catch { /* still show */ }
        if (reducedMotion()) {
            out.style.opacity = "0";
            inn.style.opacity = "1";
            act = 1 - act;
            cur = to;
            paintInfo(to);
            busy = false;
            return;
        }
        const infoEls = [...info.children];
        out.animate([{ opacity: 1, transform: "scale(1) translateX(0)" }, { opacity: 0, transform: `scale(1.04) translateX(${-40 * dir}px)` }], { duration: 700, easing: EASE_IO, fill: "forwards" });
        infoEls.forEach((e, k) => e.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateY(-10px)` }], { duration: 260, delay: k * 30, easing: "ease-in", fill: "forwards" }));
        await new Promise((r) => setTimeout(r, 360));
        cur = to;
        paintInfo(to);
        infoEls.forEach((e) => e.getAnimations().forEach((a) => a.cancel()));
        infoEls.forEach((e, k) => e.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 800, delay: 120 + k * 90, easing: EASE_IN, fill: "backwards" }));
        const a = inn.animate([{ opacity: 0, transform: `scale(1.08) translateX(${40 * dir}px)` }, { opacity: 1, transform: "scale(1) translateX(0)" }], { duration: 1100, easing: EASE_IN, fill: "forwards" });
        await a.finished.catch(() => undefined);
        out.getAnimations().forEach((x) => x.cancel());
        a.cancel();
        out.style.opacity = "0";
        inn.style.opacity = "1";
        inn.style.transform = "";
        act = 1 - act;
        busy = false;
    }
    // swipe
    const stage = section.querySelector(".hero__stage");
    let sx = 0, sy = 0, tracking = false;
    stage.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; tracking = true; });
    stage.addEventListener("pointerup", (e) => {
        if (!tracking)
            return;
        tracking = false;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4)
            go(dx < 0 ? (cur + 1) % items.length : (cur - 1 + items.length) % items.length, dx < 0 ? 1 : -1);
    });
    stage.addEventListener("pointercancel", () => { tracking = false; });
    section.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight")
            next.click();
        else if (e.key === "ArrowLeft")
            prev.click();
    });
    if (items.length) {
        paintInfo(0);
        // warm the cache so transitions never wait on the network
        setTimeout(() => items.slice(1).forEach((p) => { const i = new Image(); i.src = p.heroImage; }), 800);
    }
    return section;
}
