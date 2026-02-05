import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {zustandMMKVStorage, mmkvStorage} from '../../../shared/services/storage';
import {STORAGE_KEYS} from '../../../shared/constants/storage';
import {PERMISSIONS} from '../../../shared/constants/permissions';
import type {User, DatabaseConfig, HomeInfo} from '../types/auth.types';

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  selectedDatabase: DatabaseConfig | null;
  permissions: string[];
  homeInfo: HomeInfo | null;
  rememberLogin: boolean;

  // Database list for selection
  databaseList: DatabaseConfig[];

  // Actions
  setUser: (user: User) => void;
  setSelectedDatabase: (db: DatabaseConfig) => void;
  setPermissions: (permissions: string[]) => void;
  setHomeInfo: (info: HomeInfo) => void;
  setRememberLogin: (remember: boolean) => void;
  setDatabaseList: (list: DatabaseConfig[]) => void;
  addDatabase: (db: DatabaseConfig) => void;
  logout: () => void;

  // Permission checks
  hasPermission: (permission: string) => boolean;
  canViewDocuments: () => boolean;
  canEditDocuments: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      selectedDatabase: null,
      permissions: [],
      homeInfo: null,
      rememberLogin: false,
      databaseList: [],

      // Actions
      setUser: user =>
        set({
          user,
          isAuthenticated: true,
        }),

      setSelectedDatabase: db => {
        // Also save to MMKV for API client to use
        mmkvStorage.setObject(STORAGE_KEYS.SELECTED_DATABASE, db);
        set({selectedDatabase: db});
      },

      setPermissions: permissions => set({permissions}),

      setHomeInfo: info => set({homeInfo: info}),

      setRememberLogin: remember => set({rememberLogin: remember}),

      setDatabaseList: list => set({databaseList: list}),

      addDatabase: db =>
        set(state => ({
          databaseList: [...state.databaseList, db],
        })),

      logout: () => {
        // Clear stored data (with safety check)
        try {
          if (mmkvStorage) {
            mmkvStorage.delete(STORAGE_KEYS.SELECTED_DATABASE);
            mmkvStorage.delete(STORAGE_KEYS.USER_INFO);
          }
        } catch (error) {
          console.warn('[authStore] Error clearing storage on logout:', error);
        }

        set({
          isAuthenticated: false,
          user: null,
          permissions: [],
          homeInfo: null,
        });
      },

      // Permission checks
      hasPermission: permission => get().permissions.includes(permission),

      canViewDocuments: () =>
        get().permissions.includes(PERMISSIONS.VIEW_DOCUMENTS),

      canEditDocuments: () =>
        get().permissions.includes(PERMISSIONS.EDIT_DOCUMENTS),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
      // Only persist these fields
      partialize: state => ({
        selectedDatabase: state.selectedDatabase,
        databaseList: state.databaseList,
        rememberLogin: state.rememberLogin,
      }),
    },
  ),
);
