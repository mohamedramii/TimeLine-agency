import { lazy, Suspense, useRef, useState } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap';
import { NO_PREF_QUERY } from '../lib/prefs';
import Silk from '../components/reactbits/Silk';
import TrueFocus from '../components/reactbits/TrueFocus';
import { LiveClock, Pill, PlayIcon, Video } from '../components/ui';
import { usePlayer } from '../components/VideoModal';
import { Symbol } from '../components/Logo';
import { useMedia, useRtl, useT } from '../i18n';

const HeroScene = lazy(() => import('../three/HeroScene'));

const Stars = () => (
  <span className="flex gap-0.5 text-sky-500" aria-label="5/5">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} width="13" height="13" viewBox="0 0 16 16" aria-hidden="true">
        <path d="m8 1.4 2 4.3 4.6.5-3.4 3.2.9 4.6L8 11.7 3.9 14l.9-4.6L1.4 6.2 6 5.7Z" fill="currentColor" />
      </svg>
    ))}
  </span>
);

function Ruler() {
  const ticks = Array.from({ length: 121 });
  return (
    <div dir="ltr" className="ruler flex items-end gap-[9px] whitespace-nowrap will-change-transform">
      {ticks.map((_, i) => {
        const major = i % 10 === 0;
        return (
          <span key={i} className="relative flex flex-col items-center">
            {major && (
              <span className="absolute -top-6 font-mono text-[10px] tracking-[0.08em] text-muted">
                {String(Math.floor(i / 2)).padStart(2, '0')}:{i % 20 === 0 ? '00' : '30'}
              </span>
            )}
            <span className={`block w-px ${major ? 'h-4 bg-sky-500' : 'h-2 bg-ink/20'}`} />
          </span>
        );
      })}
    </div>
  );
}

export default function Hero({ ready }) {
  const root = useRef(null);
  const stage = useRef(null);
  const progress = useRef(0);
  const open = usePlayer();
  const t = useT();
  const rtl = useRtl();
  const media = useMedia();
  // WebGL clock on tablets/desktops; phones get a light SVG watermark instead
  const [desktop] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches);
  const phone = !desktop;
  const h = t.hero;
  const s = rtl ? -1 : 1; // horizontal direction

  // Intro — runs once the preloader hands over.
  useGSAP(
    () => {
      if (!ready) return;
      const lines = gsap.utils.toArray('[data-hero-line]');
      // words only: splitting Arabic into characters would break letter joining
      const splits = lines.map(l => new SplitText(l, { type: 'lines,words', mask: 'lines' }));
      // the 3D layer spans the hero; grow it out of the clock's own box, not the screen centre
      const st = stage.current;
      const stageCenter = `${st.offsetLeft + st.offsetWidth / 2}px ${st.offsetTop + st.offsetHeight / 2}px`;
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.from(
        splits.flatMap(sp => sp.words),
        { yPercent: 115, rotate: 4 * s, duration: 1.4, stagger: 0.05 },
        0.05
      )
        // drop the line masks once the words land — they would clip Arabic dots and diacritics
        .call(() => splits.forEach(sp => sp.revert()), null, '>')
        .from('[data-hero-fade]', { y: 26, opacity: 0, duration: 1.2, stagger: 0.08 }, 0.45)
        .from('[data-hero-card]', { y: 80, opacity: 0, duration: 1.6, stagger: 0.12 }, 0.5)
        .from('[data-hero-3d]', { scale: 0.7, opacity: 0, duration: 2, transformOrigin: stageCenter }, 0.2)
        .from('.ruler', { xPercent: -10, opacity: 0, duration: 2 }, 0.6);
      return () => splits.forEach(sp => sp.revert());
    },
    { scope: root, dependencies: [ready] }
  );

  // Scroll — the headline parts horizontally, the camera dives into the clock and night falls.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_PREF_QUERY(), () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=130%',
            pin: true,
            scrub: 0.8,
            onUpdate: self => (progress.current = self.progress)
          }
        });
        tl.to('[data-hero-line="0"]', { xPercent: -18 * s, opacity: 0, ease: 'none' }, 0)
          .to('[data-hero-line="1"]', { xPercent: 14 * s, opacity: 0, ease: 'none' }, 0)
          .to('[data-hero-line="2"]', { xPercent: -10 * s, opacity: 0, ease: 'none' }, 0)
          .to('[data-hero-fade]', { y: -60, opacity: 0, stagger: 0.02, ease: 'none' }, 0)
          .to('[data-hero-card="a"]', { x: `${28 * s}vw`, y: '-30vh', rotate: 22 * s, ease: 'none' }, 0)
          .to('[data-hero-card="b"]', { x: `${20 * s}vw`, y: '30vh', rotate: -18 * s, ease: 'none' }, 0)
          .to('.ruler', { xPercent: -30, ease: 'none' }, 0)
          .to('[data-silk]', { scale: 1.25, ease: 'none' }, 0)
          .to('[data-night]', { opacity: 1, ease: 'power1.in' }, 0.55);
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  // GSAP wraps pinned sections in a pin-spacer; the outer div keeps React's DOM bookkeeping intact.
  return (
    <div>
      <section id="top" ref={root} className="relative h-[100svh] min-h-[680px] overflow-hidden bg-paper">
        {/* Sky silk */}
        <div data-silk className="absolute inset-0 ltr:origin-right rtl:origin-left">
          <Silk
            lightMode
            color="#56b7e9"
            sheenColor="#ffffff"
            speed={2.2}
            scale={1.05}
            depth={0.6}
            sheen={0.8}
            glow={0.3}
            noiseIntensity={0.4}
            rotation={0.35}
            intro={false}
            dpr={0.75}
          />
        </div>
        <div className="hero-veil pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-paper to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-paper/80 to-transparent" />

        {/* 3D clock: the canvas covers the whole hero so the camera dive has no edge to hit;
            .hero-stage only marks where the clock sits (and holds the SVG watermark on phones) */}
        <div data-hero-3d className="pointer-events-none absolute inset-0">
          <div ref={stage} className="hero-stage">
            {phone && <Symbol className="h-full w-full" color="var(--color-sky-500)" />}
          </div>
          {desktop && (
            <Suspense fallback={null}>{ready && <HeroScene progress={progress} anchor={stage} className="absolute inset-0" />}</Suspense>
          )}
        </div>

        {/* Floating proof cards */}
        <button
          type="button"
          data-hero-card="a"
          onClick={() => open(media.zatFinal)}
          className="reel absolute bottom-[17vh] end-[5vw] hidden w-[140px] rotate-[7deg] lg:block xl:w-[158px]"
          data-cursor="play"
          aria-label={t.ui.playShowreel}
        >
          <Video src={media.zatFinal.loop} poster={media.zatFinal.poster} eager />
          <span className="absolute inset-x-2 bottom-2 flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-medium text-ink backdrop-blur">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-sky-500 text-white">
              <PlayIcon className="h-2.5 w-2.5" />
            </span>
            {h.reel}
          </span>
        </button>

        <div
          data-hero-card="b"
          className="absolute bottom-[14vh] end-[calc(5vw+150px)] hidden w-[230px] -rotate-[4deg] rounded-[22px] bg-white/75 p-4 shadow-[var(--shadow-lift)] backdrop-blur-xl lg:block"
        >
          <div className="flex items-center justify-between">
            <span className="mono-label !text-[10px] text-muted">{h.card.label}</span>
            <span dir="ltr" className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
              +3.2x
            </span>
          </div>
          <svg viewBox="0 0 200 60" className="dir-flip mt-3 h-14 w-full" aria-hidden="true">
            <defs>
              <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#50B4E8" stopOpacity="0.35" />
                <stop offset="1" stopColor="#50B4E8" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 52 C20 50 30 46 45 44 S70 40 85 33 110 30 125 22 150 18 165 12 190 6 200 4 V60 H0Z" fill="url(#spark)" />
            <path
              d="M0 52 C20 50 30 46 45 44 S70 40 85 33 110 30 125 22 150 18 165 12 190 6 200 4"
              fill="none"
              stroke="#50B4E8"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="200" cy="4" r="3.5" fill="#50B4E8" />
          </svg>
          <p className="mt-1 text-[12px] text-muted">{h.card.note}</p>
        </div>

        {/* Copy */}
        <div className="hero-copy frame relative z-10 flex h-full flex-col">
          <h1 className="hero-title display max-w-[15ch] text-ink">
            <span data-hero-line="0" className="block">
              {h.lines[0]}
            </span>
            <span data-hero-line="1" className="block">
              {h.lines[1]}
            </span>
            <span data-hero-line="2" className="serif-accent block text-sky-500 [font-size:1.08em] [line-height:0.9]">
              {h.accent}
            </span>
          </h1>

          <p data-hero-fade className="hero-sub mt-5 max-w-[33rem] leading-relaxed text-ink-2">
            {h.sub}
          </p>

          {/* outcomes on their own line: TrueFocus brackets hop between them, the rest stay blurred */}
          <div data-hero-fade className="hero-focus mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="mono-label flex items-center gap-2 text-sky-600">
              <span className="h-px w-6 bg-sky-500" />
              {h.focusLabel}
            </span>
            <div className="serif-accent text-ink">
              <TrueFocus
                key={t.lang}
                sentence={(phone ? h.rotating.slice(0, 3) : h.rotating).join('|')}
                separator="|"
                focusStyle="brackets"
                easing="spring"
                borderColor="#50B4E8"
                glowColor="rgba(80, 180, 232, 0.55)"
                blurAmount={2.5}
                unfocusedOpacity={0.4}
                focusScale={1.04}
                cornerSize={12}
                borderWidth={2}
                animationDuration={0.6}
                pauseBetweenAnimations={1.2}
              />
            </div>
          </div>

          <div data-hero-fade className="hero-ctas mt-7 flex flex-wrap items-center gap-3">
            <Pill href="#contact" magnetic>
              {h.primary}
            </Pill>
            <Pill variant="light" icon="play" onClick={() => open(media.zatFinal)}>
              {h.secondary}
            </Pill>
          </div>

          <div data-hero-fade className="hero-proof mt-7 flex items-center gap-4">
            <div dir="ltr" className="flex -space-x-2.5">
              {['z', 'M', 'S', '+'].map((l, i) => (
                <span
                  key={l}
                  className={`grid h-9 w-9 place-items-center rounded-full border-2 border-paper font-sans text-[13px] font-semibold ${
                    i === 3 ? 'bg-sky-500 text-white' : 'bg-white text-ink shadow-[0_0_0_1px_var(--color-line)]'
                  }`}
                >
                  {l}
                </span>
              ))}
            </div>
            <div>
              <Stars />
              <p className="mt-1 text-[13px] text-muted">{h.proof}</p>
            </div>
          </div>
        </div>

        {/* Bottom ruler */}
        <div className="absolute inset-x-0 bottom-0 z-10 overflow-hidden pb-5 pt-8">
          <div className="frame mb-8 flex items-center justify-center md:justify-between">
            <span className="hidden w-[220px] md:block" />
            <span className="mono-label text-muted">{t.ui.scrollCue}</span>
            <span className="mono-label hidden text-muted sm:block">
              {t.city} · <LiveClock seconds className="text-ink" />
            </span>
          </div>
          <Ruler />
        </div>

        {/* Night falls */}
        <div data-night className="pointer-events-none absolute inset-0 z-20 bg-night opacity-0" />
      </section>
    </div>
  );
}
