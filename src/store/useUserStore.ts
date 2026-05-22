import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { mockAuth } from '../lib/mockAuth';
import { testSupabaseConnection } from '../lib/runtimeConfig';
import { createSignedAssetUrl } from '../lib/storage';
import { migrateLocalDataOnce } from '../utils/localDataMigration';
import { ensureDefaultSeedData } from '../utils/defaultSeedData';
import { prefetchUserData } from '../utils/prefetchUserData';

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar: string | null;
  createdAt: string;
}

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isUsingLocalMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nickname: string) => Promise<boolean>;
  signInAsGuest: () => Promise<void>;
  sendEmailOtp: (email: string) => Promise<void>;
  verifyEmailOtp: (email: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateNickname: (nickname: string) => Promise<void>;
  updateAvatar: (avatar: string | null) => Promise<void>;
  initUser: () => Promise<void>;
  fallbackToLocal: () => void;
}

async function getProfile(session: Session): Promise<User> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, nickname, avatar_url, created_at')
    .eq('id', session.user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          email: session.user.email || null,
          nickname: session.user.email ? session.user.email.split('@')[0] : '访客',
          avatar_url: null
        })
        .select()
        .single();

      if (createError) throw createError;

      return {
        id: newProfile.id,
        email: newProfile.email || session.user.email || '',
        nickname: newProfile.nickname,
        avatar: await createSignedAssetUrl('avatars', newProfile.avatar_url),
        createdAt: newProfile.created_at
      };
    }
    throw error;
  }

  return {
    id: data.id,
    email: data.email || session.user.email || '',
    nickname: data.nickname,
    avatar: await createSignedAssetUrl('avatars', data.avatar_url),
    createdAt: data.created_at
  };
}

let initUserPromise: Promise<void> | null = null;
let connectionChecked = false;

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  isUsingLocalMode: false,

  signIn: async (email, password) => {
    if (get().isUsingLocalMode) {
      await mockAuth.signInWithPassword(email, password);
      const user = mockAuth.getUser();
      if (user) {
        set({ user, isLoggedIn: true });
      }
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await get().initUser();
    } catch (error) {
      console.warn('Supabase login failed, falling back to local mode:', error);
      get().fallbackToLocal();
      await mockAuth.signInWithPassword(email, password);
      const user = mockAuth.getUser();
      if (user) {
        set({ user, isLoggedIn: true });
      }
    }
  },

  signUp: async (email, password, nickname) => {
    if (get().isUsingLocalMode) {
      await mockAuth.signUp(email, password);
      const user = mockAuth.getUser();
      if (user) {
        set({ user, isLoggedIn: true });
        return true;
      }
      return false;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nickname } }
      });
      if (error) throw error;
      if (!data.session) {
        set({ user: null, isLoggedIn: false, isLoading: false });
        return false;
      }
      await get().initUser();
      return true;
    } catch (error) {
      console.warn('Supabase signup failed, falling back to local mode:', error);
      get().fallbackToLocal();
      await mockAuth.signUp(email, password);
      const user = mockAuth.getUser();
      if (user) {
        set({ user, isLoggedIn: true });
        return true;
      }
      return false;
    }
  },

  signInAsGuest: async () => {
    if (get().isUsingLocalMode) {
      await mockAuth.signInAnonymously();
      const user = mockAuth.getUser();
      if (user) {
        set({ user, isLoggedIn: true });
      }
      return;
    }

    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      await get().initUser();
    } catch (error) {
      console.warn('Supabase anonymous login failed, falling back to local mode:', error);
      get().fallbackToLocal();
      await mockAuth.signInAnonymously();
      const user = mockAuth.getUser();
      if (user) {
        set({ user, isLoggedIn: true });
      }
    }
  },

  sendEmailOtp: async (email) => {
    if (get().isUsingLocalMode) {
      throw new Error('邮箱验证在本地模式下不可用');
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true
      }
    });
    if (error) throw error;
  },

  verifyEmailOtp: async (email, token) => {
    if (get().isUsingLocalMode) {
      throw new Error('邮箱验证在本地模式下不可用');
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });
    if (error) throw error;
    await get().initUser();
  },

  logout: async () => {
    if (!get().isUsingLocalMode) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.warn('Supabase logout error:', error);
      }
    }
    await mockAuth.signOut();
    set({ user: null, isLoggedIn: false });
  },

  updateNickname: async (nickname) => {
    const user = get().user;
    if (!user) return;

    if (get().isUsingLocalMode) {
      const updatedUser = mockAuth.updateUser({ nickname });
      if (updatedUser) set({ user: updatedUser });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ nickname })
      .eq('id', user.id);

    if (error) {
      console.warn('Supabase update nickname failed, using local mode:', error);
      get().fallbackToLocal();
      const updatedUser = mockAuth.updateUser({ nickname });
      if (updatedUser) set({ user: updatedUser });
      return;
    }

    set({ user: { ...user, nickname } });
  },

  updateAvatar: async (avatar) => {
    const user = get().user;
    if (!user) return;

    if (get().isUsingLocalMode) {
      const updatedUser = mockAuth.updateUser({ avatar });
      if (updatedUser) set({ user: updatedUser });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatar })
      .eq('id', user.id);

    if (error) {
      console.warn('Supabase update avatar failed, using local mode:', error);
      get().fallbackToLocal();
      const updatedUser = mockAuth.updateUser({ avatar });
      if (updatedUser) set({ user: updatedUser });
      return;
    }

    set({ user: { ...user, avatar: await createSignedAssetUrl('avatars', avatar) } });
  },

  fallbackToLocal: () => {
    console.log('Switching to local mode...');
    set({ isUsingLocalMode: true });
    localStorage.setItem('reading-notes-use-local-mode', 'true');
  },

  initUser: async () => {
    if (initUserPromise) {
      await initUserPromise;
      return;
    }

    initUserPromise = (async () => {
      set({ isLoading: true });

      const forceLocal = localStorage.getItem('reading-notes-use-local-mode') === 'true';
      if (forceLocal) {
        console.log('Using local mode (forced)');
        const user = mockAuth.getUser();
        set({ user, isLoggedIn: Boolean(user), isLoading: false, isUsingLocalMode: true });
        return;
      }

      if (connectionChecked) {
        if (get().isUsingLocalMode) {
          const user = mockAuth.getUser();
          set({ user, isLoggedIn: Boolean(user), isLoading: false });
          return;
        }
      }

      try {
        const isSupabaseAvailable = await testSupabaseConnection();
        connectionChecked = true;

        if (!isSupabaseAvailable) {
          console.log('Supabase not available, using local mode');
          get().fallbackToLocal();
          const user = mockAuth.getUser();
          set({ user, isLoggedIn: Boolean(user), isLoading: false });
          return;
        }

        const { data } = await supabase.auth.getSession();

        if (!data.session) {
          const user = mockAuth.getUser();
          set({ user, isLoggedIn: Boolean(user), isLoading: false });
          return;
        }

        const user = await getProfile(data.session);
        try {
          await migrateLocalDataOnce();
        } catch (error) {
          console.error('Local data migration failed', error);
        }
        try {
          await ensureDefaultSeedData();
        } catch (error) {
          console.error('Default seed data initialization failed', error);
        }
        set({ user, isLoggedIn: true, isLoading: false });

        const schedulePrefetch = () => prefetchUserData();
        if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
          window.requestIdleCallback(schedulePrefetch);
        } else if (typeof window !== 'undefined') {
          globalThis.setTimeout(schedulePrefetch, 500);
        }
      } catch (error) {
        console.warn('Supabase connection error, falling back to local mode:', error);
        get().fallbackToLocal();
        const user = mockAuth.getUser();
        set({ user, isLoggedIn: Boolean(user), isLoading: false });
      }
    })();

    try {
      await initUserPromise;
    } finally {
      initUserPromise = null;
    }
  }
}));
