import React, { useState } from 'react';
import { 
  ChevronDown, 
  Minus, 
  Plus, 
  Columns, 
  Eye, 
  Check
} from 'lucide-react';
import { FlipbookPreset, ViewMode } from '../types/flipbook';

interface ToolbarProps {
  presets: FlipbookPreset[];
  activePreset: FlipbookPreset;
  onSelectPreset: (preset: FlipbookPreset) => void;
  zoom: number;
  setZoom: (updater: (prev: number) => number) => void;
  onResetZoom: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onToggleFullscreen?: () => void;
  theme?: 'dark' | 'light';
}

export const Toolbar: React.FC<ToolbarProps> = ({
  presets,
  activePreset,
  onSelectPreset,
  zoom,
  setZoom,
  onResetZoom,
  viewMode,
  setViewMode,
  theme = 'dark',
}) => {
  const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);
  const isDark = theme === 'dark';

  return (
    <div className={`h-11 border-b px-4 flex items-center justify-between z-20 select-none text-xs transition-colors duration-200 ${
      isDark ? 'border-[#1e293b] bg-[#0d1527] text-[#dae2fd]' : 'border-slate-200 bg-slate-50 text-slate-800'
    }`}>
      {/* Left Toolbar Controls */}
      <div className="flex items-center space-x-3">
        {/* Preset Selector */}
        <div className="relative">
          <button
            onClick={() => setPresetDropdownOpen(!presetDropdownOpen)}
            className={`flex items-center space-x-2 px-2.5 py-1 border rounded-md transition-colors ${
              isDark 
                ? 'bg-[#171f33] hover:bg-[#222a3d] border-[#2d3449] text-[#dae2fd]'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800 shadow-xs'
            }`}
          >
            <span className={`uppercase tracking-wider text-[10px] font-semibold ${isDark ? 'text-[#908fa0]' : 'text-slate-400'}`}>Preset:</span>
            <span className={`font-medium ${isDark ? 'text-[#c0c1ff]' : 'text-indigo-600'}`}>{activePreset.name}</span>
            <ChevronDown className={`w-3.5 h-3.5 ${isDark ? 'text-[#908fa0]' : 'text-slate-400'}`} />
          </button>

          {presetDropdownOpen && (
            <div className={`absolute left-0 mt-1.5 w-60 border rounded-lg shadow-xl py-1.5 z-50 ${
              isDark 
                ? 'bg-[#171f33] border-[#2d3449] text-[#dae2fd] shadow-black/60'
                : 'bg-white border-slate-200 text-slate-800 shadow-slate-300/50'
            }`}>
              <div className={`px-3 py-1 text-[10px] uppercase tracking-wider font-semibold border-b mb-1 ${
                isDark ? 'text-[#908fa0] border-[#222a3d]' : 'text-slate-400 border-slate-100'
              }`}>
                Design & Material Presets
              </div>
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    onSelectPreset(preset);
                    setPresetDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-start justify-between transition-colors ${
                    isDark ? 'hover:bg-[#222a3d]' : 'hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className={`text-xs font-medium ${isDark ? 'text-[#dae2fd]' : 'text-slate-900'}`}>{preset.name}</div>
                    <div className={`text-[11px] mt-0.5 ${isDark ? 'text-[#908fa0]' : 'text-slate-500'}`}>{preset.description}</div>
                  </div>
                  {activePreset.id === preset.id && (
                    <Check className="w-4 h-4 text-[#8083ff] shrink-0 ml-2 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Separator */}
        <div className={`h-4 w-px ${isDark ? 'bg-[#1e293b]' : 'bg-slate-200'}`} />

        {/* Zoom & Canvas controls */}
        <div className={`flex items-center space-x-1 px-1 py-0.5 rounded-md border ${
          isDark ? 'bg-[#171f33] border-[#222a3d]' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <button
            onClick={() => setZoom(z => Math.max(0.6, Math.round((z - 0.1) * 10) / 10))}
            className={`p-1 rounded transition-colors ${
              isDark ? 'text-[#908fa0] hover:text-white hover:bg-[#222a3d]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className={`px-1.5 text-[11px] font-mono font-medium min-w-[42px] text-center ${
            isDark ? 'text-[#dae2fd]' : 'text-slate-700'
          }`}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(1.8, Math.round((z + 0.1) * 10) / 10))}
            className={`p-1 rounded transition-colors ${
              isDark ? 'text-[#908fa0] hover:text-white hover:bg-[#222a3d]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onResetZoom}
            className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors border-l ${
              isDark 
                ? 'text-[#908fa0] hover:text-[#c0c1ff] hover:bg-[#222a3d] border-[#222a3d]'
                : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border-slate-200'
            }`}
          >
            Fit
          </button>
        </div>
      </div>

      {/* Right: View layout toggles */}
      <div className={`flex items-center space-x-1 p-0.5 rounded-lg border ${
        isDark ? 'bg-[#131b2e] border-[#222a3d]' : 'bg-slate-200/70 border-slate-300/80'
      }`}>
        <button
          onClick={() => setViewMode('split')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
            viewMode === 'split'
              ? isDark 
                ? 'bg-[#222a3d] text-white shadow-sm' 
                : 'bg-white text-slate-900 shadow-xs'
              : isDark 
                ? 'text-[#908fa0] hover:text-[#dae2fd]' 
                : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Columns className="w-3.5 h-3.5 text-[#8083ff]" />
          <span>Split Studio</span>
        </button>

        <button
          onClick={() => setViewMode('preview')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
            viewMode === 'preview'
              ? isDark 
                ? 'bg-[#222a3d] text-white shadow-sm' 
                : 'bg-white text-slate-900 shadow-xs'
              : isDark 
                ? 'text-[#908fa0] hover:text-[#dae2fd]' 
                : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-[#009bd1]" />
          <span>Preview Only</span>
        </button>
      </div>
    </div>
  );
};
