
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Card from "../../components/Card";
import LoadingButton from "../../components/LoadingButton";
import { createCampaign, getSchema } from "../../lib/api";
import { setCampaignId } from "../../lib/store";
import { useRouter } from "next/navigation";

interface CampaignForm {
    campaign_id: string;
    platform: string;
    post_type: string;
    ad_spend_usd: number;
    ad_duration_days: number;
    daily_budget_usd: number;
    most_engaged_gender: string;
    most_engaged_age_group: string;
    region: string;
    device_type: string;
    likes: number | string;
    comments: number | string;
    shares: number | string;
    saves: number | string;
}

export default function CampaignPage() {
    const [schema, setSchema] = useState<{ enums?: Record<string, string[]> } | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const router = useRouter();

    const [form, setForm] = useState<CampaignForm>({
        campaign_id: "CMP-NEW-001",
        platform: "Instagram",
        post_type: "Reel",
        ad_spend_usd: 150,
        ad_duration_days: 10,
        daily_budget_usd: 15,
        most_engaged_gender: "Female",
        most_engaged_age_group: "18-24",
        region: "Sri Lanka",
        device_type: "Mobile",
        likes: "",
        comments: "",
        shares: "",
        saves: ""
    });

    useEffect(() => {
        getSchema().then(setSchema).catch(() => setSchema(null));
    }, []);

    // Adaptive Budget Automation: Auto-calculate Daily Budget (Division-by-zero proof)
    useEffect(() => {
        if (form.ad_spend_usd >= 0 && form.ad_duration_days > 0) {
            const calculated = Number((form.ad_spend_usd / form.ad_duration_days).toFixed(2));
            if (calculated !== form.daily_budget_usd) {
                setForm((p) => ({ ...p, daily_budget_usd: calculated }));
            }
        } else if (form.ad_duration_days === 0 && form.daily_budget_usd !== 0) {
            // Default to 0 daily if duration is 0 to avoid Infinity
            setForm((p) => ({ ...p, daily_budget_usd: 0 }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.ad_spend_usd, form.ad_duration_days]);

    const update = (k: keyof CampaignForm, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

    const submit = async () => {
        setErr("");

        // Universal Zero-Permissive Validation (Block negative only)
        if (form.ad_spend_usd < 0) return setErr("Spend cannot be negative.");
        if (form.ad_duration_days < 0) return setErr("Duration cannot be negative.");
        if (form.daily_budget_usd < 0) return setErr("Daily Budget cannot be negative.");

        // Strict Mandatory (Likes only)
        if (form.likes === "" || form.likes === null || form.likes === undefined) {
            return setErr("Likes count is mandatory to proceed.");
        }
        if (Number(form.likes) < 0) return setErr("Likes count cannot be negative.");

        // Optional Metrics with Auto-Zero fallback (Comments, Shares, Saves)
        const normalize = (v: number | string) => (v === "" || v === null || v === undefined) ? 0 : v;
        const finalForm = {
            ...form,
            comments: normalize(form.comments),
            shares: normalize(form.shares),
            saves: normalize(form.saves)
        };

        if (Number(finalForm.comments) < 0) return setErr("Comments count cannot be negative.");
        if (Number(finalForm.shares) < 0) return setErr("Shares count cannot be negative.");
        if (Number(finalForm.saves) < 0) return setErr("Saves count cannot be negative.");

        setLoading(true);
        const res = await createCampaign(finalForm);
        setLoading(false);

        if (res?.error) return setErr(res.error);

        setCampaignId(res.campaignId);
        router.push("/results");
    };

    const enums = schema?.enums || {};

    const formatNum = (val: number | string) => {
        if (val === 0 || val === "0") return "";
        const num = typeof val === 'string' ? parseInt(val, 10) : val;
        if (isNaN(num)) return "";
        if (num < 10) return `0${num}`;
        return `${num}`;
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', animation: 'fadeIn 0.8s ease-out' }}>
            <div style={{ marginBottom: 20 }}>
                <Link href="/" className="btn-muted">← Back to Home</Link>
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: 40,
                alignItems: 'start'
            }}>
                {/* Left: Functional Form */}
                <Card title="Campaign Configuration" subtitle="Define your primary dataset parameters">
                    <label style={{ display: 'block' }}>Platform</label>
                    <select value={form.platform} onChange={(e) => update("platform", e.target.value)}>
                        {(enums.platform || ["Instagram", "Facebook"]).map((x: string) => (
                            <option key={x} value={x}>{x}</option>
                        ))}
                    </select>

                    <label style={{ marginTop: 10, display: 'block' }}>Content Strategy</label>
                    <select value={form.post_type} onChange={(e) => update("post_type", e.target.value)}>
                        {(enums.post_type || ["Reel", "Post", "Story"]).map((x: string) => (
                            <option key={x} value={x}>{x}</option>
                        ))}
                    </select>

                    <div className="grid" style={{ marginTop: 10 }}>
                        <div>
                            <label>Total Budget (USD)</label>
                            <input
                                type="text"
                                value={formatNum(form.ad_spend_usd)}
                                onChange={(e) => update("ad_spend_usd", parseInt(e.target.value, 10) || 0)}
                            />
                        </div>
                        <div>
                            <label>Duration (Days)</label>
                            <input
                                type="text"
                                value={formatNum(form.ad_duration_days)}
                                onChange={(e) => update("ad_duration_days", parseInt(e.target.value, 10) || 0)}
                            />
                        </div>
                    </div>

                    <label style={{ marginTop: 10, display: 'block' }}>Daily Budget (USD)</label>
                    <input
                        type="text"
                        value={formatNum(form.daily_budget_usd)}
                        onChange={(e) => update("daily_budget_usd", parseInt(e.target.value, 10) || 0)}
                    />

                    <label style={{ marginTop: 10, display: 'block' }}>Target Audience</label>
                    <div className="grid">
                        <select value={form.most_engaged_gender} onChange={(e) => update("most_engaged_gender", e.target.value)}>
                            {(enums.most_engaged_gender || ["Female", "Male", "All"]).map((x: string) => (
                                <option key={x} value={x}>{x}</option>
                            ))}
                        </select>
                        <select value={form.most_engaged_age_group} onChange={(e) => update("most_engaged_age_group", e.target.value)}>
                            {(enums.most_engaged_age_group || ["18-24", "25-34", "35-44", "45-54"]).map((x: string) => (
                                <option key={x} value={x}>{x}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid" style={{ marginTop: 10 }}>
                        <div>
                            <label>Market Region</label>
                            <select value={form.region} onChange={(e) => update("region", e.target.value)}>
                                {(enums.region || ["Sri Lanka", "Australia", "India", "Other"]).map((x: string) => (
                                    <option key={x} value={x}>{x}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Primary Device</label>
                            <select value={form.device_type} onChange={(e) => update("device_type", e.target.value)}>
                                {(enums.device_type || ["Mobile", "Desktop"]).map((x: string) => (
                                    <option key={x} value={x}>{x}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: 24, padding: 20, background: 'rgba(59, 130, 246, 0.05)', borderRadius: 16, border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                        <h4 style={{ margin: '0 0 16px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#60a5fa' }}>Historical Engagement Metrics</h4>
                        <div className="grid">
                            <div>
                                <label>Likes Count <span style={{ color: 'var(--bad)' }}>*</span></label>
                                <input
                                    type="text"
                                    value={form.likes === "" ? "" : formatNum(form.likes)}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, '');
                                        update("likes", val === "" ? "" : (parseInt(val, 10) || 0));
                                    }}
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label>Comments</label>
                                <input
                                    type="text"
                                    value={form.comments === "" ? "" : formatNum(form.comments)}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, '');
                                        update("comments", val === "" ? "" : (parseInt(val, 10) || 0));
                                    }}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="grid" style={{ marginTop: 10 }}>
                            <div>
                                <label>Shares Count</label>
                                <input
                                    type="text"
                                    value={form.shares === "" ? "" : formatNum(form.shares)}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, '');
                                        update("shares", val === "" ? "" : (parseInt(val, 10) || 0));
                                    }}
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label>Saves Count</label>
                                <input
                                    type="text"
                                    value={form.saves === "" ? "" : formatNum(form.saves)}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/,/g, '');
                                        update("saves", val === "" ? "" : (parseInt(val, 10) || 0));
                                    }}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {err && <p className="err" style={{ marginTop: 16 }}>{err}</p>}
                    <div style={{ marginTop: 24 }}>
                        <LoadingButton loading={loading} onClick={submit}>Submit Campaign</LoadingButton>
                    </div>
                </Card>

                {/* Right: Visual Context */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 20 }}>
                    <div style={{
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 24,
                        border: '1px solid var(--border)',
                        background: 'rgba(0,0,0,0.2)'
                    }}>
                        <Image
                            src="/hero.png"
                            alt="Visual Context"
                            width={600}
                            height={400}
                            style={{
                                width: '100%',
                                height: 'auto',
                                opacity: 0.8,
                                display: 'block',
                                transform: 'scale(1.05)',
                                filter: 'blur(0px)'
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: 0, left: 0, right: 0,
                            padding: 30,
                            background: 'linear-gradient(transparent, rgba(11, 18, 32, 0.95))'
                        }}>
                            <h3 style={{ margin: 0, fontSize: 18, color: '#fff' }}>Strategic Optimization</h3>
                            <p className="muted" style={{ margin: '8px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                                The underlying Random Forest model analyzes these parameters against 3,000+ historical data points
                                to synthesize your performance trajectory.
                            </p>
                        </div>
                    </div>

                    <div style={{
                        padding: 24,
                        borderRadius: 24,
                        background: 'rgba(59, 130, 246, 0.03)',
                        border: '1px dashed var(--border)'
                    }}>
                        <h4 style={{ margin: 0, fontSize: 14, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Systems</h4>
                        <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <li style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 6, height: 6, background: 'var(--good)', borderRadius: '50%' }} /> Audience Segmentation
                            </li>
                            <li style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 6, height: 6, background: 'var(--good)', borderRadius: '50%' }} /> Strategy Plan
                            </li>
                            <li style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 6, height: 6, background: 'var(--good)', borderRadius: '50%' }} /> Engagement Prediction
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
