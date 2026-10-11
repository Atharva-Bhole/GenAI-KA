import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Bot,
  Compass,
  FileCheck2,
  FolderGit2,
  Send,
  Sparkles,
  Terminal,
  Workflow,
} from 'lucide-react';
import { ActionRequest, QueryResponse } from '../../types';
import { MessageBubble } from './MessageBubble';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  responseDetails?: QueryResponse;
}

interface ChatCanvasProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onSelectCitation: (index: number) => void;
  onOpenActionModal: (action: ActionRequest) => void;
  researchMode: boolean;
  activeSpaceName: string;
}

export const ChatCanvas: React.FC<ChatCanvasProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onSelectCitation,
  onOpenActionModal,
  researchMode,
  activeSpaceName,
}) => {
  const [inputText, setInputText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const starterCards = [
    {
      badge: 'CONFLICT RESOLUTION',
      badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
      title: 'Leave Policy Harmonization',
      desc: 'Cross-checks Employee Handbook 2024 against Leave Policy 2026 to resolve the 21 vs 24 day entitlement discrepancy.',
      query: 'What is our annual leave policy entitlement, and has anything changed since last year?',
      icon: <FileCheck2 className="h-4 w-4 text-amber-400" />,
    },
    {
      badge: 'MULTI-POLICY REASONING',
      badgeColor: 'border-indigo-500/30 text-indigo-300 bg-indigo-500/10',
      title: 'Tri-Policy Eligibility Synthesis',
      desc: 'Simultaneously traverses Travel Policy, Expense Guidelines, and Leave Rules to determine eligibility for personal extensions.',
      query: 'Can someone take annual leave immediately after an overseas business trip and still claim the return flight?',
      icon: <Compass className="h-4 w-4 text-indigo-400" />,
    },
    {
      badge: 'JURISDICTION & MOBILITY',
      badgeColor: 'border-teal-500/30 text-teal-300 bg-teal-500/10',
      title: 'Cross-State Remote Work Rules',
      desc: 'Evaluates state-specific labor tax compliance and Engineering Guidelines for permanent out-of-state residency.',
      query: 'Compare our remote work policy with the employee handbook and tell me whether software engineers based outside Maharashtra can work permanently remotely.',
      icon: <Bot className="h-4 w-4 text-teal-400" />,
    },
    {
      badge: 'AGENTIC WORKFLOW',
      badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
      title: 'Human-in-the-Loop Action Dispatch',
      desc: 'Extracts vacation parameters, checks balance availability, and presents an interactive API confirmation modal.',
      query: 'Apply for leave this Friday',
      icon: <Workflow className="h-4 w-4 text-emerald-400" />,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-950 bg-radial-mesh overflow-hidden relative">
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto py-10 sm:py-16 text-center select-none">
            <div className="relative inline-block mb-6">
              <div className="h-16 w-16 sm:h-20 sm:w-20 mx-auto rounded-3xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center shadow-xl shadow-brand-500/25 ring-1 ring-white/20">
                <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-dark-950" />
              </div>
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-dark-900 border border-brand-500/40 text-[10px] font-mono text-brand-300 shadow-md">
                v2.4
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs font-medium mb-4">
              <Terminal className="h-3 w-3" />
              <span>Layer-5 Organizational Knowledge Intelligence</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Evidence-Grounded Enterprise Intelligence
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto mt-3 leading-relaxed">
              Query unified organizational handbooks, travel governance, cybersecurity standards, and SOPs with authoritative score weighting, provenance tracing, and conflict detection.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-3xl mx-auto mt-10 text-left">
              {starterCards.map((card, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(card.query)}
                  className="p-4.5 rounded-2xl bg-dark-900/60 hover:bg-dark-850/80 border border-white/[0.07] hover:border-brand-500/40 transition-all duration-200 group flex flex-col justify-between text-left shadow-lg shadow-black/20 hover:shadow-brand-500/5 hover:-translate-y-0.5"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className={`text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md border ${card.badgeColor}`}>
                        {card.badge}
                      </span>
                      <div className="p-1.5 rounded-lg bg-dark-800/80 border border-white/[0.05] group-hover:scale-110 transition-transform">
                        {card.icon}
                      </div>
                    </div>
                    <h3 className="text-xs font-semibold text-slate-100 group-hover:text-brand-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1.5">
                      {card.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px]">
                    <span className="text-brand-400 font-medium group-hover:text-brand-300 flex items-center gap-1">
                      Execute Query
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">1-Click</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto pb-6">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                onSelectCitation={onSelectCitation}
                onOpenActionModal={onOpenActionModal}
                onSelectPrompt={onSendMessage}
              />
            ))}

            {isLoading && (
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-dark-900/90 border border-brand-500/30 text-slate-200 text-xs shadow-xl shadow-brand-500/10 max-w-xl animate-pulse">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20">
                  <Sparkles className="h-4 w-4 text-white animate-spin" />
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>{researchMode ? 'Synthesizing Multi-Policy Research Plan...' : 'Traversing Enterprise Knowledge Graph...'}</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400 animate-ping" />
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Dense Vector Match • Okapi BM25 • Authority Hierarchy • Conflict Harmonization
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 border-t border-white/[0.07] bg-dark-950/80 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl bg-dark-900/90 border border-white/[0.09] focus-within:border-brand-500/70 focus-within:ring-2 focus-within:ring-brand-500/20 shadow-2xl shadow-black/60 transition-all duration-200">
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={`Ask anything across ${activeSpaceName}... (e.g. Compare policy versions, query travel expense guidelines, or apply for leave)`}
              className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-xs sm:text-[13px] p-4 pr-24 outline-none resize-none leading-relaxed"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="h-8 px-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 disabled:opacity-30 disabled:pointer-events-none text-dark-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-brand-500/20 transition-all duration-150 active:scale-95"
              >
                <span>Ask</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2.5 px-2 text-[11px] text-slate-400 select-none">
            <span className="flex items-center gap-1.5">
              <FolderGit2 className="h-3 w-3 text-slate-400" />
              <span>Scoped to:</span>
              <strong className="text-slate-300 font-medium">{activeSpaceName}</strong>
            </span>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-slate-400">Shift + Enter for new line</span>
              <span className="px-1.5 py-0.5 rounded bg-dark-850 border border-white/[0.05] text-[10px] text-slate-400 font-mono">
                Grounded Citations
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
