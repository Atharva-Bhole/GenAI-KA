import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  RefreshCw,
  Scale,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { fetchAnalytics, fetchKnowledgeGaps, resolveGap } from '../../services/api';
import { AnalyticsStats, KnowledgeGapRecord } from '../../types';

export const GovernanceDashboard: React.FC = () => {
  const [gaps, setGaps] = useState<KnowledgeGapRecord[]>([]);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gapsData, statsData] = await Promise.all([
        fetchKnowledgeGaps(),
        fetchAnalytics(),
      ]);
      setGaps(gapsData);
      setStats(statsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolveGap = async (gapId: string) => {
    try {
      await resolveGap(gapId);
      loadData();
    } catch (e) {
      alert('Failed to resolve gap');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-950 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-white/[0.07] bg-dark-900/60 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldAlert className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Knowledge Governance & Telemetry</h2>
              <span className="px-2 py-0.5 rounded-full bg-dark-800 border border-white/[0.05] text-[10px] font-mono text-amber-300">
                Active Governance Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Automated conflict arbitration, institutional knowledge gap tracking, and telemetry monitoring
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-300 border border-white/[0.05] hover:border-white/[0.1] transition-all"
          title="Refresh Governance Data"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-2xl bg-dark-900/80 border border-white/[0.06] shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Queries</span>
                <Activity className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div className="text-2xl font-extrabold text-white mt-1.5 font-mono">{stats.total_queries}</div>
              <span className="text-[10px] text-slate-500 font-mono">Real-time enterprise load</span>
            </div>

            <div className="p-4 rounded-2xl bg-dark-900/80 border border-white/[0.06] shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Avg Latency</span>
                <Clock className="h-3.5 w-3.5 text-brand-400" />
              </div>
              <div className="text-2xl font-extrabold text-brand-400 mt-1.5 font-mono">{stats.avg_latency_ms} <span className="text-xs font-sans text-slate-400">ms</span></div>
              <span className="text-[10px] text-brand-400/80 font-mono">P95 ~340ms across hybrid</span>
            </div>

            <div className="p-4 rounded-2xl bg-dark-900/80 border border-white/[0.06] shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Avg Confidence</span>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1.5 font-mono">{Math.round(stats.avg_confidence * 100)}%</div>
              <span className="text-[10px] text-emerald-400/80 font-mono">Composite evidence rank</span>
            </div>

            <div className="p-4 rounded-2xl bg-dark-900/80 border border-amber-500/20 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Conflicts Caught</span>
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-amber-400 mt-1.5 font-mono">{stats.conflicts_detected}</div>
              <span className="text-[10px] text-amber-400/80 font-mono">Discrepancies reconciled</span>
            </div>

            <div className="p-4 rounded-2xl bg-dark-900/80 border border-rose-500/20 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Institutional Gaps</span>
                <HelpCircle className="h-3.5 w-3.5 text-rose-400" />
              </div>
              <div className="text-2xl font-extrabold text-rose-400 mt-1.5 font-mono">{stats.gaps_detected}</div>
              <span className="text-[10px] text-rose-400/80 font-mono">Uncovered policy areas</span>
            </div>
          </div>
        )}

        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
              <Scale className="h-4 w-4 text-amber-400" />
              <span>Active Discrepancy & Conflict Arbitration Records</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Automatically resolved via authority weighting and temporal freshness
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-dark-900/80 border border-amber-500/30 text-xs space-y-3 shadow-lg shadow-amber-500/5">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-amber-300 text-sm">Annual Leave Entitlement (21 vs 24 Days)</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold shrink-0">
                  ARBITRATED
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Direct contradiction between legacy general handbook and updated departmental policy.
              </p>
              <div className="p-3.5 rounded-xl bg-dark-950/80 border border-white/[0.05] space-y-2 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Employee Handbook (2024, v1.0)</span>
                  <span className="font-mono text-slate-500 line-through">21 days</span>
                </div>
                <div className="flex items-center justify-between text-brand-300 font-semibold border-t border-white/[0.04] pt-2">
                  <span>Employee Leave Policy (2026, v4.1)</span>
                  <span className="font-mono text-brand-400 font-bold">24 days</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                <Sparkles className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                <span>Governance Decision: <strong className="text-slate-200">Leave Policy 2026 (Authority 1.0) takes precedence.</strong></span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-dark-900/80 border border-amber-500/30 text-xs space-y-3 shadow-lg shadow-amber-500/5">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-amber-300 text-sm">Authentication Password & Expiration Protocol</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold shrink-0">
                  ARBITRATED
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Legacy handbook prescribes obsolete periodic rotation; cybersecurity standard mandates passphrases with MFA.
              </p>
              <div className="p-3.5 rounded-xl bg-dark-950/80 border border-white/[0.05] space-y-2 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Employee Handbook (2024, v1.0)</span>
                  <span className="font-mono text-slate-500 line-through">12 chars, 90-day rotation</span>
                </div>
                <div className="flex items-center justify-between text-brand-300 font-semibold border-t border-white/[0.04] pt-2">
                  <span>Cybersecurity IAM Standard (2026, v3.0)</span>
                  <span className="font-mono text-brand-400 font-bold">14 chars, MFA required</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                <Sparkles className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                <span>Governance Decision: <strong className="text-slate-200">Security Standard takes precedence over general handbook.</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3.5 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
              <HelpCircle className="h-4 w-4 text-rose-400" />
              <span>Institutional Knowledge Gap Registry</span>
              <span className="px-2 py-0.5 rounded-full bg-dark-800 text-[10px] font-mono text-rose-300">
                {gaps.length} logged
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Captured when high-entropy user inquiries encounter missing policy coverage
            </span>
          </div>

          {gaps.length === 0 ? (
            <div className="p-8 rounded-2xl bg-dark-900/60 border border-dashed border-white/[0.07] text-center text-slate-400 text-xs">
              No pending institutional knowledge gaps registered.
            </div>
          ) : (
            <div className="space-y-3">
              {gaps.map((gap) => (
                <div
                  key={gap.id}
                  className="p-4.5 rounded-2xl bg-dark-900/80 border border-white/[0.06] hover:border-white/[0.1] transition-all flex flex-wrap items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-slate-100">"{gap.query}"</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider ${
                          gap.status === 'resolved'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {gap.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-4 flex-wrap">
                      <span>Owner: <strong className="text-slate-300">{gap.owner_contact}</strong></span>
                      <span>Department: <strong className="text-slate-300">{gap.department}</strong></span>
                      <span className="text-slate-500">Detected: {gap.detected_at.slice(0, 10)}</span>
                    </div>
                  </div>

                  {gap.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolveGap(gap.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-semibold shrink-0 transition-all active:scale-95"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Mark Policy Published</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
