import type { User } from '../store/useUserStore';

let mockUser: User | null = null;
const STORAGE_KEY = 'reading-notes-mock-user';

export const mockAuth = {
  signInAnonymously: async (): Promise<void> => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      mockUser = JSON.parse(stored);
    } else {
      mockUser = {
        id: `guest_${Date.now()}`,
        email: '',
        nickname: '访客',
        avatar: null,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    }
  },

  signInWithPassword: async (email: string, _password: string): Promise<void> => {
    mockUser = {
      id: `user_${email}`,
      email,
      nickname: email.split('@')[0],
      avatar: null,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
  },

  signUp: async (email: string, _password: string): Promise<void> => {
    mockUser = {
      id: `user_${email}`,
      email,
      nickname: email.split('@')[0],
      avatar: null,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
  },

  signOut: async (): Promise<void> => {
    mockUser = null;
    localStorage.removeItem(STORAGE_KEY);
  },

  updateUser: (updates: Partial<Pick<User, 'nickname' | 'avatar'>>): User | null => {
    const currentUser = mockAuth.getUser();
    if (!currentUser) return null;
    mockUser = { ...currentUser, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    return mockUser;
  },

  getUser: (): User | null => {
    if (mockUser) return mockUser;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    mockUser = JSON.parse(stored);
    return mockUser;
  },

  isLoggedIn: (): boolean => mockAuth.getUser() !== null
};
