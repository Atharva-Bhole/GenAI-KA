import React from 'react';
import {
  ChevronRight,
  Compass,
  Cpu,
  Layers,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { GeminiConfigStatus, KnowledgeSpace } from '../../types';

interface HeaderProps {
  spaces: KnowledgeSpace[];
  activeSpace: string;
  onSelectSpace: (spaceId: string) => void;
  strategy: string;
  onChangeStrategy: (strategy: string) => void;
  researchMode: boolean;
  onToggleResearchMode: (val: boolean) => void;
  citationsCount: number;
  onToggleDrawer: () => void;
  drawerOpen: boolean;
  geminiStatus: GeminiConfigStatus | null;
  onOpenGeminiModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  spaces,
  activeSpace,
  onSelectSpace,
  strategy,
  onChangeStrategy,
  researchMode,
  onToggleResearchMode,
  citationsCount,
  onToggleDrawer,
  drawerOpen,
  geminiStatus,
  onOpenGeminiModal,
}) => {
  return (
    <header className="h-16 border-b border-white/5 bg-dark-900/70 backdrop-blur-md px-6 flex items-center justify-between select-none relative z-20">
      <div className="flex items-center space-x-3 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-medium">
          <Layers className="h-3.5 w-3.5 text-brand-400" />
          <span>Scope</span>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
        <select
          value={activeSpace}
          onChange={(e) => onSelectSpace(e.target.value)}
          className="bg-dark-850 text-white font-medium px-3 py-1.5 rounded-lg border border-white/10 outline-none text-xs hover:border-brand-500/40 cursor-pointer shadow-inner-light transition-colors"
        >
          {spaces.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.department})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenGeminiModal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all group ${
            geminiStatus?.configured
              ? 'bg-gradient-to-r from-brand-500/15 via-indigo-500/15 to-emerald-500/15 border-brand-500/40 text-brand-300 hover:border-brand-500/60 shadow-sm'
              : 'bg-dark-850 border-white/10 text-slate-300 hover:border-brand-500/40 hover:text-white'
          }`}
          title="Configure Google Gemini text-embedding-004 & LLM synthesis"
        >
          <div className="relative">
            <Sparkles className="h-3.5 w-3.5 text-brand-400 group-hover:scale-110 transition-transform" />
            <span
              className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                geminiStatus?.configured ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
          </div>
          <span>{geminiStatus?.configured ? `${geminiStatus.model}` : 'Connect Gemini'}</span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
              geminiStatus?.configured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-dark-800 text-slate-400'
            }`}
          >
            {geminiStatus?.configured ? 'ACTIVE' : 'LOCAL'}
          </span>
        </button>

        <div className="flex items-center bg-dark-950/80 border border-white/10 rounded-xl p-1 text-xs shadow-inner-light">
          <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1.5 font-medium">
            <Cpu className="h-3.5 w-3.5 text-slate-400" />
            Strategy:
          </span>
          <button
            onClick={() => onChangeStrategy('adaptive')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              strategy === 'adaptive'
                ? 'bg-gradient-to-r from-brand-500 to-emerald-500 text-slate-950 shadow-glow-teal font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Adaptive Intelligence
          </button>
          <button
            onClick={() => onChangeStrategy('hybrid_rag')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              strategy === 'hybrid_rag'
                ? 'bg-white/15 text-white font-semibold shadow-inner-light'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hybrid RAG
          </button>
          <button
            onClick={() => onChangeStrategy('naive_rag')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              strategy === 'naive_rag'
                ? 'bg-white/15 text-white font-semibold shadow-inner-light'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Naive Vector RAG
          </button>
        </div>

        <button
          onClick={() => onToggleResearchMode(!researchMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            researchMode
              ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-glow-indigo'
              : 'bg-dark-850 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
          }`}
        >
          <Compass className={`h-4 w-4 ${researchMode ? 'text-indigo-400 animate-spin-slow' : 'text-slate-400'}`} />
          <span>Research Mode</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${researchMode ? 'bg-indigo-500/30 text-indigo-200 font-bold' : 'bg-white/5 text-slate-400'}`}>
            {researchMode ? 'ON' : 'OFF'}
          </span>
        </button>

        <button
          onClick={onToggleDrawer}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            drawerOpen
              ? 'bg-brand-500/20 border-brand-500/50 text-brand-300 shadow-glow-teal'
              : 'bg-dark-850 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-brand-400" />
          <span>Evidence Sources</span>
          {citationsCount > 0 && (
            <span className="h-4 min-w-4 px-1.5 rounded-full bg-brand-400 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-sm">
              {citationsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
