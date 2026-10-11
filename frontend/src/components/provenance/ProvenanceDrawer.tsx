import React from 'react';
import {
  Calendar,
  CheckCircle,
  FileText,
  HelpCircle,
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
    <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-screen select-none z-20">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-teal-400" />
            <span>Answer Provenance & Evidence</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {citations.length} verified citation{citations.length !== 1 ? 's' : ''} with score decomposition
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {citations.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <HelpCircle className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            No citations available for this turn.
          </div>
        ) : (
          citations.map((c, idx) => {
            const isSelected = selectedCitationIndex === idx;

            return (
              <div
                key={idx}
                onClick={() => onSelectCitation(idx)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-850 border-teal-500 shadow-md shadow-teal-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded bg-teal-500/20 text-teal-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <h3 className="text-xs font-semibold text-slate-200 leading-tight">
                      {c.document_title}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 shrink-0">
                    {Math.round(c.composite_score * 100)}%
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400 mb-2.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    Page {c.page_number}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {c.section_title}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 capitalize font-medium">
                    {c.authority.replace('_', ' ')}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 flex items-center gap-0.5">
                    <Calendar className="h-2.5 w-2.5" />
                    {c.effective_date} (v{c.version})
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed font-sans mb-3">
                  <span className="bg-teal-500/20 text-teal-200 px-0.5 rounded">
                    "{c.exact_text}"
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5 text-[10px]">
                  <div className="flex justify-between text-slate-400 font-mono">
                    <span>Dense Semantic (40%)</span>
                    <span className="text-slate-300">{c.semantic_score}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-mono">
                    <span>Sparse BM25 (25%)</span>
                    <span className="text-slate-300">{c.bm25_score}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-mono">
                    <span>Policy Authority (20%)</span>
                    <span className="text-slate-300">{c.authority_score}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-mono">
                    <span>Freshness Decay (15%)</span>
                    <span className="text-slate-300">{c.freshness_score}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-800 flex justify-between font-bold text-teal-400 font-mono">
                    <span>Composite Final Rank</span>
                    <span>{c.composite_score}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[10px] text-slate-400 leading-normal">
        <div className="font-semibold text-slate-300 mb-0.5 flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-teal-400" />
          <span>Adaptive Ranking Formula</span>
        </div>
        Score = 0.40·Semantic + 0.25·BM25 + 0.20·Authority + 0.15·Freshness
      </div>
    </aside>
  );
};
