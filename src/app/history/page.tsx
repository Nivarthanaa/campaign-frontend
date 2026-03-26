"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "../../components/Card";
import { getAllCampaigns, deleteCampaign, clearAllCampaigns } from "../../lib/api";
import { useRouter } from "next/navigation";

// Functions moved to src/lib/api.ts

interface CampaignHistoryItem {
    id: string;
    platform: string;
    prob_high: number;
    predictionText?: string;
    [key: string]: unknown;
}

export default function HistoryPage() {
    const [allHistory, setAllHistory] = useState<CampaignHistoryItem[]>([]);
    const [platform, setPlatform] = useState("All");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await getAllCampaigns();
                setAllHistory(data);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = platform === "All" 
        ? allHistory 
        : allHistory.filter(c => c.platform === platform);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Delete campaign ${id}?`)) return;
        const res = await deleteCampaign(id);
        if (!res.error) {
            setAllHistory(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleClearAll = async () => {
        if (!confirm("Are you sure you want to CLEAR ALL history? This action cannot be undone.")) return;
        const res = await clearAllCampaigns();
        if (!res.error) setAllHistory([]);
    };

    const getGrowthColor = (curr: number, prev: number | null) => {
        if (prev === null) return "#94a3b8";
        return curr >= prev ? "var(--good)" : "var(--bad)";
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', animation: 'fadeIn 0.8s ease-out' }}>
            <div style={{ marginBottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => router.back()} className="btn-muted">← Back to Results</button>
                    <Link href="/" className="btn-muted">Back to Portal</Link>
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>Performance History</h1>
            </div>

            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                    {["All", "Instagram", "Facebook"].map(p => (
                        <button
                            key={p}
                            onClick={() => setPlatform(p)}
                            className={platform === p ? "btn" : "btn-muted"}
                            style={{ padding: '8px 24px', fontSize: 13 }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
                {allHistory.length > 0 && (
                    <button 
                        onClick={handleClearAll} 
                        style={{ 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            border: '1px solid rgba(239, 68, 68, 0.2)', 
                            color: 'var(--bad)', 
                            padding: '8px 20px', 
                            fontSize: 12, 
                            borderRadius: 12,
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        Clear All History
                    </button>
                )}
            </div>

            <Card title="Tactical Submissions" subtitle="Archive of actionable strategy benchmarks">
                {loading ? (
                    <p style={{ padding: 40, textAlign: 'center' }}>Synchronizing neural ledger...</p>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center' }}>
                        <p className="muted">No results found for {platform === "All" ? "any submission" : platform}.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto', marginTop: 20 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '16px 20px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)' }}>ID</th>
                                    <th style={{ padding: '16px 20px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)' }}>Platform</th>
                                    <th style={{ padding: '16px 20px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)' }}>Result</th>
                                    <th style={{ padding: '16px 20px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)' }}>Confidence</th>
                                    <th style={{ padding: '16px 20px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)' }}>Growth</th>
                                    <th style={{ padding: '16px 20px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c, idx) => {
                                    const nextInAll = allHistory[allHistory.findIndex(x => x.id === c.id) + 1] || null;
                                    const growth = nextInAll ? c.prob_high - nextInAll.prob_high : 0;

                                    return (
                                        <tr key={`${c.id}-${idx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                                            <td style={{ padding: 20, fontSize: 14, fontWeight: 700, color: 'var(--good)' }}>{c.id}</td>
                                            <td style={{ padding: 20, fontSize: 14 }}>{c.platform}</td>
                                            <td style={{ padding: 20 }}>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: 100,
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                    color: '#60a5fa',
                                                    border: '1px solid rgba(59, 130, 246, 0.2)'
                                                }}>
                                                    {c.predictionText || "Analyzed"}
                                                </span>
                                            </td>
                                            <td style={{ padding: 20, fontSize: 14, fontWeight: 900 }}>
                                                {(c.prob_high * 100).toFixed(1)}%
                                            </td>
                                            <td style={{ padding: 20 }}>
                                                {nextInAll ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: getGrowthColor(c.prob_high, nextInAll.prob_high), fontSize: 13, fontWeight: 700 }}>
                                                        {growth >= 0 ? "▲" : "▼"} {Math.abs(growth * 100).toFixed(1)}%
                                                    </div>
                                                ) : (
                                                    <span className="muted" style={{ fontSize: 11 }}>Baseline</span>
                                                )}
                                            </td>
                                            <td style={{ padding: 20 }}>
                                                <button
                                                    onClick={(e) => handleDelete(c.id, e)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                                        color: 'var(--bad)',
                                                        borderRadius: 6,
                                                        padding: '4px 10px',
                                                        fontSize: 11,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
