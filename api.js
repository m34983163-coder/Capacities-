export async function fetchProducts() {
    try {
        const r = await fetch("/api/products", { headers: { Accept: "application/json" } });
        if (r.ok)
            return { products: (await r.json()).products, source: "api" };
    }
    catch { /* fall through to static sample file */ }
    const r2 = await fetch("products.json");
    if (!r2.ok)
        throw new Error("catalogue unavailable");
    return { products: (await r2.json()).products, source: "static" };
}
export class ApiError extends Error {
    fields;
    constructor(message, fields = {}) {
        super(message);
        this.fields = fields;
    }
}
/** Creates an order on the server. Throws ApiError if the server did not create it. */
export async function createOrder(req) {
    let res;
    try {
        res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req),
        });
    }
    catch {
        throw new ApiError("The order service is unreachable, so no order was placed. Please try again.");
    }
    const data = (await res.json().catch(() => ({})));
    if (!res.ok || !data.order)
        throw new ApiError(data.error ?? "The order could not be placed.", data.fields ?? {});
    return data.order;
}
export async function fetchOrder(id) {
    try {
        const r = await fetch(`/api/orders/${encodeURIComponent(id)}`);
        return r.ok ? ((await r.json()).order) : null;
    }
    catch {
        return null;
    }
}
