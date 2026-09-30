import React from 'react';
import { AlertTriangle, ShieldAlert, X, CheckCircle, Lock } from 'lucide-react';

interface SecurityCautionModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  theme?: 'dark' | 'light';
}

export const SecurityCautionModal: React.FC<SecurityCautionModalProps> = ({
  isOpen,
  onClose,
  fileName,
  theme = 'dark',
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className={`border-2 border-amber-500/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 transition-colors ${
        isDark ? 'bg-[#0f172a] shadow-amber-950/40' : 'bg-white shadow-slate-900/20'
      }`}>
        {/* Amber top highlight line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 animate-pulse" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
            isDark ? 'text-[#908fa0] hover:text-white hover:bg-[#1e293b]' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-7 text-center space-y-5">
          {/* Warning Icon with Glow */}
          <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-500 flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-9 h-9 stroke-[2.2]" />
            </div>
          </div>

          {/* Exact Required Caution Message */}
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Security Advisory</span>
            </div>
            <h2 className={`text-xl md:text-2xl font-bold font-['Plus_Jakarta_Sans'] leading-snug ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              The File Uploaded Will Not Be Saved To Cloud Due To Security Issue
            </h2>
          </div>

          {/* Context and details */}
          <div className={`border rounded-xl p-4 text-left space-y-2 text-xs transition-colors ${
            isDark ? 'bg-[#171f33] border-[#222a3d]' : 'bg-amber-50/50 border-amber-200'
          }`}>
            <div className={`flex items-center justify-between pb-2 border-b ${
              isDark ? 'text-[#908fa0] border-[#222a3d]' : 'text-slate-500 border-amber-200/60'
            }`}>
              <span>Processed Document:</span>
              <span className={`font-mono font-semibold truncate max-w-[200px] ${
                isDark ? 'text-[#dae2fd]' : 'text-slate-900'
              }`} title={fileName}>
                {fileName}
              </span>
            </div>
            <div className={`flex items-start space-x-2 pt-1 leading-relaxed ${
              isDark ? 'text-[#c7c4d7]' : 'text-slate-700'
            }`}>
              <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Your PDF has been converted entirely inside your browser's local sandbox memory. Zero file data, vector layouts, or image assets are uploaded or stored on any external cloud server.
              </span>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-950/30 flex items-center justify-center space-x-2 active:scale-[0.99]"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Acknowledge & View 3D Booklet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
