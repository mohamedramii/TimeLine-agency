import { lazy, Suspense, useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { lite, NO_PREF_QUERY } from '../lib/prefs';
import { useScrollTo } from '../lib/smooth';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import StarBorder from '../components/reactbits/StarBorder';
import { Symbol } from '../components/Logo';
import { Pill, Timestamp } from '../components/ui';
import { aLaCarte, brand, chapterTimes, egp, packages, prices } from '../content/shared';
import { useT } from '../i18n';

const Iridescence = lazy(() => import('../components/reactbits/Iridescence'));

const Check = ({ dark }) => (
  <svg width="17" height="17" viewBox="0 0 16 16" className={`mt-0.5 shrink-0 ${dark ? 'text-sky-400' : 'text-sky-500'}`} aria-hidden="true">
    <circle cx="8" cy="8" r="8" fill="currentColor" opacity="0.16" />
    <path d="m4.8 8.2 2 2 4.4-4.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Announces the chosen package to the contact form, then glides there.
function usePickPackage() {
  const scrollTo = useScrollTo();
  return label => {
    window.dispatchEvent(new CustomEvent('tl-package', { detail: label }));
    scrollTo('#contact');
  };
}

function PackageCard({ pkg, pr, pick }) {
  const dark = !!pkg.featured;
  const name = pr.names[pkg.id];
  const separate = aLaCarte(pkg);
  const saving = separate - pkg.price;
  const label = `${name} — ${egp(pkg.price)} ${pr.currency}`;

  return (
    <SpotlightCard
      data-price-card
      theme={dark ? 'dark' : 'light'}
      spotlightColor={dark ? 'rgba(80,180,232,0.32)' : 'rgba(80,180,232,0.2)'}
      className={`!rounded-[30px] !p-0 flex h-full flex-col ${dark ? 'text-white lg:-translate-y-5' : 'text-ink'}`}
      style={{
        '--spotlight-card-surface': dark ? '#06121d' : '#ffffff',
        '--spotlight-card-shadow': dark ? 'var(--shadow-lift)' : 'var(--shadow-soft)',
        '--spotlight-card-border': dark ? 'rgba(80,180,232,0.35)' : 'var(--color-line)'
      }}
    >
      {/* a gradient, not filter: blur() — a blur stays expensive on phones for as long as it is on screen */}
      {dark && <div className="pointer-events-none absolute -end-36 -top-40 h-96 w-96 bg-[radial-gradient(closest-side,rgba(80,180,232,0.34),rgba(80,180,232,0.12)_55%,transparent)]" />}
      <div className="relative flex flex-1 flex-col p-7 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <p className="text-2xl font-medium tracking-tight">{name}</p>
          {dark ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-3 py-1 text-[12px] font-medium text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {pr.featured}
            </span>
          ) : null}
        </div>
        <p className={`mt-2 text-[14.5px] ${dark ? 'text-white/60' : 'text-muted'}`}>{pr.notes[pkg.id]}</p>

        <p className="mt-7 flex flex-wrap items-baseline gap-x-2">
          <span dir="ltr" className="display font-sans text-[56px] md:text-[62px]">
            {egp(pkg.price)}
          </span>
          <span className={`text-lg font-medium ${dark ? 'text-white/70' : 'text-ink-2'}`}>{pr.currency}</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
          <span className={dark ? 'text-white/45' : 'text-muted'}>
            {pr.insteadBefore}{' '}
            <s className="decoration-sky-400/80 decoration-[1.5px]">
              <span dir="ltr">{egp(separate)}</span> {pr.currency}
            </s>{' '}
            {pr.insteadAfter}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 font-medium ${dark ? 'bg-sky-500/20 text-sky-300' : 'bg-sky-50 text-sky-700'}`}>{pr.save(egp(saving))}</span>
        </div>

        <hr className={`dashed my-7 ${dark ? 'text-white' : 'text-ink'}`} />

        <ul className="space-y-3.5 text-[15.5px]">
          {[pr.reels(pkg.reels), pr.page, pr.posts(pkg.posts)].map(item => (
            <li key={item} className="flex items-start gap-2.5">
              <Check dark={dark} />
              <span className={dark ? 'text-white/90' : 'text-ink-2'}>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          {dark && lite ? (
            <Pill variant="sky" className="w-full justify-center" onClick={() => pick(label)}>
              {pr.choose}
            </Pill>
          ) : dark ? (
            <StarBorder
              as="button"
              type="button"
              onClick={() => pick(label)}
              color="#50B4E8"
              radius={999}
              thickness={1.5}
              duration={5}
              theme="dark"
              className="!block w-full"
              data-cursor="hover"
            >
              <span className="flex items-center justify-center gap-2 py-1 font-medium">{pr.choose}</span>
            </StarBorder>
          ) : (
            <Pill variant="light" className="w-full justify-center" onClick={() => pick(label)}>
              {pr.choose}
            </Pill>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}

export default function Pricing() {
  const root = useRef(null);
  const t = useT();
  const pr = t.pricing;
  const pick = usePickPackage();
  const singles = [
    { key: 'reel', price: prices.reel, unit: pr.perReel },
    { key: 'page', price: prices.page },
    { key: 'posts5', price: prices.posts5 },
    { key: 'pagePlus10', price: prices.pagePlus10 }
  ];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(NO_PREF_QUERY(), () => {
        gsap.from('[data-price-card]', {
          y: 70,
          opacity: 0,
          duration: 1.3,
          stagger: 0.12,
          scrollTrigger: { trigger: '[data-price-grid]', start: 'top 80%' }
        });
        gsap.from('[data-price-extra]', {
          y: 50,
          opacity: 0,
          duration: 1.2,
          stagger: 0.1,
          scrollTrigger: { trigger: '[data-price-extras]', start: 'top 85%' }
        });
        gsap.from('[data-single-row]', {
          x: () => (document.documentElement.dir === 'rtl' ? -30 : 30),
          opacity: 0,
          duration: 0.9,
          stagger: 0.07,
          scrollTrigger: { trigger: '[data-price-extras]', start: 'top 75%' }
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section id="pricing" ref={root} className="relative bg-paper pb-28 md:pb-36">
      <div className="frame">
        <div className="flex flex-col items-center text-center">
          <Timestamp time={chapterTimes[7]} label={t.chapters[7]} />
          <h2 className="display mt-6 text-[11vw] md:text-[5.6vw] xl:text-[5.2rem]">
            {pr.title}
            <br />
            <span className="serif-accent text-sky-500">{pr.accent}</span>
          </h2>
          <p className="mt-5 max-w-xl text-[17px] text-muted">{pr.sub}</p>
        </div>

        {/* Packages */}
        <div data-price-grid className="mx-auto mt-16 grid max-w-[620px] items-stretch gap-5 md:mt-20 lg:max-w-none lg:grid-cols-3">
          {packages.map(pkg => (
            <PackageCard key={pkg.id} pkg={pkg} pr={pr} pick={pick} />
          ))}
        </div>

        <div data-price-extras className="mx-auto mt-5 grid max-w-[620px] gap-5 lg:max-w-none lg:grid-cols-[1.1fr_0.9fr]">
          {/* Single services */}
          <div data-price-extra className="card p-7 md:p-9">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-medium tracking-tight">{pr.singlesTitle}</p>
                <p className="mt-1 text-[14.5px] text-muted">{pr.singlesSub}</p>
              </div>
              <Symbol className="h-9 w-9 opacity-90" color="var(--color-sky-500)" />
            </div>
            <ul className="mt-7">
              {singles.map(s => (
                <li key={s.key} data-single-row className="flex items-baseline gap-4 border-t border-line py-4 first:border-t-0">
                  <span className="text-[16.5px] font-medium text-ink">{pr.singles[s.key]}</span>
                  <span className="mb-1 h-px flex-1 bg-[linear-gradient(to_right,var(--color-line)_50%,transparent_0%)] bg-[length:8px_1px]" />
                  <span className="whitespace-nowrap text-[17px] font-semibold text-ink">
                    <span dir="ltr">{egp(s.price)}</span> <span className="text-[13px] font-medium text-muted">{pr.currency}</span>
                    {s.unit && <span className="text-[13px] font-normal text-muted"> {s.unit}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sponsor — priced on contact */}
          <div data-price-extra className="relative flex min-h-[380px] flex-col overflow-hidden rounded-[var(--radius-card)] p-7 text-white shadow-[var(--shadow-lift)] md:p-9">
            <div className="absolute inset-0">
              {lite ? (
                <div className="h-full w-full bg-[linear-gradient(135deg,#7cc8ef_0%,#50b4e8_45%,#2f93cc_100%)]" />
              ) : (
                <Suspense fallback={null}>
                  <Iridescence color={[0.31, 0.7, 0.91]} speed={0.6} amplitude={0.12} mouseReact resolution={0.6} />
                </Suspense>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-sky-700/25 via-sky-600/10 to-sky-950/60" />
            <div className="relative flex items-center justify-between">
              <span className="chip !bg-white/20 !text-white !shadow-none backdrop-blur">
                <span className="chip-dot !bg-white" /> {pr.sponsorChip}
              </span>
              <Symbol className="h-10 w-10" color="#ffffff" />
            </div>
            <div className="relative mt-auto">
              <p className="display text-[46px] md:text-[54px]">
                {pr.sponsorTitle}
                <br />
                <span className="serif-accent">{pr.sponsorAccent}</span>
              </p>
              <p className="mt-3 max-w-sm text-white/85">{pr.sponsorText}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium ring-1 ring-white/30 backdrop-blur">{pr.sponsorPrice}</span>
                <Pill href={brand.whatsapp} target="_blank" rel="noreferrer" variant="light" size="sm">
                  {pr.whatsapp}
                </Pill>
                <Pill href="#contact" variant="dark" size="sm">
                  {pr.pickTime}
                </Pill>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
