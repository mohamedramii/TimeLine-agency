import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP);

gsap.defaults({ ease: 'expo.out', duration: 1.1 });
ScrollTrigger.config({ ignoreMobileResize: true });

export { motionOff as prefersReducedMotion } from './prefs';

// Native "pin": the section is `position: sticky` inside a taller runway, so the browser holds it still
// on its own scrolling thread. GSAP's pin moves the section from JavaScript, which shakes on iPhones.
// Sizes the runway to the section plus `extra()` px of scroll before every refresh; a section taller
// than the screen sticks by its bottom edge so all of it is seen. Returns the scroll distance before
// the section is held, for the ScrollTrigger start.
export function stickyRunway(runway, section, extra) {
  const size = () => {
    section.style.top = `${Math.min(0, window.innerHeight - section.offsetHeight)}px`;
    runway.style.height = `${section.offsetHeight + extra()}px`;
  };
  size();
  ScrollTrigger.addEventListener('refreshInit', size);
  return {
    lead: () => Math.max(0, section.offsetHeight - window.innerHeight),
    kill: () => ScrollTrigger.removeEventListener('refreshInit', size)
  };
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
