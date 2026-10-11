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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm">
            <Zap className="h-4 w-4" />
            <span>Human-In-The-Loop Action Confirmation</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {result ? (
          <div className="py-6 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Workflow Action Executed!</h4>
            <p className="text-xs text-slate-300 px-4">
              {result.message}
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-teal-400 text-left overflow-x-auto">
              {JSON.stringify(result.details, null, 2)}
            </div>
            <button
              onClick={onClose}
              className="mt-3 px-4 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              <Workflow className="h-4 w-4 text-slate-400" />
              <span>Target Workflow: <strong>{action.title}</strong></span>
            </div>

            <p className="text-slate-400 leading-relaxed">
              The Knowledge Assistant has parsed your intent and generated an actionable request payload for enterprise systems:
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-300 mb-1">
                Parsed Parameters:
              </div>
              {Object.entries(action.parameters).map(([key, val]) => (
                <div key={key} className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">{key}:</span>
                  <span className="text-slate-200 font-medium">{String(val)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={executing}
                onClick={handleExecute}
                className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-md shadow-teal-500/20"
              >
                {executing ? 'Executing API...' : 'Confirm & Dispatch Action'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
