"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Card from "../../components/Card";
import LoadingButton from "../../components/LoadingButton";
import { reportUrl, segment, dashboard } from "../../lib/api";
import { getCampaignId } from "../../lib/store";

interface SegmentationData {
    clusterId: number | string;
    segmentProfile?: {
        size: number;
        avg_engagement_score: number;
        top_gender: string;
        top_age_group: string;
        top_platform: string;
        top_post_type: string;
        top_region: string;
        top_device: string;
    };
}

export default function ResultsPage() {
    const router = useRouter();
    const [campaignId, setCampaignIdState] = useState<string | null>(null);
    const [seg, setSeg] = useState<SegmentationData | null>(null);
    const [campaignData, setCampaignData] = useState<any>(null);
    const [err, setErr] = useState("");
    const [highlight, setHighlight] = useState(false);
    const segRef = useRef<HTMLDivElement>(null);

    const [loadingSeg, setLoadingSeg] = useState(false);

    useEffect(() => {
        const cid = getCampaignId();
        if (cid) {
            setCampaignIdState(cid);
            dashboard(cid).then(res => {
                if (res && res.kpis) setCampaignData(res.kpis);
            }).catch(console.error);
        }
    }, []);


    const runSeg = async () => {
        setErr("");
        if (!campaignId) return setErr("No campaign found. Please submit a campaign first.");
        setLoadingSeg(true);
        try {
            const r = await segment(campaignId);
            // No redundant setLoadingSeg(true) here

            if (r?.error) {
                setErr(r.error);
                setLoadingSeg(false);
            } else if (r) {
                setSeg(r);
                setHighlight(true);
                setLoadingSeg(false);

                // Scroll to the result card
                setTimeout(() => {
                    segRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);

                // Reset highlight after 3 seconds
                setTimeout(() => setHighlight(false), 3000);
            } else {
                setErr("Received empty response from server.");
                setLoadingSeg(false);
            }
        } catch (e: unknown) {
            setLoadingSeg(false);
            setErr(e instanceof Error ? e.message : "An unexpected error occurred during segmentation.");
        }
    };


    const dl = campaignId ? reportUrl(campaignId) : "";

    return (
        <div style={{ animation: 'fadeIn 0.8s ease-out' }}>
            <div style={{ marginBottom: 20 }}>
                <Link href="/" className="btn-muted">← Back to Home</Link>
            </div>
            <Card title="Run Core Functionalities" subtitle="Segmentation • Engagement Prediction • Dashboard • Report">
                {err && <p className="err">{err}</p>}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <LoadingButton loading={loadingSeg} onClick={runSeg}>Run Segmentation</LoadingButton>
                    <button onClick={() => router.push('/prediction')} className="btn">Engagement Prediction →</button>
                    <button onClick={() => router.push('/dashboard')} className="btn">Load Dashboard →</button>
                    <button onClick={() => router.push('/history')} className="btn">Performance Tracking →</button>
                </div>

            </Card>

            <div className="grid">
                <div ref={segRef} style={{
                    transition: 'all 0.5s ease',
                    boxShadow: highlight ? '0 0 30px var(--primary)' : 'none',
                    borderRadius: 16,
                    transform: highlight ? 'scale(1.02)' : 'scale(1)'
                }}>
                    <Card title="Audience Segmentation" subtitle="Segment analysis">
                        {seg && (
                            <div style={{
                                background: 'rgba(59, 130, 246, 0.1)',
                                padding: '8px 12px',
                                borderRadius: 8,
                                marginBottom: 15,
                                border: '1px solid var(--primary)',
                                fontSize: 12,
                                color: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}>
                                <span style={{ 
                                    width: 16, 
                                    height: 16, 
                                    background: 'var(--primary)', 
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 10,
                                    color: '#fff',
                                    fontWeight: 'bold'
                                }}>✔</span>
                                Segmentation Successful: Campaign matched to Cluster {seg.clusterId}
                            </div>
                        )}
                        {seg ? (
                            <div style={{ fontSize: 13 }}>
                                <p><b>Cluster ID:</b> {seg.clusterId}</p>
                                {seg.segmentProfile && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 10 }}>
                                        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                                            <h5 style={{ margin: '0 0 8px', fontSize: 11, textTransform: 'uppercase', color: 'var(--primary)' }}>Your Campaign Focus</h5>
                                            <ul style={{ padding: 0, listStyle: 'none', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <li><b>Platform:</b> {campaignData?.platform || 'Loading...'}</li>
                                                <li><b>Device:</b> {campaignData?.device_type || 'Loading...'}</li>
                                                <li><b>Region:</b> {campaignData?.region || 'Loading...'}</li>
                                            </ul>
                                        </div>
                                        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(59, 130, 246, 0.03)', border: '1px dashed var(--primary)' }}>
                                            <h5 style={{ margin: '0 0 8px', fontSize: 11, textTransform: 'uppercase', color: 'var(--primary)' }}>Segment Benchmark</h5>
                                            <ul style={{ padding: 0, listStyle: 'none', fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <li><b>Typical Device:</b> {seg.segmentProfile.top_device}</li>
                                                <li><b>Segment Size:</b> {seg.segmentProfile.size}</li>
                                                <li><b>Avg. Engagement:</b> {(seg.segmentProfile.avg_engagement_score * 100).toFixed(1)}%</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="muted">Run segmentation to view results.</p>
                        )}
                    </Card>
                </div>

                <Card title="Quick Optimization" subtitle="Strategic Overview">
                    <p className="muted" style={{ fontSize: 13 }}>AI is processing campaign metrics to synthesize your next tactical roadmap.</p>
                    <div style={{ marginTop: 20 }}>
                        <button onClick={() => router.push('/optimize')} className="btn" style={{ width: '100%' }}>
                            View Strategy Plan →
                        </button>
                    </div>
                </Card>
            </div>

            <Card title="Dashboard & Report" subtitle="KPIs + download report">
                <p className="muted">
                    Access your full performance dashboard and download detailed PDF reports for baseline and optimization strategies.
                </p>
                {campaignId && (
                    <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                        <a href={dl} target="_blank" rel="noreferrer" className="btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                            Download Full PDF Report
                        </a>
                    </div>
                )}
            </Card>
        </div>
    );
}
