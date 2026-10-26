import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { NO_PREF_QUERY } from '../lib/prefs';
import SplitText from '../components/reactbits/SplitText';
import { Pill, Timestamp, Video } from '../components/ui';
import { usePlayer } from '../components/VideoModal';
import { caseLooks, chapterTimes } from '../content/shared';
import { useMedia, useRtl, useT } from '../i18n';

const TONE = {
  light: 'bg-white text-ink shadow-[var(--shadow-lift)]',
  night: 'bg-night text-white',
  sky: 'bg-sky-500 text-white shadow-[var(--shadow-sky)]'
};

function CaseCard({ c, look, i, total, open, t, media }) {
  const dark = look.tone !== 'light';
  const reels = look.media.map(k => media[k]);
  return (
    <article
      data-case
      className={`case-card sticky mb-[8vh] flex min-h-[78svh] origin-top flex-col overflow-hidden rounded-[34px] lg:flex-row ${TONE[look.tone]}`}
      style={{ top: `calc(11vh + ${i * 18}px)` }}
    >
      <span data-case-dim className="pointer-events-none absolute inset-0 z-20 bg-[#0b2233] opacity-0" aria-hidden="true" />
      <div className="flex flex-1 flex-col p-7 md:p-12">
        <div className="flex items-center justify-between">
          <span className={`mono-label ${dark ? 'text-white/60' : 'text-muted'}`}>{c.type}</span>
          <span dir="ltr" className={`font-mono text-[12px] tracking-[0.08em] ${dark ? 'text-white/60' : 'text-muted'}`}>
            {String(i + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
          </span>
        </div>
        <h3 className={`display mt-8 text-[13vw] md:text-[6.2vw] xl:text-[5.6rem] ${look.script ? 'case-script' : ''}`}>{c.client}</h3>
        <p className={`serif-accent mt-3 text-3xl md:text-4xl ${look.tone === 'sky' ? 'text-white' : dark ? 'text-sky-300' : 'text-sky-500'}`}>{c.headline}</p>
        <p className={`mt-5 max-w-[30rem] text-[16px] leading-relaxed ${dark ? 'text-white/75' : 'text-muted'}`}>{c.text}</p>

        <div className={`mt-auto grid grid-cols-3 gap-4 border-t pt-6 ${dark ? 'border-white/15' : 'border-line'}`}>
          {c.results.map(([value, label]) => (
            <div key={label}>
              <p dir="ltr" className="display font-sans text-3xl md:text-5xl rtl:text-right">
                {value}
              </p>
              <p className={`mt-2 text-[12.5px] leading-snug ${dark ? 'text-white/60' : 'text-muted'}`}>{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-7">
          <Pill variant={look.tone === 'night' ? 'sky' : dark ? 'light' : 'dark'} icon="play" onClick={() => open(reels[0])}>
            {t.ui.watchReel}
          </Pill>
        </div>
      </div>

      <div className={`relative flex items-center justify-center gap-4 overflow-hidden p-7 md:gap-6 md:p-10 lg:w-[48%] ${dark ? 'bg-white/[0.04]' : 'bg-sky-25'}`}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url(/brand/tile.svg)', backgroundSize: '120px' }} />
        {reels.map((r, k) => (
          <button
            key={r.title + k}
            type="button"
            onClick={() => open(r)}
            data-case-reel={k}
            className={`reel relative w-[44%] max-w-[260px] ${k === 1 ? 'translate-y-10 rotate-[3deg]' : '-translate-y-6 -rotate-[2deg]'}`}
            data-cursor="play"
            aria-label={r.title}
          >
            <Video src={r.loop} poster={r.poster} />
          </button>
        ))}
        {look.image && (
          <img
            src={media[look.image].poster}
            alt={media[look.image].title}
            loading="lazy"
            className="absolute bottom-6 end-6 hidden w-[26%] -rotate-[6deg] rounded-2xl shadow-[var(--shadow-lift)] ring-4 ring-white xl:block"
          />
        )}
      </div>
    </article>
  );
}

export default function Work() {
  const root = useRef(null);
  const open = usePlayer();
  const t = useT();
  const rtl = useRtl();
  const media = useMedia();
  const cs = t.cases;

  useGSAP(
    () => {
      const cards = gsap.utils.toArray('[data-case]');
      const mm = gsap.matchMedia();
      mm.add(NO_PREF_QUERY(), () => {
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (next) {
            // recede as the next case stacks on top. A tinted overlay, not a CSS filter: tweening
            // filter from 'none' starts at brightness(0) (black), and filtering video layers is costly.
            const recede = { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true };
            gsap.fromTo(card, { scale: 1 }, { scale: 0.93, ease: 'none', scrollTrigger: recede });
            gsap.fromTo(card.querySelector('[data-case-dim]'), { opacity: 0 }, { opacity: 0.22, ease: 'none', scrollTrigger: recede });
          }
          gsap.from(card.querySelectorAll('[data-case-reel]'), {
            yPercent: 30,
            rotate: k => (k ? 10 : -8),
            opacity: 0,
            duration: 1.4,
            stagger: 0.1,
            scrollTrigger: { trigger: card, start: 'top 75%' }
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section id="work" ref={root} className="relative bg-paper pb-[6vh] pt-32 md:pt-40">
      <div className="frame flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <Timestamp time={chapterTimes[4]} label={t.chapters[4]} />
          <h2 className="display mt-5 text-[12vw] md:text-[6vw] xl:text-[5.6rem]">
            <SplitText key={t.lang} text={cs.title} tag="span" textAlign="start" splitType={rtl ? 'words' : 'chars'} delay={25} className="!inline" />{' '}
            <span className="serif-accent text-sky-500">{cs.accent}</span>
          </h2>
        </div>
        <p className="max-w-sm text-[16px] text-muted">{cs.sub}</p>
      </div>
      <div className="frame mt-16">
        {cs.items.map((c, i) => (
          <CaseCard key={caseLooks[i].id} c={c} look={caseLooks[i]} i={i} total={cs.items.length} open={open} t={t} media={media} />
        ))}
      </div>
    </section>
  );
}
