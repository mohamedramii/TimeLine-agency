import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { lite, NO_PREF_QUERY } from '../lib/prefs';
import SplitText from '../components/reactbits/SplitText';
import { Pill, PlayIcon, Screen, Timestamp } from '../components/ui';
import { usePlayer } from '../components/VideoModal';
import { chapterTimes, digitalFeatured, digitalMore } from '../content/shared';
import { useMedia, useT } from '../i18n';

function Project({ look, copy, index, media, open, t }) {
  const item = media[look.media];
  const second = look.extra ? media[look.extra] : null;
  const flip = index % 2 === 1;
  return (
    <article data-dg-row className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14">
      <div data-dg-screen className={`lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}>
        <Screen item={item} url={look.url} src={item.loop} onOpen={open} className="w-full" />
      </div>
      <div data-dg-copy className={`lg:col-span-5 ${flip ? 'lg:order-1' : ''}`}>
        <span className="mono-label text-sky-300">{copy.type}</span>
        <h3 dir="ltr" className="display mt-4 font-sans text-[10vw] text-white rtl:text-right md:text-[4rem]">
          {look.name}
        </h3>
        <p className="mt-4 max-w-[30rem] text-[17px] leading-relaxed text-white/70">{copy.text}</p>
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {copy.tags.map(tag => (
            <li key={tag} className="rounded-full bg-white/[0.07] px-3 py-1 text-[12.5px] font-medium text-white/80 ring-1 ring-white/10">
              {tag}
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Pill variant="sky" icon="play" size="sm" onClick={() => open(item)}>
            {t.digital.watch}
          </Pill>
          {second && (
            <button
              type="button"
              onClick={() => open(second)}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[14px] font-medium text-sky-300 ring-1 ring-white/15 transition-colors hover:text-white"
              data-cursor="hover"
            >
              <PlayIcon className="h-2.5 w-2.5" />
              {copy.second}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// "We also build the product": websites, web apps and interface design, shown on the real screens.
export default function Digital() {
  const root = useRef(null);
  const open = usePlayer();
  const t = useT();
  const media = useMedia();
  const d = t.digital;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_PREF_QUERY(), () => {
        gsap.utils.toArray('[data-dg-row]').forEach(row => {
          const screen = row.querySelector('[data-dg-screen]');
          if (lite) {
            // one quick reveal per project; nothing here is tied to the scroll on phones
            gsap.from(row, { y: 44, opacity: 0, duration: 0.9, scrollTrigger: { trigger: row, start: 'top 86%' } });
            return;
          }
          // the screen tips up towards the camera as it arrives
          gsap.fromTo(
            screen,
            { rotateX: 12, scale: 0.9, transformPerspective: 1500, transformOrigin: '50% 100%' },
            { rotateX: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: row, start: 'top 92%', end: 'top 30%', scrub: 0.6 } }
          );
          gsap.from(row.querySelector('[data-dg-copy]'), { y: 50, opacity: 0, duration: 1.2, scrollTrigger: { trigger: row, start: 'top 72%' } });
        });
        gsap.from('[data-dg-pillar]', { y: 40, opacity: 0, duration: 1, stagger: 0.08, scrollTrigger: { trigger: '[data-dg-pillars]', start: 'top 84%' } });
        gsap.from('[data-dg-more]', { y: 36, opacity: 0, duration: 0.9, stagger: 0.06, scrollTrigger: { trigger: '[data-dg-grid]', start: 'top 86%' } });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section id="digital" ref={root} className="relative overflow-clip bg-night py-28 text-white md:py-44">
      <div className="frame">
        <Timestamp time={chapterTimes[10]} label={t.chapters[10]} tone="white" />
        <h2 className="display mt-6 max-w-[17ch] text-[11vw] md:text-[6vw] xl:text-[5.6rem]">
          <SplitText key={t.lang} text={d.title} tag="span" textAlign="start" splitType="words" delay={40} className="!inline" />{' '}
          <span className="serif-accent text-sky-400">{d.accent}</span>
        </h2>
        <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/70 md:text-lg">{d.sub}</p>
        <ul className="mt-7 flex flex-wrap gap-2">
          {d.offer.map(item => (
            <li key={item} className="rounded-full bg-sky-500/15 px-4 py-2 text-[14px] font-medium text-sky-200 ring-1 ring-sky-400/25">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="frame mt-20 space-y-24 md:mt-28 lg:space-y-36">
        {digitalFeatured.map((look, i) => (
          <Project key={look.id} look={look} copy={d.projects[look.id]} index={i} media={media} open={open} t={t} />
        ))}
      </div>

      {/* how the work runs + the numbers behind it */}
      <div data-dg-pillars className="frame mt-24 grid gap-4 md:mt-36 md:grid-cols-3">
        {d.pillars.map((p, i) => (
          <div key={p.title} data-dg-pillar className="rounded-[26px] bg-white/[0.04] p-7 ring-1 ring-white/10">
            <span dir="ltr" className="font-mono text-[12px] tracking-[0.08em] text-sky-300">
              0{i + 1}
            </span>
            <p className="mt-4 text-2xl font-medium tracking-tight">{p.title}</p>
            <p className="mt-3 text-[15.5px] leading-relaxed text-white/65">{p.text}</p>
          </div>
        ))}
      </div>
      <div className="frame mt-4 grid grid-cols-3 gap-4 border-t border-white/10 pt-8 md:mt-10">
        {d.stats.map(([value, label]) => (
          <div key={label}>
            <p dir="ltr" className="display font-sans text-[9vw] rtl:text-right md:text-6xl">
              {value}
            </p>
            <p className="mt-2 text-[13px] leading-snug text-white/60 md:text-[14px]">{label}</p>
          </div>
        ))}
      </div>

      {/* more work */}
      <div className="frame mt-24 md:mt-36">
        <p className="text-2xl font-medium tracking-tight md:text-4xl">{d.moreTitle}</p>
        <div data-dg-grid className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12">
          {digitalMore.map(look => {
            const item = media[look.media];
            return (
              <div key={look.id} data-dg-more>
                <Screen item={item} src={item.tile} onOpen={open} className="w-full" />
                <p dir="ltr" className="mt-3 text-[17px] font-medium tracking-tight rtl:text-right md:text-xl">
                  {look.name}
                </p>
                <p className="mt-1 text-[13.5px] leading-snug text-white/60 md:text-[15px]">{d.more[look.id]}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-14 flex flex-col gap-5 rounded-[28px] bg-sky-500 p-7 text-white md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <p className="text-2xl font-medium tracking-tight md:text-3xl">{d.ctaTitle}</p>
            <p className="mt-2 max-w-xl text-white/90">{d.ctaText}</p>
          </div>
          <Pill href="#contact" variant="light" className="shrink-0 self-start md:self-auto">
            {d.cta}
          </Pill>
        </div>
      </div>
    </section>
  );
}
