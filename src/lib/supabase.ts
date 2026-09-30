import { useState, useEffect, useCallback } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// User's Supabase Project Credentials
export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://vichklqnaaxjaiqlkwpp.supabase.co';

export const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpY2hrbHFuYWF4amFpcWxrd3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0Mzg5MTYsImV4cCI6MjEwNjAxNDkxNn0.wFvVHbA62jylhtG9K7YMOv9G9x9mefJkxaMpi5Uqph0';

let client: SupabaseClient | null = null;
try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn('Failed to initialize Supabase client:', e);
}

export const supabase: SupabaseClient | null = client;

// Export isSupabaseConfigured both as a boolean and as a helper function
export const isSupabaseConfigured: boolean = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  avatar_url: string;
  role?: string;
  isFromSupabase: boolean;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Kalpana V.',
  email: 'kalpanav87@gmail.com',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
  role: 'Publisher',
  isFromSupabase: true,
};

/**
 * Fetch user profile from Supabase with safe fallbacks
 */
export async function fetchSupabaseUserProfile(): Promise<UserProfile> {
  if (!supabase) {
    return DEFAULT_USER_PROFILE;
  }

  try {
    // 1. Check Supabase Auth session first
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const u = authData.user;
        const meta = u.user_metadata || {};
        const name = meta.full_name || meta.name || u.email?.split('@')[0] || DEFAULT_USER_PROFILE.name;
        const avatar_url = meta.avatar_url || meta.picture || DEFAULT_USER_PROFILE.avatar_url;
        return {
          id: u.id,
          name,
          email: u.email,
          avatar_url,
          role: meta.role || 'Publisher',
          isFromSupabase: true,
        };
      }
    } catch (e) {
      console.warn('Supabase auth check failed:', e);
    }

    // 2. Try fetching from 'profiles' table
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (!error && profiles && profiles.length > 0) {
        const p = profiles[0];
        return {
          id: p.id,
          name: p.full_name || p.name || p.username || p.display_name || DEFAULT_USER_PROFILE.name,
          email: p.email || DEFAULT_USER_PROFILE.email,
          avatar_url: p.avatar_url || p.profile_picture || p.image || p.photo_url || DEFAULT_USER_PROFILE.avatar_url,
          role: p.role || 'Publisher',
          isFromSupabase: true,
        };
      }
    } catch {
      // Ignore
    }

    // 3. Try fetching from 'users' table
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      if (!error && users && users.length > 0) {
        const u = users[0];
        return {
          id: u.id,
          name: u.full_name || u.name || u.username || DEFAULT_USER_PROFILE.name,
          email: u.email || DEFAULT_USER_PROFILE.email,
          avatar_url: u.avatar_url || u.profile_picture || u.image || DEFAULT_USER_PROFILE.avatar_url,
          role: u.role || 'Publisher',
          isFromSupabase: true,
        };
      }
    } catch {
      // Ignore
    }

    // 4. Try fetching from 'user_profiles' table
    try {
      const { data: uProfiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);

      if (!error && uProfiles && uProfiles.length > 0) {
        const up = uProfiles[0];
        return {
          id: up.id,
          name: up.full_name || up.name || DEFAULT_USER_PROFILE.name,
          email: up.email || DEFAULT_USER_PROFILE.email,
          avatar_url: up.avatar_url || up.profile_picture || DEFAULT_USER_PROFILE.avatar_url,
          role: up.role || 'Publisher',
          isFromSupabase: true,
        };
      }
    } catch {
      // Ignore
    }

    return DEFAULT_USER_PROFILE;
  } catch (err) {
    console.warn('Error fetching Supabase profile:', err);
    return DEFAULT_USER_PROFILE;
  }
}

/**
 * React Hook for Supabase User Profile
 * Used by App.tsx and UserProfileBadge.tsx
 */
export function useSupabaseProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSupabaseUserProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err);
      setProfile(DEFAULT_USER_PROFILE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();

    if (supabase) {
      try {
        const authResponse = supabase.auth.onAuthStateChange(() => {
          refreshProfile();
        });
        return () => {
          authResponse?.data?.subscription?.unsubscribe?.();
        };
      } catch (err) {
        console.warn('Supabase auth listener error:', err);
      }
    }
  }, [refreshProfile]);

  return {
    profile,
    userProfile: profile,
    loading,
    isLoading: loading,
    error,
    refreshProfile,
    isConfigured: isSupabaseConfigured,
    isSupabaseConfigured,
  };
}
