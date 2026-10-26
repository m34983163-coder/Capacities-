const table = [
    { name: "home", re: /^\/?$/, keys: [] },
    { name: "collection", re: /^\/collection\/?$/, keys: [] },
    { name: "story", re: /^\/story\/?$/, keys: [] },
    { name: "product", re: /^\/product\/([\w-]+)\/?$/, keys: ["id"] },
    { name: "cart", re: /^\/cart\/?$/, keys: [] },
    { name: "checkout", re: /^\/checkout\/?$/, keys: [] },
    { name: "order", re: /^\/order\/([\w-]+)\/?$/, keys: ["id"] },
];
export const currentPath = () => location.hash.replace(/^#/, "") || "/";
export function match(path) {
    for (const r of table) {
        const m = r.re.exec(path);
        if (m)
            return { name: r.name, params: Object.fromEntries(r.keys.map((k, i) => [k, m[i + 1] ?? ""])) };
    }
    return { name: "notfound", params: {} };
}
export const isHomeFamily = (n) => n === "home" || n === "collection" || n === "story";
export const navigate = (path) => { location.hash = path; };
