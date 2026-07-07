import { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';

export function useTheme() {
  const { theme, resolved, setTheme } = useThemeStore();

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
