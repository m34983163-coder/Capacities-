import { fetchProducts } from "./api.js";
/* ---------- Catalogue ---------- */
export const catalog = {
    products: [],
    source: "static",
    ready: false,
    error: "",
};
const catalogListeners = new Set();
export const onCatalog = (fn) => { catalogListeners.add(fn); return () => catalogListeners.delete(fn); };
export async function loadCatalog() {
    try {
        const r = await fetchProducts();
        catalog.products = r.products;
        catalog.source = r.source;
        catalog.error = "";
    }
    catch (e) {
        catalog.error = "We couldn't load the collection. Please try again.";
    }
    catalog.ready = true;
    reconcileCart();
    catalogListeners.forEach((f) => f());
}
export const getProduct = (id) => catalog.products.find((p) => p.id === id);
export const totalStock = (p) => p.variants.reduce((s, v) => s + v.stock, 0);
export function stockStatus(p) {
    const t = totalStock(p);
    return t <= 0 ? "out_of_stock" : t <= 3 ? "low_stock" : "in_stock";
}
export const firstAvailable = (p) => p.variants.find((v) => v.stock > 0);
export const collections = () => [...new Set(catalog.products.map((p) => p.collection))];
/* ---------- Cart ---------- */
const KEY = "not.cart.v1";
let lines = load();
const cartListeners = new Set();
export const onCart = (fn) => { cartListeners.add(fn); return () => cartListeners.delete(fn); };
function load() {
    try {
        const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
        if (!Array.isArray(raw))
            return [];
        return raw.filter((l) => !!l && typeof l.productId === "string" && typeof l.variantId === "string" && Number.isInteger(l.qty) && l.qty > 0);
    }
    catch {
        return [];
    }
}
function save() {
    try {
        localStorage.setItem(KEY, JSON.stringify(lines));
    }
    catch { /* storage unavailable */ }
    cartListeners.forEach((f) => f());
}
/** Drop unknown items and clamp quantities to live stock. */
function reconcileCart() {
    if (!catalog.products.length)
        return;
    const next = [];
    for (const l of lines) {
        const v = getProduct(l.productId)?.variants.find((x) => x.id === l.variantId);
        if (!v || v.stock <= 0)
            continue;
        next.push({ ...l, qty: Math.min(l.qty, v.stock) });
    }
    if (JSON.stringify(next) !== JSON.stringify(lines)) {
        lines = next;
        save();
    }
}
export const MAX_PER_LINE = 5;
export const cartLines = () => lines;
export const cartCount = () => lines.reduce((s, l) => s + l.qty, 0);
export function resolvedLines() {
    const out = [];
    for (const line of lines) {
        const product = getProduct(line.productId);
        const variant = product?.variants.find((v) => v.id === line.variantId);
        if (product && variant)
            out.push({ line, product, variant, lineTotal: product.price * line.qty });
    }
    return out;
}
export const subtotal = () => resolvedLines().reduce((s, r) => s + r.lineTotal, 0);
/** SAMPLE shipping rule — replace with real rates. */
export const FREE_SHIPPING_OVER = 2500;
export const FLAT_SHIPPING = 25;
export const shippingFor = (sub) => (sub === 0 || sub >= FREE_SHIPPING_OVER ? 0 : FLAT_SHIPPING);
export const orderTotal = () => subtotal() + shippingFor(subtotal());
export function addToCart(productId, variantId, qty = 1) {
    const p = getProduct(productId);
    const v = p?.variants.find((x) => x.id === variantId);
    if (!p || !v)
        return { ok: false, message: "This watch is no longer available." };
    if (!Number.isInteger(qty) || qty < 1)
        return { ok: false, message: "Choose a valid quantity." };
    if (v.stock <= 0)
        return { ok: false, message: `${p.name} ${v.label} is sold out.` };
    const existing = lines.find((l) => l.productId === productId && l.variantId === variantId);
    const cap = Math.min(v.stock, MAX_PER_LINE);
    const wanted = (existing?.qty ?? 0) + qty;
    if (wanted > cap) {
        if (existing)
            existing.qty = cap;
        else
            lines.push({ productId, variantId, qty: cap });
        save();
        return { ok: false, message: `Only ${cap} available for ${p.name} ${v.label}. Cart updated to the maximum.` };
    }
    if (existing)
        existing.qty = wanted;
    else
        lines.push({ productId, variantId, qty });
    save();
    return { ok: true, message: `${p.name} added to your cart.` };
}
export function setQty(productId, variantId, qty) {
    const v = getProduct(productId)?.variants.find((x) => x.id === variantId);
    const l = lines.find((x) => x.productId === productId && x.variantId === variantId);
    if (!l || !v)
        return { ok: false, message: "Item not found." };
    if (qty <= 0)
        return removeLine(productId, variantId);
    const cap = Math.min(v.stock, MAX_PER_LINE);
    l.qty = Math.min(qty, cap);
    save();
    return qty > cap ? { ok: false, message: `Maximum of ${cap} for this watch.` } : { ok: true, message: "Quantity updated." };
}
export function removeLine(productId, variantId) {
    lines = lines.filter((l) => !(l.productId === productId && l.variantId === variantId));
    save();
    return { ok: true, message: "Item removed." };
}
export function clearCart() { lines = []; save(); }
