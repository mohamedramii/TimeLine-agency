import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import CurvedLoop from '../components/reactbits/CurvedLoop';
import SplitText from '../components/reactbits/SplitText';
import Threads from '../components/reactbits/Threads';
import { Wordmark } from '../components/Logo';
import { MotionToggle } from '../components/MotionNotice';
import { LiveClock, Pill, Timestamp } from '../components/ui';
import { brand, chapterTimes, navTargets } from '../content/shared';
import { useScrollTo } from '../lib/smooth';
import { switchLang } from '../lib/prefs';
import { useT } from '../i18n';

function Field({ label, ...props }) {
  return (
    <label className="group block">
      <span className="mono-label text-white/50">{label}</span>
      <input
        {...props}
        className="mt-2 block w-full border-b border-white/15 bg-transparent pb-3 text-lg text-white outline-none transition-colors placeholder:text-white/25 focus:border-sky-400"
      />
    </label>
  );
}

function Toggle({ items, value, onChange, multi }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map(item => {
        const on = multi ? value.includes(item) : value === item;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onChange(multi ? (on ? value.filter(v => v !== item) : [...value, item]) : item)}
            className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition-all duration-300 ${
              on ? 'bg-sky-500 text-white ring-sky-500' : 'bg-white/[0.04] text-white/75 ring-white/15 hover:ring-sky-400/60'
            }`}
            aria-pressed={on}
            data-cursor="hover"
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

export default function Contact() {
  const root = useRef(null);
  const scrollTo = useScrollTo();
  const t = useT();
  const c = t.contact;
  const [form, setForm] = useState({ name: '', company: '', contact: '', services: [], budget: '', pkg: '' });

  // a package picked in the pricing section rides along into the brief
  useEffect(() => {
    const onPick = e => setForm(f => ({ ...f, pkg: e.detail }));
    window.addEventListener('tl-package', onPick);
    return () => window.removeEventListener('tl-package', onPick);
  }, []);
  const set = key => e => setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));

  // No backend needed: the brief opens as a pre-filled WhatsApp message.
  const submit = e => {
    e.preventDefault();
    const msg = [
      c.msg.hello(form.name || '—', form.company || '—'),
      form.pkg ? c.msg.pkg(form.pkg) : '',
      form.services.length ? c.msg.interested(form.services.join('، ')) : '',
      form.budget ? c.msg.budget(form.budget) : '',
      form.contact ? c.msg.reach(form.contact) : ''
    ]
      .filter(Boolean)
      .join('\n');
    window.open(`${brand.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  };

  useGSAP(
    () => {
      gsap.from('[data-wordmark] .name-part', {
        yPercent: 110,
        duration: 1.6,
        stagger: 0.06,
        ease: 'expo.out',
        scrollTrigger: { trigger: '[data-wordmark]', start: 'top 95%' }
      });
    },
    { scope: root }
  );

  return (
    <section id="contact" ref={root} className="relative overflow-hidden bg-night pt-10 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[70%] opacity-60">
        <Threads color={[0.31, 0.7, 0.91]} amplitude={1.2} distance={0.3} lineCount={40} speed={0.4} />
      </div>

      <div className="relative -mx-4 text-sky-500" dir={t.dir}>
        <CurvedLoop
          key={t.lang}
          marqueeText={c.loop}
          speed={1.2}
          curveAmount={120}
          fontSize={72}
          fontWeight={500}
          color="#50B4E8"
          direction={t.dir === 'rtl' ? 'right' : 'left'}
          interactive
        />
      </div>

      <div className="frame relative grid gap-16 pb-24 pt-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Timestamp time={chapterTimes[9]} label={t.chapters[9]} tone="white" />
          <h2 className="display mt-6 text-[13vw] md:text-[7vw] xl:text-[6.6rem]">
            <SplitText key={t.lang} text={c.title} tag="span" textAlign="start" splitType="words" delay={60} effect="blur" className="!block" />
            <span className="serif-accent text-sky-400">{c.accent}</span>
          </h2>
          <p className="mt-6 max-w-md text-lg text-white/65">{c.sub}</p>
          <div className="mt-10 grid max-w-md gap-4 text-[15px]">
            <a href={`mailto:${brand.email}`} className="group flex items-center justify-between border-b border-white/10 pb-4" data-cursor="hover">
              <span className="text-white/50">{c.email}</span>
              <span dir="ltr" className="font-medium transition-colors group-hover:text-sky-400">
                {brand.email}
              </span>
            </a>
            <a href={brand.whatsapp} target="_blank" rel="noreferrer" className="group flex items-center justify-between border-b border-white/10 pb-4" data-cursor="hover">
              <span className="text-white/50">{c.whatsapp}</span>
              <span dir="ltr" className="font-medium transition-colors group-hover:text-sky-400">
                {brand.phone}
              </span>
            </a>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-white/50">{c.studioTime}</span>
              <span className="font-medium">
                {t.city} · <LiveClock seconds />
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-[32px] bg-white/[0.04] p-7 ring-1 ring-white/10 backdrop-blur-sm md:p-10">
          <p className="text-2xl font-medium tracking-tight">{c.formTitle}</p>
          {form.pkg && (
            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-sky-500/15 px-4 py-3 ring-1 ring-sky-400/40">
              <span className="text-[15px]">
                <span className="text-white/60">{c.pkgLabel}: </span>
                <span className="font-medium text-white">{form.pkg}</span>
              </span>
              <button type="button" onClick={() => set('pkg')('')} className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white/80 hover:bg-white/20" aria-label={c.pkgRemove} data-cursor="hover">
                ×
              </button>
            </div>
          )}
          <div className="mt-8 grid gap-7 sm:grid-cols-2">
            <Field label={c.name} placeholder={c.namePh} value={form.name} onChange={set('name')} autoComplete="name" />
            <Field label={c.brand} placeholder={c.brandPh} value={form.company} onChange={set('company')} autoComplete="organization" />
          </div>
          <div className="mt-7">
            <Field label={c.reach} placeholder={c.reachPh} value={form.contact} onChange={set('contact')} />
          </div>
          <div className="mt-8">
            <span className="mono-label text-white/50">{c.need}</span>
            <Toggle items={c.services} value={form.services} onChange={set('services')} multi />
          </div>
          <div className="mt-7">
            <span className="mono-label text-white/50">{c.budget}</span>
            <Toggle items={c.budgets} value={form.budget} onChange={set('budget')} />
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button type="submit" className="pill pill-sky" data-cursor="hover">
              <span>{c.send}</span>
              <span className="pill-icon">
                <span className="dir-flip inline-block">→</span>
              </span>
            </button>
            <span className="text-sm text-white/45">{c.reply}</span>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-white/10">
        <div className="frame grid gap-10 py-14 text-[15px] sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="mono-label text-white/40">{c.sitemap}</p>
            <ul className="mt-4 space-y-2">
              {t.nav.map((label, i) => (
                <li key={label}>
                  <a
                    href={navTargets[i]}
                    onClick={e => {
                      e.preventDefault();
                      scrollTo(navTargets[i]);
                    }}
                    className="text-white/80 transition-colors hover:text-sky-400"
                    data-cursor="hover"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mono-label text-white/40">{c.social}</p>
            <ul className="mt-4 space-y-2">
              {[
                ['Instagram', brand.instagram],
                ['TikTok', brand.tiktok],
                ['Facebook', brand.facebook],
                ['LinkedIn', brand.linkedin]
              ].map(([l, h]) => (
                <li key={l}>
                  <a href={h} target="_blank" rel="noreferrer" className="text-white/80 transition-colors hover:text-sky-400" data-cursor="hover">
                    {l} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mono-label text-white/40">{c.studio}</p>
            <p className="mt-4 text-white/80">
              {c.address}
              <br />
              {c.hours}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <MotionToggle />
              <button
                type="button"
                onClick={() => switchLang(t.lang === 'ar' ? 'en' : 'ar')}
                className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[13px] text-white/70 ring-1 ring-white/10 transition hover:text-white"
                data-cursor="hover"
              >
                {t.lang === 'ar' ? 'English' : 'عربي'}
              </button>
            </div>
          </div>
          <div className="lg:text-end">
            <p className="mono-label text-white/40">{c.backTo}</p>
            <div className="mt-4">
              <Pill href="#top" variant="sky" size="sm">
                {c.beginning}
              </Pill>
            </div>
          </div>
        </div>
        <div data-wordmark dir="ltr" className="frame overflow-hidden pb-4">
          <Wordmark className="h-auto w-full" color="#50B4E8" />
        </div>
        <div className="frame flex flex-col justify-between gap-2 border-t border-white/10 py-6 text-[13px] text-white/45 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {c.rights}
          </span>
          <span>{c.made}</span>
        </div>
      </footer>
    </section>
  );
}
