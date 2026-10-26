import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap';
import { lite, NO_PREF_QUERY } from '../lib/prefs';
import LightRays from '../components/reactbits/LightRays';
import { Cross, Timestamp } from '../components/ui';
import { chapterTimes } from '../content/shared';
import { useRtl, useT } from '../i18n';

// Pinned chapter: the page holds still while the manifesto lights up word by word,
// so the reader actually gets to read it before the showreel takes over.
export default function Manifesto() {
  const root = useRef(null);
  const t = useT();
  const rtl = useRtl();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_PREF_QUERY(), () => {
        const split = new SplitText('[data-manifesto]', { type: 'words' });
        gsap.set(split.words, { opacity: 0.14 });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=140%',
            pin: true,
            scrub: 0.6,
            anticipatePin: 1
          }
        });
        tl.from('[data-manifesto-head]', { y: 30, opacity: 0, duration: 0.15, ease: 'power2.out' }, 0)
          // each word: lights up sky, then settles to white
          .to(split.words, { opacity: 1, color: '#50B4E8', duration: 0.12, stagger: 0.022, ease: 'none' }, 0.05)
          .to(split.words, { color: '#ffffff', duration: 0.2, stagger: 0.022, ease: 'none' }, 0.17)
          .from('[data-manifesto-stat]', { y: 40, opacity: 0, stagger: 0.06, duration: 0.2, ease: 'power3.out' }, '>-0.25')
          // breathe out before the showreel arrives
          .to('[data-manifesto-body]', { scale: 0.94, opacity: 0.35, duration: 0.25, ease: 'power1.in' }, '>+0.1');
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  // the outer div keeps React's DOM intact while GSAP wraps the section in a pin-spacer;
  // its negative margin slides the chapter over the hero's darkening tail (no dead black stretch)
  return (
    <div className="relative z-30 -mt-[35svh]">
      <section id="manifesto" ref={root} className="relative -mt-px flex min-h-[100svh] items-center overflow-hidden bg-night py-[14vh] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          {lite ? (
            <div className="h-full w-full bg-[radial-gradient(70%_55%_at_50%_0%,rgba(80,180,232,0.45)_0%,rgba(80,180,232,0.12)_45%,transparent_75%)]" />
          ) : (
          <LightRays
            raysOrigin="top-center"
            raysColor="#50B4E8"
            raysSpeed={0.6}
            lightSpread={0.9}
            rayLength={1.6}
            glow={0.5}
            haze={0.3}
            followMouse
            mouseInfluence={0.06}
            maxDevicePixelRatio={0.75}
            intro={false}
          />
          )}
        </div>
        <div data-manifesto-body className="frame relative origin-center">
          <Cross className="-left-[5px] -top-[60px] hidden md:block" />
          <Cross className="-right-[5px] -top-[60px] hidden md:block" />
          <div data-manifesto-head>
            <Timestamp time={chapterTimes[1]} label={t.chapters[1]} tone="white" />
          </div>
          <h2
            data-manifesto
            className="manifesto mt-10 max-w-[1100px] text-[8.4vw] font-medium leading-[1.06] tracking-[-0.035em] md:text-[4.6vw] xl:text-[4.25rem]"
            style={{ transformOrigin: rtl ? '100% 50%' : '0% 50%' }}
          >
            {t.manifesto.text}
          </h2>
          <div className="mt-16 grid gap-6 border-t border-white/10 pt-8 text-white/60 md:grid-cols-3">
            {t.manifesto.stats.map(([k, v]) => (
              <div key={k} data-manifesto-stat className="flex items-baseline gap-3">
                <span className="text-3xl font-medium tracking-tight text-white">{k}</span>
                <span className="text-[15px]">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
