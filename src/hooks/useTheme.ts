import { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';

export function useTheme() {
  const theme = useThemeStore((state) => state.theme);
  const resolved = useThemeStore((state) => state.resolved);
  const setTheme = useThemeStore((state) => state.setTheme);

  // Apply data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
  }, [resolved]);

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (useThemeStore.getState().theme === 'system') {
        useThemeStore.getState()._resolve();
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return { theme, setTheme };
}
