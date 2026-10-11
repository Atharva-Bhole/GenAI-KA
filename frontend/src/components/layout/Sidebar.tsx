import React from 'react';
import {
  MessageSquare,
  FileText,
  Share2,
  ShieldAlert,
  BarChart3,
  Layers,
  Sparkles,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { KnowledgeSpace } from '../../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  spaces: KnowledgeSpace[];
  activeSpace: string;
  onSelectSpace: (spaceId: string) => void;
  userRole: string;
  onSelectRole: (role: string) => void;
  onSelectPrompt: (prompt: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  spaces,
  activeSpace,
  onSelectSpace,
  userRole,
  onSelectRole,
  onSelectPrompt
}) => {
  const suggestedQueries = [
    { label: "Compare Leave Policy vs Handbook", query: "What is our annual leave policy entitlement, and has anything changed since last year?" },
    { label: "Overseas Travel + Annual Leave", query: "Can someone take annual leave immediately after an overseas business trip and still claim the return flight?" },
    { label: "Remote Engineers Outside State", query: "Compare our remote work policy with the employee handbook and tell me whether software engineers based outside Maharashtra can work permanently remotely." },
    { label: "Password & IAM Conflict", query: "Analyze our cybersecurity documentation and identify inconsistencies in password requirements and expiration." },
    { label: "Action: Apply for Leave", query: "Apply for leave this Friday" },
    { label: "Gap Test: Personal AI Tools", query: "What is our company policy for employees using personal AI tools on work laptops?" },
  ];

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
              Knowledge AI
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Enterprise Intelligence Layer</p>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="p-3 space-y-1">
        <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 tracking-wider">
          Workspace
        </div>
        
        <button
          onClick={() => onSelectTab('chat')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'chat'
              ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Assistant & Research</span>
        </button>

        <button
          onClick={() => onSelectTab('sources')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'sources'
              ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Knowledge Sources</span>
        </button>

        <button
          onClick={() => onSelectTab('graph')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'graph'
              ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Share2 className="h-4 w-4" />
          <span>Knowledge Graph</span>
        </button>

        <div className="pt-2 text-[10px] uppercase font-bold text-slate-400 px-3 py-1 tracking-wider">
          Governance & Research
        </div>

        <button
          onClick={() => onSelectTab('governance')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'governance'
              ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Conflict & Gap Center</span>
        </button>

        <button
          onClick={() => onSelectTab('benchmark')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'benchmark'
              ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Empirical Benchmark</span>
        </button>
      </div>

      {/* Knowledge Spaces Scoping */}
      <div className="p-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 px-3 py-1 tracking-wider">
          <span>Knowledge Spaces</span>
          <Layers className="h-3 w-3" />
        </div>
        <div className="mt-1 space-y-0.5 max-h-36 overflow-y-auto pr-1">
          {spaces.map((sp) => (
            <button
              key={sp.id}
              onClick={() => onSelectSpace(sp.id)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-colors ${
                activeSpace === sp.id
                  ? 'bg-slate-800 text-teal-400 font-medium'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <span className="truncate">{sp.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {sp.document_count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Inquiries / Demos */}
      <div className="p-3 flex-1 overflow-y-auto border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 px-3 py-1 tracking-wider">
          <HelpCircle className="h-3 w-3" />
          <span>Case Studies</span>
        </div>
        <div className="mt-1 space-y-1">
          {suggestedQueries.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.query)}
              className="w-full text-left p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/60 transition-all group"
            >
              <div className="text-[11px] font-medium text-slate-300 group-hover:text-teal-300">
                {item.label}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {item.query}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* User Persona & Role Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Briefcase className="h-3.5 w-3.5 text-teal-400" />
            Active Role:
          </span>
          <select
            value={userRole}
            onChange={(e) => onSelectRole(e.target.value)}
            className="bg-slate-800 text-slate-200 text-[11px] rounded px-2 py-0.5 border border-slate-700 outline-none"
          >
            <option value="employee">Employee</option>
            <option value="hr_manager">HR Manager</option>
            <option value="security_lead">Security Lead</option>
            <option value="admin">Knowledge Admin</option>
          </select>
        </div>
        <div className="flex items-center gap-2 pt-1 text-slate-400 text-[11px]">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Atharva (Organization Staff)</span>
        </div>
      </div>
    </aside>
  );
};
