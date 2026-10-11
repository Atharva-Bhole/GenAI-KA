import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  HelpCircle,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock
} from 'lucide-react';
import { KnowledgeGapRecord, AnalyticsStats } from '../../types';
import { fetchKnowledgeGaps, resolveGap, fetchAnalytics } from '../../services/api';

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
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-teal-400" />
            <span>Knowledge Governance & Conflict Intelligence Center</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Monitor policy discrepancies, institutional knowledge gaps, and live telemetry
          </p>
        </div>
        <button
          onClick={loadData}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Real-time Analytics Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Total Queries</span>
              <div className="text-xl font-bold text-white mt-1 font-mono">{stats.total_queries}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Avg Latency</span>
              <div className="text-xl font-bold text-teal-400 mt-1 font-mono">{stats.avg_latency_ms} ms</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Avg Confidence</span>
              <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{Math.round(stats.avg_confidence * 100)}%</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Conflicts Caught</span>
              <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{stats.conflicts_detected}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Gaps Flagged</span>
              <div className="text-xl font-bold text-rose-400 mt-1 font-mono">{stats.gaps_detected}</div>
            </div>
          </div>
        )}

        {/* Conflict Intelligence Case Studies */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Active Enterprise Discrepancy & Conflict Cases</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Conflict Case 1 */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-400">Annual Leave Entitlement (21 vs 24 Days)</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                  RESOLVED TO LATEST
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Discrepancy identified between general Employee Handbook 2024 and Employee Leave Policy 2026.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
                <div className="text-slate-400">
                  • <strong>Employee Handbook (2024, v1.0)</strong>: 21 days
                </div>
                <div className="text-teal-300 font-medium">
                  • <strong>Employee Leave Policy (2026, v4.1)</strong>: 24 days (Authoritative Official Policy)
                </div>
              </div>
              <div className="text-[11px] text-slate-400">
                Governance Rule: <span className="text-slate-200">Newer policy classified with authority weight 1.0 supersedes general handbook.</span>
              </div>
            </div>

            {/* Conflict Case 2 */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-400">Password Length & Expiration Rules</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                  RESOLVED TO IAM STANDARD
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                Legacy Handbook specifies 12 characters and 90-day expiration; Cybersecurity Standard mandates 14 characters, MFA, and disables expiration.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
                <div className="text-slate-400">
                  • <strong>Employee Handbook (2024)</strong>: 12 chars, 90-day rotation
                </div>
                <div className="text-teal-300 font-medium">
                  • <strong>Cybersecurity IAM Standard (2026)</strong>: 14 chars, mandatory MFA, rotation deprecated
                </div>
              </div>
              <div className="text-[11px] text-slate-400">
                Governance Rule: <span className="text-slate-200">Security Standard governs enterprise authentication over general employee handbook.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Gap Registry */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-rose-400" />
              <span>Institutional Knowledge Gap Registry ({gaps.length})</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Surfaced when user inquiries encounter zero authoritative policy coverage
            </span>
          </div>

          {gaps.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
              No unresolved knowledge gaps currently logged.
            </div>
          ) : (
            <div className="space-y-2.5">
              {gaps.map((gap) => (
                <div
                  key={gap.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">"{gap.query}"</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        gap.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {gap.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>Owner: <strong className="text-slate-300">{gap.owner_contact}</strong></span>
                      <span>Department: <strong className="text-slate-300">{gap.department}</strong></span>
                      <span>Detected: {gap.detected_at.slice(0, 10)}</span>
                    </div>
                  </div>

                  {gap.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolveGap(gap.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-medium shrink-0 transition-colors"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
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
