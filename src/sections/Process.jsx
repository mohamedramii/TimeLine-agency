import { useRef } from 'react';
import { gsap, ScrollTrigger, scrubbed, useGSAP } from '../lib/gsap';
import { NO_PREF_QUERY } from '../lib/prefs';
import SplitText from '../components/reactbits/SplitText';
import { Timestamp } from '../components/ui';
import { chapterTimes } from '../content/shared';
import { useRtl, useT } from '../i18n';

// The literal time line: a sky line draws itself down the page, a clock hand rides its tip,
// and each milestone lights up as the line reaches it.
export default function Process() {
  const root = useRef(null);
  const rail = useRef(null);
  const t = useT();
  const rtl = useRtl();
  const p = t.process;

  useGSAP(
    () => {
      const steps = gsap.utils.toArray('[data-step]');
      const mm = gsap.matchMedia();
      mm.add(NO_PREF_QUERY(), () => {
        // one timeline, transforms only: the tip used to animate `top`, a layout on every frame
        gsap.set('[data-tip]', { xPercent: -50, yPercent: -50 });
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: rail.current,
              start: 'top 55%',
              end: 'bottom 55%',
              scrub: scrubbed(0.6),
              invalidateOnRefresh: true
            }
          })
          .fromTo('[data-line]', { scaleY: 0 }, { scaleY: 1 }, 0)
          .fromTo('[data-tip]', { y: 0 }, { y: () => rail.current.offsetHeight }, 0)
          .fromTo('[data-tip-hand]', { rotation: 0 }, { rotation: 720, svgOrigin: '12 12' }, 0);
        steps.forEach((step, i) => {
          // first column sits at the inline-start edge; flip the slide-in for RTL
          const side = (i % 2 === 0 ? -1 : 1) * (rtl ? -1 : 1);
          gsap.from(step.querySelector('[data-step-card]'), {
            x: () => (window.innerWidth > 768 ? side * 80 : (rtl ? -40 : 40)),
            opacity: 0,
            duration: 1.3,
            scrollTrigger: { trigger: step, start: 'top 72%' }
          });
          ScrollTrigger.create({
            trigger: step,
            start: 'top 55%',
            end: 'bottom 55%',
            toggleClass: { targets: step, className: 'is-on' }
          });
          ScrollTrigger.create({
            trigger: step,
            start: 'top 55%',
            onEnter: () => step.classList.add('is-done'),
            onLeaveBack: () => step.classList.remove('is-done')
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section id="process" ref={root} className="relative overflow-hidden bg-white py-32 md:py-44">
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] max-md:hidden" style={{ backgroundImage: 'url(/brand/tile.svg)', backgroundSize: '160px' }} />
      <div className="frame relative text-center">
        <div className="flex justify-center">
          <Timestamp time={chapterTimes[5]} label={t.chapters[5]} />
        </div>
        <h2 className="display mx-auto mt-6 max-w-[15ch] text-[11vw] md:text-[5.6vw] xl:text-[5.2rem]">
          <SplitText key={t.lang} text={p.title} tag="span" splitType="words" delay={50} className="!inline" />
          {rtl ? '' : ' '}
          <span className="serif-accent text-sky-500">{p.accent}</span> {p.tail}
        </h2>
      </div>

      <div ref={rail} className="frame relative mt-24">
        {/* rail */}
        <div className="process-rail absolute bottom-0 top-0 w-[2px] rounded bg-line">
          <div data-line className="h-full w-full origin-top rounded bg-sky-500 will-change-transform" />
          <div data-tip className="absolute left-1/2 top-0 will-change-transform">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-[0_0_0_1px_var(--color-line),var(--shadow-sky)]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="none" stroke="var(--color-sky-500)" strokeWidth="1.5" />
                <g data-tip-hand>
                  <line x1="12" y1="12" x2="12" y2="5" stroke="var(--color-ink)" strokeWidth="1.8" strokeLinecap="round" />
                </g>
                <circle cx="12" cy="12" r="1.8" fill="var(--color-sky-500)" />
              </svg>
            </div>
          </div>
        </div>

        <ol className="relative space-y-16 md:space-y-28">
          {p.steps.map((st, i) => {
            const second = i % 2 === 1;
            return (
              <li key={st.title} data-step className="step group relative grid items-center ps-14 md:grid-cols-2 md:ps-0">
                <span className="step-node absolute top-8 z-10 grid h-5 w-5 place-items-center rounded-full bg-white shadow-[0_0_0_2px_var(--color-line)] transition-all duration-700 md:top-1/2">
                  <span className="h-2 w-2 rounded-full bg-line transition-colors duration-700" />
                </span>
                <div className={second ? 'md:col-start-2 md:ps-20' : 'md:pe-20 md:text-end'}>
                  <div data-step-card className="step-card card relative inline-block w-full max-w-[460px] p-7 text-start transition-shadow duration-700 md:p-9">
                    <div className="flex items-center justify-between">
                      <span className="mono-label text-sky-600">{st.when}</span>
                      <span dir="ltr" className="font-mono text-[12px] text-muted">
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="mt-4 text-4xl font-medium tracking-[-0.03em]">{st.title}</h3>
                    <p className="mt-3 text-[15.5px] leading-relaxed text-muted">{st.text}</p>
                    <ul className="mt-5 flex flex-wrap gap-1.5">
                      {st.points.map(pt => (
                        <li key={pt} className="rounded-full bg-sky-50 px-3 py-1 text-[12.5px] font-medium text-sky-800">
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className={`hidden md:block ${second ? 'md:col-start-1 md:row-start-1 md:pe-20 md:text-end' : 'md:ps-20'}`}>
                  <span dir="ltr" className="display inline-block font-sans text-[9rem] leading-none text-sky-100 transition-colors duration-700 group-[.is-on]:text-sky-200">
                    0{i + 1}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
