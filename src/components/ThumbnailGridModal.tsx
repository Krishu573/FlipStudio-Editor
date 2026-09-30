import React from 'react';
import { X, Search } from 'lucide-react';
import { PageData } from '../types/flipbook';

interface ThumbnailGridModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: PageData[];
  currentSpreadIndex: number;
  onSelectPage: (pageNumber: number) => void;
  theme?: 'dark' | 'light';
}

export const ThumbnailGridModal: React.FC<ThumbnailGridModalProps> = ({
  isOpen,
  onClose,
  pages,
  onSelectPage,
  theme = 'dark',
}) => {
  const [filterQuery, setFilterQuery] = React.useState('');

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const filteredPages = pages.filter(p => 
    p.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (p.subtitle && p.subtitle.toLowerCase().includes(filterQuery.toLowerCase())) ||
    p.pageNumber.toString().includes(filterQuery)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className={`border rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-[#0f172a] border-[#222a3d]' : 'bg-white border-slate-200'
      }`}>
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-[#1e293b]' : 'border-slate-200'
        }`}>
          <div className="flex items-center space-x-3">
            <h2 className={`text-base font-bold font-['Plus_Jakarta_Sans'] ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Page Thumbnails & Spread Index
            </h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono border ${
              isDark ? 'bg-[#171f33] text-[#8083ff] border-[#222a3d]' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
              {pages.length} Pages
            </span>
          </div>

          {/* Search bar */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-[#908fa0]' : 'text-slate-400'
              }`} />
              <input
                type="text"
                placeholder="Filter pages..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className={`text-xs pl-8 pr-3 py-1 rounded-lg border focus:border-[#8083ff] focus:outline-none w-48 ${
                  isDark ? 'bg-[#171f33] text-[#dae2fd] border-[#222a3d]' : 'bg-slate-50 text-slate-800 border-slate-200'
                }`}
              />
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
        </div>

        {/* Thumbnail Grid List */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredPages.map((page) => {
            const spreadIdx = page.pageNumber === 1 
              ? 0 
              : Math.floor((page.pageNumber) / 2);

            return (
              <div
                key={page.id}
                onClick={() => {
                  onSelectPage(page.pageNumber);
                  onClose();
                }}
                className={`group relative rounded-xl border p-2.5 cursor-pointer transition-all hover:scale-[1.03] shadow-md flex flex-col justify-between ${
                  isDark
                    ? 'bg-[#171f33] hover:bg-[#1e293b] border-[#222a3d] hover:border-[#8083ff]'
                    : 'bg-slate-50 hover:bg-indigo-50/50 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {/* Visual Thumbnail Representation */}
                <div className="aspect-[3/4] bg-white rounded-md overflow-hidden relative shadow-inner flex flex-col justify-between p-2 text-[#0f172a] border border-slate-200/50">
                  {page.pdfPageImage ? (
                    <img
                      src={page.pdfPageImage}
                      alt={page.title}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  ) : page.imageUrl ? (
                    <img
                      src={page.imageUrl}
                      alt={page.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="space-y-1 z-10">
                      <div className="h-1 bg-[#cbd5e1] rounded w-2/3" />
                      <div className="h-1 bg-[#e2e8f0] rounded w-full" />
                      <div className="h-1 bg-[#e2e8f0] rounded w-4/5" />
                      <div className="h-1 bg-[#e2e8f0] rounded w-1/2" />
                    </div>
                  )}

                  {/* Page number badge inside thumbnail */}
                  <div className="z-10 absolute bottom-1 right-1 bg-black/75 backdrop-blur-sm text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                    p.{page.pageNumber}
                  </div>
                </div>

                {/* Meta details below card */}
                <div className="mt-2 text-left">
                  <div className={`text-[11px] font-semibold truncate ${
                    isDark ? 'text-[#dae2fd] group-hover:text-[#c0c1ff]' : 'text-slate-800 group-hover:text-indigo-600'
                  }`}>
                    {page.title}
                  </div>
                  <div className={`text-[10px] capitalize mt-0.5 flex items-center justify-between ${
                    isDark ? 'text-[#908fa0]' : 'text-slate-500'
                  }`}>
                    <span>{page.layout}</span>
                    <span className="font-mono text-[9px]">Spread {spreadIdx}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
