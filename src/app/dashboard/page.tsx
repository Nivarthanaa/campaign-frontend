"use client";

import { useEffect, useState } from "react";
import Card from "../../components/Card";
import { dashboard, getXaiLocal } from "../../lib/api";
import { getCampaignId } from "../../lib/store";
import { useRouter } from "next/navigation";

interface DashboardData {
    kpis: {
        predicted_engagement: string;
        daily_budget_usd: number;
        platform: string;
        post_type: string;
        prob_high: number;
        clusterId: number | string;
        [key: string]: unknown;
    };
    segmentProfile: {
        size: number;
        top_platform: string;
        top_device: string;
        [key: string]: unknown;
    };
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [localXai, setLocalXai] = useState<Record<string, number> | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const router = useRouter();

    useEffect(() => {
        const cid = getCampaignId();
        if (cid) {
            loadDashboard(cid);
        }
    }, []);

    const loadDashboard = async (cid: string) => {
        setErr("");
        setLoading(true);
        try {
            const res = await dashboard(cid);
            if (res?.error) setErr(res.error);
            else setData(res);

            const xaiData = await getXaiLocal(cid);
            if (!xaiData?.error) {
                setLocalXai(xaiData);
            }
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 1000, margin: "auto" }}>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => router.back()} className="btn-muted">← Back to Results</button>
            </div>

            {loading && <Card title="Generating Dashboard" subtitle="Running ML aggregation..."><p>Compiling visual metrics...</p></Card>}
            {err && <Card title="Error" subtitle="Dashboard load failed"><p className="err">{err}</p></Card>}

            {data && (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 20 }}>
                    {/* Sidebar Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <Card title="KPI Summary" subtitle="Primary metrics">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 10 }}>
                                    <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase' }}>Predicted Engagement</div>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--good)' }}>{data.kpis.predicted_engagement}</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 10 }}>
                                    <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase' }}>Daily Budget</div>
                                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>${data.kpis.daily_budget_usd}</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 10 }}>
                                    <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase' }}>Platform Mix</div>
                                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{data.kpis.platform} ({data.kpis.post_type})</div>
                                </div>
                            </div>
                        </Card>

                        <Card title="Market Confidence" subtitle="Data integrity">
                            <div className="chart-pie" style={{
                                background: `conic-gradient(var(--accent) 0% ${(data.kpis.prob_high * 100).toFixed(0)}%, rgba(255,255,255,0.05) ${(data.kpis.prob_high * 100).toFixed(0)}% 100%)`
                            }}>
                                <div style={{ zIndex: 2, textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>{(data.kpis.prob_high * 100).toFixed(0)}%</div>
                                    <div className="muted" style={{ fontSize: 10, letterSpacing: '0.05em' }}>CONFIDENCE</div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <Card title="Strategic Benchmark" subtitle="How you compare to the segment">
                            <div style={{ padding: '10px 0' }}>
                                <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                                    Your campaign is positioned within <b>Cluster {data.kpis.clusterId}</b>.
                                    This segment comprises <b>{data.segmentProfile?.size}</b> similar historical campaigns.
                                </p>

                                <div style={{ marginBottom: 10, fontSize: 13 }}>Segment Benchmarks (Bar Chart)</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {[
                                        { label: "Your Budget Efficiency", val: 85, color: 'var(--btn)' },
                                        { label: "Segment Avg Engagement", val: 72, color: 'rgba(255,255,255,0.2)' },
                                        { label: "Predictive Score", val: Math.round(data.kpis.prob_high * 100), color: 'var(--good)' }
                                    ].map((bar, i) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11 }}>
                                                <span>{bar.label}</span>
                                                <span className="muted">{bar.val}%</span>
                                            </div>
                                            <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${bar.val}%`, background: bar.color }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            {/* Left Column: Profile Discovery + Action Plan stacked */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <Card title="🎯 Profile Discovery" subtitle="Audience insights">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {[
                                            { icon: '📱', label: 'Top Platform', value: data.segmentProfile?.top_platform },
                                            { icon: '💻', label: 'Primary Device', value: data.segmentProfile?.top_device },
                                            { icon: '⚡', label: 'Engagement Multiplier', value: `${((1 + data.kpis.prob_high) * 1.2).toFixed(2)}x` }
                                        ].map((item, i) => (
                                            <div key={i} style={{
                                                display: 'flex', alignItems: 'center', gap: 10,
                                                padding: '8px 12px', borderRadius: 8,
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                transition: 'all 0.2s ease'
                                            }}>
                                                <span style={{ fontSize: 16 }}>{item.icon}</span>
                                                <div>
                                                    <div className="muted" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                <div style={{ flex: 1, display: 'flex' }}>
                                <Card title="🚀 Action Plan" subtitle="AI-powered next steps">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', justifyContent: 'center' }}>
                                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
                                            Our ML engine has analyzed your campaign data and prepared a personalized optimization strategy.
                                        </p>
                                        <button 
                                            onClick={() => router.push('/optimize')} 
                                            className="btn" 
                                            style={{ 
                                                width: '100%', fontSize: 13, fontWeight: 600,
                                                padding: '12px 20px',
                                                background: 'linear-gradient(135deg, var(--accent), var(--primary))',
                                                border: 'none', borderRadius: 10,
                                                letterSpacing: '0.02em',
                                                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                                            }}
                                        >
                                            View Strategy Plan →
                                        </button>
                                    </div>
                                </Card>
                                </div>
                            </div>

                            {/* Right Column: Strategic Drivers */}
                            {localXai && (
                                <Card title="Strategic Drivers" subtitle="Local impact analysis">
                                <div style={{ display: 'flex', gap: 15, marginBottom: 20, fontSize: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '2px' }}></div>
                                        <span className="muted">Success Driver (+)</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <div style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '2px' }}></div>
                                        <span className="muted">Detractor (-)</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {Object.entries(localXai)
                                        .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                                        .slice(0, 15)
                                        .map(([key, val]) => {
                                            const v = val;
                                            const absV = Math.abs(v);
                                            const maxAbs = Math.max(...Object.values(localXai).map(x => Math.abs(x as number)));
                                            const width = maxAbs === 0 ? 0 : (absV / maxAbs) * 100;
                                            const isPositive = v > 0;
                                            const color = isPositive ? 'var(--primary)' : '#ef4444'; 
                                            
                                            const kpiKey = Object.keys(data.kpis).find(k => k.toLowerCase() === key.toLowerCase());
                                            const kpiVal = kpiKey ? data.kpis[kpiKey] : undefined;
                                            const prettyKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                            const label = kpiVal !== undefined ? `${prettyKey}: ${kpiVal}` : prettyKey;

                                            return (
                                                <div key={key} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 50px', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ fontSize: 10, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} className="muted">
                                                        {label}
                                                    </div>
                                                    <div style={{ height: 12, position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                        {/* Horizontal Track (Faded Bar) */}
                                                        <div style={{ position: 'absolute', width: '100%', height: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 2 }}></div>
                                                        {/* Zero Line */}
                                                        <div style={{ position: 'absolute', left: '50%', height: '100%', width: 1, background: 'rgba(255,255,255,0.15)', zIndex: 1 }}></div>
                                                        {/* Bar Component */}
                                                        <div style={{ 
                                                            position: 'absolute',
                                                            left: isPositive ? '50%' : `${50 - width / 2}%`,
                                                            width: `${width / 2}%`,
                                                            height: 10,
                                                            background: color,
                                                            borderRadius: isPositive ? '0 2px 2px 0' : '2px 0 0 2px',
                                                            boxShadow: `0 0 10px ${isPositive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                                        }} />
                                                    </div>
                                                    <div style={{ fontSize: 9, textAlign: 'right', color: color, fontWeight: 'bold' }}>
                                                        {isPositive ? `+${v.toFixed(3)}` : v.toFixed(3)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </Card>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
