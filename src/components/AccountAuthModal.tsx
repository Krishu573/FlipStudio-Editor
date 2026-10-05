import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Check, 
  RefreshCw 
} from 'lucide-react';
import { 
  UserProfile, 
  saveLocalUserProfile, 
  getAvatarUrlForUser 
} from '../lib/supabase';

interface AccountAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onProfileUpdated: (newProfile: UserProfile) => void;
  theme?: 'dark' | 'light';
}

export const AccountAuthModal: React.FC<AccountAuthModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdated,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const [name, setName] = useState(currentProfile.name);
  const [avatarUrl, setAvatarUrl] = useState(currentProfile.avatar_url);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setName(currentProfile.name);
    setAvatarUrl(currentProfile.avatar_url);
    setSuccessMsg(null);
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim() || 'Publisher';

    // Auto-sync avatar with name if it was initials/generated
    let finalAvatar = avatarUrl;
    if (!finalAvatar || finalAvatar.includes('dicebear')) {
      finalAvatar = getAvatarUrlForUser(trimmedName);
    }

    const updated: UserProfile = {
      ...currentProfile,
      name: trimmedName,
      avatar_url: finalAvatar,
      isFromSupabase: true,
    };

    saveLocalUserProfile(updated);
    onProfileUpdated(updated);
    setSuccessMsg('Profile updated successfully!');
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleGenerateInitials = () => {
    const freshAvatar = getAvatarUrlForUser(name.trim() || 'User', String(Date.now()));
    setAvatarUrl(freshAvatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className={`w-full max-w-sm rounded-2xl shadow-2xl border overflow-hidden transition-all duration-200 ${
          isDark 
            ? 'bg-[#0f172a] border-[#222a3d] text-white' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${
          isDark ? 'border-[#1e293b] bg-[#111c35]' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-none">Edit Profile</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Update your display name
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mx-5 mt-4 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Simple Profile Form */}
        <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
          {/* Avatar Preview with refresh button */}
          <div className="flex flex-col items-center justify-center pt-1 pb-2">
            <div className="relative group">
              <img
                src={avatarUrl}
                alt={name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/50 shadow-md"
                onError={() => setAvatarUrl(getAvatarUrlForUser(name))}
              />
              <button
                type="button"
                onClick={handleGenerateInitials}
                title="Refresh avatar color style"
                className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-md transition-transform hover:scale-110"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Display Name Input */}
          <div>
            <label className={`text-xs font-semibold block mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Display Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const val = e.target.value;
                  setName(val);
                  if (avatarUrl.includes('dicebear')) {
                    setAvatarUrl(getAvatarUrlForUser(val));
                  }
                }}
                placeholder="Enter your name"
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  isDark 
                    ? 'bg-[#18233c] border-[#29354f] text-white placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                isDark 
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountAuthModal;
