import { useState, useEffect, useCallback } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

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
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    });
  }
} catch (e) {
  console.warn('Failed to initialize Supabase client:', e);
}

export const supabase: SupabaseClient | null = client;

export const isSupabaseConfigured: boolean = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  avatar_url: string;
  role?: string;
  isFromSupabase: boolean;
  isAuthenticated?: boolean;
}

/**
 * Generate a dynamic, unique avatar based on the user's name or email
 */
export function getAvatarUrlForUser(name: string, seed?: string): string {
  const cleanSeed = encodeURIComponent(seed || name || 'User');
  return `https://api.dicebear.com/7.x/initials/svg?seed=${cleanSeed}&backgroundColor=4f46e5,6366f1,818cf8,0ea5e9,3b82f6&textColor=ffffff`;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Kalpana V.',
  email: 'kalpanav87@gmail.com',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
  role: 'Publisher',
  isFromSupabase: true,
  isAuthenticated: false,
};

const LOCAL_STORAGE_PROFILE_KEY = 'flipstudio_active_profile';

/**
 * Fetch user profile from Supabase Auth with dynamic fallback
 */
export async function fetchSupabaseUserProfile(): Promise<UserProfile> {
  // 1. Check if user saved a custom profile override locally
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.name) {
        return parsed;
      }
    }
  } catch {
    // Ignore local storage error
  }

  if (!supabase) {
    return DEFAULT_USER_PROFILE;
  }

  try {
    // 2. Check Supabase Auth session first
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (!authError && authData?.user) {
      const u: User = authData.user;
      const meta = u.user_metadata || {};
      
      // Determine name from metadata or email username
      let displayName = meta.full_name || meta.name || meta.display_name;
      if (!displayName && u.email) {
        const emailPrefix = u.email.split('@')[0];
        // Capitalize first letter
        displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      }
      if (!displayName) {
        displayName = 'User ' + u.id.slice(0, 5);
      }

      // Generate distinct avatar if no custom image is supplied
      const avatarUrl = meta.avatar_url || meta.picture || getAvatarUrlForUser(displayName, u.email || u.id);

      return {
        id: u.id,
        name: displayName,
        email: u.email,
        avatar_url: avatarUrl,
        role: meta.role || 'Member',
        isFromSupabase: true,
        isAuthenticated: true,
      };
    }
  } catch (e) {
    console.warn('Supabase auth session fetch failed:', e);
  }

  return DEFAULT_USER_PROFILE;
}

/**
 * Sign In with Supabase Email & Password
 */
export async function signInWithSupabase(email: string, password: string): Promise<{ success: boolean; error?: string; profile?: UserProfile }> {
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      const meta = data.user.user_metadata || {};
      const displayName = meta.full_name || meta.name || email.split('@')[0];
      const avatarUrl = meta.avatar_url || meta.picture || getAvatarUrlForUser(displayName, email);

      const profile: UserProfile = {
        id: data.user.id,
        name: displayName,
        email: data.user.email,
        avatar_url: avatarUrl,
        role: meta.role || 'Publisher',
        isFromSupabase: true,
        isAuthenticated: true,
      };

      try {
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
      } catch {
        // Ignore
      }

      return { success: true, profile };
    }

    return { success: false, error: 'User data not returned' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to sign in' };
  }
}

/**
 * Sign Up with Supabase Email & Password
 */
export async function signUpWithSupabase(email: string, password: string, name: string): Promise<{ success: boolean; error?: string; profile?: UserProfile }> {
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const avatarUrl = getAvatarUrlForUser(name, email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          name: name,
          avatar_url: avatarUrl,
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const profile: UserProfile = {
      id: data.user?.id || 'new-user',
      name: name || email.split('@')[0],
      email,
      avatar_url: avatarUrl,
      role: 'Publisher',
      isFromSupabase: true,
      isAuthenticated: true,
    };

    try {
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore
    }

    return { success: true, profile };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to sign up' };
  }
}

/**
 * Sign Out from Supabase
 */
export async function signOutFromSupabase(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch (e) {
    console.warn('Sign out error:', e);
  }
}

/**
 * Save manual custom profile update (name, avatar, email)
 */
export function saveLocalUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Failed to save profile to localStorage:', e);
  }
}

/**
 * React Hook for Supabase User Profile
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
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            const u = session.user;
            const meta = u.user_metadata || {};
            const displayName = meta.full_name || meta.name || u.email?.split('@')[0] || 'User';
            const avatarUrl = meta.avatar_url || meta.picture || getAvatarUrlForUser(displayName, u.email || u.id);
            const newProfile: UserProfile = {
              id: u.id,
              name: displayName,
              email: u.email,
              avatar_url: avatarUrl,
              role: meta.role || 'Publisher',
              isFromSupabase: true,
              isAuthenticated: true,
            };
            setProfile(newProfile);
            saveLocalUserProfile(newProfile);
          } else {
            // Signed out: reset
            refreshProfile();
          }
        });

        return () => {
          authListener?.subscription?.unsubscribe?.();
        };
      } catch (err) {
        console.warn('Supabase auth listener error:', err);
      }
    }
  }, [refreshProfile]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...updates };
      saveLocalUserProfile(updated);
      return updated;
    });
  }, []);

  return {
    profile,
    userProfile: profile,
    loading,
    isLoading: loading,
    error,
    refreshProfile,
    updateProfile,
    isConfigured: isSupabaseConfigured,
    isSupabaseConfigured,
  };
}
