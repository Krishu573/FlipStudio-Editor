import React, { useState, useEffect } from 'react';
import { Search, Command, BookOpen, Layers, Sparkles, Download, Volume2, Sun, Rotate3d, Check } from 'lucide-react';
import { CoverType, SurfaceSheen } from '../types/flipbook';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (pageNumber: number) => void;
  onSetCoverType: (type: CoverType) => void;
  onSetSheen: (sheen: SurfaceSheen) => void;
  onOpenExport: () => void;
  onToggleSound: () => void;
  onToggleFullscreen?: () => void;
  onToggleTheme: () => void;
  theme?: 'dark' | 'light';
  hasUploaded?: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectPage,
  onSetCoverType,
  onSetSheen,
  onOpenExport,
  onToggleSound,
  onToggleTheme,
  theme = 'dark',
  hasUploaded = false,
}) => {
  const isDark = theme === 'dark';
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'jump-1',
      title: 'Jump to Cover (Page 1)',
      category: 'Navigation',
      icon: BookOpen,
      action: () => onSelectPage(1),
    },
    {
      id: 'jump-12',
      title: 'Jump to Feature: The Art of Tactile Design (Page 12-13)',
      category: 'Navigation',
      icon: BookOpen,
      action: () => onSelectPage(12),
    },
    {
      id: 'jump-24',
      title: 'Jump to Back Cover (Page 24)',
      category: 'Navigation',
      icon: BookOpen,
      action: () => onSelectPage(24),
    },
    {
      id: 'cover-hc',
      title: 'Set Cover Type: Hard Cover (Stiff Embossed)',
      category: 'Appearance',
      icon: Layers,
      action: () => onSetCoverType('hardcover'),
    },
    {
      id: 'cover-pb',
      title: 'Set Cover Type: Paperback (Flexible Soft)',
      category: 'Appearance',
      icon: Layers,
      action: () => onSetCoverType('paperback'),
    },
    {
      id: 'cover-sp',
      title: 'Set Cover Type: Spiral Bound (Wire Coil)',
      category: 'Appearance',
      icon: Layers,
      action: () => onSetCoverType('spiral'),
    },
    {
      id: 'cover-lt',
      title: 'Set Cover Type: Leather Folio (Grained Stitch)',
      category: 'Appearance',
      icon: Layers,
      action: () => onSetCoverType('leather'),
    },
    {
      id: 'sheen-matte',
      title: 'Surface Finish: Matte Silk',
      category: 'Materials',
      icon: Sparkles,
      action: () => onSetSheen('matte'),
    },
    {
      id: 'sheen-glossy',
      title: 'Surface Finish: Glossy UV Specular',
      category: 'Materials',
      icon: Sparkles,
      action: () => onSetSheen('glossy'),
    },
    {
      id: 'sheen-gold',
      title: 'Surface Finish: Gold Foil Hotstamp',
      category: 'Materials',
      icon: Sparkles,
      action: () => onSetSheen('gold'),
    },
    {
      id: 'export',
      title: hasUploaded ? 'Export Flipbook (HTML5 / PDF / PNG / React)' : 'Export Flipbook (Upload Required)',
      category: 'Publishing',
      icon: Download,
      action: onOpenExport,
      disabled: !hasUploaded,
    },
    {
      id: 'sound',
      title: 'Toggle Web Audio Paper Sounds',
      category: 'Audio',
      icon: Volume2,
      action: onToggleSound,
    },
    {
      id: 'theme',
      title: 'Toggle Light / Dark Mode',
      category: 'Appearance',
      icon: Sun,
      action: onToggleTheme,
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-start justify-center pt-20 p-4 select-none">
      <div className={`border rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 transition-colors ${
        isDark ? 'bg-[#0f172a] border-[#222a3d]' : 'bg-white border-slate-200 shadow-slate-900/15'
      }`}>
        {/* Search Header */}
        <div className={`p-3.5 border-b flex items-center space-x-3 ${
          isDark ? 'border-[#1e293b]' : 'border-slate-200'
        }`}>
          <Search className="w-5 h-5 text-[#8083ff]" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or jump to page... (e.g. 'hardcover', 'page 12', 'export')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`flex-1 bg-transparent text-sm focus:outline-none ${
              isDark ? 'text-white placeholder-[#908fa0]' : 'text-slate-900 placeholder-slate-400'
            }`}
          />
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
            isDark ? 'text-[#908fa0] bg-[#171f33] border-[#222a3d]' : 'text-slate-400 bg-slate-100 border-slate-200'
          }`}>
            ESC
          </span>
        </div>

        {/* Action List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className={`p-6 text-center text-xs ${isDark ? 'text-[#908fa0]' : 'text-slate-400'}`}>
              No actions matching "{query}"
            </div>
          ) : (
            filtered.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  disabled={action.disabled}
                  onClick={() => {
                    if (action.disabled) return;
                    action.action();
                    onClose();
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg text-left flex items-center justify-between text-xs transition-colors group ${
                    action.disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : isDark ? 'hover:bg-[#1e293b]' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-md text-[#8083ff] group-hover:bg-[#494bd6] group-hover:text-white transition-colors ${
                      isDark ? 'bg-[#171f33]' : 'bg-indigo-50'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`font-medium ${
                        isDark ? 'text-[#dae2fd] group-hover:text-white' : 'text-slate-800 group-hover:text-slate-950 font-semibold'
                      }`}>
                        {action.title}
                      </div>
                      <div className={`text-[10px] ${isDark ? 'text-[#908fa0]' : 'text-slate-500'}`}>{action.category}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity ${
                    isDark ? 'text-[#908fa0]' : 'text-slate-400'
                  }`}>
                    ↵ Return
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
