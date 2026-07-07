import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  // Relative base path for Tauri webview compatibility
  base: '',
  server: {
    strictPort: true,
  },
})
