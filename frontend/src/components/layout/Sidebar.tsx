import React from 'react';
import {
  BarChart3,
  BookOpen,
  Briefcase,
  ChevronRight,
  Code2,
  Compass,
  FileCheck2,
  FileText,
  Globe,
  HelpCircle,
  Layers,
  MessageSquare,
  Rocket,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users2,
  Wallet,
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
  onSelectPrompt,
}) => {
  const getSpaceIcon = (iconName: string) => {
    switch (iconName) {
      case 'globe': return <Globe className="h-3.5 w-3.5 text-teal-400" />;
      case 'users': return <Users2 className="h-3.5 w-3.5 text-indigo-400" />;
      case 'code': return <Code2 className="h-3.5 w-3.5 text-emerald-400" />;
      case 'dollar-sign': return <Wallet className="h-3.5 w-3.5 text-amber-400" />;
      case 'shield': return <ShieldCheck className="h-3.5 w-3.5 text-rose-400" />;
      default: return <Rocket className="h-3.5 w-3.5 text-sky-400" />;
    }
  };

  const samplePrompts = [
    {
      category: "CONFLICT",
      catColor: "text-amber-400 border-amber-500/20 bg-amber-500/10",
      label: "Leave Policy vs Handbook",
      query: "What is our annual leave policy entitlement, and has anything changed since last year?"
    },
    {
      category: "SYNTHESIS",
      catColor: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10",
      label: "Overseas Travel + Leave Claim",
      query: "Can someone take annual leave immediately after an overseas business trip and still claim the return flight?"
    },
    {
      category: "MOBILITY",
      catColor: "text-teal-400 border-teal-500/20 bg-teal-500/10",
      label: "Engineers Outside Maharashtra",
      query: "Compare our remote work policy with the employee handbook and tell me whether software engineers based outside Maharashtra can work permanently remotely."
    },
    {
      category: "GOVERNANCE",
      catColor: "text-rose-400 border-rose-500/20 bg-rose-500/10",
      label: "Password & IAM Standard",
      query: "Analyze our cybersecurity documentation and identify inconsistencies in password requirements and expiration."
    },
    {
      category: "ACTION",
      catColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
      label: "Apply for Leave (HITL)",
      query: "Apply for leave this Friday"
    },
    {
      category: "GAP TEST",
      catColor: "text-pink-400 border-pink-500/20 bg-pink-500/10",
      label: "Personal AI Tools Policy",
      query: "What is our company policy for employees using personal AI tools on work laptops?"
    },
  ];

  return (
    <aside className="w-80 bg-dark-950 border-r border-white/5 flex flex-col h-screen select-none relative z-30">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/25 ring-1 ring-white/20">
            <Sparkles className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">Knowledge AI</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold tracking-wider">
                LAYER 5
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">Enterprise Intelligence</p>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-1">
        <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5 tracking-wider">
          Cognitive Workspace
        </div>
        
        <button
          onClick={() => onSelectTab('chat')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
            currentTab === 'chat'
              ? 'bg-gradient-to-r from-teal-500/15 to-transparent text-teal-300 border border-teal-500/30 shadow-glow-teal font-semibold'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-1 rounded-lg ${currentTab === 'chat' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 group-hover:text-slate-200'}`}>
              <MessageSquare className="h-4 w-4" />
            </div>
            <span>Assistant & Reasoning</span>
          </div>
          <ChevronRight className={`h-3 w-3 transition-transform ${currentTab === 'chat' ? 'text-teal-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`} />
        </button>

        <button
          onClick={() => onSelectTab('sources')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
            currentTab === 'sources'
              ? 'bg-gradient-to-r from-teal-500/15 to-transparent text-teal-300 border border-teal-500/30 shadow-glow-teal font-semibold'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-1 rounded-lg ${currentTab === 'sources' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 group-hover:text-slate-200'}`}>
              <FileText className="h-4 w-4" />
            </div>
            <span>Knowledge Sources</span>
          </div>
          <ChevronRight className={`h-3 w-3 transition-transform ${currentTab === 'sources' ? 'text-teal-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`} />
        </button>

        <button
          onClick={() => onSelectTab('graph')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
            currentTab === 'graph'
              ? 'bg-gradient-to-r from-teal-500/15 to-transparent text-teal-300 border border-teal-500/30 shadow-glow-teal font-semibold'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-1 rounded-lg ${currentTab === 'graph' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 group-hover:text-slate-200'}`}>
              <Share2 className="h-4 w-4" />
            </div>
            <span>Knowledge Graph</span>
          </div>
          <ChevronRight className={`h-3 w-3 transition-transform ${currentTab === 'graph' ? 'text-teal-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`} />
        </button>

        <div className="pt-2 text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5 tracking-wider">
          Enterprise Governance
        </div>

        <button
          onClick={() => onSelectTab('governance')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
            currentTab === 'governance'
              ? 'bg-gradient-to-r from-teal-500/15 to-transparent text-teal-300 border border-teal-500/30 shadow-glow-teal font-semibold'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-1 rounded-lg ${currentTab === 'governance' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 group-hover:text-slate-200'}`}>
              <ShieldAlert className="h-4 w-4" />
            </div>
            <span>Conflict & Gap Center</span>
          </div>
          <ChevronRight className={`h-3 w-3 transition-transform ${currentTab === 'governance' ? 'text-teal-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`} />
        </button>

        <button
          onClick={() => onSelectTab('benchmark')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
            currentTab === 'benchmark'
              ? 'bg-gradient-to-r from-teal-500/15 to-transparent text-teal-300 border border-teal-500/30 shadow-glow-teal font-semibold'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-1 rounded-lg ${currentTab === 'benchmark' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 group-hover:text-slate-200'}`}>
              <BarChart3 className="h-4 w-4" />
            </div>
            <span>Empirical Benchmark</span>
          </div>
          <ChevronRight className={`h-3 w-3 transition-transform ${currentTab === 'benchmark' ? 'text-teal-400 translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'}`} />
        </button>
      </div>

      <div className="p-3 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5 tracking-wider">
          <span>Knowledge Spaces</span>
          <Layers className="h-3 w-3 text-slate-400" />
        </div>
        <div className="mt-1 space-y-1 max-h-36 overflow-y-auto pr-1">
          {spaces.map((sp) => {
            const isSelected = activeSpace === sp.id;
            return (
              <button
                key={sp.id}
                onClick={() => onSelectSpace(sp.id)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all ${
                  isSelected
                    ? 'bg-white/10 text-white font-semibold shadow-inner-light ring-1 ring-white/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {getSpaceIcon(sp.icon)}
                  <span className="truncate">{sp.name}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-slate-400">
                  {sp.document_count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 flex-1 overflow-y-auto border-t border-white/5">
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5 tracking-wider">
          <BookOpen className="h-3 w-3 text-slate-400" />
          <span>Case Studies & Scenarios</span>
        </div>
        <div className="mt-1 space-y-1.5">
          {samplePrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.query)}
              className="w-full text-left p-2.5 rounded-xl bg-dark-900/60 hover:bg-dark-850 border border-white/5 hover:border-teal-500/30 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-semibold ${item.catColor}`}>
                  {item.category}
                </span>
                <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-teal-400 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="text-[11px] font-medium text-slate-200 group-hover:text-teal-300 transition-colors">
                {item.label}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {item.query}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-3.5 border-t border-white/5 bg-black/30">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Briefcase className="h-3.5 w-3.5 text-teal-400" />
            User Role (RBAC):
          </span>
          <select
            value={userRole}
            onChange={(e) => onSelectRole(e.target.value)}
            className="bg-dark-850 text-slate-200 text-[11px] rounded-lg px-2.5 py-1 border border-white/10 outline-none hover:border-teal-500/40 cursor-pointer font-medium"
          >
            <option value="employee">Staff Employee</option>
            <option value="hr_manager">HR Manager</option>
            <option value="security_lead">Security Lead</option>
            <option value="admin">Knowledge Admin</option>
          </select>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-300">Atharva</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Enterprise Tenant</span>
        </div>
      </div>
    </aside>
  );
};
