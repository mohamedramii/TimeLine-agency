import { useEffect, useRef, useState } from 'react';
import Magnet from './reactbits/Magnet';
import { useScrollTo } from '../lib/smooth';
import { brand } from '../content/shared';
import { videoUrl } from '../lib/video';
import { cachedUrl } from '../lib/preload';

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
  if (!magnetic) return el;
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
function play(el) {
  el.play?.()
    .then(() => refused.delete(el))
    .catch(() => refused.add(el));
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

  return (
    <video
      ref={ref}
      className={className}
      src={load ? cachedUrl(videoUrl(src)) : undefined}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay={eager}
      preload={eager ? 'auto' : 'none'}
      aria-hidden="true"
      {...rest}
    />
  );
}

// Live local time for the agency's city — "time" is the brand.
export function LiveClock({ className = '', seconds = false }) {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: seconds ? '2-digit' : undefined,
      hour12: false,
      timeZone: brand.timezone
    }).format(new Date());
  const [now, setNow] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setNow(fmt()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <span dir="ltr" className={`font-mono tabular-nums ${className}`}>
      {now}
    </span>
  );
}

export function Cross({ className = '' }) {
  return <span className={`cross ${className}`} aria-hidden="true" />;
}
