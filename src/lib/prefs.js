// Visitor preferences: language and motion. Read once at boot; changing either reloads the page
// so every ScrollTrigger, pin and RTL layout is rebuilt cleanly.

const LANG_KEY = 'tl-lang';
const MOTION_KEY = 'tl-motion';
const NOTICE_KEY = 'tl-motion-notice';
const QUICK_KEY = 'tl-quick-intro';

const read = (store, key) => {
  try {
    return window[store].getItem(key);
  } catch {
    return null;
  }
};
const write = (store, key, value) => {
  try {
    window[store].setItem(key, value);
  } catch {
    /* storage blocked — preference just won't persist */
  }
};

export const LANGS = ['ar', 'en'];

export function initialLang() {
  if (typeof window === 'undefined') return 'ar';
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (LANGS.includes(fromUrl)) return fromUrl;
  const stored = read('localStorage', LANG_KEY);
  return LANGS.includes(stored) ? stored : 'ar';
}

export function switchLang(lang) {
  write('localStorage', LANG_KEY, lang);
  write('sessionStorage', QUICK_KEY, '1');
  const url = new URL(window.location.href);
  url.searchParams.delete('lang');
  url.hash = '';
  window.location.replace(url.toString());
}

// Motion is ON by default. Many Windows machines report "reduced motion" simply because
// "Animation effects" is switched off, so we ask instead of silently removing the experience.
export const systemPrefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

let cachedOff = null;
export function motionOff() {
  if (cachedOff === null) cachedOff = typeof window !== 'undefined' && read('localStorage', MOTION_KEY) === 'off';
  return cachedOff;
}

export function setMotion(on) {
  write('localStorage', MOTION_KEY, on ? 'on' : 'off');
  write('localStorage', NOTICE_KEY, '1');
  window.location.reload();
}

export const shouldShowMotionNotice = () =>
  systemPrefersReduced() && !motionOff() && read('localStorage', NOTICE_KEY) !== '1' && read('localStorage', MOTION_KEY) === null;
export const dismissMotionNotice = () => write('localStorage', NOTICE_KEY, '1');

export function consumeQuickIntro() {
  const quick = read('sessionStorage', QUICK_KEY) === '1';
  if (quick) {
    try {
      window.sessionStorage.removeItem(QUICK_KEY);
    } catch {
      /* ignore */
    }
  }
  return quick;
}

// Drop-in replacements for the media queries React Bits components use.
export const REDUCE_QUERY = () => (motionOff() ? 'all' : 'not all');
export const NO_PREF_QUERY = () => (motionOff() ? 'not all' : 'all');
