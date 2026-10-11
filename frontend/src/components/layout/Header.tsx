import React from 'react';
import {
  ChevronRight,
  Compass,
  Cpu,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { KnowledgeSpace } from '../../types';

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
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/60 backdrop-blur px-5 flex items-center justify-between select-none">
      <div className="flex items-center space-x-2 text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-teal-400" />
          Space
        </span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <select
          value={activeSpace}
          onChange={(e) => onSelectSpace(e.target.value)}
          className="bg-slate-800 text-slate-100 font-medium px-2.5 py-1 rounded-md border border-slate-700 outline-none text-xs hover:border-slate-600 cursor-pointer"
        >
          {spaces.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.department})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-0.5 text-xs">
          <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1">
            <Cpu className="h-3 w-3 text-slate-400" />
            Engine:
          </span>
          <button
            onClick={() => onChangeStrategy('adaptive')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              strategy === 'adaptive'
                ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Adaptive Intelligence
          </button>
          <button
            onClick={() => onChangeStrategy('hybrid_rag')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              strategy === 'hybrid_rag'
                ? 'bg-slate-700 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hybrid RAG
          </button>
          <button
            onClick={() => onChangeStrategy('naive_rag')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
              strategy === 'naive_rag'
                ? 'bg-slate-700 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Naive Vector RAG
          </button>
        </div>

        <button
          onClick={() => onToggleResearchMode(!researchMode)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            researchMode
              ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 shadow-sm shadow-indigo-500/10'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className={`h-3.5 w-3.5 ${researchMode ? 'text-indigo-400 animate-spin-slow' : 'text-slate-400'}`} />
          <span>Research Mode</span>
          <span className={`text-[10px] px-1 rounded ${researchMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700 text-slate-400'}`}>
            {researchMode ? 'ON' : 'OFF'}
          </span>
        </button>

        <button
          onClick={onToggleDrawer}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            drawerOpen
              ? 'bg-teal-500/15 border-teal-500/40 text-teal-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Evidence Sources</span>
          {citationsCount > 0 && (
            <span className="h-4 min-w-4 px-1 rounded-full bg-teal-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
              {citationsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
