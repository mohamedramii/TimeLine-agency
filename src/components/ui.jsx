import { useEffect, useRef, useState } from 'react';
import Magnet from './reactbits/Magnet';
import { useScrollTo } from '../lib/smooth';
import { brand } from '../content/shared';
import { videoUrl } from '../lib/video';
import { cachedUrl } from '../lib/preload';
import { lite } from '../lib/prefs';

export const ArrowIcon = ({ className = '' }) => (
  <svg viewBox="0 0 16 16" className={`dir-flip ${className}`} width="14" height="14" fill="none" aria-hidden="true">
    <path d="M3.5 12.5 12.5 3.5M5.5 3.5h7v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PlayIcon = ({ className = '' }) => (
  <svg viewBox="0 0 16 16" className={className} width="12" height="12" aria-hidden="true">
    <path d="M4.5 2.8v10.4a.6.6 0 0 0 .9.5l8.2-5.2a.6.6 0 0 0 0-1L5.4 2.3a.6.6 0 0 0-.9.5Z" fill="currentColor" />
  </svg>
);

// Pill button. `href` starting with # scrolls smoothly via Lenis.
export function Pill({ children, href, onClick, variant = 'dark', size, icon = 'arrow', magnetic = false, className = '', ...rest }) {
  const scrollTo = useScrollTo();
  const cls = `pill pill-${variant} ${size === 'sm' ? 'pill-sm' : ''} ${className}`;
  const handle = e => {
    if (href?.startsWith('#')) {
      e.preventDefault();
      scrollTo(href);
    }
    onClick?.(e);
  };
  const inner = (
    <>
      <span>{children}</span>
      {icon && <span className="pill-icon">{icon === 'play' ? <PlayIcon /> : <ArrowIcon />}</span>}
    </>
  );
  const el = href ? (
    <a href={href} onClick={handle} className={cls} data-cursor="hover" {...rest}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={handle} className={cls} data-cursor="hover" {...rest}>
      {inner}
    </button>
  );
  if (!magnetic || lite) return el;
  return (
    <Magnet padding={60} magnetStrength={4} wrapperClassName="inline-block">
      {el}
    </Magnet>
  );
}

export function Timestamp({ time, label, tone = 'ink', className = '' }) {
  const color = tone === 'white' ? 'text-white/70' : tone === 'sky' ? 'text-white' : 'text-muted';
  return (
    <div className={`timestamp mono-label ${color} ${className}`}>
      <span dir="ltr" className={`time ${tone === 'white' ? 'text-sky-400' : tone === 'sky' ? 'text-white' : 'text-sky-600'}`}>
        {time}
      </span>
      <span className="tick" />
      <span>{label}</span>
    </div>
  );
}

// iOS Low Power Mode (and some data savers) refuse autoplay until the visitor touches the page.
// Refused videos are remembered and started on the next tap; the ones on screen keep playing.
const refused = new Set();
const onScreen = el => {
  const r = el.getBoundingClientRect();
  return r.bottom > -200 && r.top < window.innerHeight + 200;
};
// Starting several videos in the same frame is a visible hitch on phones: they start one at a time.
const startQueue = new Set();
let startTimer = 0;
function nextStart() {
  startTimer = 0;
  const el = startQueue.values().next().value;
  if (!el) return;
  startQueue.delete(el);
  if (el.isConnected && onScreen(el)) {
    el.play?.()
      .then(() => refused.delete(el))
      .catch(() => refused.add(el));
    startTimer = setTimeout(nextStart, 90);
  } else {
    nextStart();
  }
}
function play(el) {
  startQueue.add(el);
  if (!startTimer) nextStart();
}
if (typeof window !== 'undefined') {
  // a tap unlocks every refused video, so ones scrolled to later can start on their own;
  // the off-screen ones are paused again straight away
  const retry = () =>
    refused.forEach(el => {
      if (!el.isConnected || !el.src) return;
      el.play?.()
        .then(() => {
          refused.delete(el);
          if (!onScreen(el)) el.pause();
        })
        .catch(() => {});
    });
  ['touchend', 'click', 'keydown'].forEach(type => window.addEventListener(type, retry, { passive: true }));
}

// Plays only while on screen — keeps a wall of reels cheap.
export function Video({ src, poster, className = '', eager = false, ...rest }) {
  const ref = useRef(null);
  const [load, setLoad] = useState(eager);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    // React sets `muted` only as a property; iOS checks the attribute before it allows autoplay
    el.muted = true;
    el.setAttribute('muted', '');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true);
          play(el);
        } else {
          startQueue.delete(el);
          el.pause?.();
        }
      },
      { rootMargin: '200px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // a src that arrives later (e.g. the showreel wall going live) should start playing on its own
  useEffect(() => {
    const el = ref.current;
    if (!el || !load || !src) return;
    if (onScreen(el)) play(el);
  }, [src, load]);

  // The poster is a real image underneath: it shows at once (iPhones draw nothing for a <video> without a
  // source), and the clip fades in over it once frames are actually playing.
  return (
    <>
      {poster && <img src={poster} alt="" aria-hidden="true" className={className} decoding="async" />}
      <video
        ref={ref}
        className={`transition-opacity duration-500 ${playing ? 'opacity-100' : 'opacity-0'} ${className}`}
        src={load && src ? cachedUrl(videoUrl(src)) : undefined}
        muted
        loop
        playsInline
        autoPlay={eager}
        preload={eager ? 'auto' : 'none'}
        onPlaying={() => setPlaying(true)}
        aria-hidden="true"
        {...rest}
      />
    </>
  );
}

// A browser window around a looping screen recording. The preview plays muted; a tap opens the full walkthrough.
export function Screen({ item, url, src, onOpen, className = '', ...rest }) {
  return (
    <button type="button" onClick={() => onOpen(item)} className={`screen ${className}`} data-cursor="play" aria-label={item.title} {...rest}>
      <span className="screen-bar" dir="ltr" aria-hidden="true">
        <i />
        <i />
        <i />
        {url && <span className="screen-url">{url}</span>}
      </span>
      <span className="screen-view">
        <Video src={src} poster={item.poster} />
      </span>
    </button>
  );
}

// Live local time for the agency's city — "time" is the brand. Ticks only while it is on screen,
// and writes straight to the DOM so a second never costs a React render.
const clockText = (() => {
  const make = seconds =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: seconds ? '2-digit' : undefined, hour12: false, timeZone: brand.timezone });
  const short = make(false);
  const long = make(true);
  return seconds => (seconds ? long : short).format(new Date());
})();

export function LiveClock({ className = '', seconds = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    let id = 0;
    const tick = () => {
      const now = clockText(seconds);
      if (el.textContent !== now) el.textContent = now;
    };
    const io = new IntersectionObserver(([entry]) => {
      clearInterval(id);
      id = 0;
      if (entry.isIntersecting) {
        tick();
        id = setInterval(tick, 1000);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(id);
    };
  }, [seconds]);
  return (
    <span ref={ref} dir="ltr" className={`font-mono tabular-nums ${className}`}>
      {clockText(seconds)}
    </span>
  );
}

export function Cross({ className = '' }) {
  return <span className={`cross ${className}`} aria-hidden="true" />;
}
