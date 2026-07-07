/** Detect if running inside a Tauri WebView */
export const isTauri = (): boolean => {
  return '__TAURI_INTERNALS__' in window;
};
