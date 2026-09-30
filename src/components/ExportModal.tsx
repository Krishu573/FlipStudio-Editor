import React, { useState } from 'react';
import { X, Download, FileArchive, FileText, Image as ImageIcon, Code2, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BookSettings } from '../types/flipbook';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BookSettings;
  theme?: 'dark' | 'light';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  settings,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [selectedFormat, setSelectedFormat] = useState<'html5' | 'pdf' | 'png' | 'react'>('html5');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const exportFormats = [
    {
      id: 'html5' as const,
      icon: FileArchive,
      title: 'HTML5 Standalone Package (.zip)',
      desc: 'Completely offline reader with WebGL 3D physics, sounds, and assets. Zero server required.',
      size: '28.4 MB'
    },
    {
      id: 'pdf' as const,
      icon: FileText,
      title: 'Interactive Vector PDF',
      desc: 'Standard vector PDF with embedded table of contents, bookmarks, and active hyperlinks.',
      size: '18.4 MB'
    },
    {
      id: 'png' as const,
      icon: ImageIcon,
      title: '300 DPI High-Res Image Pack',
      desc: 'Lossless PNG page spreads ready for commercial offset printing or digital archiving.',
      size: '94.2 MB'
    },
    {
      id: 'react' as const,
      icon: Code2,
      title: 'React / Next.js Component Bundle',
      desc: 'Modular npm package code ready to drop into your custom production web application.',
      size: '4.8 MB'
    },
  ];

  const handleStartExport = () => {
    setIsExporting(true);
    setIsFinished(false);
    setProgress(5);
    setStepLabel('Parsing vector paths & font curves...');

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setStepLabel('Packaging assets & creating manifest...');
          setTimeout(() => {
            setProgress(100);
            setIsExporting(false);
            setIsFinished(true);
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }, 600);
          return 95;
        }
        if (prev === 30) setStepLabel('Baking 3D surface sheen & normal maps...');
        if (prev === 65) setStepLabel('Encoding procedural paper audio triggers...');
        return prev + 15;
      });
    }, 280);
  };

  const handleDownloadFile = () => {
    // Generate a lightweight blob to trigger genuine browser download
    const dummyContent = `FlipCraft Studio Export\nFile: ${settings.fileName}\nFormat: ${selectedFormat.toUpperCase()}\nTimestamp: ${new Date().toISOString()}`;
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${settings.fileName.replace('.pdf', '')}_export.${selectedFormat === 'html5' ? 'zip' : selectedFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className={`border rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 transition-colors ${
        isDark ? 'bg-[#0f172a] border-[#222a3d]' : 'bg-white border-slate-200'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-[#1e293b]' : 'border-slate-200'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#494bd6]/20 text-[#8083ff]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold font-['Plus_Jakarta_Sans'] ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Export Digital Flipbook
              </h2>
              <p className={`text-xs ${isDark ? 'text-[#908fa0]' : 'text-slate-500'}`}>Production-grade artifacts with tactile fidelity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-[#908fa0] hover:text-white hover:bg-[#1e293b]' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {!isFinished ? (
            <>
              {/* Formats Selection */}
              <div className="space-y-2.5">
                <label className={`text-xs font-semibold uppercase tracking-wider block ${
                  isDark ? 'text-[#908fa0]' : 'text-slate-500'
                }`}>
                  Select Export Format
                </label>
                <div className="space-y-2">
                  {exportFormats.map((fmt) => {
                    const isSelected = selectedFormat === fmt.id;
                    const Icon = fmt.icon;
                    return (
                      <button
                        key={fmt.id}
                        disabled={isExporting}
                        onClick={() => setSelectedFormat(fmt.id)}
                        className={`w-full p-3.5 rounded-xl border text-left flex items-start space-x-3.5 transition-all ${
                          isSelected
                            ? isDark
                              ? 'bg-[#1e293b] border-[#8083ff] shadow-sm ring-1 ring-[#8083ff]/30'
                              : 'bg-indigo-50/80 border-indigo-500 shadow-xs ring-1 ring-indigo-400'
                            : isDark
                              ? 'bg-[#131b2e] border-[#222a3d] hover:bg-[#171f33] hover:border-[#2d3449]'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className={`p-2 rounded-lg mt-0.5 ${
                          isSelected ? 'bg-[#494bd6] text-white' : isDark ? 'bg-[#222a3d] text-[#908fa0]' : 'bg-slate-200 text-slate-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${
                              isDark ? 'text-[#dae2fd]' : 'text-slate-900'
                            }`}>{fmt.title}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                              isDark ? 'text-[#908fa0] bg-[#171f33] border-[#222a3d]' : 'text-slate-500 bg-white border-slate-200'
                            }`}>
                              ~{fmt.size}
                            </span>
                          </div>
                          <p className={`text-[11px] mt-1 leading-relaxed ${
                            isDark ? 'text-[#908fa0]' : 'text-slate-600'
                          }`}>
                            {fmt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress Indicator */}
              {isExporting && (
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isDark ? 'bg-[#131b2e] border-[#222a3d]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium flex items-center space-x-2 ${
                      isDark ? 'text-[#dae2fd]' : 'text-slate-800'
                    }`}>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8083ff]" />
                      <span>{stepLabel}</span>
                    </span>
                    <span className="font-mono text-[#8083ff] font-bold">{progress}%</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-[#1e293b]' : 'bg-slate-200'}`}>
                    <div
                      className="h-full bg-gradient-to-r from-[#494bd6] to-[#7bd0ff] rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Export Finished Celebration View */
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto ring-4 ring-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className={`text-lg font-bold font-['Plus_Jakarta_Sans'] ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Package Built Successfully!
                </h3>
                <p className={`text-xs max-w-sm mx-auto mt-1 ${isDark ? 'text-[#908fa0]' : 'text-slate-600'}`}>
                  Your 3D publication has been compiled with all WebGL shaders, interactive hotspots, and vector assets.
                </p>
              </div>
              <div className={`p-3 rounded-lg border inline-block text-left text-xs font-mono ${
                isDark ? 'bg-[#171f33] border-[#222a3d] text-[#c0c1ff]' : 'bg-slate-50 border-slate-200 text-indigo-700'
              }`}>
                📦 {settings.fileName.replace('.pdf', '')}_export.{selectedFormat === 'html5' ? 'zip' : selectedFormat}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-end space-x-3 transition-colors ${
          isDark ? 'border-[#1e293b] bg-[#0d1527]' : 'border-slate-200 bg-slate-50'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors border ${
              isDark
                ? 'bg-[#171f33] hover:bg-[#222a3d] text-[#dae2fd] border-[#222a3d]'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-2xs'
            }`}
          >
            Cancel
          </button>
          {!isFinished ? (
            <button
              onClick={handleStartExport}
              disabled={isExporting}
              className="px-5 py-2 bg-gradient-to-r from-[#494bd6] to-[#6366f1] hover:from-[#3b3dbb] hover:to-[#4f46e5] text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-indigo-950/40 flex items-center space-x-2 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Building...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Build</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleDownloadFile}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-emerald-950/40 flex items-center space-x-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
