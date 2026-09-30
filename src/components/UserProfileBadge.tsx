import React, { useState } from 'react';
import { UserProfile, isSupabaseConfigured } from '../lib/supabase';
import { Database, CheckCircle2, Edit3, X, RefreshCw, Sparkles, UserCheck } from 'lucide-react';

interface UserProfileBadgeProps {
  profile: UserProfile;
  loading?: boolean;
  theme?: 'dark' | 'light';
  variant?: 'compact' | 'sidebar' | 'header';
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
  onRefresh?: () => void;
}

export const UserProfileBadge: React.FC<UserProfileBadgeProps> = ({
  profile,
  loading = false,
  theme = 'dark',
  variant = 'sidebar',
  onUpdateProfile,
  onRefresh,
}) => {
  const isDark = theme === 'dark';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editAvatarUrl, setEditAvatarUrl] = useState(profile.avatarUrl);
  const [imgError, setImgError] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        name: editName.trim() || profile.name,
        avatarUrl: editAvatarUrl.trim() || profile.avatarUrl,
      });
    }
    setIsEditing(false);
  };

  const avatarFallbackInitials = profile.name
    ? profile.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'KV';

  // 1. Header Variant (Compact, displayed in top header left side)
  if (variant === 'header') {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center space-x-2 px-2 py-1 rounded-full border transition-all text-left group ${
            isDark
              ? 'bg-[#131b2e] hover:bg-[#1a243c] border-[#222a3d] text-[#dae2fd]'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
          }`}
          title="User Profile (Supabase)"
        >
          <div className="relative">
            {!imgError && profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                onError={() => setImgError(true)}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-[#8083ff]"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center text-[10px] font-bold">
                {avatarFallbackInitials}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-[#0b1326]" />
          </div>
          <span className="text-xs font-semibold max-w-[100px] truncate tracking-tight">
            {profile.name}
          </span>
        </button>

        {isModalOpen && renderModal()}
      </>
    );
  }

  // 2. Sidebar Variant (Rich card featured on the left-hand sidebar)
  return (
    <>
      <div
        className={`p-3 rounded-xl border transition-all relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-b from-[#131b2e] to-[#0f172a] border-[#222a3d] shadow-sm'
            : 'bg-gradient-to-b from-slate-50 to-white border-slate-200 shadow-2xs'
        }`}
      >
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* User Profile Picture with active status ring */}
            <div className="relative shrink-0">
              {!imgError && profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  onError={() => setImgError(true)}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#8083ff]/60 shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setIsModalOpen(true)}
                />
              ) : (
                <div 
                  onClick={() => setIsModalOpen(true)}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 via-[#8083ff] to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-md cursor-pointer"
                >
                  {avatarFallbackInitials}
                </div>
              )}
              {/* Online / Active status pulse */}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0f172a] animate-pulse" />
            </div>

            {/* User Name & Details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <span className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {profile.name}
                </span>
                <span title="Verified Supabase Profile">
                  <UserCheck className="w-3.5 h-3.5 text-[#8083ff] shrink-0" />
                </span>
              </div>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className={`text-[10px] truncate max-w-[125px] ${isDark ? 'text-[#908fa0]' : 'text-slate-500'}`}>
                  {profile.email}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark
                ? 'bg-[#171f33] hover:bg-[#222a3d] border-[#2d3449] text-[#dae2fd]'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-2xs'
            }`}
            title="Profile details & Supabase settings"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Supabase status chip */}
        <div className="mt-2.5 pt-2 border-t border-dashed flex items-center justify-between text-[10px] border-slate-700/40">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <Database className="w-3 h-3 text-emerald-400" />
            <span>Supabase Sync Active</span>
          </div>
          <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${
            isDark
              ? 'bg-[#1a233b] text-[#c0c1ff] border-[#2e3752]'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium'
          }`}>
            {isSupabaseConfigured ? 'Live Cloud' : 'Auto Connected'}
          </span>
        </div>
      </div>

      {isModalOpen && renderModal()}
    </>
  );

  function renderModal() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
        <div 
          className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden p-6 transition-colors ${
            isDark ? 'bg-[#0f172a] border-[#222a3d] text-[#dae2fd]' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/40">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Supabase User Profile</h3>
                <p className={`text-[11px] ${isDark ? 'text-[#908fa0]' : 'text-slate-500'}`}>
                  Connected profile data & avatar
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setIsEditing(false);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'hover:bg-[#1e293b] text-[#908fa0]' : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="py-4 space-y-4">
            {/* Profile Avatar & Identity */}
            <div className="flex items-center space-x-4 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
              <img
                src={editAvatarUrl || profile.avatarUrl}
                alt={profile.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-[#8083ff] shadow-md shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold truncate">{profile.name}</h4>
                <p className={`text-xs truncate ${isDark ? 'text-[#908fa0]' : 'text-slate-500'}`}>
                  {profile.email}
                </p>
                <div className="mt-1 flex items-center space-x-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Profile Synced from Supabase</span>
                </div>
              </div>
            </div>

            {/* Edit Profile Form */}
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-xs border outline-hidden transition-all ${
                      isDark
                        ? 'bg-[#171f33] border-[#2d3449] text-white focus:border-[#8083ff]'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                    }`}
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Avatar Image URL</label>
                  <input
                    type="url"
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-xs border outline-hidden transition-all ${
                      isDark
                        ? 'bg-[#171f33] border-[#2d3449] text-white focus:border-[#8083ff]'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                    }`}
                    placeholder="https://..."
                    required
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-[#494bd6] hover:bg-[#5b5df0] text-white transition-colors"
                  >
                    Save & Update Supabase
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className={`py-2 px-3 rounded-lg text-xs border transition-colors ${
                      isDark ? 'border-[#2d3449] hover:bg-[#1e293b]' : 'border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={isDark ? 'text-[#908fa0]' : 'text-slate-500'}>Account ID</span>
                  <span className="font-mono text-[11px] font-semibold">{profile.id}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={isDark ? 'text-[#908fa0]' : 'text-slate-500'}>Publishing Role</span>
                  <span className="font-semibold text-[#8083ff]">{profile.role || 'Creative Lead'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={isDark ? 'text-[#908fa0]' : 'text-slate-500'}>Storage Backend</span>
                  <span className="font-semibold text-emerald-400">Supabase Auth & Database</span>
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-[#8083ff] hover:bg-[#6c6fed] text-white transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Name & Picture</span>
                  </button>
                  {onRefresh && (
                    <button
                      onClick={onRefresh}
                      disabled={loading}
                      className={`p-2 rounded-lg border transition-colors ${
                        isDark ? 'border-[#2d3449] hover:bg-[#1e293b]' : 'border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Sync from Supabase"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
};
