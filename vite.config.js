import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, host: true },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[/]three[/]/.test(id)) return 'three';
          if (/gsap|lenis/.test(id)) return 'gsap';
          if (/motion|framer/.test(id)) return 'motion';
          return undefined;
        }
      }
    }
  }
});
