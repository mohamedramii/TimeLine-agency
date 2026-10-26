// Visitor preferences: language. Read once at boot; changing it reloads the page
// so every ScrollTrigger, pin and RTL layout is rebuilt cleanly.

const LANG_KEY = 'tl-lang';
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

// Motion is always on — the movement is the product, so the OS "reduced motion" hint is ignored.
export const motionOff = () => false;

// Phones get static gradients instead of the WebGL backgrounds: pinned sections are moved from
// JavaScript there, and every millisecond of GPU/main-thread work shows up as scroll stutter.
export const lite = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

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
