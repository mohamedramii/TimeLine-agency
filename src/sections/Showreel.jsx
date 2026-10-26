import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { lite, NO_PREF_QUERY, REDUCE_QUERY } from '../lib/prefs';
import { Timestamp, Video } from '../components/ui';
import { usePlayer } from '../components/VideoModal';
import { chapterTimes, showreelWall } from '../content/shared';
import { useMedia, useT } from '../i18n';

const COLS = 5;
const CENTER = 7; // col 2, row 1

// "Canvas zoom-out": we start inside one reel, then pull the camera back to reveal the whole wall.
export default function Showreel() {
  const root = useRef(null);
  const wall = useRef(null);
  const open = usePlayer();
  const t = useT();
  const media = useMedia();
  const sr = t.showreel;
  // tiles stay on their posters until the camera starts pulling back — 14 videos never start in the same frame
  const [live, setLive] = useState(false);
  const liveRef = useRef(false);

  const columns = Array.from({ length: COLS }, (_, c) => showreelWall.map((key, i) => ({ key, i })).filter(x => x.i % COLS === c));

  useGSAP(
    () => {
      const center = wall.current.querySelector(`[data-tile="${CENTER}"]`);
      const zoom = () => Math.max(window.innerWidth / center.offsetWidth, window.innerHeight / center.offsetHeight) * 1.04;
      // whole wall on laptops; on wide screens fill the width and let top/bottom rows crop (an endless wall)
      const fit = () =>
        window.innerWidth >= 1600
          ? Math.min(1, (window.innerWidth * 1.02) / wall.current.offsetWidth)
          : Math.min(1, (window.innerHeight * 1.05) / wall.current.offsetHeight, (window.innerWidth * 1.02) / wall.current.offsetWidth);

      gsap.set(wall.current, { xPercent: -50, yPercent: -50, scale: zoom });

      const mm = gsap.matchMedia();
      mm.add(NO_PREF_QUERY(), () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=240%',
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: self => {
              if (!liveRef.current && self.progress > 0.08) {
                liveRef.current = true;
                setLive(true);
              }
            }
          }
        });
        // arrive softly out of the manifesto's night instead of cutting to a full-screen video
        gsap.fromTo(
          '[data-reel-enter]',
          { opacity: 1 },
          { opacity: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 15%', scrub: true } }
        );
        gsap.fromTo(
          '[data-reel-title] > *',
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: root.current, start: 'top 70%', end: 'top top', scrub: true } }
        );
        tl.fromTo(wall.current, { scale: zoom }, { scale: fit, ease: 'power2.inOut', duration: 0.62 }, 0.06)
          .fromTo(center, { '--r': '0px' }, { '--r': '22px', ease: 'none', duration: 0.4 }, 0.1)
          .to('[data-reel-shade]', { opacity: 0, ease: 'none', duration: 0.3 }, 0.12)
          .to('[data-reel-title]', { scale: 0.7, opacity: 0, ease: 'power1.in', duration: 0.38 }, 0.08)
          .fromTo('[data-col="0"],[data-col="4"]', { yPercent: 6 }, { yPercent: -10, ease: 'none', duration: 1 }, 0)
          .fromTo('[data-col="1"],[data-col="3"]', { yPercent: -12 }, { yPercent: 4, ease: 'none', duration: 1 }, 0)
          .from('[data-reel-outro] > *', { y: 50, opacity: 0, stagger: 0.04, duration: 0.18, ease: 'power3.out' }, 0.68)
          .to({}, { duration: 0.12 });
      });
      mm.add(REDUCE_QUERY(), () => {
        setLive(true);
        gsap.set(wall.current, { scale: fit });
        gsap.set('[data-reel-title]', { opacity: 0 });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  // GSAP wraps pinned sections in a pin-spacer; the outer div keeps React's DOM bookkeeping intact.
  return (
    <div>
      <section id="showreel" ref={root} className="relative h-[100svh] overflow-hidden bg-night text-white">
        <div
          ref={wall}
          dir="ltr"
          className="reel-wall absolute left-1/2 top-1/2 flex gap-[1.5vw] will-change-transform"
        >
          {columns.map((col, c) => (
            <div key={c} data-col={c} className="flex flex-1 flex-col gap-[1.5vw]">
              {col.map(({ key, i }) => {
                const item = media[key];
                const isCenter = i === CENTER;
                // phones decode 9 reels at most: the outer columns sit half off screen, so they keep posters
                const plays = live && (!lite || (c >= 1 && c <= 3));
                return (
                  <button
                    type="button"
                    key={i}
                    data-tile={i}
                    onClick={() => open(item)}
                    className="reel w-full !rounded-[var(--r,22px)]"
                    data-cursor="play"
                    aria-label={item.title}
                  >
                    <Video src={isCenter ? item.loop : plays ? item.tile : undefined} poster={item.poster} eager={isCenter} />
                    {isCenter && (
                      <span data-reel-shade className="absolute inset-0 bg-gradient-to-b from-night/40 via-night/10 to-night/60" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div data-reel-enter className="pointer-events-none absolute inset-0 bg-night" />

        {/* Title shown while we're "inside" the reel */}
        <div data-reel-title className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <Timestamp time={chapterTimes[2]} label={t.chapters[2]} tone="white" className="mb-6" />
          <h2 className="display text-[13vw] md:text-[8.5vw]">
            {sr.title[0]}
            <br />
            <span className="serif-accent text-sky-300">{sr.title[1]}</span>
          </h2>
        </div>

        {/* Outro once the wall is revealed */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-night via-night/80 to-transparent pb-24 pt-40">
          <div data-reel-outro className="frame flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-md">
              <Timestamp time={chapterTimes[2]} label={sr.wallLabel} tone="white" />
              <p className="mt-4 text-lg text-white/75">{sr.caption}</p>
            </div>
            <div className="flex gap-10">
              {sr.stats.map(st => (
                <div key={st.label}>
                  <p dir="ltr" className="display text-6xl text-white md:text-7xl">
                    {st.value}
                  </p>
                  <p className="mono-label mt-2 text-sky-300">{st.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
