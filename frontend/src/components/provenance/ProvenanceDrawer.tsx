import React from 'react';
import {
  Calendar,
  CheckCircle,
  FileText,
  HelpCircle,
  Quote,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import { Citation } from '../../types';

interface ProvenanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  citations: Citation[];
  selectedCitationIndex: number | null;
  onSelectCitation: (index: number) => void;
}

export const ProvenanceDrawer: React.FC<ProvenanceDrawerProps> = ({
  isOpen,
  onClose,
  citations,
  selectedCitationIndex,
  onSelectCitation,
}) => {
  if (!isOpen) return null;

  return (
    <aside className="w-96 sm:w-[420px] bg-dark-900/95 border-l border-white/[0.08] backdrop-blur-2xl flex flex-col h-screen select-none z-30 shadow-2xl shadow-black/80">
      <div className="p-4 sm:p-5 border-b border-white/[0.07] bg-dark-950/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shadow-sm">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Answer Provenance & Evidence</span>
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400" />
              <span>{citations.length} verified citation{citations.length !== 1 ? 's' : ''} with score decomposition</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-dark-800 text-slate-400 hover:text-white border border-transparent hover:border-white/[0.05] transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {citations.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            <HelpCircle className="h-10 w-10 mx-auto text-slate-400 mb-3" />
            <p className="font-medium text-slate-300">No citations active</p>
            <p className="text-[11px] text-slate-400 mt-1">Submit a question to see real-time multi-dimensional scoring.</p>
          </div>
        ) : (
          citations.map((c, idx) => {
            const isSelected = selectedCitationIndex === idx;
            const scorePercent = Math.round(c.composite_score * 100);

            return (
              <div
                key={idx}
                onClick={() => onSelectCitation(idx)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-dark-850 border-brand-500/60 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/20'
                    : 'bg-dark-950/70 border-white/[0.06] hover:border-white/[0.12] hover:bg-dark-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-5 w-5 rounded-md bg-brand-500/20 text-brand-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 border border-brand-500/30">
                      #{idx + 1}
                    </span>
                    <h3 className="text-xs font-bold text-slate-100 truncate">
                      {c.document_title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30 font-mono text-[11px] font-bold text-brand-300">
                    <Sparkles className="h-2.5 w-2.5 text-brand-400" />
                    <span>{scorePercent}%</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-300 mb-3">
                  <span className="px-2 py-0.5 rounded-md bg-dark-800 border border-white/[0.05] text-slate-300 font-mono">
                    Page {c.page_number}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-dark-800 border border-white/[0.05] text-slate-300">
                    {c.section_title}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-300 capitalize font-medium flex items-center gap-1">
                    <Shield className="h-2.5 w-2.5" />
                    {c.authority.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-dark-800 border border-white/[0.05] text-slate-400 flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    v{c.version} ({c.effective_date})
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-dark-950 border border-white/[0.05] relative mb-3.5 group">
                  <Quote className="h-3 w-3 text-brand-400 absolute top-2.5 left-2.5 opacity-40" />
                  <p className="text-[11px] text-slate-200 leading-relaxed pl-4 font-sans italic">
                    "{c.exact_text}"
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-dark-900/90 border border-white/[0.06] space-y-2 text-[10px]">
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400 font-mono">
                      <span>Dense Semantic (40%)</span>
                      <span className="text-slate-200 font-semibold">{c.semantic_score}</span>
                    </div>
                    <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.round(c.semantic_score * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400 font-mono">
                      <span>Sparse Okapi BM25 (25%)</span>
                      <span className="text-slate-200 font-semibold">{c.bm25_score}</span>
                    </div>
                    <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.round(c.bm25_score * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400 font-mono">
                      <span>Policy Authority (20%)</span>
                      <span className="text-slate-200 font-semibold">{c.authority_score}</span>
                    </div>
                    <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.round(c.authority_score * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400 font-mono">
                      <span>Freshness Decay (15%)</span>
                      <span className="text-slate-200 font-semibold">{c.freshness_score}</span>
                    </div>
                    <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.round(c.freshness_score * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] flex justify-between font-bold text-brand-300 font-mono text-[11px]">
                    <span>Composite Final Rank</span>
                    <span className="text-brand-400">{c.composite_score}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-white/[0.07] bg-dark-950/80 text-[10px] text-slate-400 leading-normal">
        <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-brand-400" />
          <span>Multi-Dimensional Scoring Function</span>
        </div>
        <div className="font-mono text-[9px] text-slate-400 bg-dark-900 p-2 rounded-lg border border-white/[0.04]">
          Composite Score = 0.40·Dense + 0.25·BM25 + 0.20·Authority + 0.15·Freshness
        </div>
      </div>
    </aside>
  );
};
