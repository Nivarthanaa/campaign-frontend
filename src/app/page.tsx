"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.body.classList.add('home-active');
    return () => document.body.classList.remove('home-active');
  }, []);

  return (
    <>
      <div className="hero-glow" />
      <div className="hero-glow-2" />
      <div className="grid-horizon" />

      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        zIndex: 10
      }}>
        <div style={{ maxWidth: 900, textAlign: 'center', padding: '0 20px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 20px',
            borderRadius: 100,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#94a3b8',
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            marginBottom: 40,
            animation: 'fadeIn 1s ease-out'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} />
            Autonomous Intelligence • v3.0
          </div>

          <h2 style={{ animation: 'fadeIn 1.2s ease-out' }}>
            Building Better<br />
            <span style={{ color: '#fff', textShadow: '0 0 30px rgba(255,255,255,0.3)' }}>Campaign Decisions.</span>
          </h2>

          <p className="muted" style={{ animation: 'fadeIn 1.4s ease-out', marginBottom: 50 }}>
            Analyze campaign performance, discover your most responsive audiences, and spend smarter
            with a clear strategy plan for confident campaign decisions.
          </p>

          <div style={{ animation: 'fadeIn 1.6s ease-out' }}>
            <Link href="/campaign" className="btn">
              Optimize Strategy →
            </Link>
            <div style={{ marginTop: 24, display: 'flex', gap: 24, justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--good)' }} /> Prediction Ready
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--good)' }} /> Segmentation Live
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
