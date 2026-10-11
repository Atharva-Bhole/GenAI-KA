import React, { useState } from 'react';
import {
  CheckCircle2,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import { executeAction } from '../../services/api';
import { ActionRequest } from '../../types';

interface ActionModalProps {
  action: ActionRequest | null;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  action,
  onClose,
  onSuccess,
}) => {
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!action) return null;

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const resp = await executeAction(action.action_type, action.parameters);
      setResult(resp);
      onSuccess(resp);
    } catch (e: any) {
      alert(`Action execution failed: ${e.message}`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-fadeIn">
      <div className="bg-dark-900 border border-white/[0.09] rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-black/90">
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Action Confirmation</h3>
              <p className="text-[11px] text-slate-400">Human-in-the-loop workflow dispatch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {result ? (
          <div className="py-6 text-center space-y-3.5">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Action Successfully Executed</h4>
              <p className="text-xs text-slate-300 mt-1 px-4 leading-relaxed">
                {result.message}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-dark-950 border border-white/[0.05] text-[11px] font-mono text-brand-300 text-left overflow-x-auto max-h-48">
              <pre>{JSON.stringify(result.details, null, 2)}</pre>
            </div>

            <button
              onClick={onClose}
              className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 text-dark-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-3.5 text-xs">
            <div className="flex items-center gap-2 text-slate-200">
              <Workflow className="h-4 w-4 text-brand-400" />
              <span>Target Workflow: <strong className="text-white">{action.title}</strong></span>
            </div>

            <p className="text-slate-400 leading-relaxed">
              The Assistant has extracted the necessary parameters from your query and prepared a transactional API payload:
            </p>

            <div className="p-3.5 rounded-xl bg-dark-950 border border-white/[0.05] space-y-2">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                Extracted Payload Parameters
              </div>
              {Object.entries(action.parameters).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center text-[11px] border-b border-white/[0.03] pb-1.5 last:border-b-0 last:pb-0">
                  <span className="text-slate-400 font-mono">{key}:</span>
                  <span className="text-slate-200 font-semibold">{String(val)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/[0.07] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-dark-800 text-slate-300 hover:bg-dark-750 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={executing}
                onClick={handleExecute}
                className="px-4.5 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 disabled:opacity-40 text-dark-950 font-bold shadow-lg shadow-brand-500/20 transition-all"
              >
                {executing ? 'Executing API...' : 'Confirm & Execute Action'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
