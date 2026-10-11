import React, { useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Layers,
  Power,
  RefreshCw,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { configureGemini, disconnectGemini } from '../../services/api';
import { GeminiConfigStatus } from '../../types';

interface GeminiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: GeminiConfigStatus | null;
  onStatusUpdated: (newStatus: GeminiConfigStatus) => void;
}

export const GeminiConfigModal: React.FC<GeminiConfigModalProps> = ({
  isOpen,
  onClose,
  status,
  onStatusUpdated,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updated = await configureGemini(apiKey.trim(), model);
      onStatusUpdated(updated);
      setSuccessMsg('Google Gemini connected successfully! Embeddings and chat generation are now active.');
      setApiKey('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updated = await disconnectGemini();
      onStatusUpdated(updated);
      setSuccessMsg('Disconnected. Platform transitioned to local evidence engine.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Disconnect failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-fadeIn">
      <div className="bg-dark-900 border border-white/[0.09] rounded-2xl w-full max-w-lg p-6 shadow-2xl shadow-black/95">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-500 via-indigo-500 to-amber-400 p-0.5 shadow-md">
              <div className="h-full w-full bg-dark-900 rounded-[10px] flex items-center justify-center text-brand-400">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Google Gemini Engine Integration</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Text-embedding-004 vector search & multi-document LLM synthesis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="p-4 rounded-xl bg-dark-950/80 border border-white/[0.05] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Active Engine State:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 ${
                  status?.configured
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status?.configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {status?.configured ? 'Gemini Active' : 'Local Engine'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/[0.04]">
              <div>
                <span className="text-slate-500">Embedding Model:</span>
                <p className="font-mono text-slate-200 mt-0.5">text-embedding-004</p>
              </div>
              <div>
                <span className="text-slate-500">Generation Model:</span>
                <p className="font-mono text-brand-300 mt-0.5">{status?.model || 'gemini-2.5-flash'}</p>
              </div>
              <div>
                <span className="text-slate-500">Indexed Chunks:</span>
                <p className="font-mono text-slate-200 mt-0.5">{status?.total_indexed_chunks || 0} chunks</p>
              </div>
              <div>
                <span className="text-slate-500">Vector Space:</span>
                <p className="font-mono text-slate-200 mt-0.5">
                  {status?.gemini_vectors_active ? 'Gemini 768-dim' : 'Local SVD 128-dim'}
                </p>
              </div>
            </div>
          </div>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <X className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-3.5 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-medium flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-brand-400" />
                  <span>Gemini API Key</span>
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-400 hover:text-brand-300 text-[11px] flex items-center gap-1"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder={status?.configured ? '••••••••••••••••••••••••••••' : 'AIzaSy...'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-dark-850 text-slate-100 placeholder-slate-500 p-2.5 pr-10 rounded-xl border border-white/[0.08] focus:border-brand-500/70 outline-none font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Select Synthesis Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-dark-850 text-slate-200 p-2.5 rounded-xl border border-white/[0.08] focus:border-brand-500/70 outline-none text-xs"
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended • Ultra Fast & Intelligent)</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash (Standard Low Latency)</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash (Next Gen Multimodal)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (High Reasoning Complex Logic)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between">
              {status?.configured ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="px-3 py-2 rounded-xl bg-dark-800 hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-300 border border-white/[0.05] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Power className="h-3.5 w-3.5" />
                  <span>Disconnect</span>
                </button>
              ) : (
                <div className="text-[11px] text-slate-500">
                  Runs local fallback if key is unprovided
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl bg-dark-800 text-slate-300 hover:bg-dark-750 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={loading || !apiKey.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 disabled:opacity-40 text-dark-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Verifying & Indexing...' : 'Activate Gemini'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
