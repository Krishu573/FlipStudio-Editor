import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Download, 
  Sun, 
  Moon, 
  Layers
} from 'lucide-react';
import { BookSettings } from '../types/flipbook';
import { fetchSupabaseUserProfile, UserProfile, DEFAULT_USER_PROFILE, supabase } from '../lib/supabase';
import { UserProfileBadge } from './UserProfileBadge';

interface HeaderProps {
  settings: BookSettings;
  pageCount: number;
  activeNavTab: 'editor' | 'templates';
  setActiveNavTab: (tab: 'editor' | 'templates') => void;
  onOpenExportModal: () => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  hasUploaded?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  pageCount,
  activeNavTab,
  setActiveNavTab,
  onOpenExportModal,
  theme,
  setTheme,
  hasUploaded = false,
}) => {
  const isDark = theme === 'dark';

  // Supabase User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  const loadProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const profile = await fetchSupabaseUserProfile();
      setUserProfile(profile);
    } catch {
      setUserProfile(DEFAULT_USER_PROFILE);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    loadProfile();

    if (supabase) {
      try {
        const authResponse = supabase.auth.onAuthStateChange(() => {
          loadProfile();
        });
        return () => {
          authResponse?.data?.subscription?.unsubscribe?.();
        };
      } catch (err) {
        console.warn('Supabase auth state listener error:', err);
      }
    }
  }, []);

  return (
    <header className={`h-14 border-b px-4 flex items-center justify-between z-30 select-none transition-colors duration-200 ${
      isDark ? 'border-[#1e293b] bg-[#0b1326] text-[#dae2fd]' : 'border-slate-200 bg-white text-slate-800 shadow-xs'
    }`}>
      {/* Left: Brand & File info */}
      <div className="flex items-center space-x-4">
        {/* Brand Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-[#494bd6] to-[#8083ff] flex items-center justify-center text-white shadow-md shadow-indigo-900/30">
            <Layers className="w-4 h-4" />
          </div>
          <span className={`font-bold text-base tracking-tight font-['Plus_Jakarta_Sans'] ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Flip<span className={isDark ? 'text-[#c0c1ff] font-medium' : 'text-[#494bd6] font-medium'}>Studio</span>
          </span>
        </div>

        {/* Separator */}
        <div className={`h-4 w-px ${isDark ? 'bg-[#1e293b]' : 'bg-slate-200'}`} />

        {/* Breadcrumb & Project Name */}
        <div className="flex items-center space-x-2 text-xs">
          <span className={`hidden sm:inline ${isDark ? 'text-[#908fa0]' : 'text-slate-400'}`}>Project</span>
          <span className={`hidden sm:inline ${isDark ? 'text-[#464554]' : 'text-slate-300'}`}>/</span>
          <div className={`flex items-center space-x-2 px-2.5 py-1 rounded border transition-colors ${
            isDark ? 'bg-[#171f33] border-[#222a3d] text-[#dae2fd]' : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}>
            <BookOpen className="w-3.5 h-3.5 text-[#8083ff]" />
            <span className="font-medium max-w-[140px] md:max-w-[220px] truncate" title={hasUploaded ? settings.fileName : 'Awaiting PDF Upload'}>
              {hasUploaded ? settings.fileName : 'Awaiting PDF Upload'}
            </span>
          </div>

          {/* Status Badge */}
          {hasUploaded ? (
            <div className={`flex items-center space-x-1.5 border px-2 py-0.5 rounded-full text-[11px] font-medium ${
              isDark ? 'bg-[#00354a]/60 text-[#7bd0ff] border-[#009bd1]/30' : 'bg-sky-50 text-sky-700 border-sky-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-[#7bd0ff]' : 'bg-sky-500'}`} />
              <span>Ready ({pageCount} pages)</span>
            </div>
          ) : (
            <div className={`flex items-center space-x-1.5 border px-2 py-0.5 rounded-full text-[11px] font-medium ${
              isDark ? 'bg-[#222a3d]/60 text-[#908fa0] border-[#2d3449]' : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#908fa0]' : 'bg-slate-400'}`} />
              <span>Awaiting Upload</span>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Nav tabs with Light/Dark toggle in place of fullscreen */}
      <div className={`hidden lg:flex items-center space-x-1.5 p-1 rounded-lg border transition-colors ${
        isDark ? 'bg-[#131b2e] border-[#222a3d]' : 'bg-slate-100 border-slate-200'
      }`}>
        <button
          onClick={() => setActiveNavTab('editor')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
            activeNavTab === 'editor'
              ? isDark 
                ? 'bg-[#222a3d] text-white shadow-sm'
                : 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : isDark
                ? 'text-[#908fa0] hover:text-[#dae2fd] hover:bg-[#171f33]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setActiveNavTab('templates')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
            activeNavTab === 'templates'
              ? isDark 
                ? 'bg-[#222a3d] text-white shadow-sm'
                : 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : isDark
                ? 'text-[#908fa0] hover:text-[#dae2fd] hover:bg-[#171f33]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          Templates
        </button>

        {/* Separator */}
        <div className={`h-4 w-px mx-0.5 ${isDark ? 'bg-[#222a3d]' : 'bg-slate-300'}`} />

        {/* Option to toggle Light or Dark mode */}
        <div 
          className={`flex items-center p-0.5 rounded-lg border transition-all ${
            isDark ? 'bg-[#0f172a] border-[#222a3d]' : 'bg-slate-200/80 border-slate-300'
          }`}
          title={isDark ? 'Current theme: Dark. Click Light to switch' : 'Current theme: Light. Click Dark to switch'}
        >
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              !isDark
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-[#908fa0] hover:text-[#dae2fd]'
            }`}
            title="Switch to Light Theme"
          >
            <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500 fill-amber-500/20' : 'text-slate-400'}`} />
            <span>Light</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              isDark
                ? 'bg-[#222a3d] text-white shadow-sm border border-[#2d3449]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Switch to Dark Theme"
          >
            <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-indigo-400 fill-indigo-400/20' : 'text-slate-400'}`} />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-3">
        {/* Export Flipbook button */}
        <button
          onClick={onOpenExportModal}
          disabled={!hasUploaded}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all border ${
            !hasUploaded
              ? isDark
                ? 'opacity-40 cursor-not-allowed text-white/50 bg-[#494bd6]/40 border-transparent shadow-none'
                : 'opacity-40 cursor-not-allowed text-white/60 bg-indigo-300 border-transparent shadow-none'
              : 'text-white bg-gradient-to-r from-[#494bd6] to-[#6366f1] hover:from-[#3b3dbb] hover:to-[#4f46e5] shadow-md shadow-indigo-950/40 border-[#8083ff]/40'
          }`}
          title={hasUploaded ? 'Export publication' : 'Upload a PDF first to enable export'}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Flipbook</span>
        </button>

        {/* Separator */}
        <div className={`h-5 w-px ${isDark ? 'bg-[#1e293b]' : 'bg-slate-200'}`} />

        {/* User Profile Container (Name on the left hand side of the profile picture, beside Export Flipbook) */}
        <UserProfileBadge theme={theme} customProfile={userProfile} />
      </div>
    </header>
  );
};

