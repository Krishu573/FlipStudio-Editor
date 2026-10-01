import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Check, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  RefreshCw 
} from 'lucide-react';
import { 
  UserProfile, 
  signInWithSupabase, 
  signUpWithSupabase, 
  signOutFromSupabase, 
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

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80',
];

export const AccountAuthModal: React.FC<AccountAuthModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdated,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  // Tabs: 'profile' (view/edit) | 'signin' | 'signup'
  const [activeTab, setActiveTab] = useState<'profile' | 'signin' | 'signup'>('profile');

  // Form states
  const [name, setName] = useState(currentProfile.name);
  const [email, setEmail] = useState(currentProfile.email || '');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(currentProfile.avatar_url);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const updated: UserProfile = {
      ...currentProfile,
      name: name.trim() || 'Publisher',
      email: email.trim() || currentProfile.email,
      avatar_url: avatarUrl || getAvatarUrlForUser(name, email),
      isFromSupabase: true,
    };

    saveLocalUserProfile(updated);
    onProfileUpdated(updated);
    setSuccessMsg('Profile updated successfully!');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await signInWithSupabase(email, password);
    setIsLoading(false);

    if (res.success && res.profile) {
      onProfileUpdated(res.profile);
      setSuccessMsg(`Signed in as ${res.profile.name}!`);
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMsg(res.error || 'Failed to sign in.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter an email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await signUpWithSupabase(email, password, name || email.split('@')[0]);
    setIsLoading(false);

    if (res.success && res.profile) {
      onProfileUpdated(res.profile);
      setSuccessMsg('Account created & signed in successfully!');
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setErrorMsg(res.error || 'Failed to sign up.');
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOutFromSupabase();
    setIsLoading(false);
    const guestProfile: UserProfile = {
      name: 'Guest User',
      email: '',
      avatar_url: getAvatarUrlForUser('Guest', 'guest'),
      role: 'Guest',
      isFromSupabase: false,
      isAuthenticated: false,
    };
    saveLocalUserProfile(guestProfile);
    onProfileUpdated(guestProfile);
    setSuccessMsg('Signed out successfully.');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleGenerateInitialsAvatar = () => {
    const generated = getAvatarUrlForUser(name, email || String(Date.now()));
    setAvatarUrl(generated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className={`w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden transition-all duration-200 ${
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
              <h3 className="font-semibold text-sm leading-none">Supabase Account</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Manage account profile, switch users, or sign in
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

        {/* Tab Switcher */}
        <div className={`flex border-b text-xs font-medium px-5 pt-3 space-x-4 ${
          isDark ? 'border-[#1e293b]' : 'border-slate-100'
        }`}>
          <button
            onClick={() => { setActiveTab('profile'); setErrorMsg(null); }}
            className={`pb-2.5 border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-500 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Profile
          </button>
          <button
            onClick={() => { setActiveTab('signin'); setErrorMsg(null); }}
            className={`pb-2.5 border-b-2 transition-all ${
              activeTab === 'signin'
                ? 'border-indigo-500 text-indigo-500 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In with Different Account
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setErrorMsg(null); }}
            className={`pb-2.5 border-b-2 transition-all ${
              activeTab === 'signup'
                ? 'border-indigo-500 text-indigo-500 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Profile View & Customization */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
            {/* Avatar Preview & Selection */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/50"
                  onError={() => setAvatarUrl(getAvatarUrlForUser(name))}
                />
                <button
                  type="button"
                  onClick={handleGenerateInitialsAvatar}
                  title="Generate dynamic avatar from name"
                  className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-md text-xs"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold block mb-1">Choose Photo / Avatar</label>
                <div className="flex items-center space-x-1.5 mb-1.5">
                  {AVATAR_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(p)}
                      className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                        avatarUrl === p ? 'border-indigo-500 scale-105' : 'border-transparent opacity-70'
                      }`}
                    >
                      <img src={p} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleGenerateInitialsAvatar}
                    className="px-2 py-1 text-[11px] rounded bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 font-medium"
                  >
                    Initials
                  </button>
                </div>
              </div>
            </div>

            {/* Display Name Input */}
            <div>
              <label className="text-xs font-medium block mb-1.5 text-slate-300">Display Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark 
                      ? 'bg-[#18233c] border-[#29354f] text-white placeholder-slate-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="text-xs font-medium block mb-1.5 text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark 
                      ? 'bg-[#18233c] border-[#29354f] text-white placeholder-slate-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Custom Photo URL */}
            <div>
              <label className="text-xs font-medium block mb-1.5 text-slate-300">Custom Avatar Image URL (Optional)</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark 
                    ? 'bg-[#18233c] border-[#29354f] text-white placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1 py-1.5 px-2 rounded hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Reset / Sign Out</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Sign In */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignIn} className="p-5 space-y-4">
            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Sign in with your registered Supabase credentials to load your account and picture:
            </p>

            <div>
              <label className="text-xs font-medium block mb-1.5 text-slate-300">Supabase Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark 
                      ? 'bg-[#18233c] border-[#29354f] text-white placeholder-slate-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1.5 text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark 
                      ? 'bg-[#18233c] border-[#29354f] text-white placeholder-slate-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>{isLoading ? 'Signing In...' : 'Sign In with Supabase'}</span>
            </button>
          </form>
        )}

        {/* Tab 3: Sign Up */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp} className="p-5 space-y-4">
            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Create a new user account on your Supabase project:
            </p>

            <div>
              <label className="text-xs font-medium block mb-1.5 text-slate-300">Your Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark 
                      ? 'bg-[#18233c] border-[#29354f] text-white placeholder-slate-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1.5 text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark 
                      ? 'bg-[#18233c] border-[#29354f] text-white placeholder-slate-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1.5 text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark 
                      ? 'bg-[#18233c] border-[#29354f] text-white placeholder-slate-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>{isLoading ? 'Creating Account...' : 'Sign Up with Supabase'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AccountAuthModal;
