import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { motionOff } from '../lib/prefs';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import SplitText from '../components/reactbits/SplitText';
import { Pill, Timestamp, Video } from '../components/ui';
import { usePlayer } from '../components/VideoModal';
import { chapterTimes, egp, maxSaving, packages, prices, serviceLooks } from '../content/shared';
import { useMedia, useRtl, useT } from '../i18n';

const TONES = {
  light: {
    surface: '#ffffff',
    text: 'text-ink',
    sub: 'text-muted',
    chip: 'bg-sky-50 text-sky-800',
    spot: 'rgba(80,180,232,0.22)',
    theme: 'light'
  },
  sky: {
    surface: '#50B4E8',
    text: 'text-white',
    sub: 'text-white/85',
    chip: 'bg-white/20 text-white',
    spot: 'rgba(255,255,255,0.35)',
    theme: 'light'
  },
  night: {
    surface: '#0c1d2b',
    text: 'text-white',
    sub: 'text-white/65',
    chip: 'bg-white/10 text-white/90',
    spot: 'rgba(80,180,232,0.3)',
    theme: 'dark'
  }
};

function Dashboard({ d }) {
  const bars = [38, 52, 44, 66, 58, 81, 74, 96];
  return (
    <div className="rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10 md:p-4">
      <div className="flex items-center justify-between">
        <span className="mono-label !text-[10px] text-white/50">{d.label}</span>
        <span dir="ltr" className="rounded-full bg-sky-500 px-2 py-0.5 text-[11px] font-semibold text-white">
          4.6x
        </span>
      </div>
      <div className="mt-3 flex h-12 items-end gap-2 md:mt-4 md:h-28">
        {bars.map((b, i) => (
          <span
            key={i}
            className={`flex-1 rounded-t-md ${i === bars.length - 1 ? 'bg-sky-400' : 'bg-white/15'}`}
            style={{ height: `${b}%` }}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-white/60 md:mt-4">
        {[
          [d.ctr, '3.8%'],
          [d.cpa, '−42%'],
          [d.hooks, '24']
        ].map(([k, v]) => (
          <span key={k}>
            {k}{' '}
            <b dir="ltr" className="block text-base font-medium text-white">
              {v}
            </b>
          </span>
        ))}
      </div>
    </div>
  );
}

// The real price behind each service, from the shared price list.
function priceTag(look, tags) {
  if (look.price === 'sponsor') return tags.sponsor;
  if (look.price === 'packages') return tags.packages(egp(Math.min(...packages.map(p => p.price))));
  return tags[look.price](egp(prices[look.price]));
}

function ServiceCard({ s, look, open, t, media }) {
  const tone = TONES[look.tone];
  const text = typeof s.text === 'function' ? s.text(egp(maxSaving())) : s.text;
  const item = look.media ? media[look.media] : null;
  const image = look.image ? media[look.image] : null;
  return (
    <SpotlightCard
      theme={tone.theme}
      spotlightColor={tone.spot}
      className={`service-card !rounded-[30px] !p-0 flex h-full max-h-[540px] w-[min(500px,84vw)] shrink-0 flex-col md:h-[min(64svh,600px)] md:max-h-none ${tone.text}`}
      style={{
        '--spotlight-card-surface': tone.surface,
        '--spotlight-card-shadow': look.tone === 'light' ? 'var(--shadow-soft)' : 'var(--shadow-lift)',
        '--spotlight-card-border': look.tone === 'light' ? 'var(--color-line)' : 'rgba(255,255,255,0.08)'
      }}
    >
      <div className="flex items-start justify-between p-5 pb-0 md:p-8 md:pb-0">
        <span dir="ltr" className="display font-sans text-5xl opacity-90 md:text-7xl">
          {look.no}
        </span>
        <span className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${tone.chip}`}>{priceTag(look, t.services.priceTags)}</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-row gap-4 p-5 md:gap-5 md:p-8">
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="mt-auto text-[23px] font-medium leading-[1.15] tracking-[-0.03em] md:text-[34px]">{s.title}</h3>
          <p className={`mt-2 text-[14px] leading-relaxed md:mt-3 md:text-[15px] ${tone.sub}`}>{text}</p>
          <div className="mt-5 hidden flex-wrap gap-1.5 sm:flex">
            {s.tags.map(tag => (
              <span key={tag} className={`rounded-full px-3 py-1 text-[12px] font-medium ${tone.chip}`}>
                {tag}
              </span>
            ))}
          </div>
          {look.cta && (
            <div className="mt-6">
              <Pill href={look.cta} variant={look.tone === 'sky' ? 'light' : 'dark'} size="sm">
                {s.cta}
              </Pill>
            </div>
          )}
        </div>
        {item && (
          <button
            type="button"
            onClick={() => open(item)}
            className="reel mt-auto w-[36%] shrink-0 !rounded-[20px] sm:w-[38%]"
            data-cursor="play"
            aria-label={item.title}
          >
            <Video src={item.tile} poster={item.poster} />
          </button>
        )}
        {image && (
          <div className="mt-auto w-[38%] shrink-0 overflow-hidden rounded-[20px] shadow-[var(--shadow-lift)] sm:w-[40%]">
            <img src={image.poster} alt={image.title} loading="lazy" className="aspect-[3/4] h-full w-full object-cover" />
          </div>
        )}
      </div>
      {look.dashboard && (
        <div className="px-5 pb-5 md:px-8 md:pb-8">
          <Dashboard d={t.services.dashboard} />
        </div>
      )}
    </SpotlightCard>
  );
}

// Horizontal chapter: the page scrolls down, the services travel sideways
// (leftwards in English, rightwards in Arabic).
export default function Services() {
  const root = useRef(null);
  const track = useRef(null);
  const [index, setIndex] = useState(1);
  const open = usePlayer();
  const t = useT();
  const rtl = useRtl();
  const media = useMedia();
  const sv = t.services;
  const total = sv.items.length;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(motionOff() ? 'not all' : 'all', () => {
        const dir = rtl ? 1 : -1;
        const distance = () => track.current.scrollWidth - window.innerWidth;
        const tween = gsap.to(track.current, {
          x: () => dir * distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: self => {
              setIndex(Math.min(total, Math.floor(self.progress * total) + 1));
              gsap.set('[data-svc-progress]', { scaleX: self.progress });
            }
          }
        });
        // each card leans in as it travels
        gsap.utils.toArray('.service-card').forEach(card => {
          gsap.fromTo(
            card,
            { rotate: 3 * -dir, y: 40 },
            {
              rotate: -2 * -dir,
              y: -10,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: rtl ? 'right left' : 'left right',
                end: rtl ? 'left right' : 'right left',
                scrub: true
              }
            }
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  // GSAP wraps pinned sections in a pin-spacer; the outer div keeps React's DOM bookkeeping intact.
  return (
    <div>
      <section id="services" ref={root} className="relative h-[100svh] overflow-hidden bg-paper">
        <div className="flex h-full flex-col justify-center gap-5 pb-6 pt-16 md:gap-10 md:py-0">
          <div className="frame flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Timestamp time={chapterTimes[3]} label={t.chapters[3]} />
              <h2 className="display mt-3 max-w-[20ch] text-[7.6vw] md:mt-5 md:max-w-[16ch] md:text-[4.8vw] xl:text-[4.6rem]">
                <SplitText key={t.lang} text={sv.title} tag="span" textAlign="start" splitType="words" delay={40} className="!inline" />{' '}
                <span className="serif-accent text-sky-500">{sv.accent}</span>
              </h2>
            </div>
            <div className="hidden items-end gap-6 md:flex">
              <p className="max-w-[18rem] text-[15px] text-muted">{sv.sub}</p>
              <span dir="ltr" className="display font-sans text-5xl tabular-nums text-ink">
                {String(index).padStart(2, '0')}
                <span className="text-line">/{String(total).padStart(2, '0')}</span>
              </span>
            </div>
          </div>

          <div
            ref={track}
            className="flex min-h-0 flex-1 gap-4 px-[var(--gutter)] md:flex-none md:gap-5"
            data-cursor="drag"
          >
            {sv.items.map((s, i) => (
              <ServiceCard key={serviceLooks[i].no} s={s} look={serviceLooks[i]} open={open} t={t} media={media} />
            ))}
            <div className="flex w-[min(380px,70vw)] shrink-0 flex-col justify-center pe-[var(--gutter)]">
              <p className="serif-accent text-5xl leading-[1] text-ink">{sv.endTitle}</p>
              <p className="mt-4 text-muted">{sv.endText}</p>
              <a href="#contact" className="mt-6 inline-flex items-center gap-2 font-medium text-sky-600" data-cursor="hover">
                {sv.endLink}
              </a>
            </div>
          </div>

          <div className="frame">
            <div className="h-px w-full bg-line">
              <div data-svc-progress className="h-px scale-x-0 bg-sky-500 ltr:origin-left rtl:origin-right" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
