import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  Layers,
  Scale,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ActionRequest, QueryResponse } from '../../types';

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    responseDetails?: QueryResponse;
  };
  onSelectCitation: (index: number) => void;
  onOpenActionModal: (action: ActionRequest) => void;
  onOpenGapModal?: (gap: any) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onSelectCitation,
  onOpenActionModal,
}) => {
  const isUser = message.role === 'user';
  const details = message.responseDetails;

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-2xl bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-lg shadow-teal-900/30 border border-teal-400/30 text-sm leading-relaxed font-medium">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 mb-8 group">
      <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-400 via-teal-500 to-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20 text-slate-950 font-bold text-xs ring-2 ring-white/10">
        <Sparkles className="h-4 w-4 text-slate-950" />
      </div>

      <div className="flex-1 max-w-4xl space-y-3.5">
        {details && (
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <div className="px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 font-mono font-semibold flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
              <span>Confidence: {Math.round(details.confidence_score * 100)}%</span>
            </div>

            <div className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-medium flex items-center gap-1">
              <span>Engine:</span>
              <span className="text-white font-semibold capitalize">{details.strategy_used.replace('_', ' ')}</span>
            </div>

            <div className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 font-mono flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" />
              <span>{details.retrieval_latency_ms}ms search ({details.total_latency_ms}ms total)</span>
            </div>

            <div className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 flex items-center gap-1">
              <Layers className="h-3 w-3 text-slate-400" />
              <span>Space: {details.active_space}</span>
            </div>
          </div>
        )}

        {details?.conflict_report && details.conflict_report.has_conflict && (
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-dark-900 to-amber-950/20 p-5 shadow-lg shadow-amber-950/20 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs tracking-tight">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Policy Conflict & Governance Resolution</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">
                CONFLICT DETECTED
              </span>
            </div>

            <p className="text-slate-200 text-xs leading-relaxed">
              {details.conflict_report.discrepancy_details}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1">
                  <span>Superseded / Legacy</span>
                </div>
                <div className="text-slate-200 font-semibold text-xs">
                  {details.conflict_report.source_b} (v{details.conflict_report.version_b})
                </div>
                <div className="text-slate-400 text-[11px] leading-relaxed pt-1">
                  "{details.conflict_report.claim_b}"
                </div>
              </div>

              <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/30 space-y-1">
                <div className="text-[10px] uppercase font-bold text-teal-400 font-mono flex items-center gap-1">
                  <span>Authoritative Active Policy</span>
                </div>
                <div className="text-white font-semibold text-xs">
                  {details.conflict_report.source_a} (v{details.conflict_report.version_a})
                </div>
                <div className="text-teal-200 text-[11px] leading-relaxed pt-1">
                  "{details.conflict_report.claim_a}"
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-100 text-xs flex items-center gap-2.5">
              <Scale className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-300">Governed Resolution:</span>{' '}
                <span>{details.conflict_report.recommended_answer}</span>
              </div>
            </div>
          </div>
        )}

        {details?.plan_steps && details.plan_steps.length > 0 && (
          <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 via-dark-900 to-indigo-950/15 p-4 text-xs space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-indigo-300 font-semibold">
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-400" />
                <span>Multi-Document Query Decomposition & Reasoning Plan</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                {details.plan_steps.length} STEPS COMPLETED
              </span>
            </div>

            <div className="space-y-2">
              {details.plan_steps.map((st) => (
                <div key={st.step_id} className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-200">
                    <span className="flex items-center gap-2 text-indigo-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Step {st.step_id}: {st.title}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px] px-2 py-0.5 rounded bg-white/5">
                      {st.targeted_sources.join(', ')}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-1 pl-5.5 leading-relaxed">
                    {st.findings}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {details?.proposed_action && (
          <div className="rounded-2xl border border-teal-500/40 bg-gradient-to-br from-teal-950/40 via-dark-900 to-teal-950/20 p-5 text-xs shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
                <Zap className="h-4 w-4 text-teal-400" />
                <span>Actionable Workflow Ready</span>
              </div>
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold">
                HUMAN-IN-THE-LOOP APPROVAL
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              The assistant identified an automated workflow request: <strong>{details.proposed_action.title}</strong>
            </p>
            <button
              onClick={() => onOpenActionModal(details.proposed_action!)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs hover:from-teal-400 hover:to-emerald-400 transition-all shadow-glow-teal"
            >
              <span>Review & Execute Workflow</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {details?.knowledge_gap && (
          <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-br from-rose-950/30 via-dark-900 to-rose-950/15 p-4 text-xs space-y-2 shadow-lg">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <HelpCircle className="h-4 w-4 text-rose-400" />
              <span>Institutional Knowledge Gap Detected</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              No authoritative organizational policy covers this query. This has been logged into the Knowledge Governance Registry for department review.
            </p>
            <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 font-medium">
              <span>Assigned Reviewer: <strong className="text-slate-200">{details.knowledge_gap.owner_contact}</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">Registered in Governance Registry</span>
            </div>
          </div>
        )}

        <div className="bg-dark-850 border border-white/10 rounded-2xl rounded-tl-sm p-5 text-sm text-slate-100 leading-relaxed space-y-2 whitespace-pre-line shadow-lg font-sans">
          {message.content}
        </div>

        {details?.citations && details.citations.length > 0 && (
          <div className="pt-1 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span>Verified Evidence Sources ({details.citations.length}):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {details.citations.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectCitation(idx)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-850 hover:bg-white/10 border border-white/10 hover:border-teal-500/40 text-xs text-slate-300 hover:text-white transition-all group shadow-sm"
                >
                  <span className="font-mono font-bold text-teal-400">[{idx + 1}]</span>
                  <span className="font-semibold">{c.document_title}</span>
                  <span className="text-slate-400 font-mono text-[10px]">P.{c.page_number}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-bold">
                    {Math.round(c.composite_score * 100)}%
                  </span>
                  <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-teal-400 ml-0.5" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
