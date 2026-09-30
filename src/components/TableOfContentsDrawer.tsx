import React from 'react';
import { X, Bookmark, ChevronRight } from 'lucide-react';
import { PageData } from '../types/flipbook';

interface TableOfContentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pages: PageData[];
  onSelectPage: (pageNumber: number) => void;
  theme?: 'dark' | 'light';
}

export const TableOfContentsDrawer: React.FC<TableOfContentsDrawerProps> = ({
  isOpen,
  onClose,
  pages,
  onSelectPage,
  theme = 'dark',
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  // Filter bookmarked pages or chapters
  const bookmarkedPages = pages.filter(p => p.bookmarkTitle || p.chapter || p.pageNumber === 1 || p.pageNumber === pages.length);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end select-none">
      <div className={`w-full max-w-sm border-l h-full flex flex-col shadow-2xl animate-in slide-in-from-right transition-colors ${
        isDark ? 'bg-[#0f172a] border-[#222a3d]' : 'bg-white border-slate-200'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-[#1e293b]' : 'border-slate-200'
        }`}>
          <div className="flex items-center space-x-2">
            <Bookmark className="w-4 h-4 text-[#8083ff]" />
            <h2 className={`text-sm font-bold font-['Plus_Jakarta_Sans'] uppercase tracking-wider ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Bookmarks & Outline
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isDark ? 'text-[#908fa0] hover:text-white hover:bg-[#1e293b]' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {bookmarkedPages.map((page) => (
            <button
              key={page.id}
              onClick={() => {
                onSelectPage(page.pageNumber);
                onClose();
              }}
              className={`w-full p-3 border rounded-xl text-left transition-all flex items-center justify-between group ${
                isDark 
                  ? 'bg-[#171f33] hover:bg-[#1e293b] border-[#222a3d] hover:border-[#8083ff]'
                  : 'bg-slate-50 hover:bg-indigo-50/50 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono text-[#8083ff] uppercase font-semibold">
                  Page {page.pageNumber}
                </div>
                <div className={`text-xs font-semibold ${
                  isDark ? 'text-[#dae2fd] group-hover:text-white' : 'text-slate-800 group-hover:text-indigo-900'
                }`}>
                  {page.bookmarkTitle || page.title}
                </div>
                {page.subtitle && (
                  <div className={`text-[11px] truncate max-w-[220px] ${
                    isDark ? 'text-[#908fa0]' : 'text-slate-500'
                  }`}>
                    {page.subtitle}
                  </div>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-[#908fa0] group-hover:text-[#8083ff] transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
