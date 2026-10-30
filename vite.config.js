import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// ScrollTrigger keeps an empty requestAnimationFrame loop alive forever (per its own comment, a workaround for
// Firefox repaints). Everywhere else that forces a full render pass on every frame even when nothing moves,
// which on phones costs frames and heat, so only Firefox keeps it. Applies to production builds.
const noScrollTriggerKeepAlive = {
  name: 'no-scrolltrigger-keepalive',
  enforce: 'pre',
  transform(code, id) {
    if (!/gsap[\/]ScrollTrigger\.js/.test(id)) return null;
    const loop = 'return _enabled && requestAnimationFrame(_rafBugFix);';
    if (!code.includes(loop)) {
      this.warn('ScrollTrigger keep-alive loop not found: has gsap changed?');
      return null;
    }
    return { code: code.replace(loop, 'return _enabled && /firefox/i.test(navigator.userAgent) && requestAnimationFrame(_rafBugFix);'), map: null };
  }
};

export default defineConfig({
  plugins: [noScrollTriggerKeepAlive, react(), tailwindcss()],
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
