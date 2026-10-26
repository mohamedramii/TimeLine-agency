import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { consumeQuickIntro, motionOff } from '../lib/prefs';
import { useT } from '../i18n';
import { Symbol } from './Logo';
import { preloadVideos } from '../lib/preload';
import { mediaFiles, showreelWall } from '../content/shared';

// What the counter waits for: the showreel wall's tiles plus the first service reels — about half the
// page's video. Capped, so a slow connection never keeps visitors on the loader for long.
const PRELOAD = [...new Set(showreelWall)].map(k => mediaFiles[k].tile).concat(mediaFiles.mamoBite.loop, mediaFiles.santos.loop);
const MIN_TIME = 2.1; // the sweep never runs faster than this
const MAX_WAIT = 7; // seconds; after this the page opens and the rest streams in

// 00 → 100 clock sweep driven by real video loading, then the symbol shrinks and flies into its place in
// the nav while the curtain lifts. Only ever scaled down, so the vector symbol stays crisp the whole way.
export default function Preloader({ onDone }) {
  const root = useRef(null);
  const t = useT();

  useGSAP(
    () => {
      const html = document.documentElement;
      html.style.overflow = 'hidden';
      const finish = () => {
        html.style.overflow = '';
        onDone?.();
      };
      if (motionOff()) {
        gsap.set(root.current, { autoAlpha: 0, display: 'none' });
        finish();
        return;
      }

      const count = { v: 0 };
      const counter = root.current.querySelector('[data-count]');
      const parts = root.current.querySelectorAll('.symbol-part');
      const mark = root.current.querySelector('[data-symbol]');
      // the nav's own mark stays hidden until this one lands on it
      const navMark = document.querySelector('header [data-logo-mark]');
      gsap.set(navMark, { autoAlpha: 0 });

      // Measured when the flight starts — after `finish` has brought the scrollbar back,
      // so the nav mark is already where it will stay.
      let dest;
      const flight = key => () => {
        if (!dest) {
          const a = mark.getBoundingClientRect();
          const b = navMark.getBoundingClientRect();
          dest = {
            x: b.left + b.width / 2 - (a.left + a.width / 2),
            y: b.top + b.height / 2 - (a.top + a.height / 2),
            scale: b.width / a.width
          };
        }
        return dest[key];
      };

      // a language switch reloads the page — replay the intro faster (the videos are cached by then)
      const speed = consumeQuickIntro() ? 2.2 : 1;

      const intro = gsap.timeline({ defaults: { ease: 'expo.out' } }).timeScale(speed);
      intro
        .from(parts, { scale: 0.6, opacity: 0, transformOrigin: '50% 50%', duration: 1, stagger: 0.12 }, 0.15)
        .from('[data-copy]', { yPercent: 120, duration: 1, stagger: 0.08 }, 0.3);

      const exit = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } }).timeScale(speed);
      exit
        .to('[data-copy]', { yPercent: -120, duration: 0.6, ease: 'power3.in', stagger: 0.04 }, 0.05)
        .to('[data-dial], [data-hand]', { opacity: 0, scale: 0.85, duration: 0.4, ease: 'power2.in' }, 0)
        .add(finish, 0.1)
        .set(root.current, { pointerEvents: 'none' }, 0.1)
        // the symbol shrinks into the nav on a gentle curve (x and y on different eases)…
        .to(mark, { x: flight('x'), duration: 1.3, ease: 'power3.inOut' }, 0.15)
        .to(mark, { y: flight('y'), scale: flight('scale'), duration: 1.3, ease: 'expo.inOut' }, 0.15)
        // …while the curtain lifts off the page, its sky edge leading
        .to('[data-veil]', { yPercent: -100, duration: 1.25, ease: 'expo.inOut' }, 0.25)
        .set(navMark, { autoAlpha: 1 }, 1.45)
        .set(root.current, { display: 'none' }, 1.45);

      // Ring, hand, counter and bar follow the slower of: the minimum sweep time, or the videos loading.
      let loaded = 0;
      preloadVideos(PRELOAD, f => (loaded = f));
      const sweep = gsap.parseEase('power2.inOut');
      const start = performance.now();
      gsap.set('[data-ring]', { drawSVG: '0%' });
      gsap.set('[data-bar]', { scaleX: 0 });
      gsap.set('[data-hand]', { transformOrigin: '50% 50%' });
      const tick = () => {
        const t = (performance.now() - start) / 1000;
        const target = Math.min(sweep(Math.min(1, (t * speed) / MIN_TIME)), t > MAX_WAIT ? 1 : loaded);
        count.v += (target - count.v) * 0.12;
        if (target === 1 && count.v > 0.997) count.v = 1;
        gsap.set('[data-ring]', { drawSVG: `${count.v * 100}%` });
        gsap.set('[data-hand]', { rotate: count.v * 360 });
        gsap.set('[data-bar]', { scaleX: count.v });
        counter.textContent = String(Math.round(count.v * 100)).padStart(3, '0');
        if (count.v === 1) {
          gsap.ticker.remove(tick);
          exit.play();
        }
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: root }
  );

  return (
    <div ref={root} data-preloader className="fixed inset-0 z-[400]" aria-hidden="true">
      <div data-veil className="absolute inset-0 bg-paper">
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 md:p-10">
          <div className="overflow-hidden">
            <p data-copy className="mono-label text-muted">
              {t.ui.loading}
            </p>
          </div>
          <div className="overflow-hidden">
            <p data-copy dir="ltr" className="display font-sans text-[18vw] !leading-[0.85] text-ink md:text-[11vw]">
              <span data-count>000</span>
            </p>
          </div>
        </div>
        <div className="absolute start-5 top-5 overflow-hidden md:start-10 md:top-10">
          <p data-copy dir="ltr" className="mono-label text-muted">
            TIME LINE — Marketing
          </p>
        </div>
        {/* progress bar that becomes the curtain's leading edge */}
        <span data-bar className="absolute inset-x-0 bottom-0 h-[3px] bg-sky-500 ltr:origin-left rtl:origin-right" />
      </div>

      <div className="absolute inset-0 grid place-items-center">
        <div className="relative grid place-items-center">
          <svg data-dial viewBox="0 0 200 200" className="absolute h-[230px] w-[230px] -rotate-90 overflow-visible">
            <circle cx="100" cy="100" r="98" fill="none" stroke="var(--color-line)" strokeWidth="1" />
            <circle data-ring cx="100" cy="100" r="98" fill="none" stroke="var(--color-sky-500)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <svg data-hand viewBox="0 0 200 200" className="absolute h-[230px] w-[230px]">
            <circle cx="100" cy="2" r="3.5" fill="var(--color-sky-500)" />
          </svg>
          <div data-symbol className="h-[120px] w-[120px]">
            <Symbol className="h-full w-full" color="var(--color-sky-500)" />
          </div>
        </div>
      </div>
    </div>
  );
}
