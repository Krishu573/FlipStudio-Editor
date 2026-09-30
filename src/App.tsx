/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SAMPLE_PAGES, PRESETS } from './data/sampleCatalog';
import { 
  BookSettings, 
  FlipbookPreset, 
  PageData, 
  ViewMode, 
  WorkflowTab,
  CoverType,
  SurfaceSheen,
} from './types/flipbook';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { LeftSidebar } from './components/LeftSidebar';
import { Flipbook3D } from './components/Flipbook3D';
import { SecurityCautionModal } from './components/SecurityCautionModal';
import { ThumbnailGridModal } from './components/ThumbnailGridModal';
import { TableOfContentsDrawer } from './components/TableOfContentsDrawer';
import { ExportModal } from './components/ExportModal';
import { CommandPalette } from './components/CommandPalette';
import { audioEngine } from './utils/audio';
import { convertUploadedFileToPages } from './utils/pdfRenderer';
import { useSupabaseProfile } from './lib/supabase';

export default function App() {
  const [pages, setPages] = useState<PageData[]>(SAMPLE_PAGES);

  // Supabase User Profile State
  const { 
    profile: userProfile, 
    loading: loadingProfile, 
    refreshProfile, 
    updateProfile 
  } = useSupabaseProfile();

  // When a user arrives, there is no booklet open and no sample load option
  const [hasUploaded, setHasUploaded] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  // Caution sign will only appear at the middle of screen after the user uploads their PDF
  const [showSecurityNotice, setShowSecurityNotice] = useState<boolean>(false);

  // Settings matching the studio configuration
  const [settings, setSettings] = useState<BookSettings>({
    title: 'Annual Product Catalog 2025',
    fileName: 'Annual_Product_Catalog_2025.pdf',
    fileSizeMb: 18.4,
    dpi: 300,
    coverType: 'hardcover',
    boardThicknessMm: 8.0,
    sheen: 'matte',
    roundedCorners: true,
    preserveHyperlinks: true,
    doubleClickZoom: true,
    spreadMode: 'double',
    perspectiveTilt: 42,
    soundEnabled: true,
    autoPlayInterval: 4.5,
  });

  // Current spread index: 6 corresponds to Pages 12 & 13 (The Art of Tactile Design)
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState<number>(6);
  const [activePreset, setActivePreset] = useState<FlipbookPreset>(PRESETS[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<WorkflowTab>('convert');
  const [activeNavTab, setActiveNavTab] = useState<'editor' | 'templates'>('editor');
  const [zoom, setZoom] = useState<number>(1.0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Synchronize theme with document element and body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.classList.add('light');
    }
  }, [theme]);

  // Modals & drawers state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState(false);
  const [isTOCOpen, setIsTOCOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const updateSettings = (partial: Partial<BookSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleSelectPreset = (preset: FlipbookPreset) => {
    setActivePreset(preset);
    updateSettings({
      coverType: preset.coverType,
      boardThicknessMm: preset.boardThicknessMm,
      sheen: preset.sheen,
      roundedCorners: preset.roundedCorners,
      perspectiveTilt: preset.perspectiveTilt,
    });
  };

  // Convert PDF to 3D booklet and then show + trigger caution modal
  const handleTriggerUpload = async (file?: File) => {
    setIsConverting(true);
    if (file) {
      try {
        const result = await convertUploadedFileToPages(file);
        setPages(result.pages);
        updateSettings({
          fileName: file.name,
          fileSizeMb: result.fileSizeMb,
          title: result.title,
        });
      } catch (err) {
        console.error('Failed to convert PDF into booklet:', err);
      }
    }

    // Smooth conversion computation timeline
    setTimeout(() => {
      setIsConverting(false);
      setHasUploaded(true);
      setCurrentSpreadIndex(0); // Show cover of converted document
      // After uploading there is a caution sign at the middle of screen
      setShowSecurityNotice(true);
    }, 900);
  };

  const handleResetDocument = () => {
    setHasUploaded(false);
    setShowSecurityNotice(false);
    setCurrentSpreadIndex(0);
    updateSettings({
      fileName: 'No document uploaded',
      title: 'Awaiting Upload',
      fileSizeMb: 0,
    });
  };

  // Jump to specific page
  const handleSelectPage = (pageNum: number) => {
    if (pageNum === 1) {
      setCurrentSpreadIndex(0);
    } else if (pageNum >= pages.length) {
      const lastSpread = Math.ceil((pages.length - 2) / 2) + 1;
      setCurrentSpreadIndex(lastSpread);
    } else {
      const spreadIdx = Math.floor(pageNum / 2);
      setCurrentSpreadIndex(spreadIdx);
    }
  };

  // Toggle preview only mode (shows only the 3D booklet, hides editor sidebar)
  const handleTogglePreviewOnly = () => {
    setViewMode((prev) => (prev === 'preview' ? 'split' : 'preview'));
  };

  // Navigation tab switcher
  const handleNavTabClick = (tab: 'editor' | 'templates') => {
    setActiveNavTab(tab);
    if (tab === 'editor') {
      setViewMode('split');
    } else if (tab === 'templates') {
      const nextIdx = (PRESETS.findIndex(p => p.id === activePreset.id) + 1) % PRESETS.length;
      handleSelectPreset(PRESETS[nextIdx]);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-['Inter'] ${theme === 'dark' ? 'bg-[#0b1326] text-[#dae2fd]' : 'bg-[#f8fafc] text-[#0f172a]'}`}>
      {/* Studio Top Header */}
      <Header
        settings={settings}
        pageCount={pages.length}
        activeNavTab={activeNavTab}
        setActiveNavTab={handleNavTabClick}
        onOpenExportModal={() => hasUploaded && setIsExportModalOpen(true)}
        theme={theme}
        setTheme={setTheme}
        hasUploaded={hasUploaded}
        userProfile={userProfile}
        onUpdateProfile={updateProfile}
        onRefreshProfile={refreshProfile}
      />

      {/* Secondary Workflow Toolbar */}
      <Toolbar
        presets={PRESETS}
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
        zoom={zoom}
        setZoom={setZoom}
        onResetZoom={() => setZoom(1.0)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        theme={theme}
      />

      {/* Studio Workspace Main Stage */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Only visible in Split mode, completely hidden in Preview Only) */}
        {viewMode !== 'preview' && (
          <LeftSidebar
            settings={settings}
            updateSettings={updateSettings}
            activeWorkflowTab={activeWorkflowTab}
            setActiveWorkflowTab={setActiveWorkflowTab}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenExportModal={() => hasUploaded && setIsExportModalOpen(true)}
            hasUploaded={hasUploaded}
            isConverting={isConverting}
            onTriggerUpload={handleTriggerUpload}
            onResetDocument={handleResetDocument}
            theme={theme}
            userProfile={userProfile}
            loadingProfile={loadingProfile}
            onUpdateProfile={updateProfile}
            onRefreshProfile={refreshProfile}
          />
        )}

        {/* Central 3D Flipbook Stage (Clear before upload, converts, then shows booklet) */}
        <Flipbook3D
          pages={pages}
          currentSpreadIndex={currentSpreadIndex}
          onSpreadChange={setCurrentSpreadIndex}
          settings={settings}
          updateSettings={updateSettings}
          zoom={zoom}
          setZoom={setZoom}
          onOpenThumbnails={() => setIsThumbnailsOpen(true)}
          onOpenTOC={() => setIsTOCOpen(true)}
          hasUploaded={hasUploaded}
          isConverting={isConverting}
          onTriggerUpload={handleTriggerUpload}
          theme={theme}
        />
      </main>

      {/* Prominent Caution Modal at Center of Screen After Upload */}
      <SecurityCautionModal
        isOpen={showSecurityNotice}
        onClose={() => setShowSecurityNotice(false)}
        fileName={settings.fileName}
        theme={theme}
      />

      {/* Modals & Slide-over Drawers */}
      <ThumbnailGridModal
        isOpen={isThumbnailsOpen}
        onClose={() => setIsThumbnailsOpen(false)}
        pages={pages}
        currentSpreadIndex={currentSpreadIndex}
        onSelectPage={handleSelectPage}
        theme={theme}
      />

      <TableOfContentsDrawer
        isOpen={isTOCOpen}
        onClose={() => setIsTOCOpen(false)}
        pages={pages}
        onSelectPage={handleSelectPage}
        theme={theme}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        settings={settings}
        theme={theme}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectPage={handleSelectPage}
        onSetCoverType={(coverType: CoverType) => updateSettings({ coverType })}
        onSetSheen={(sheen: SurfaceSheen) => updateSettings({ sheen })}
        onOpenExport={() => hasUploaded && setIsExportModalOpen(true)}
        onToggleSound={() => {
          const nextVal = !settings.soundEnabled;
          updateSettings({ soundEnabled: nextVal });
          audioEngine.setMuted(!nextVal);
        }}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        theme={theme}
        hasUploaded={hasUploaded}
      />
    </div>
  );
}
