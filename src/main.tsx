import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Initialize theme before render to avoid flash
const storedTheme = (() => {
  try {
    const raw = localStorage.getItem('nextmd-theme');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.state?.theme || 'system';
    }
  } catch { /* ignore */ }
  return 'system';
})();

const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const resolved = storedTheme === 'system' ? (systemDark ? 'dark' : 'light') : storedTheme;
document.documentElement.setAttribute('data-theme', resolved);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
