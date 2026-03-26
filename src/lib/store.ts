"use client";

export function setCampaignId(id: string) {
    localStorage.setItem("campaignId", id);
}
export function getCampaignId() {
    if (typeof window !== "undefined") {
        return localStorage.getItem("campaignId");
    }
    return null;
}
