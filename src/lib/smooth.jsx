import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap';

const LenisContext = createContext(null);

export function SmoothScroll({ children }) {
  const [lenis, setLenis] = useState(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    // Touch screens keep the browser's own scrolling: Lenis' touch mode and GSAP's normalizeScroll both
    // make iOS scrolling feel heavy, and the sections now hold still with CSS sticky (see stickyRunway).
    if (ScrollTrigger.isTouch === 1) return undefined;
    const instance = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.95,
      smoothWheel: true
    });
    instance.on('scroll', ScrollTrigger.update);
    const tick = time => instance.raf(time * 1000);
    rafRef.current = tick;
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);
    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export const useLenis = () => useContext(LenisContext);

// Smoothly scrolls to an in-page anchor, falling back to native when Lenis is off.
export function useScrollTo() {
  const lenis = useLenis();
  return (target, opts = {}) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4), ...opts });
    else el.scrollIntoView({ behavior: 'smooth' });
  };
}
