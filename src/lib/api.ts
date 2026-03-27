const BASE = process.env.NEXT_PUBLIC_API_URL;

export async function getSchema() {
    const res = await fetch(`${BASE}/schema`, { cache: "no-store" });
    return res.json();
}

export async function createCampaign(payload: Record<string, unknown>) {
    const res = await fetch(`${BASE}/campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return res.json();
}

export async function segment(campaignId: string) {
    const res = await fetch(`${BASE}/segment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId }),
    });
    return res.json();
}

export async function predict(campaignId: string) {
    const res = await fetch(`${BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId }),
    });
    return res.json();
}

export async function dashboard(campaignId: string) {
    const res = await fetch(`${BASE}/dashboard?campaignId=${encodeURIComponent(campaignId)}`, {
        cache: "no-store",
    });
    return res.json();
}

export async function getOptimizationPlan(campaignId: string) {
    const res = await fetch(`${BASE}/optimize?campaignId=${encodeURIComponent(campaignId)}`, {
        cache: "no-store",
    });
    return res.json();
}

export function reportUrl(campaignId: string) {
    return `${BASE}/report?campaignId=${encodeURIComponent(campaignId)}`;
}

export async function getXaiGlobal() {
    const res = await fetch(`${BASE}/xai/global`, { cache: "no-store" });
    return res.json();
}

export async function getXaiLocal(campaignId: string) {
    const res = await fetch(`${BASE}/xai/local?campaignId=${encodeURIComponent(campaignId)}`, {
        cache: "no-store",
    });
    return res.json();
}

export async function getAllCampaigns() {
    const res = await fetch(`${BASE}/campaigns`, { cache: "no-store" });
    return res.json();
}

export async function deleteCampaign(id: string) {
    const res = await fetch(`${BASE}/campaign/${id}`, { method: 'DELETE' });
    return res.json();
}

export async function clearAllCampaigns() {
    const res = await fetch(`${BASE}/campaigns/all`, { method: 'DELETE' });
    return res.json();
}
