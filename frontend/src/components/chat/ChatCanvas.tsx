import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  Compass,
  FileCheck2,
  Workflow
} from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { QueryResponse, ActionRequest } from '../../types';

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
  activeSpaceName
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
      title: "Conflict Intelligence",
      desc: "Cross-checks policy versions and resolves discrepancies between legacy handbooks and updated policies.",
      query: "What is our annual leave policy entitlement, and has anything changed since last year?",
      icon: <FileCheck2 className="h-5 w-5 text-amber-400" />
    },
    {
      title: "Multi-Policy Synthesis",
      desc: "Reason across Travel, Expense, and Leave policies simultaneously to determine eligibility.",
      query: "Can someone take annual leave immediately after an overseas business trip and still claim the return flight?",
      icon: <Compass className="h-5 w-5 text-indigo-400" />
    },
    {
      title: "Cross-Jurisdiction Rules",
      desc: "Evaluates Engineering Guidelines and Remote Work policies for geographic mobility.",
      query: "Compare our remote work policy with the employee handbook and tell me whether software engineers based outside Maharashtra can work permanently remotely.",
      icon: <Bot className="h-5 w-5 text-teal-400" />
    },
    {
      title: "Agentic Workflows",
      desc: "Execute business actions directly via transactional APIs with human-in-the-loop validation.",
      query: "Apply for leave this Friday",
      icon: <Workflow className="h-5 w-5 text-emerald-400" />
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/60 overflow-hidden">
      {/* Scrollable Conversation Stream */}
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto py-12 text-center select-none">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-xl shadow-teal-500/20 mb-5">
              <Sparkles className="h-8 w-8 text-slate-950" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Enterprise Knowledge Intelligence Layer
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
              Ask across organizational handbooks, travel guidelines, cybersecurity standards, and SOPs with authoritative citations and conflict detection.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-2xl mx-auto mt-8 text-left">
              {starterCards.map((c, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(c.query)}
                  className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/40 transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    {c.icon}
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-teal-300">
                      {c.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal mb-2">
                    {c.desc}
                  </p>
                  <span className="text-[10px] text-teal-400 font-medium group-hover:underline flex items-center gap-1">
                    Try query →
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                onSelectCitation={onSelectCitation}
                onOpenActionModal={onOpenActionModal}
              />
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs animate-pulse max-w-xl">
                <div className="h-6 w-6 rounded-lg bg-teal-500 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-slate-950 animate-spin" />
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {researchMode ? 'Executing Multi-Step Research & Policy Plan...' : 'Retrieving & Scoring Enterprise Knowledge...'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Traversing Vector Store, BM25 Index, Knowledge Graph & Authority Models...
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Query Input Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl bg-slate-850 border border-slate-700/80 focus-within:border-teal-500 shadow-lg shadow-black/40 transition-all">
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
              placeholder={`Ask anything across ${activeSpaceName}... (e.g. Compare policy versions, travel expense guidelines, or apply for leave)`}
              className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-xs p-3.5 pr-24 outline-none resize-none leading-relaxed"
            />
            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="h-8 px-3 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:hover:bg-teal-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition-all"
              >
                <span>Ask</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
            <span>Scoped to: <strong className="text-slate-300">{activeSpaceName}</strong></span>
            <span>Shift + Enter for newline • Grounded in Authoritative Enterprise Documents</span>
          </div>
        </form>
      </div>
    </div>
  );
};
