import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
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
        <div className="max-w-2xl bg-teal-600/90 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md border border-teal-500/30 text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-8">
      <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20 text-slate-950 font-bold text-xs">
        <Sparkles className="h-4 w-4 text-slate-950" />
      </div>

      <div className="flex-1 max-w-4xl space-y-3">
        {details && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-teal-400 font-mono font-medium flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Confidence: {Math.round(details.confidence_score * 100)}%
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300">
              Engine: <span className="text-white font-medium capitalize">{details.strategy_used.replace('_', ' ')}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-400 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {details.retrieval_latency_ms}ms retrieval ({details.total_latency_ms}ms total)
            </span>
          </div>
        )}

        {details?.conflict_report && details.conflict_report.has_conflict && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 shadow-sm text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Policy Conflict & Governance Resolution</span>
            </div>
            <p className="text-slate-300 mb-3 text-[12px] leading-relaxed">
              {details.conflict_report.discrepancy_details}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] mb-3">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 font-medium">Superseded / Legacy:</span>
                <div className="text-slate-200 font-semibold mt-0.5">
                  {details.conflict_report.source_b} (v{details.conflict_report.version_b})
                </div>
                <div className="text-slate-400 mt-1">{details.conflict_report.claim_b}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-teal-500/30">
                <span className="text-teal-400 font-medium">Latest Active Policy:</span>
                <div className="text-white font-semibold mt-0.5">
                  {details.conflict_report.source_a} (v{details.conflict_report.version_a})
                </div>
                <div className="text-slate-300 mt-1">{details.conflict_report.claim_a}</div>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200">
              <span className="font-semibold text-amber-400">Authoritative Governed Ruling:</span>{' '}
              {details.conflict_report.recommended_answer}
            </div>
          </div>
        )}

        {details?.plan_steps && details.plan_steps.length > 0 && (
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/15 p-3.5 text-xs space-y-2">
            <div className="flex items-center justify-between text-indigo-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-indigo-400" />
                Multi-Document Research Plan Execution
              </span>
              <span className="text-[10px] text-indigo-400 uppercase font-mono">
                {details.plan_steps.length} Steps Completed
              </span>
            </div>
            <div className="space-y-1.5 pt-1">
              {details.plan_steps.map((st) => (
                <div key={st.step_id} className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between font-medium text-slate-200">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      Step {st.step_id}: {st.title}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {st.targeted_sources.join(', ')}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{st.findings}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {details?.proposed_action && (
          <div className="rounded-xl border border-teal-500/40 bg-teal-950/20 p-3.5 text-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-teal-300 font-semibold">
                <Zap className="h-4 w-4 text-teal-400" />
                <span>Actionable Workflow Proposed</span>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                HITL Approval Required
              </span>
            </div>
            <p className="text-slate-300 text-[11px] mb-3">
              The assistant identified an actionable enterprise trigger based on your prompt: <strong>{details.proposed_action.title}</strong>
            </p>
            <button
              onClick={() => onOpenActionModal(details.proposed_action!)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-semibold text-xs hover:bg-teal-400 transition-all shadow-md shadow-teal-500/20"
            >
              <span>Review & Execute Workflow</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {details?.knowledge_gap && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-3.5 text-xs">
            <div className="flex items-center gap-2 text-red-300 font-semibold mb-1">
              <HelpCircle className="h-4 w-4 text-red-400" />
              <span>Institutional Knowledge Gap Detected</span>
            </div>
            <p className="text-slate-300 text-[11px] mb-2">
              No authoritative organizational policy covers this query. This has been logged into the Knowledge Governance Registry for department review.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span>Assigned Reviewer: <strong className="text-slate-300">{details.knowledge_gap.owner_contact}</strong></span>
              <span>•</span>
              <span className="text-emerald-400">Status: Registered in Governance Registry</span>
            </div>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-200 leading-relaxed space-y-2 whitespace-pre-line shadow-sm">
          {message.content}
        </div>

        {details?.citations && details.citations.length > 0 && (
          <div className="pt-1">
            <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <span>Verified Evidence Sources ({details.citations.length}):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {details.citations.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectCitation(idx)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-slate-300 hover:text-teal-300 transition-all group"
                >
                  <span className="font-medium text-teal-400">[{idx + 1}]</span>
                  <span className="font-medium">{c.document_title}</span>
                  <span className="text-slate-400 font-mono">P.{c.page_number}</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-teal-400">
                    ({Math.round(c.composite_score * 100)}%)
                  </span>
                  <ExternalLink className="h-2.5 w-2.5 text-slate-400 group-hover:text-teal-400 ml-0.5" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
