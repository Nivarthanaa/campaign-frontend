"use client";

import { useEffect, useState } from "react";
import Card from "../../components/Card";
import { predict, getXaiLocal } from "../../lib/api";
import { getCampaignId } from "../../lib/store";
import { useRouter } from "next/navigation";

interface PredictionData {
    predictionText: string;
    predictionLabel: number;
    probabilities: number[];
    inputs: {
        likes: number;
        comments: number;
        shares: number;
        saves: number;
        [key: string]: unknown;
    };
    recommendations: string[];
}

export default function PredictionPage() {
    const [res, setRes] = useState<PredictionData | null>(null);
    const [xai, setXai] = useState<Record<string, number> | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const router = useRouter();

    const LABELS = ["Low", "Medium", "High"];

    useEffect(() => {
        const cid = getCampaignId();
        if (cid) {
            loadPrediction(cid);
        }
    }, []);

    const loadPrediction = async (cid: string) => {
        setErr("");
        setLoading(true);
        try {
            const data = await predict(cid);
            if (data?.error) {
                setErr(data.error);
                setLoading(false);
                return;
            }
            setRes(data);

            // Fetch XAI data
            const xaiData = await getXaiLocal(cid);
            if (!xaiData?.error) {
                setXai(xaiData);
            }
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Failed to load prediction");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: "auto" }}>
            <div style={{ marginBottom: 20 }}>
                <button onClick={() => router.back()} className="btn-muted">← Back to Results</button>
            </div>

            <Card title="Engagement Prediction Analysis" subtitle="Deep dive into AI confidence levels">
                {loading && <p>Analyzing engagement patterns...</p>}
                {err && <p className="err">{err}</p>}

                {res && (
                    <div style={{ marginTop: 24 }}>
                        <div className="res-grid" style={{ marginBottom: 40, textAlign: 'center' }}>
                            <h2 style={{ fontSize: 32, color: 'var(--primary)', marginBottom: 5 }}>{res.predictionText}</h2>
                            <p className="muted">Overall Predicted Engagement Level</p>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: 15,
                            marginBottom: 40,
                            padding: 20,
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: 16,
                            border: '1px solid var(--border)'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>Likes</div>
                                <div style={{ fontSize: 18, fontWeight: 700 }}>{res.inputs?.likes || 0}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>Comments</div>
                                <div style={{ fontSize: 18, fontWeight: 700 }}>{res.inputs?.comments || 0}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>Shares</div>
                                <div style={{ fontSize: 18, fontWeight: 700 }}>{res.inputs?.shares || 0}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', marginBottom: 4 }}>Saves</div>
                                <div style={{ fontSize: 18, fontWeight: 700 }}>{res.inputs?.saves || 0}</div>
                            </div>
                        </div>

                        {xai && (
                            <div style={{ marginBottom: 40 }}>
                                <h4 style={{ marginBottom: 20 }}>Why this prediction? (AI Insights)</h4>
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
                                    {Object.entries(xai)
                                        .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                                        .slice(0, 15)
                                        .map(([key, val]) => {
                                            const v = val;
                                            const absV = Math.abs(v);
                                            const maxAbs = Math.max(...Object.values(xai).map(x => Math.abs(x as number)));
                                            const width = maxAbs === 0 ? 0 : (absV / maxAbs) * 100;
                                            const isPositive = v > 0;
                                            const color = isPositive ? 'var(--primary)' : '#ef4444'; 
                                            
                                            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                                            return (
                                                <div key={key} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 50px', alignItems: 'center', gap: 10 }}>
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
                            </div>
                        )}

                        <div style={{ marginBottom: 40 }}>
                            <h4 style={{ marginBottom: 20 }}>Probability Distribution</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {res.probabilities.map((p: number, i: number) => {
                                    const percent = (p * 100).toFixed(1);
                                    const isTarget = i === res.predictionLabel;
                                    return (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                                                <span style={{ fontWeight: isTarget ? 'bold' : 'normal' }}>
                                                    {LABELS[i]} Engagement {isTarget ? "(Predicted)" : ""}
                                                </span>
                                                <span className="muted">{percent}%</span>
                                            </div>
                                            <div style={{
                                                height: 12,
                                                background: 'rgba(255,255,255,0.05)',
                                                borderRadius: 6,
                                                overflow: 'hidden',
                                                border: '1px solid rgba(255,255,255,0.1)'
                                            }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${percent}%`,
                                                    background: isTarget ? 'var(--good)' : 'rgba(255,255,255,0.2)',
                                                    transition: 'width 1s ease-out'
                                                }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 16, border: '1px solid var(--border)' }}>
                            <h4 style={{ marginBottom: 12, fontSize: 14 }}>Strategic Context</h4>
                            <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                                The model is <b>{(res.probabilities[res.predictionLabel] * 100).toFixed(1)}% confident</b> that this campaign will result in <b>{res.predictionText.toLowerCase()}</b> engagement levels based on historical data patterns from your audience segment.
                            </p>
                            <ul style={{ marginTop: 15, fontSize: 12, color: 'rgba(255,255,255,0.5)', paddingLeft: 20 }}>
                                {res.recommendations.slice(0, 2).map((r: string, idx: number) => (
                                    <li key={idx} style={{ marginBottom: 8 }}>{r}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
