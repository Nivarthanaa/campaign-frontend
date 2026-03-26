"use client";

import { useEffect, useState } from "react";
import Card from "../../components/Card";
import { getOptimizationPlan } from "../../lib/api";
import { getCampaignId } from "../../lib/store";
import { useRouter } from "next/navigation";

interface OptimizationPlan {
    status: string;
    confidence: number;
    next_campaign: {
        tactical_goal: string;
        duration_days: number;
        suggested_daily_spend: number;
        budget_recommendation: string;
        strategic_pivot: string;
        improvement_steps: string[];
    };
    segment_insight?: string;
    audience_logic?: string;
}

export default function OptimizePage() {
    const [plan, setPlan] = useState<OptimizationPlan | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const router = useRouter();

    const loadPlan = async (cid: string) => {
        setErr("");
        setLoading(true);
        try {
            const res = await getOptimizationPlan(cid);
            if (res?.error) setErr(res.error);
            else setPlan(res);
        } catch {
            setErr("Failed to load optimization plan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const cid = getCampaignId();
        if (cid) {
            loadPlan(cid);
        }
    }, []);

    return (
        <div style={{ maxWidth: 800, margin: "auto" }}>
            <div style={{ marginBottom: 20 }}>
                <button onClick={() => router.back()} className="btn-muted">← Back to Results</button>
            </div>

            <Card title="Advanced Optimization Plan" subtitle="AI-driven strategy for your next campaign">
                {loading && <p>Generating your strategic roadmap...</p>}
                {err && <p className="err">{err}</p>}

                {plan && (
                    <div style={{ marginTop: 24 }}>
                        <div style={{ marginBottom: 40, textAlign: 'center' }}>
                            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontWeight: 600 }}>Current Status:</div>
                            <div style={{ fontSize: 56, fontWeight: 900, fontFamily: '"Outfit", sans-serif', color: 'var(--primary)', lineHeight: 1.1, letterSpacing: '-0.02em', WebkitFontSmoothing: 'antialiased' }}>
                                {plan.status}
                            </div>
                            <p className="muted" style={{ marginTop: 12, fontSize: 16 }}>Prediction Confidence: {(plan.confidence * 100).toFixed(1)}%</p>
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
                            <div style={{ background: 'rgba(0,255,136,0.05)', padding: 15, borderRadius: 8, borderLeft: '4px solid var(--primary)' }}>
                                <div className="muted" style={{ fontSize: 10, textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.05em' }}>Target Objective</div>
                                <div style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--good)' }}>{plan.next_campaign.tactical_goal || "A Mix of Actions"}</div>
                                <p className="muted" style={{ fontSize: 11, marginTop: 4 }}>Optimized for {plan.next_campaign.duration_days} Days</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 8 }}>
                                <div className="muted" style={{ fontSize: 10, textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.05em' }}>Budget Blueprint</div>
                                <div style={{ fontSize: 18, fontWeight: 'bold' }}>${plan.next_campaign.suggested_daily_spend}/day</div>
                                <p className="muted" style={{ fontSize: 11, marginTop: 4 }}>{plan.next_campaign.budget_recommendation}</p>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 8, marginBottom: 30 }}>
                            <h4 style={{ marginBottom: 8, fontSize: 13, textTransform: 'uppercase', color: 'var(--primary)' }}>Strategic Pivot</h4>
                            <p style={{ fontSize: 14, lineHeight: 1.5 }}>{plan.next_campaign.strategic_pivot}</p>
                        </div>

                        <div style={{ marginBottom: 30 }}>
                            <h4 style={{ marginBottom: 15 }}>Step-by-Step Improvement Roadmap</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {plan.next_campaign.improvement_steps.map((step: string, i: number) => (
                                    <div key={i} style={{ display: 'flex', gap: 15, alignItems: 'flex-start' }}>
                                        <div style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: '50%',
                                            background: 'var(--primary)',
                                            color: '#000',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            fontSize: 12,
                                            fontWeight: 'bold',
                                            flexShrink: 0
                                        }}>{i + 1}</div>
                                        <p style={{ fontSize: 14, paddingTop: 3 }}>{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {(plan.segment_insight || plan.audience_logic) && (
                            <div style={{ padding: 15, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px border rgba(255,255,255,0.1)' }}>
                                <h4 style={{ marginBottom: 10, fontSize: 14, color: 'var(--accent)' }}>Audience Intelligence</h4>
                                <p style={{ fontSize: 13, marginBottom: 5 }}>{plan.segment_insight}</p>
                                <p style={{ fontSize: 13 }} className="muted">{plan.audience_logic}</p>
                            </div>
                        )}

                        <div style={{
                            marginTop: 40,
                            padding: 24,
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
                            borderRadius: 12,
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            textAlign: 'center'
                        }}>
                            <h3 style={{ marginBottom: 12, fontSize: 18, color: 'var(--primary)' }}>Need Advanced Strategic Guidance?</h3>
                            <p style={{ marginBottom: 20, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>
                                Take your campaign to the next level with expert consulting from industry professionals.
                            </p>
                            <a
                                href="https://tmdconsultants.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-block',
                                    padding: '14px 40px',
                                    background: 'var(--primary)',
                                    color: '#ffffff',
                                    borderRadius: 30,
                                    fontWeight: 'bold',
                                    textDecoration: 'none',
                                    fontSize: 16
                                }}
                            >
                                Contact Strategy Consultants →
                            </a>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
