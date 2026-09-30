import React, { useRef } from 'react';
import { 
  FileUp, 
  BookMarked, 
  Download, 
  UploadCloud, 
  FileText, 
  RotateCw, 
  Trash2, 
  Check, 
  Sliders, 
  HelpCircle, 
  Command, 
  ExternalLink,
  Palette,
  Loader2,
  Lock
} from 'lucide-react';
import { BookSettings, CoverType, SurfaceSheen, WorkflowTab } from '../types/flipbook';
import { UserProfile } from '../lib/supabase';

interface LeftSidebarProps {
  settings: BookSettings;
  updateSettings: (partial: Partial<BookSettings>) => void;
  activeWorkflowTab: WorkflowTab;
  setActiveWorkflowTab: (tab: WorkflowTab) => void;
  onOpenCommandPalette: () => void;
  onOpenExportModal: () => void;
  hasUploaded: boolean;
  isConverting: boolean;
  onTriggerUpload: (file?: File) => void;
  onResetDocument: () => void;
  theme?: 'dark' | 'light';
  userProfile?: UserProfile;
  loadingProfile?: boolean;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
  onRefreshProfile?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  settings,
  updateSettings,
  activeWorkflowTab,
  setActiveWorkflowTab,
  onOpenCommandPalette,
  onOpenExportModal,
  hasUploaded,
  isConverting,
  onTriggerUpload,
  onResetDocument,
  theme = 'dark',
  userProfile,
  loadingProfile = false,
  onUpdateProfile,
  onRefreshProfile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = Math.round((file.size / (1024 * 1024)) * 10) / 10;
      updateSettings({
        fileName: file.name,
        fileSizeMb: sizeMb || 14.2,
      });
      onTriggerUpload(file);
    }
  };

  const coverOptions: { id: CoverType; code: string; label: string; sub: string }[] = [
    { id: 'hardcover', code: 'HC', label: 'Hard Cover', sub: 'Stiff Embossed' },
    { id: 'paperback', code: 'PB', label: 'Paperback', sub: 'Flexible Soft' },
    { id: 'spiral', code: 'SP', label: 'Spiral Bound', sub: 'Wire Coil' },
    { id: 'leather', code: 'LT', label: 'Leather Folio', sub: 'Grained Stitch' },
  ];

  const sheenOptions: { id: SurfaceSheen; label: string; sub: string; previewClass: string }[] = [
    { 
      id: 'glossy', 
      label: 'High Gloss UV', 
      sub: 'Dynamic Light Glare',
      previewClass: 'bg-gradient-to-tr from-sky-300 via-white to-indigo-500 shadow-xs'
    },
    { 
      id: 'matte', 
      label: 'Matte Varnish', 
      sub: 'Velvet Non-Glare Coat',
      previewClass: 'bg-slate-400/80'
    },
    { 
      id: 'linen', 
      label: 'Linen Bookcloth', 
      sub: 'Woven Fabric Texture',
      previewClass: 'bg-amber-100 border border-amber-300/80'
    },
    { 
      id: 'gold', 
      label: 'Gold Foil Stamping', 
      sub: 'Gilded Metallic Trim',
      previewClass: 'bg-gradient-to-r from-amber-500 via-yellow-200 to-amber-600 shadow-xs'
    },
  ];

  return (
    <aside className={`w-full md:w-[380px] lg:w-[420px] shrink-0 border-r flex flex-col h-[calc(100vh-100px)] overflow-hidden select-none transition-colors duration-200 ${
      isDark ? 'border-[#1e293b] bg-[#0b1326] text-[#dae2fd]' : 'border-slate-200 bg-white text-slate-800'
    }`}>
      {/* Workflow Navigation Rail */}
      <div className={`border-b px-3 py-2 flex items-center justify-between ${
        isDark ? 'border-[#1e293b] bg-[#0d1527]' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className={`flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider ${
          isDark ? 'text-[#908fa0]' : 'text-slate-500'
        }`}>
          <Sliders className="w-3.5 h-3.5 text-[#8083ff]" />
          <span>Studio Workflow</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveWorkflowTab('convert')}
            className={`p-1.5 rounded-md transition-colors ${
              activeWorkflowTab === 'convert'
                ? isDark ? 'bg-[#222a3d] text-[#c0c1ff]' : 'bg-indigo-50 text-indigo-600 shadow-xs border border-indigo-200/50'
                : isDark ? 'text-[#908fa0] hover:text-[#dae2fd] hover:bg-[#171f33]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Convert & Files"
          >
            <FileUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveWorkflowTab('appearance')}
            className={`p-1.5 rounded-md transition-colors ${
              activeWorkflowTab === 'appearance'
                ? isDark ? 'bg-[#222a3d] text-[#c0c1ff]' : 'bg-indigo-50 text-indigo-600 shadow-xs border border-indigo-200/50'
                : isDark ? 'text-[#908fa0] hover:text-[#dae2fd] hover:bg-[#171f33]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Appearance & Binding"
          >
            <BookMarked className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (hasUploaded) setActiveWorkflowTab('export');
            }}
            disabled={!hasUploaded}
            className={`p-1.5 rounded-md transition-colors ${
              !hasUploaded
                ? 'opacity-35 cursor-not-allowed text-slate-400'
                : activeWorkflowTab === 'export'
                  ? isDark ? 'bg-[#222a3d] text-[#c0c1ff]' : 'bg-indigo-50 text-indigo-600 shadow-xs border border-indigo-200/50'
                  : isDark ? 'text-[#908fa0] hover:text-[#dae2fd] hover:bg-[#171f33]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={hasUploaded ? 'Export Packages' : 'Upload a PDF first to unlock export'}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Workflow Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {activeWorkflowTab === 'convert' && (
          <>
            {/* Source Document Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#dae2fd]' : 'text-slate-800'}`}>
                  Source Document
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  isDark ? 'bg-[#171f33] text-[#8083ff] border-[#2d3449]' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  PDF
                </span>
              </div>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (file) onTriggerUpload(file);
              }}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all group ${
                isConverting
                  ? 'border-[#8083ff] bg-indigo-500/10 pointer-events-none'
                  : isDark
                    ? 'border-[#222a3d] hover:border-[#8083ff]/60 bg-[#131b2e]/60 hover:bg-[#171f33]/80'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-slate-100/90'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.epub,.ai"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto text-[#8083ff] transition-colors mb-2.5 ${
                isDark ? 'bg-[#1e293b] group-hover:bg-[#8083ff]/20' : 'bg-slate-200/80 group-hover:bg-indigo-100'
              }`}>
                {isConverting ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#8083ff]" />
                ) : (
                  <UploadCloud className="w-5 h-5" />
                )}
              </div>
              <div className={`text-xs font-medium ${isDark ? 'text-[#dae2fd]' : 'text-slate-800'}`}>
                {isConverting ? (
                  <span className="text-[#8083ff] font-semibold">Converting PDF to 3D Booklet...</span>
                ) : (
                  <>Drop your PDF here, or <span className="text-[#8083ff] underline underline-offset-2">Browse files</span></>
                )}
              </div>
              <div className={`text-[11px] mt-1 ${isDark ? 'text-[#908fa0]' : 'text-slate-500'}`}>
                High-res vector PDFs, EPUB, AI up to 250MB. Auto-split double spreads active.
              </div>
            </div>

            {/* File info card */}
            {hasUploaded ? (
              <div className={`border rounded-xl p-3.5 space-y-3 shadow-md ${
                isDark ? 'bg-[#171f33] border-[#222a3d]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[#8083ff] shrink-0 border ${
                      isDark ? 'bg-[#222a3d] border-[#2d3449]' : 'bg-white border-slate-200 shadow-2xs'
                    }`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`text-xs font-semibold max-w-[200px] truncate ${isDark ? 'text-[#dae2fd]' : 'text-slate-900'}`} title={settings.fileName}>
                        {settings.fileName}
                      </div>
                      <div className={`text-[11px] mt-0.5 ${isDark ? 'text-[#908fa0]' : 'text-slate-500'}`}>
                        {settings.fileSizeMb} MB • 24 Pages parsed • {settings.dpi} DPI
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      title="Replace / Upload new file"
                      className={`p-1 rounded transition-colors ${
                        isDark ? 'text-[#908fa0] hover:text-[#dae2fd] hover:bg-[#222a3d]' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-200/80'
                      }`}
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={onResetDocument}
                      title="Clear Document"
                      className={`p-1 rounded transition-colors ${
                        isDark ? 'text-[#908fa0] hover:text-[#ffb4ab] hover:bg-[#222a3d]' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress & State */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className={`flex items-center space-x-1.5 ${isDark ? 'text-[#7bd0ff]' : 'text-sky-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#7bd0ff]' : 'bg-sky-500'}`} />
                      <span>Ready for 3D render</span>
                    </div>
                    <span className={`font-mono ${isDark ? 'text-[#908fa0]' : 'text-slate-400'}`}>100% processed</span>
                  </div>
                  <div className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-[#222a3d]' : 'bg-slate-200'}`}>
                    <div className="h-full bg-gradient-to-r from-[#494bd6] to-[#7bd0ff] rounded-full w-full" />
                  </div>
                </div>
              </div>
            ) : (
              <div className={`border border-dashed rounded-xl p-3.5 text-center text-xs space-y-1 ${
                isDark ? 'bg-[#131b2e] border-[#222a3d] text-[#908fa0]' : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <div className={`font-medium ${isDark ? 'text-[#c0c1ff]' : 'text-indigo-600'}`}>No Booklet Converted Yet</div>
                <div className="text-[11px]">Upload a PDF above to convert it into a 3D digital booklet.</div>
              </div>
            )}

            {/* Binding & Cover Style */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookMarked className="w-4 h-4 text-[#8083ff]" />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#dae2fd]' : 'text-slate-800'}`}>
                    Binding & Cover Style
                  </span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  isDark ? 'text-[#c0c1ff] bg-[#222a3d] border-[#2d3449]' : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                }`}>
                  {settings.coverType}
                </span>
              </div>

              {/* Cover Type 2x2 Grid */}
              <div>
                <label className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 block ${
                  isDark ? 'text-[#908fa0]' : 'text-slate-500'
                }`}>
                  Cover Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {coverOptions.map((opt) => {
                    const isSelected = settings.coverType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => updateSettings({ coverType: opt.id })}
                        className={`p-2.5 rounded-lg border text-left flex items-start space-x-2.5 transition-all ${
                          isSelected
                            ? isDark
                              ? 'bg-[#1e293b] border-[#8083ff] ring-1 ring-[#8083ff]/40 shadow-sm'
                              : 'bg-indigo-50/80 border-indigo-500 ring-1 ring-indigo-400 shadow-xs'
                            : isDark
                              ? 'bg-[#131b2e] border-[#222a3d] hover:bg-[#171f33] hover:border-[#2d3449]'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-[#494bd6] text-white'
                              : isDark ? 'bg-[#222a3d] text-[#908fa0]' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {opt.code}
                        </div>
                        <div>
                          <div className={`text-xs font-semibold ${isDark ? 'text-[#dae2fd]' : 'text-slate-900'}`}>
                            {opt.label}
                          </div>
                          <div className={`text-[10px] ${isDark ? 'text-[#908fa0]' : 'text-slate-500'}`}>
                            {opt.sub}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Board Thickness Slider */}
              <div className={`space-y-1.5 p-3 rounded-lg border ${
                isDark ? 'bg-[#131b2e] border-[#222a3d]' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${isDark ? 'text-[#908fa0]' : 'text-slate-600'}`}>Board Thickness</span>
                  <span className={`font-mono font-semibold px-2 py-0.5 rounded border ${
                    isDark ? 'text-[#c0c1ff] bg-[#171f33] border-[#222a3d]' : 'text-indigo-700 bg-white border-slate-200 shadow-2xs'
                  }`}>
                    {settings.boardThicknessMm.toFixed(1)} <span className={`text-[10px] ${isDark ? 'text-[#908fa0]' : 'text-slate-400'}`}>mm</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="14.0"
                  step="0.5"
                  value={settings.boardThicknessMm}
                  onChange={(e) => updateSettings({ boardThicknessMm: parseFloat(e.target.value) })}
                  className="w-full accent-[#8083ff] bg-slate-300 h-1.5 rounded-lg cursor-pointer"
                />
                <div className={`flex items-center justify-between text-[10px] ${isDark ? 'text-[#908fa0]' : 'text-slate-400'}`}>
                  <span>4mm Slim</span>
                  <span className={`font-medium ${isDark ? 'text-[#7bd0ff]' : 'text-indigo-600'}`}>Spine Rigid</span>
                  <span>14mm Heavy</span>
                </div>
              </div>

              {/* Surface Sheen & Finish */}
              <div className="space-y-1.5">
                <label className={`text-[10px] font-semibold uppercase tracking-wider block ${
                  isDark ? 'text-[#908fa0]' : 'text-slate-500'
                }`}>
                  Surface Sheen & Finish
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {sheenOptions.map((s) => {
                    const isSelected = settings.sheen === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => updateSettings({ sheen: s.id })}
                        className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden group ${
                          isSelected
                            ? isDark
                              ? 'bg-[#1e293b] border-[#8083ff] text-[#dae2fd] ring-1 ring-[#8083ff]/40 shadow-sm'
                              : 'bg-indigo-50 border-indigo-400 text-indigo-950 font-semibold ring-1 ring-indigo-400 shadow-2xs'
                            : isDark
                              ? 'bg-[#131b2e] border-[#222a3d] text-[#908fa0] hover:text-[#dae2fd] hover:bg-[#171f33]'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${s.previewClass}`} />
                          <span className={`text-xs font-semibold truncate ${
                            isSelected
                              ? isDark ? 'text-[#dae2fd]' : 'text-indigo-950'
                              : isDark ? 'text-[#dae2fd]' : 'text-slate-800'
                          }`}>
                            {s.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pl-5">
                          <span className={`text-[10px] ${
                            isSelected
                              ? isDark ? 'text-[#c0c1ff]' : 'text-indigo-700 font-medium'
                              : isDark ? 'text-[#908fa0]' : 'text-slate-400'
                          }`}>
                            {s.sub}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#8083ff] shrink-0 ml-1" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                {/* Rounded Corners */}
                <div className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                  isDark ? 'bg-[#131b2e] border-[#222a3d]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <div className={`text-xs font-medium ${isDark ? 'text-[#dae2fd]' : 'text-slate-900'}`}>
                      Rounded Book Corners
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-[#908fa0]' : 'text-slate-500'}`}>
                      Smooth 3.5mm die-cut corner radius
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSettings({ roundedCorners: !settings.roundedCorners })}
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                      settings.roundedCorners ? 'bg-[#494bd6]' : isDark ? 'bg-[#222a3d]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                        settings.roundedCorners ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Interactive Hyperlinks */}
                <div className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                  isDark ? 'bg-[#131b2e] border-[#222a3d]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <div className={`text-xs font-medium ${isDark ? 'text-[#dae2fd]' : 'text-slate-900'}`}>
                      Interactive Hyperlinks Preservation
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-[#908fa0]' : 'text-slate-500'}`}>
                      Extract vector clickable URLs to reader overlays
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSettings({ preserveHyperlinks: !settings.preserveHyperlinks })}
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                      settings.preserveHyperlinks ? 'bg-[#494bd6]' : isDark ? 'bg-[#222a3d]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                        settings.preserveHyperlinks ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Double Click Smart Zoom */}
                <div className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                  isDark ? 'bg-[#131b2e] border-[#222a3d]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <div className={`text-xs font-medium ${isDark ? 'text-[#dae2fd]' : 'text-slate-900'}`}>
                      Double Click Smart Zoom
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-[#908fa0]' : 'text-slate-500'}`}>
                      Smooth focal zoom into page column on click
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSettings({ doubleClickZoom: !settings.doubleClickZoom })}
                    className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                      settings.doubleClickZoom ? 'bg-[#494bd6]' : isDark ? 'bg-[#222a3d]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                        settings.doubleClickZoom ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeWorkflowTab === 'appearance' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-[#8083ff]" />
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#dae2fd]' : 'text-slate-800'}`}>
                Tactile Appearance & Materials
              </h3>
            </div>

            <div className={`p-3.5 rounded-xl border space-y-3 transition-colors ${
              isDark ? 'bg-[#171f33] border-[#222a3d]' : 'bg-slate-50 border-slate-200'
            }`}>
              <label className={`text-xs font-medium block ${isDark ? 'text-[#dae2fd]' : 'text-slate-800'}`}>
                Paper Caliper & Weight
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['115 gsm (Satin)', '150 gsm (Art)', '220 gsm (Heavy)'].map((weight, idx) => (
                  <button
                    key={weight}
                    onClick={() => alert(`Paper weight set to ${weight}`)}
                    className={`p-2 text-[11px] text-center rounded-lg border transition-colors ${
                      idx === 1
                        ? isDark ? 'bg-[#1e293b] border-[#8083ff] text-white' : 'bg-indigo-50 border-indigo-400 text-indigo-900 font-semibold'
                        : isDark
                          ? 'bg-[#131b2e] border-[#222a3d] text-[#908fa0] hover:text-[#dae2fd]'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {weight}
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border space-y-3 transition-colors ${
              isDark ? 'bg-[#171f33] border-[#222a3d]' : 'bg-slate-50 border-slate-200'
            }`}>
              <label className={`text-xs font-medium block ${isDark ? 'text-[#dae2fd]' : 'text-slate-800'}`}>
                Ambient Lighting Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Studio Daylight (5500K)', icon: '☀️' },
                  { name: 'Warm Gallery (2800K)', icon: '🕯️' },
                  { name: 'Architectural Uplight', icon: '💡' },
                  { name: 'Dark Monolith', icon: '🌑' },
                ].map((mode, idx) => (
                  <button
                    key={mode.name}
                    onClick={() => alert(`Lighting mode active: ${mode.name}`)}
                    className={`p-2.5 text-left text-xs rounded-lg border transition-colors flex items-center space-x-2 ${
                      idx === 0
                        ? isDark ? 'bg-[#1e293b] border-[#8083ff] text-white' : 'bg-indigo-50 border-indigo-400 text-indigo-900 font-semibold'
                        : isDark
                          ? 'bg-[#131b2e] border-[#222a3d] text-[#908fa0] hover:text-[#dae2fd]'
                          : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{mode.icon}</span>
                    <span className="text-[11px] font-medium">{mode.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border space-y-3 transition-colors ${
              isDark ? 'bg-[#171f33] border-[#222a3d]' : 'bg-slate-50 border-slate-200'
            }`}>
              <label className={`text-xs font-medium block ${isDark ? 'text-[#dae2fd]' : 'text-slate-800'}`}>
                Page Sound Effects
              </label>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] ${isDark ? 'text-[#908fa0]' : 'text-slate-500'}`}>
                  Web Audio paper flutter & turn friction
                </span>
                <button
                  type="button"
                  onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                    settings.soundEnabled ? 'bg-[#494bd6]' : isDark ? 'bg-[#222a3d]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                      settings.soundEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeWorkflowTab === 'export' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4 text-[#8083ff]" />
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#dae2fd]' : 'text-slate-800'}`}>
                Distribution & Export Packages
              </h3>
            </div>
            {!hasUploaded ? (
              <div className={`p-5 rounded-xl border border-dashed text-center space-y-2 ${
                isDark ? 'bg-[#131b2e]/60 border-[#222a3d] text-[#908fa0]' : 'bg-slate-50 border-slate-300 text-slate-500'
              }`}>
                <div className={`text-xs font-semibold ${isDark ? 'text-[#c0c1ff]' : 'text-indigo-600'}`}>
                  Document Upload Required
                </div>
                <div className="text-[11px] leading-relaxed">
                  Upload a PDF first in the Convert tab to generate export packages.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={onOpenExportModal}
                  className={`w-full p-3 rounded-xl text-left transition-colors flex items-center justify-between border ${
                    isDark
                      ? 'bg-[#171f33] hover:bg-[#222a3d] border-[#2d3449]'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className={`text-xs font-semibold ${isDark ? 'text-[#dae2fd]' : 'text-slate-900'}`}>
                      Download Offline Flipbook (HTML5)
                    </div>
                    <div className={`text-[11px] ${isDark ? 'text-[#908fa0]' : 'text-slate-500'}`}>
                      Self-contained package playable without internet
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#8083ff]" />
                </button>
                <button
                  onClick={onOpenExportModal}
                  className={`w-full p-3 rounded-xl text-left transition-colors flex items-center justify-between border ${
                    isDark
                      ? 'bg-[#171f33] hover:bg-[#222a3d] border-[#2d3449]'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className={`text-xs font-semibold ${isDark ? 'text-[#dae2fd]' : 'text-slate-900'}`}>
                      Vector PDF / Image Pack
                    </div>
                    <div className={`text-[11px] ${isDark ? 'text-[#908fa0]' : 'text-slate-500'}`}>
                      Interactive PDF with table of contents or high-res 300 DPI spreads
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#7bd0ff]" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Left Sidebar Footer */}
      <div className={`border-t p-3 space-y-2 transition-colors ${
        isDark ? 'border-[#1e293b] bg-[#0d1527]' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className={`flex items-center justify-between text-[11px] px-1 ${
          isDark ? 'text-[#908fa0]' : 'text-slate-500'
        }`}>
          <span className="flex items-center space-x-1.5 text-emerald-500 font-medium">
            <Lock className="w-3 h-3" />
            <span>Local Browser Sandbox</span>
          </span>
          <span className="font-mono text-[10px]">No Cloud Storage</span>
        </div>

        {/* Footer actions */}
        <div className={`flex items-center justify-between pt-1 border-t ${
          isDark ? 'border-[#1e293b]/60' : 'border-slate-200'
        }`}>
          <button 
            onClick={() => alert('FlipCraft Studio: High-performance client-side WebGL 3D flipbook renderer. No cloud storage is used.')}
            className={`flex items-center space-x-1.5 text-xs transition-colors ${
              isDark ? 'text-[#908fa0] hover:text-[#dae2fd]' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help & Docs</span>
          </button>
          <button
            onClick={onOpenCommandPalette}
            className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors ${
              isDark
                ? 'bg-[#171f33] hover:bg-[#222a3d] border-[#2d3449] text-[#908fa0] hover:text-[#dae2fd]'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
            }`}
          >
            <Command className="w-3 h-3" />
            <span>K</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
