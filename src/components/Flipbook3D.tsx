import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Grid, 
  List, 
  Rotate3d, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Tag, 
  UploadCloud, 
  Loader2, 
  Lock, 
  Layers, 
  ShieldCheck,
  Minus,
  Plus,
  Sparkles
} from 'lucide-react';
import { BookSettings, PageData, Hotspot } from '../types/flipbook';
import { audioEngine } from '../utils/audio';

interface Flipbook3DProps {
  pages: PageData[];
  currentSpreadIndex: number; // 0-based spread index (e.g. 0 = cover, 6 = pages 12-13)
  onSpreadChange: (newIndex: number) => void;
  settings: BookSettings;
  updateSettings: (partial: Partial<BookSettings>) => void;
  zoom: number;
  setZoom?: (updater: number | ((prev: number) => number)) => void;
  onOpenThumbnails: () => void;
  onOpenTOC: () => void;
  onToggleFullscreen?: () => void;
  hasUploaded: boolean;
  isConverting: boolean;
  onTriggerUpload: (file?: File) => void;
  theme?: 'dark' | 'light';
}

export const Flipbook3D: React.FC<Flipbook3DProps> = ({
  pages,
  currentSpreadIndex,
  onSpreadChange,
  settings,
  updateSettings,
  zoom,
  setZoom,
  onOpenThumbnails,
  onOpenTOC,
  onToggleFullscreen,
  hasUploaded,
  isConverting,
  onTriggerUpload,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [flipAngle, setFlipAngle] = useState(0); // 0 to 180 degrees
  const [autoPlay, setAutoPlay] = useState(false);
  const [isTiltActive, setIsTiltActive] = useState(false);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [zoomFocal, setZoomFocal] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Zoom pan state & grab hand navigation
  const isEffectiveZoomed = isZoomedIn || zoom > 1.05;
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number } | null>(null);
  const hasMovedRef = useRef<boolean>(false);

  // Reset pan when leaving zoom
  useEffect(() => {
    if (!isEffectiveZoomed) {
      setPan({ x: 0, y: 0 });
    }
  }, [isEffectiveZoomed]);

  // Real-time WebGL/Canvas FPS counter after upload
  const [fps, setFps] = useState<number>(60);

  useEffect(() => {
    if (!hasUploaded) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const measureFps = (currentTime: number) => {
      frameCount++;
      const elapsed = currentTime - lastTime;
      if (elapsed >= 500) {
        const calculatedFps = Math.min(240, Math.round((frameCount * 1000) / elapsed));
        setFps(calculatedFps);
        frameCount = 0;
        lastTime = currentTime;
      }
      animId = requestAnimationFrame(measureFps);
    };

    animId = requestAnimationFrame(measureFps);
    return () => cancelAnimationFrame(animId);
  }, [hasUploaded]);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageFileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic light reflection glare tracking for physical surface sheen
  const [glarePos, setGlarePos] = useState<{ x: number; y: number }>({ x: 50, y: 35 });

  const handleBookContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setGlarePos({ x, y });
    }
  };

  // Group pages into spreads
  const totalSpreads = Math.ceil((pages.length - 2) / 2) + 2;

  const getPagesForSpread = (spreadIdx: number): { left: PageData | null; right: PageData | null } => {
    if (spreadIdx === 0) {
      // Front Cover
      return { left: null, right: pages[0] || null };
    }
    if (spreadIdx === totalSpreads - 1) {
      // Back Cover
      return { left: pages[pages.length - 1] || null, right: null };
    }
    const leftPageNum = (spreadIdx - 1) * 2 + 2;
    const rightPageNum = leftPageNum + 1;
    const left = pages.find(p => p.pageNumber === leftPageNum) || null;
    const right = pages.find(p => p.pageNumber === rightPageNum) || null;
    return { left, right };
  };

  const currentPages = getPagesForSpread(currentSpreadIndex);

  // Navigation handlers with 3D animation and Web Audio paper sounds
  const handleNext = useCallback(() => {
    if (!hasUploaded || currentSpreadIndex >= totalSpreads - 1 || isFlipping) return;
    setIsFlipping(true);
    setFlipDirection('next');
    if (settings.soundEnabled) {
      audioEngine.playPageTurn(true);
    }

    let progress = 0;
    const startTime = performance.now();
    const duration = 400; // ms

    const animate = (now: number) => {
      progress = Math.min(1, (now - startTime) / duration);
      const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      setFlipAngle(ease * 180);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onSpreadChange(currentSpreadIndex + 1);
        setIsFlipping(false);
        setFlipAngle(0);
      }
    };
    requestAnimationFrame(animate);
  }, [hasUploaded, currentSpreadIndex, totalSpreads, isFlipping, settings.soundEnabled, onSpreadChange]);

  const handlePrev = useCallback(() => {
    if (!hasUploaded || currentSpreadIndex <= 0 || isFlipping) return;
    setIsFlipping(true);
    setFlipDirection('prev');
    if (settings.soundEnabled) {
      audioEngine.playPageTurn(false);
    }

    let progress = 0;
    const startTime = performance.now();
    const duration = 400;

    const animate = (now: number) => {
      progress = Math.min(1, (now - startTime) / duration);
      const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      setFlipAngle(180 - ease * 180);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onSpreadChange(currentSpreadIndex - 1);
        setIsFlipping(false);
        setFlipAngle(0);
      }
    };
    requestAnimationFrame(animate);
  }, [hasUploaded, currentSpreadIndex, isFlipping, settings.soundEnabled, onSpreadChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasUploaded) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        setIsZoomedIn(false);
        setPan({ x: 0, y: 0 });
        setSelectedHotspot(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasUploaded, handleNext, handlePrev]);

  // Slideshow auto-play
  useEffect(() => {
    if (!autoPlay || !hasUploaded) return;
    const interval = setInterval(() => {
      if (currentSpreadIndex < totalSpreads - 1) {
        handleNext();
      } else {
        onSpreadChange(0);
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [autoPlay, hasUploaded, currentSpreadIndex, totalSpreads, handleNext, onSpreadChange]);

  // Grab-to-move pan handlers in zoom mode
  const handleStageMouseDown = (e: React.MouseEvent) => {
    if (!isEffectiveZoomed || e.button !== 0) return;
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };
    hasMovedRef.current = false;
  };

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // If dragging with grab hand, update pan translation
    if (panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      if (Math.hypot(dx, dy) > 3) {
        if (!hasMovedRef.current) {
          hasMovedRef.current = true;
          setIsPanning(true);
        }
        setPan({
          x: panStartRef.current.startPanX + dx,
          y: panStartRef.current.startPanY + dy,
        });
      }
      return;
    }

    // Otherwise handle normal 3D tilt
    handleMouseMove(e);
  };

  const handleStageMouseUp = () => {
    if (panStartRef.current) {
      panStartRef.current = null;
      setIsPanning(false);
    }
  };

  // 3D Canvas mouse tilt interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTiltActive || !containerRef.current || !hasUploaded) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotY(x * 22);
    setRotX(-y * 18);
  };

  const handleMouseLeave = () => {
    handleStageMouseUp();
    if (isTiltActive) {
      setRotX(0);
      setRotY(0);
    }
  };

  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1-Click Page Flip (disambiguated from double-click smart zoom and pan drag)
  const handlePageClick = (direction: 'prev' | 'next', e: React.MouseEvent) => {
    // If the user was dragging/panning to move around with the grab hand, DO NOT flip
    if (hasMovedRef.current) {
      hasMovedRef.current = false;
      return;
    }

    // If clicking on an explicit button, link or hotspot, don't trigger flip
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea, [data-interactive]')) {
      return;
    }

    if (clickTimerRef.current) {
      // Second click arrived within debounce window -> It is a double click! Abort page flip.
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      return;
    }

    // Schedule 1-click flip
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      if (direction === 'prev') {
        handlePrev();
      } else {
        handleNext();
      }
    }, 240);
  };

  // Double click smart zoom (ensures flip is NOT triggered)
  const handleSpreadDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Immediately cancel any pending 1-click flip so double click ONLY zooms
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }

    if (!settings.doubleClickZoom || !hasUploaded) return;
    if (isZoomedIn) {
      setIsZoomedIn(false);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomFocal({ x: xPercent, y: yPercent });
      setIsZoomedIn(true);
    }
  };

  const getPageSpreadLabel = () => {
    if (!hasUploaded) return 'No Document';
    if (currentSpreadIndex === 0) return 'Cover (Page 1)';
    if (currentSpreadIndex === totalSpreads - 1) return `Back Cover (Page ${pages.length})`;
    const leftNum = currentPages.left ? currentPages.left.pageNumber : '';
    const rightNum = currentPages.right ? currentPages.right.pageNumber : '';
    return `Page ${leftNum} - ${rightNum} of ${pages.length}`;
  };

  const getSheenClass = () => {
    switch (settings.sheen) {
      case 'glossy': return 'sheen-glossy';
      case 'linen': return 'sheen-linen';
      case 'gold': return 'sheen-gold';
      case 'matte':
      default:
        return 'sheen-matte';
    }
  };

  const getCoverSheenStyles = () => {
    switch (settings.sheen) {
      case 'glossy': return 'sheen-cover-glossy';
      case 'linen': return 'sheen-cover-linen';
      case 'gold': return 'sheen-cover-gold';
      case 'matte':
      default:
        return 'sheen-cover-matte';
    }
  };

  const renderSurfaceFinishOverlay = (side: 'left' | 'right') => {
    switch (settings.sheen) {
      case 'glossy':
        return (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            {/* Dynamic specular light reflection tracking cursor across page */}
            <div 
              className="absolute inset-0 pointer-events-none transition-opacity duration-200"
              style={{
                background: `radial-gradient(circle 380px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.16) 32%, transparent 68%)`,
                mixBlendMode: 'screen',
              }}
            />
            {/* 45-degree specular sheen glare stripe */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: side === 'left'
                  ? 'linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.08) 42%, rgba(255,255,255,0.3) 48%, rgba(255,255,255,0.06) 54%, transparent 70%)'
                  : 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.3) 56%, rgba(255,255,255,0.08) 62%, transparent 78%)',
                mixBlendMode: 'screen',
              }}
            />
            {/* High gloss glass edge highlight */}
            <div className="absolute inset-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.6),inset_0_-1px_2px_rgba(0,0,0,0.18)] pointer-events-none" />
          </div>
        );

      case 'linen':
        return (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            {/* Visible cross-hatch fabric weave overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-45"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, rgba(30, 41, 59, 0.14) 0px, rgba(30, 41, 59, 0.14) 1px, transparent 1px, transparent 3.5px),
                  repeating-linear-gradient(90deg, rgba(30, 41, 59, 0.14) 0px, rgba(30, 41, 59, 0.14) 1px, transparent 1px, transparent 3.5px)
                `,
                backgroundSize: '3.5px 3.5px',
                mixBlendMode: 'multiply',
              }}
            />
            {/* Subtle fiber grain wash */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(0,0,0,0.04) 50%, rgba(255,255,255,0.08) 100%)',
              }}
            />
            {/* Tactile embossed edge */}
            <div className="absolute inset-0 shadow-[inset_0_0_12px_rgba(120,53,15,0.08)] pointer-events-none" />
          </div>
        );

      case 'gold':
        return (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            {/* Metallic gilded gold edge trim */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 0 2.5px #d97706, inset 0 0 0 4px #fbbf24, inset 0 0 16px rgba(245, 158, 11, 0.35)',
              }}
            />
            {/* Golden iridescent luster gradient */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                background: `radial-gradient(circle 350px at ${glarePos.x}% ${glarePos.y}%, rgba(254, 240, 138, 0.75) 0%, rgba(245, 158, 11, 0.35) 40%, rgba(217, 119, 6, 0.08) 75%, transparent 100%)`,
                mixBlendMode: 'color-dodge',
              }}
            />
            {/* Diagonal gold foil sheen shimmer */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-45"
              style={{
                background: 'linear-gradient(125deg, transparent 20%, rgba(251, 191, 36, 0.28) 42%, rgba(254, 240, 138, 0.55) 48%, rgba(245, 158, 11, 0.28) 54%, transparent 75%)',
                mixBlendMode: 'color-dodge',
              }}
            />
            {/* Corner ornate foil brackets */}
            <div className={`absolute top-2 ${side === 'left' ? 'left-2' : 'right-2'} w-3 h-3 border-t-2 ${side === 'left' ? 'border-l-2' : 'border-r-2'} border-[#d97706] opacity-80`} />
            <div className={`absolute bottom-2 ${side === 'left' ? 'left-2' : 'right-2'} w-3 h-3 border-b-2 ${side === 'left' ? 'border-l-2' : 'border-r-2'} border-[#d97706] opacity-80`} />
          </div>
        );

      case 'matte':
      default:
        return (
          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            {/* Velvet non-reflective diffuse vignette */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.06) 100%)',
                mixBlendMode: 'multiply',
              }}
            />
            {/* Fine microscopic paper tooth */}
            <div className="absolute inset-0 shadow-[inset_0_0_8px_rgba(0,0,0,0.06)] pointer-events-none" />
          </div>
        );
    }
  };

  const renderPageContent = (page: PageData | null, side: 'left' | 'right') => {
    if (!page) {
      return (
        <div className="w-full h-full bg-[#171f33]/40 flex items-center justify-center text-[#908fa0] text-xs font-mono">
          [Blank Inside Cover]
        </div>
      );
    }

    const roundedCornerStyle = settings.roundedCorners
      ? side === 'left'
        ? 'rounded-l-sm'
        : 'rounded-r-sm'
      : '';

    // If page is a real rendered PDF page from uploaded file
    if (page.pdfPageImage) {
      return (
        <div 
          className={`relative w-full h-full bg-white flex items-center justify-center overflow-hidden ${roundedCornerStyle} ${getSheenClass()}`}
          style={{
            boxShadow: side === 'left' 
              ? 'inset -14px 0 24px -8px rgba(0,0,0,0.22)' 
              : 'inset 14px 0 24px -8px rgba(0,0,0,0.22)',
          }}
        >
          <img 
            src={page.pdfPageImage} 
            alt={`Page ${page.pageNumber}`} 
            className="w-full h-full object-contain pointer-events-none select-none bg-white"
          />
          {/* Subtle paper grain texture */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#00000008_1px,transparent_1px)] [background-size:8px_8px]" />

          {/* Active Physical Surface Sheen & Finish Layer */}
          {renderSurfaceFinishOverlay(side)}

          {/* Spine shadow overlay */}
          {side === 'left' ? (
            <div className="absolute top-0 right-0 bottom-0 w-10 pointer-events-none spine-shadow-left z-20" />
          ) : (
            <div className="absolute top-0 left-0 bottom-0 w-10 pointer-events-none spine-shadow-right z-20" />
          )}

          {/* Subtle corner page indicator */}
          <div className={`absolute bottom-2.5 ${side === 'left' ? 'left-3' : 'right-3'} px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] font-mono font-semibold text-white/95 shadow-sm z-30`}>
            {page.pageNumber}
          </div>
        </div>
      );
    }

    return (
      <div 
        className={`relative w-full h-full bg-white text-[#0f172a] p-7 md:p-8 flex flex-col justify-between overflow-hidden ${roundedCornerStyle} ${getSheenClass()}`}
        style={{
          boxShadow: side === 'left' 
            ? 'inset -12px 0 20px -8px rgba(0,0,0,0.18)' 
            : 'inset 12px 0 20px -8px rgba(0,0,0,0.18)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#00000008_1px,transparent_1px)] [background-size:8px_8px]" />

        {/* Active Physical Surface Sheen & Finish Layer */}
        {renderSurfaceFinishOverlay(side)}

        {side === 'left' ? (
          <div className="absolute top-0 right-0 bottom-0 w-8 pointer-events-none spine-shadow-left z-20" />
        ) : (
          <div className="absolute top-0 left-0 bottom-0 w-8 pointer-events-none spine-shadow-right z-20" />
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-[#0f172a]/10 pb-2.5 text-[10px] tracking-wider uppercase font-semibold text-[#64748b]">
          <div className="flex items-center space-x-2">
            <span>{page.kicker || page.chapter || 'FLIPCRAFT EDITORIAL'}</span>
            {page.category && (
              <>
                <span className="text-[#cbd5e1]">•</span>
                <span className="text-[#494bd6] font-bold">{page.category}</span>
              </>
            )}
          </div>
          <span className="font-mono text-[9px] text-[#94a3b8]">VOL. 04</span>
        </div>

        {/* Page Body */}
        <div className="flex-1 my-4 flex flex-col justify-center relative">
          {page.layout === 'cover' && (
            <div className="h-full flex flex-col justify-between py-2 text-center">
              <div className="text-[11px] uppercase tracking-widest text-[#64748b] font-bold">
                {page.kicker}
              </div>
              <div className="my-auto space-y-4">
                <div className="w-16 h-1 bg-[#494bd6] mx-auto rounded-full" />
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] font-['Plus_Jakarta_Sans'] tracking-tight leading-tight">
                  {page.title}
                </h1>
                <p className="text-xs md:text-sm text-[#475569] max-w-xs mx-auto leading-relaxed">
                  {page.subtitle}
                </p>
                {page.imageUrl && (
                  <div className="relative mt-4 rounded-lg overflow-hidden border border-[#e2e8f0] shadow-sm max-h-[160px] md:max-h-[200px]">
                    <img
                      src={page.imageUrl}
                      alt={page.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-2 bg-black/60 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded">
                      {page.imageCaption}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-[10px] text-[#94a3b8] uppercase font-mono tracking-widest">
                EDITION 2025 • ALL RIGHTS RESERVED
              </div>
            </div>
          )}

          {page.layout === 'editorial' && (
            <div className="space-y-3.5 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#0f172a] font-['Plus_Jakarta_Sans'] tracking-tight">
                  {page.title}
                </h2>
                {page.subtitle && (
                  <p className="text-xs text-[#64748b] mt-1 font-medium italic">
                    {page.subtitle}
                  </p>
                )}
              </div>

              {page.bodyText && (
                <p className="text-xs text-[#334155] leading-relaxed whitespace-pre-line">
                  {page.bodyText}
                </p>
              )}

              {page.imageUrl && (
                <div className="relative rounded-lg overflow-hidden border border-[#e2e8f0] my-2 max-h-[130px] md:max-h-[160px]">
                  <img src={page.imageUrl} alt={page.title} className="w-full h-full object-cover" />
                  {page.imageCaption && (
                    <div className="text-[9px] text-[#64748b] mt-1 italic">
                      {page.imageCaption}
                    </div>
                  )}
                </div>
              )}

              {page.callout && (
                <div className="p-3 bg-[#f8fafc] border-l-2 border-[#494bd6] rounded text-xs italic text-[#1e293b]">
                  {page.callout}
                </div>
              )}

              {page.quote && (
                <div className="my-2 border-y border-[#e2e8f0] py-2.5">
                  <blockquote className="text-xs md:text-sm font-['Playfair_Display'] italic text-[#0f172a]">
                    “{page.quote}”
                  </blockquote>
                  {page.quoteAuthor && (
                    <div className="text-[10px] font-semibold text-[#64748b] mt-1 text-right">
                      — {page.quoteAuthor}
                    </div>
                  )}
                </div>
              )}

              {page.links && (
                <div className="space-y-1 pt-1 border-t border-[#f1f5f9]">
                  <div className="text-[10px] uppercase font-bold text-[#94a3b8] tracking-wider">
                    Quick Chapters:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {page.links.map((link) => (
                      <button
                        key={link.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetSpread = Math.floor((link.targetPage) / 2);
                          onSpreadChange(targetSpread);
                        }}
                        className="text-left text-[11px] text-[#494bd6] hover:underline flex items-center space-x-1"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#494bd6]" />
                        <span className="truncate">{link.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {page.layout === 'chapter-feature' && (
            <div className="space-y-3 h-full flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold text-[#494bd6] tracking-widest uppercase">
                  {page.chapter}
                </div>
                <h2 className="text-xl md:text-2xl font-black text-[#0f172a] font-['Plus_Jakarta_Sans'] tracking-tight mt-0.5">
                  {page.title}
                </h2>
                {page.subtitle && (
                  <p className="text-xs text-[#64748b] mt-0.5 font-medium">
                    {page.subtitle}
                  </p>
                )}
              </div>

              {page.imageUrl && (
                <div className="relative rounded-lg overflow-hidden border border-[#cbd5e1] shadow-sm flex-1 max-h-[170px] md:max-h-[210px] my-1 group">
                  <img
                    src={page.imageUrl}
                    alt={page.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {page.imageBadge && (
                    <div className="absolute top-2 left-2 bg-[#0f172a]/85 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wider">
                      {page.imageBadge}
                    </div>
                  )}
                  {page.imageCaption && (
                    <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[9px] px-2 py-1 rounded">
                      {page.imageCaption}
                    </div>
                  )}

                  {page.hotspots?.map((hs) => (
                    <div
                      key={hs.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHotspot(hs);
                      }}
                      style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group/spot"
                    >
                      <span className="relative flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#494bd6] opacity-75" />
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-[#494bd6] text-white text-[10px] font-bold items-center justify-center shadow-lg border border-white">
                          •
                        </span>
                      </span>

                      <div className="opacity-0 group-hover/spot:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-[#0f172a] text-white p-2 rounded shadow-xl text-left pointer-events-none z-20">
                        <div className="text-[10px] font-bold text-[#c0c1ff]">{hs.title}</div>
                        <div className="text-[9px] text-[#cbd5e1] mt-0.5">{hs.description}</div>
                        {hs.price && (
                          <div className="text-[9px] font-bold text-[#10b981] mt-1">{hs.price}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {page.bodyText && (
                <p className="text-xs text-[#334155] leading-relaxed">
                  {page.bodyText}
                </p>
              )}
            </div>
          )}

          {page.layout === 'gallery' && (
            <div className="space-y-3 h-full flex flex-col justify-between">
              <div className="relative rounded-lg overflow-hidden border border-[#cbd5e1] shadow-sm flex-1 max-h-[220px] md:max-h-[260px] my-1">
                {page.imageUrl && (
                  <img src={page.imageUrl} alt={page.title} className="w-full h-full object-cover" />
                )}
                {page.imageBadge && (
                  <div className="absolute top-2 left-2 bg-[#0f172a]/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wider">
                    {page.imageBadge}
                  </div>
                )}
                {page.imageCaption && (
                  <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[9px] px-2 py-1 rounded">
                    {page.imageCaption}
                  </div>
                )}

                {page.hotspots?.map((hs) => (
                  <div
                    key={hs.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHotspot(hs);
                    }}
                    style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group/spot"
                  >
                    <span className="relative flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#009bd1] opacity-75" />
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-[#009bd1] text-white text-[10px] font-bold items-center justify-center shadow-lg border border-white">
                        +
                      </span>
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-base font-bold text-[#0f172a]">{page.title}</h3>
                <p className="text-xs text-[#64748b]">{page.subtitle}</p>
              </div>
            </div>
          )}

          {page.layout === 'specs' && (
            <div className="space-y-3 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0f172a]">{page.title}</h3>
                <p className="text-xs text-[#64748b]">{page.subtitle}</p>
              </div>
              {page.imageUrl && (
                <div className="rounded-lg overflow-hidden border border-[#e2e8f0] max-h-[140px]">
                  <img src={page.imageUrl} alt={page.title} className="w-full h-full object-cover" />
                </div>
              )}
              {page.bodyText && (
                <p className="text-xs text-[#334155] leading-relaxed">{page.bodyText}</p>
              )}
              {page.callout && (
                <div className="p-2.5 bg-[#f1f5f9] rounded text-[11px] font-mono text-[#0f172a]">
                  {page.callout}
                </div>
              )}
            </div>
          )}

          {page.layout === 'backcover' && (
            <div className="h-full flex flex-col justify-between py-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#494bd6] text-white mx-auto flex items-center justify-center font-bold text-xl shadow-lg">
                FC
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#0f172a] font-['Plus_Jakarta_Sans']">{page.title}</h2>
                <p className="text-xs text-[#64748b]">{page.subtitle}</p>
                <p className="text-[11px] text-[#475569] max-w-xs mx-auto">{page.bodyText}</p>
              </div>
              <div className="space-y-1">
                <div className="w-36 h-10 mx-auto bg-white border border-[#cbd5e1] p-1 flex items-center justify-center">
                  <div className="w-full h-full bg-[repeating-linear-gradient(90deg,#000,#000_2px,transparent_2px,transparent_4px,#000_4px,#000_7px,transparent_7px,transparent_8px)]" />
                </div>
                <div className="text-[9px] font-mono text-[#64748b]">{page.imageCaption}</div>
              </div>
            </div>
          )}
        </div>

        {/* Page Footer */}
        <div className="flex items-center justify-between border-t border-[#0f172a]/10 pt-2 text-[10px] text-[#94a3b8]">
          {side === 'left' ? (
            <>
              <span className="font-mono font-semibold text-[#0f172a]">{page.pageNumber}</span>
              <span className="truncate max-w-[140px] uppercase tracking-wider">{page.title}</span>
            </>
          ) : (
            <>
              <span className="truncate max-w-[140px] uppercase tracking-wider">{page.title}</span>
              <span className="font-mono font-semibold text-[#0f172a]">{page.pageNumber}</span>
            </>
          )}
        </div>
      </div>
    );
  };

  const getCoverBorderThickness = () => {
    switch (settings.coverType) {
      case 'hardcover': return 'p-3 md:p-3.5 bg-[#171b26] ring-1 ring-white/10 rounded-sm shadow-2xl';
      case 'leather': return 'p-3.5 bg-[#2c1d11] border-2 border-dashed border-[#8d5b4c] rounded-md shadow-2xl';
      case 'spiral': return 'p-1.5 bg-[#1e293b] rounded-none shadow-xl';
      case 'paperback':
      default:
        return 'p-1 bg-[#222a3d] rounded-sm shadow-xl';
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDraggingFile) setIsDraggingFile(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingFile(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
          onTriggerUpload(file);
        }
      }}
      className={`flex-1 flex flex-col h-[calc(100vh-100px)] relative overflow-hidden select-none transition-colors duration-200 ${
        isDark ? 'bg-[#090d16] canvas-dot-grid' : 'bg-slate-100 canvas-dot-grid-light'
      }`}
    >
      {/* Drag Over Overlay */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-50 bg-[#494bd6]/30 backdrop-blur-md border-4 border-dashed border-[#8083ff] flex flex-col items-center justify-center pointer-events-none animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-[#1e293b] border border-[#8083ff] flex items-center justify-center text-[#8083ff] shadow-2xl mb-4 animate-bounce">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Drop File to Convert into 3D Booklet</h3>
          <p className="text-xs text-[#dae2fd] mt-1">Accepts PDF, EPUB, and vector formats</p>
        </div>
      )}

      {/* Top Canvas Status Bar */}
      <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className={`pointer-events-auto flex items-center space-x-2 backdrop-blur-md px-3 py-1.5 rounded-full border text-xs shadow-lg transition-colors ${
          isDark ? 'bg-[#131b2e]/85 border-[#222a3d] text-[#dae2fd]' : 'bg-white/95 border-slate-200 text-slate-800 shadow-sm'
        }`}>
          <span className={`w-2 h-2 rounded-full transition-colors ${
            hasUploaded ? 'bg-[#7bd0ff] animate-pulse' : isDark ? 'bg-[#3b455b]' : 'bg-slate-300'
          }`} />
          <span className="font-medium">WebGL 3D Engine</span>
          <span className={isDark ? 'text-[#908fa0]' : 'text-slate-400'}>•</span>
          <span className={`font-mono text-[11px] font-semibold transition-colors ${
            !hasUploaded
              ? isDark ? 'text-[#908fa0]' : 'text-slate-400'
              : fps >= 50
                ? isDark ? 'text-[#7bd0ff]' : 'text-sky-600'
                : fps >= 30
                  ? 'text-amber-500'
                  : 'text-rose-500'
          }`}>
            {hasUploaded ? `${fps} FPS Active` : 'Standby'}
          </span>
          <span className={isDark ? 'text-[#908fa0]' : 'text-slate-400'}>•</span>
          <span className="text-emerald-500 font-medium flex items-center space-x-1">
            <Lock className="w-3 h-3" />
            <span className="text-[10px]">Local Memory</span>
          </span>
          {hasUploaded && (
            <>
              <span className={isDark ? 'text-[#908fa0]' : 'text-slate-400'}>•</span>
              <span className="text-[#8083ff] font-medium flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-[#8083ff]" />
                <span className="text-[10px]">
                  {settings.sheen === 'glossy' ? 'High Gloss UV' : settings.sheen === 'linen' ? 'Linen Bookcloth' : settings.sheen === 'gold' ? 'Gold Foil Hotstamp' : 'Matte Varnish'}
                </span>
              </span>
            </>
          )}
        </div>

        {/* Right Canvas Orbit & View mode */}
        {hasUploaded && (
          <div className="pointer-events-auto flex items-center space-x-2">
            <button
              onClick={() => setIsTiltActive(!isTiltActive)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all ${
                isTiltActive
                  ? 'bg-[#494bd6] border-[#8083ff] text-white shadow-md shadow-indigo-950/40'
                  : isDark
                    ? 'bg-[#131b2e]/85 border-[#222a3d] text-[#908fa0] hover:text-[#dae2fd]'
                    : 'bg-white/95 border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
              }`}
            >
              <Rotate3d className="w-3.5 h-3.5" />
              <span>Perspective: {settings.perspectiveTilt}° Tilt</span>
            </button>

            <div className={`flex items-center backdrop-blur-md p-0.5 rounded-full border text-xs ${
              isDark ? 'bg-[#131b2e]/85 border-[#222a3d]' : 'bg-white/95 border-slate-200 shadow-xs'
            }`}>
              <button
                onClick={() => updateSettings({ spreadMode: 'double' })}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  settings.spreadMode === 'double'
                    ? isDark ? 'bg-[#222a3d] text-white shadow-sm' : 'bg-slate-100 text-slate-900 font-semibold shadow-xs'
                    : isDark ? 'text-[#908fa0] hover:text-[#dae2fd]' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Double Spread
              </button>
              <button
                onClick={() => updateSettings({ spreadMode: 'single' })}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  settings.spreadMode === 'single'
                    ? isDark ? 'bg-[#222a3d] text-white shadow-sm' : 'bg-slate-100 text-slate-900 font-semibold shadow-xs'
                    : isDark ? 'text-[#908fa0] hover:text-[#dae2fd]' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Single Page
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main 3D Book Stage */}
      <div 
        className={`flex-1 flex items-center justify-center p-4 md:p-8 perspective-1500 overflow-hidden relative ${
          isEffectiveZoomed
            ? isPanning ? 'cursor-grabbing select-none' : 'cursor-grab'
            : ''
        }`}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleSpreadDoubleClick}
      >
        {/* Hidden File Input for stage clicks */}
        <input
          ref={stageFileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.epub,.ai"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onTriggerUpload(file);
            }
          }}
        />

        {/* CLEAR STATE BEFORE UPLOAD: No booklet is shown before user uploads PDF */}
        {!hasUploaded && !isConverting && (
          <div className="flex flex-col items-center justify-center text-center p-6 max-w-lg z-10 space-y-6">
            {/* Visual 3D Blueprint Staging Platform */}
            <div className={`relative w-72 h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 shadow-2xl group transition-all ${
              isDark 
                ? 'border-[#222a3d] bg-[#131b2e]/40 hover:border-[#8083ff]/60' 
                : 'border-slate-300 bg-white/80 hover:border-indigo-400 shadow-slate-200'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-b from-[#8083ff]/5 to-transparent rounded-2xl pointer-events-none" />
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-[#8083ff] shadow-inner mb-3 group-hover:scale-110 transition-transform ${
                isDark ? 'bg-[#1e293b] border-[#2d3449]' : 'bg-indigo-50 border-indigo-200'
              }`}>
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className={`text-xs font-semibold ${isDark ? 'text-[#dae2fd]' : 'text-slate-800'}`}>
                3D Digital Staging Area
              </div>
              <div className={`text-[11px] mt-1 ${isDark ? 'text-[#908fa0]' : 'text-slate-500'}`}>
                Awaiting Document Input
              </div>
            </div>

            {/* Explanatory Message */}
            <div className="space-y-2">
              <h2 className={`text-xl md:text-2xl font-bold font-['Plus_Jakarta_Sans'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Upload PDF to Convert into 3D Booklet
              </h2>
              <p className={`text-xs md:text-sm leading-relaxed max-w-md mx-auto ${isDark ? 'text-[#908fa0]' : 'text-slate-600'}`}>
                No booklet is loaded yet. Upload your PDF in the left sidebar or click below to build an interactive, tactile 3D booklet.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-center pt-2">
              <button
                onClick={() => stageFileInputRef.current?.click()}
                className="px-6 py-2.5 bg-gradient-to-r from-[#494bd6] to-[#6366f1] hover:from-[#3b3dbb] hover:to-[#4f46e5] text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-950/50 flex items-center justify-center space-x-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload PDF File</span>
              </button>
            </div>
          </div>
        )}

        {/* CONVERTING STATE */}
        {isConverting && (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-[#0f172a]/90 backdrop-blur-xl border border-[#2d3449] rounded-2xl shadow-2xl max-w-md z-30 space-y-4 animate-in zoom-in-95">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-[#222a3d] border-t-[#8083ff] animate-spin flex items-center justify-center" />
              <Layers className="w-6 h-6 text-[#8083ff] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-['Plus_Jakarta_Sans']">
                Converting Document into 3D Booklet...
              </h3>
              <p className="text-xs text-[#908fa0]">
                Synthesizing double-spread vectors, tactile paper materials & spine lighting
              </p>
            </div>

            <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#494bd6] via-[#8083ff] to-[#7bd0ff] rounded-full w-full animate-pulse" />
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Cloud Transfer • Encrypted Local Session</span>
            </div>
          </div>
        )}

        {/* 3D BOOKLET (ONLY SHOWN AFTER UPLOAD) */}
        {hasUploaded && !isConverting && (
          <>
            {/* Left Arrow Button */}
            <button
              onClick={handlePrev}
              disabled={currentSpreadIndex === 0 || isFlipping}
              className={`absolute left-4 md:left-8 z-20 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
                currentSpreadIndex === 0
                  ? 'opacity-20 cursor-not-allowed bg-[#131b2e]/50 border-transparent text-[#908fa0]'
                  : 'bg-[#1e293b]/80 hover:bg-[#2d3449] border-white/10 text-white shadow-xl hover:scale-110 active:scale-95'
              }`}
              title="Previous Spread (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Arrow Button */}
            <button
              onClick={handleNext}
              disabled={currentSpreadIndex >= totalSpreads - 1 || isFlipping}
              className={`absolute right-4 md:right-8 z-20 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
                currentSpreadIndex >= totalSpreads - 1
                  ? 'opacity-20 cursor-not-allowed bg-[#131b2e]/50 border-transparent text-[#908fa0]'
                  : 'bg-[#1e293b]/80 hover:bg-[#2d3449] border-white/10 text-white shadow-xl hover:scale-110 active:scale-95'
              }`}
              title="Next Spread (Right Arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* 3D Transform Root */}
            <div
              className={`preserve-3d ${isPanning ? '' : 'transition-transform duration-300 ease-out'}`}
              onMouseMove={handleBookContainerMouseMove}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) ${
                  isZoomedIn ? `scale(1.8) translate(${50 - zoomFocal.x}%, ${50 - zoomFocal.y}%)` : ''
                } rotateX(${isTiltActive ? rotX : (settings.perspectiveTilt * 0.15)}deg) rotateY(${
                  isTiltActive ? rotY : 0
                }deg)`,
              }}
            >
              {/* Physical Book Shadow on Table */}
              <div 
                className="absolute -inset-6 -bottom-10 bg-black/60 blur-2xl rounded-[40px] pointer-events-none transform translate-y-6"
                style={{
                  opacity: 0.75 + (settings.boardThicknessMm / 28),
                }}
              />

              {/* Hardcover Casing Frame */}
              <div className={`relative ${getCoverBorderThickness()} ${getCoverSheenStyles()} preserve-3d transition-all`}>
                {/* Spiral Bound Metallic Rings & Punch Holes (if spiral) */}
                {settings.coverType === 'spiral' && (
                  <>
                    {/* Hole punches under the rings */}
                    <div className={`absolute top-4 bottom-4 w-2 z-20 flex flex-col justify-between pointer-events-none transition-all duration-300 ${
                      settings.spreadMode === 'single'
                        ? 'left-1'
                        : 'left-1/2 -translate-x-1/2'
                    }`}>
                      {Array.from({ length: 18 }).map((_, i) => (
                        <div
                          key={`hole-${i}`}
                          className="w-2 h-2 rounded-full bg-[#0f172a]/70 border border-white/20 shadow-inner"
                        />
                      ))}
                    </div>

                    {/* Metallic wire-o coils */}
                    <div className={`absolute top-4 bottom-4 w-6 z-30 flex flex-col justify-between pointer-events-none transition-all duration-300 ${
                      settings.spreadMode === 'single'
                        ? '-left-3'
                        : 'left-1/2 -translate-x-1/2'
                    }`}>
                      {Array.from({ length: 18 }).map((_, i) => (
                        <div
                          key={`coil-${i}`}
                          className="w-full h-3 rounded-full bg-gradient-to-r from-[#94a3b8] via-[#f8fafc] to-[#64748b] shadow-sm transform -rotate-12"
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* The Spread Pages Container */}
                <div 
                  className={`relative flex items-center shadow-2xl overflow-hidden ${
                    settings.roundedCorners ? 'rounded-lg' : 'rounded-sm'
                  }`}
                  style={{
                    width: settings.spreadMode === 'single' ? '400px' : '760px',
                    height: '520px',
                    maxWidth: '92vw',
                    maxHeight: '68vh',
                  }}
                >
                  {settings.spreadMode === 'single' ? (
                    <div 
                      onClick={(e) => handlePageClick('next', e)}
                      onDoubleClick={handleSpreadDoubleClick}
                      className={`w-full h-full ${
                        isEffectiveZoomed
                          ? isPanning ? 'cursor-grabbing' : 'cursor-grab'
                          : 'cursor-pointer'
                      }`}
                      title={isEffectiveZoomed ? 'Click & drag to move around • Double-click to zoom out' : '1-click: turn page • Double-click: smart zoom'}
                    >
                      {renderPageContent(currentPages.right || currentPages.left, 'right')}
                    </div>
                  ) : (
                    <div className="w-full h-full flex relative">
                      {/* Left Page */}
                      <div 
                        onClick={(e) => handlePageClick('prev', e)}
                        onDoubleClick={handleSpreadDoubleClick}
                        className={`w-1/2 h-full transition-opacity ${
                          isEffectiveZoomed
                            ? isPanning ? 'cursor-grabbing' : 'cursor-grab'
                            : 'cursor-pointer'
                        }`}
                        title={isEffectiveZoomed ? 'Click & drag to move around • Double-click to zoom out' : '1-click: turn back • Double-click: smart zoom'}
                      >
                        {renderPageContent(currentPages.left, 'left')}
                      </div>

                      {/* Spine Crease Divider */}
                      <div className="w-[1.5px] h-full bg-[#cbd5e1] z-10 shadow-[0_0_8px_rgba(0,0,0,0.4)] pointer-events-none" />

                      {/* Right Page */}
                      <div 
                        onClick={(e) => handlePageClick('next', e)}
                        onDoubleClick={handleSpreadDoubleClick}
                        className={`w-1/2 h-full transition-opacity ${
                          isEffectiveZoomed
                            ? isPanning ? 'cursor-grabbing' : 'cursor-grab'
                            : 'cursor-pointer'
                        }`}
                        title={isEffectiveZoomed ? 'Click & drag to move around • Double-click to zoom out' : '1-click: turn forward • Double-click: smart zoom'}
                      >
                        {renderPageContent(currentPages.right, 'right')}
                      </div>

                      {/* Flipping 3D Leaf Animation */}
                      {isFlipping && (
                        <div
                          className="absolute top-0 bottom-0 w-1/2 preserve-3d pointer-events-none z-30"
                          style={{
                            right: flipDirection === 'next' ? 0 : 'auto',
                            left: flipDirection === 'prev' ? 0 : 'auto',
                            transformOrigin: flipDirection === 'next' ? 'left center' : 'right center',
                            transform: `perspective(1400px) rotateY(${
                              flipDirection === 'next' ? -flipAngle : (180 - flipAngle)
                            }deg)`,
                          }}
                        >
                          <div className="absolute inset-0 backface-hidden shadow-2xl">
                            {renderPageContent(
                              flipDirection === 'next' ? currentPages.right : currentPages.left,
                              flipDirection === 'next' ? 'right' : 'left'
                            )}
                            <div 
                              className="absolute inset-0 bg-black pointer-events-none transition-opacity"
                              style={{
                                opacity: Math.sin((flipAngle * Math.PI) / 180) * 0.35,
                              }}
                            />
                          </div>

                          <div 
                            className="absolute inset-0 backface-hidden shadow-2xl"
                            style={{ transform: 'rotateY(180deg)' }}
                          >
                            {renderPageContent(
                              flipDirection === 'next'
                                ? getPagesForSpread(currentSpreadIndex + 1).left
                                : getPagesForSpread(currentSpreadIndex - 1).right,
                              flipDirection === 'next' ? 'left' : 'right'
                            )}
                            <div 
                              className="absolute inset-0 bg-black pointer-events-none transition-opacity"
                              style={{
                                opacity: Math.sin((flipAngle * Math.PI) / 180) * 0.35,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Bottom Navigation Pill Bar (Only active when uploaded) */}
      {hasUploaded && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 select-none">
          <div className={`flex items-center space-x-3 backdrop-blur-xl px-4 py-2 rounded-full border text-xs transition-colors ${
            isDark 
              ? 'bg-[#131b2e]/90 border-white/10 shadow-2xl shadow-black/80 text-white' 
              : 'bg-white/95 border-slate-200 shadow-xl shadow-slate-300/50 text-slate-800'
          }`}>
            {/* Prev Arrow */}
            <button
              onClick={handlePrev}
              disabled={currentSpreadIndex === 0}
              className={`p-1.5 rounded-full transition-colors disabled:opacity-30 ${
                isDark ? 'text-[#908fa0] hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Counter Readout */}
            <div className={`font-mono text-xs font-semibold px-2 min-w-[110px] text-center ${
              isDark ? 'text-[#dae2fd]' : 'text-slate-900'
            }`}>
              {getPageSpreadLabel()}
            </div>

            {/* Next Arrow */}
            <button
              onClick={handleNext}
              disabled={currentSpreadIndex >= totalSpreads - 1}
              className={`p-1.5 rounded-full transition-colors disabled:opacity-30 ${
                isDark ? 'text-[#908fa0] hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Separator */}
            <div className={`h-4 w-px ${isDark ? 'bg-white/15' : 'bg-slate-200'}`} />

            {/* Manual Zoom Bar (Replaces page change slider) */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoom && setZoom((z: number) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))}
                className={`p-1 rounded-full transition-colors ${
                  isDark ? 'text-[#908fa0] hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Zoom Out (-10%)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom && setZoom(parseFloat(e.target.value))}
                className="w-20 sm:w-28 md:w-36 accent-[#8083ff] bg-slate-300 dark:bg-slate-700 h-1.5 rounded-full cursor-pointer"
                title={`Manual Zoom: ${Math.round(zoom * 100)}%`}
              />

              <button
                onClick={() => setZoom && setZoom((z: number) => Math.min(2.0, Math.round((z + 0.1) * 10) / 10))}
                className={`p-1 rounded-full transition-colors ${
                  isDark ? 'text-[#908fa0] hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Zoom In (+10%)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setZoom && setZoom(1.0)}
                className={`text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded transition-colors ${
                  isDark 
                    ? 'text-[#c0c1ff] hover:text-white hover:bg-white/10' 
                    : 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50'
                }`}
                title="Click to reset zoom to 100%"
              >
                {Math.round(zoom * 100)}%
              </button>
            </div>

            {/* Separator */}
            <div className={`h-4 w-px ${isDark ? 'bg-white/15' : 'bg-slate-200'}`} />

            {/* Slideshow Play / Pause */}
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`p-1.5 rounded-full transition-colors ${
                autoPlay 
                  ? 'bg-[#494bd6] text-white' 
                  : isDark ? 'text-[#908fa0] hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={autoPlay ? 'Pause Slideshow' : 'Auto Play Slideshow'}
            >
              {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            {/* Thumbnail Grid */}
            <button
              onClick={onOpenThumbnails}
              className={`p-1.5 rounded-full transition-colors ${
                isDark ? 'text-[#908fa0] hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Browse All Page Thumbnails"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>

            {/* Table of Contents */}
            <button
              onClick={onOpenTOC}
              className={`p-1.5 rounded-full transition-colors ${
                isDark ? 'text-[#908fa0] hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Table of Contents & Bookmarks"
            >
              <List className="w-3.5 h-3.5" />
            </button>

            {/* 3D Tilt Orbit Mode */}
            <button
              onClick={() => setIsTiltActive(!isTiltActive)}
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[11px] font-medium transition-colors ${
                isTiltActive
                  ? 'bg-[#494bd6] text-white shadow-sm'
                  : isDark ? 'text-[#908fa0] hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Toggle 3D Mouse Gyro Tilt"
            >
              <Rotate3d className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3D Tilt</span>
            </button>

            {/* Sound FX Toggle */}
            <button
              onClick={() => {
                const nextVal = !settings.soundEnabled;
                updateSettings({ soundEnabled: nextVal });
                audioEngine.setMuted(!nextVal);
              }}
              className={`p-1.5 rounded-full transition-colors ${
                isDark ? 'text-[#908fa0] hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={settings.soundEnabled ? 'Mute Page Sounds' : 'Unmute Page Sounds'}
            >
              {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-[#ffb4ab]" />}
            </button>
          </div>
        </div>
      )}

      {/* Hotspot Detailed Popover Modal */}
      {selectedHotspot && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171f33] border border-[#2d3449] rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-[#494bd6]/20 text-[#8083ff]">
                  <Tag className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-bold text-[#8083ff] uppercase tracking-wider">
                  Interactive Hotspot
                </span>
              </div>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="text-[#908fa0] hover:text-white text-xs font-mono p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{selectedHotspot.title}</h3>
              <p className="text-xs text-[#c7c4d7] mt-1.5 leading-relaxed">{selectedHotspot.description}</p>
            </div>

            {selectedHotspot.price && (
              <div className="flex items-center justify-between bg-[#131b2e] p-2.5 rounded-lg border border-[#222a3d]">
                <span className="text-xs text-[#908fa0]">Catalog Price:</span>
                <span className="text-sm font-bold text-[#10b981] font-mono">{selectedHotspot.price}</span>
              </div>
            )}

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => {
                  alert(`Navigating to verified product details: ${selectedHotspot.title}`);
                  setSelectedHotspot(null);
                }}
                className="flex-1 py-2 bg-[#494bd6] hover:bg-[#3b3dbb] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Order / Inquire Spec</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="px-3 py-2 bg-[#222a3d] hover:bg-[#2d3449] text-xs font-medium text-[#dae2fd] rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
