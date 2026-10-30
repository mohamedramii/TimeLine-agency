import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { lite } from '../lib/prefs';
import CountUp from '../components/reactbits/CountUp';
import ScrollVelocity from '../components/reactbits/ScrollVelocity';
import LogoLoop from '../components/reactbits/LogoLoop';
import BlurText from '../components/reactbits/BlurText';
import { Marquee, OutlineText } from '../components/Marquee';
import { Symbol } from '../components/Logo';
import { Timestamp } from '../components/ui';
import { chapterTimes, statValues } from '../content/shared';
import { useT } from '../i18n';

export default function Results() {
  const root = useRef(null);
  const t = useT();
  const r = t.results;
  const ar = t.lang === 'ar';
  const firstRow = r.marquee.join('  \u2726  ') + '  \u2726';

  // Phones show the quotes as plain text and fade each card in once, instead of blurring in every word
  useGSAP(
    () => {
      if (!lite) return;
      gsap.utils.toArray('[data-quote]').forEach(el => {
        gsap.from(el, { y: 40, opacity: 0, duration: 0.9, scrollTrigger: { trigger: el, start: 'top 88%' } });
      });
    },
    { scope: root }
  );
  const logos = r.clients.map((name, i) => ({
    node: (
      <span
        className={`whitespace-nowrap text-[34px] font-medium tracking-[-0.03em] ${name === 'zat' ? 'case-script !text-[44px]' : ''} ${
          i === r.clients.length - 1 ? 'text-sky-500' : 'text-ink'
        }`}
      >
        {name}
      </span>
    ),
    title: name
  }));

  return (
    <section id="results" ref={root} className="relative">
      {/* Sky band */}
      <div className="relative overflow-hidden bg-sky-500 pb-14 pt-28 text-white md:pt-36">
        <div className="pointer-events-none absolute -end-[12vw] -top-[18vw] h-[60vw] w-[60vw] opacity-[0.12]">
          <Symbol className="h-full w-full" color="#ffffff" />
        </div>
        <div className="frame relative">
          <Timestamp time={chapterTimes[6]} label={t.chapters[6]} tone="sky" />
          <h2 className="display mt-6 max-w-[18ch] text-[11vw] md:text-[5.4vw] xl:text-[5rem]">
            {r.title}
            <br />
            <span className="serif-accent">{r.accent}</span>
          </h2>
          <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 border-t border-white/25 pt-10 md:grid-cols-4">
            {statValues.map((s, i) => (
              <div key={i}>
                <p dir="ltr" className="display font-sans text-[13vw] leading-none md:text-[5vw] xl:text-[4.9rem] rtl:text-right">
                  <CountUp to={s.to} decimals={s.decimals} duration={2.4} separator="," />
                  <span className="text-sky-100">{s.suffix}</span>
                </p>
                <p className="mono-label mt-3 text-white/80">{r.statLabels[i]}</p>
              </div>
            ))}
          </div>
        </div>
        {lite ? (
          <div className="mt-24 select-none text-white" style={{ fontSize: 'clamp(3.2rem, 9vw, 9.5rem)', fontWeight: 500, lineHeight: ar ? 1.5 : 1.15, letterSpacing: ar ? 0 : '-0.04em' }}>
            <Marquee speed={60} reverse>
              <span className="whitespace-pre pe-[0.5em]">{firstRow}</span>
            </Marquee>
            <Marquee speed={60}>
              <OutlineText text={r.marquee2} />
            </Marquee>
          </div>
        ) : (
        <div className="mt-24 select-none text-white" dir="ltr">
          {/* Outline drawn by an SVG filter around the whole word shape (not a per-glyph text-stroke),
              so the joins between connected Arabic letters never show. */}
          <svg width="0" height="0" className="absolute" aria-hidden="true">
            <filter id="tl-outline" x="-2%" y="-25%" width="104%" height="150%" colorInterpolationFilters="sRGB">
              <feMorphology in="SourceAlpha" operator="dilate" radius="1.7" result="grown" />
              <feComposite in="grown" in2="SourceAlpha" operator="out" result="ring" />
              <feFlood floodColor="#ffffff" />
              <feComposite in2="ring" operator="in" />
            </filter>
          </svg>
          {[
            { text: firstRow, velocity: 60, outline: false },
            { text: r.marquee2, velocity: -60, outline: true }
          ].map(row => (
            <ScrollVelocity
              key={t.lang + row.velocity}
              texts={[row.text]}
              velocity={row.velocity}
              numCopies={4}
              className={row.outline ? 'tl-outline' : ''}
              fontSize="clamp(3.2rem, 9vw, 9.5rem)"
              fontWeight={500}
              skewWithVelocity={8}
              scrollerStyle={{ letterSpacing: t.lang === 'ar' ? '0' : '-0.04em', lineHeight: t.lang === 'ar' ? 1.5 : 1.15 }}
            />
          ))}
        </div>
        )}
      </div>

      {/* Testimonials */}
      <div className="bg-paper py-28 md:py-36">
        <div className="frame">
          <Timestamp time="05:30" label={r.testimonialsLabel} />
          <div className="mx-auto mt-10 grid max-w-[620px] gap-5 lg:max-w-none lg:grid-cols-3">
            {r.testimonials.map((q, i) => (
              <figure key={i} data-quote className={`card flex flex-col p-8 ${i === 1 ? 'lg:translate-y-10' : ''}`}>
                <svg width="34" height="26" viewBox="0 0 34 26" className="dir-flip text-sky-500" aria-hidden="true">
                  <path d="M0 26V15.6C0 6.9 4.4 1.7 13.2 0l1.4 3.6C9.9 5 7.6 7.8 7.4 12H14v14H0Zm19.4 0V15.6c0-8.7 4.4-13.9 13.2-15.6L34 3.6C29.3 5 27 7.8 26.8 12h6.6v14h-14Z" fill="currentColor" />
                </svg>
                <blockquote className="serif-accent quote mt-6 text-[30px] leading-[1.15] text-ink">
                  {lite ? q.quote : <BlurText key={t.lang} text={q.quote} delay={40} animateBy="words" direction="bottom" />}
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-3 pt-8">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-sky-50 font-semibold text-sky-700">{q.name[0]}</span>
                  <span>
                    <span className="block text-[15px] font-medium">{q.name}</span>
                    <span className="block text-[13px] text-muted">{q.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div className="mt-28" dir="ltr">
          <p className="mono-label mb-8 text-center text-muted">{r.clientsLabel}</p>
          {lite ? (
            <Marquee speed={40}>
              <div className="flex items-center gap-[60px] pe-[60px]">
                {logos.map(l => (
                  <span key={l.title}>{l.node}</span>
                ))}
              </div>
            </Marquee>
          ) : (
            <LogoLoop logos={logos} speed={70} gap={90} logoHeight={48} fadeOut fadeOutWidth={0.18} pauseOnHover scaleOnHover ariaLabel={r.clientsLabel} />
          )}
        </div>
      </div>
    </section>
  );
}
