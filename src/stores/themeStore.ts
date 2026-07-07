import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  resolved: 'light' | 'dark';

  setTheme: (theme: ThemeMode) => void;
  _resolve: () => void;
}

const getSystemTheme = (): 'light' | 'dark' =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolved: getSystemTheme(),

      setTheme: (theme) => {
        set({ theme });
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        set({ resolved });
        document.documentElement.setAttribute('data-theme', resolved);
      },
      _resolve: () => {
        const { theme } = get();
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        set({ resolved });
        document.documentElement.setAttribute('data-theme', resolved);
      },
    }),
    {
      name: 'nextmd-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
