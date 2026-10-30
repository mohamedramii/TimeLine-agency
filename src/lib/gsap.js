import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { lite } from './prefs';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP);

gsap.defaults({ ease: 'expo.out', duration: 1.1 });
ScrollTrigger.config({ ignoreMobileResize: true });

export { motionOff as prefersReducedMotion } from './prefs';

// Phones: entrances play a little quicker, so nothing feels like it is dragging behind the finger.
if (lite) gsap.globalTimeline.timeScale(1.3);

// Touch screens have no smooth-scroll layer, so a long scrub only makes animations trail the finger;
// a short one still evens out scroll events that arrive unevenly.
export const scrubbed = seconds => (ScrollTrigger.isTouch === 1 ? Math.min(seconds, 0.2) : seconds);

// What 100lvh resolves to: the viewport with Safari's toolbar collapsed (equals innerHeight on desktop).
const largeViewport = () => {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;width:0;height:100lvh;visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);
  const h = probe.offsetHeight;
  probe.remove();
  return h || window.innerHeight;
};

// Native "pin": the section is `position: sticky` inside a taller runway, so the browser holds it still
// on its own scrolling thread. GSAP's pin moves the section from JavaScript, which shakes on iPhones.
// Sizes the runway to the section plus `extra()` px of scroll before every refresh; a section taller than
// the screen sticks by its bottom edge so all of it is seen. `start`/`end` are the exact held range.
export function stickyRunway(runway, section, extra) {
  let lead = 0;
  const size = () => {
    const tall = section.offsetHeight;
    lead = Math.max(0, tall - largeViewport());
    section.style.top = `${-lead}px`;
    runway.style.height = `${tall + extra()}px`;
  };
  size();
  ScrollTrigger.addEventListener('refreshInit', size);
  return {
    start: () => `top+=${lead} top`,
    end: () => `top+=${lead + extra()} top`,
    kill: () => ScrollTrigger.removeEventListener('refreshInit', size)
  };
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
