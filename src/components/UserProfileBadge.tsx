import React from 'react';
import { isSupabaseConfigured, useSupabaseProfile, UserProfile } from '../lib/supabase';

interface UserProfileBadgeProps {
  theme?: 'dark' | 'light';
  customProfile?: UserProfile;
  onClick?: () => void;
  // Also accept remote props for full backward compatibility
  profile?: UserProfile;
  variant?: string;
  loading?: boolean;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
  onRefreshProfile?: () => void;
}

export const UserProfileBadge: React.FC<UserProfileBadgeProps> = ({
  theme = 'dark',
  customProfile,
  onClick,
  profile: propProfile,
  loading: propLoading,
}) => {
  const { profile: hookProfile, loading: hookLoading } = useSupabaseProfile();
  const profile = customProfile || propProfile || hookProfile;
  const loading = propLoading !== undefined ? propLoading : hookLoading;
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center space-x-2.5 p-1 pl-2.5 rounded-lg border transition-all text-left cursor-pointer group select-none ${
        isDark 
          ? 'border-[#1e293b] hover:border-[#8083ff]/40 hover:bg-[#131d35]' 
          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
      }`}
      title="Click to manage account, change name, or switch user"
    >
      {/* User Name on the left hand side of the image */}
      <div className="flex flex-col text-right leading-none">
        <span
          className={`text-xs font-semibold tracking-tight transition-colors ${
            isDark 
              ? 'text-white group-hover:text-[#c0c1ff]' 
              : 'text-slate-800 group-hover:text-indigo-600'
          }`}
        >
          {loading ? 'Loading...' : profile.name}
        </span>
        <span className="text-[10px] mt-0.5 flex items-center justify-end space-x-1">
          {isSupabaseConfigured && (
            <span className="text-emerald-500 font-medium flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase</span>
            </span>
          )}
        </span>
      </div>

      {/* User Profile Picture */}
      <div className="relative flex-shrink-0">
        <img
          src={profile.avatar_url}
          alt={profile.name}
          className={`w-8 h-8 rounded-full border border-[#8083ff]/50 object-cover ring-2 transition-transform group-hover:scale-105 ${
            isDark ? 'ring-[#0b1326]' : 'ring-white'
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}&backgroundColor=4f46e5&textColor=ffffff`;
          }}
        />
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 bg-emerald-500 ${
            isDark ? 'ring-[#0b1326]' : 'ring-white'
          }`}
          title="Supabase Online"
        />
      </div>
    </button>
  );
};

export default UserProfileBadge;
