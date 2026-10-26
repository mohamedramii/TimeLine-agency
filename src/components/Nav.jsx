import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { LogoLockup } from './Logo';
import { LiveClock, Pill } from './ui';
import { navTargets } from '../content/shared';
import { useScrollTo } from '../lib/smooth';
import { switchLang } from '../lib/prefs';
import { useRtl, useT } from '../i18n';

function LangSwitch({ className = '' }) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={() => switchLang(t.lang === 'ar' ? 'en' : 'ar')}
      className={`grid h-10 min-w-10 place-items-center rounded-full bg-white px-3 text-[13px] font-semibold text-ink shadow-[0_0_0_1px_var(--color-line)] transition hover:bg-sky-50 hover:text-sky-700 ${
        t.lang === 'en' ? 'font-[Alexandria,sans-serif]' : 'font-sans'
      } ${className}`}
      aria-label={t.ui.switchLangLabel}
      title={t.ui.switchLangLabel}
      data-cursor="hover"
    >
      {t.ui.switchLang}
    </button>
  );
}

export default function Nav({ ready }) {
  const t = useT();
  const rtl = useRtl();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollTo = useScrollTo();
  const links = t.nav.map((label, i) => ({ label, href: navTargets[i] }));

  useMotionValueEvent(scrollY, 'change', y => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 400 && !open);
    setSolid(y > 40);
  });

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const go = href => e => {
    e.preventDefault();
    setOpen(false);
    setTimeout(() => scrollTo(href), open ? 350 : 0);
  };

  const origin = rtl ? '8% 6%' : '92% 6%';

  return (
    <>
      {/* fades in rather than sliding: it must already sit in place for the preloader's logo to land in it */}
      <motion.header
        className="fixed inset-x-0 top-0 z-[100] px-3 pt-3 md:px-5 md:pt-4"
        initial={{ opacity: 0 }}
        animate={{ y: hidden ? -120 : 0, opacity: ready ? 1 : 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav
          className={`frame flex h-[64px] items-center justify-between rounded-full ps-4 pe-2 transition-all duration-500 md:ps-6 ${
            solid ? 'bg-white/75 shadow-[0_0_0_1px_rgba(223,232,239,0.9),0_18px_40px_-24px_rgba(23,63,90,0.35)] backdrop-blur-xl max-md:bg-white/95' : 'bg-transparent'
          }`}
          aria-label="Main"
        >
          <a href="#top" onClick={go('#top')} aria-label="TIME LINE" data-cursor="hover">
            <LogoLockup />
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map(item => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={go(item.href)}
                  className="group block rounded-full px-4 py-2 text-[14.5px] font-medium text-ink-2 transition-colors hover:bg-sky-50"
                  data-cursor="hover"
                >
                  <span className="relative block h-[1.45em] overflow-hidden leading-[1.45em]">
                    <span className="block transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-y-full">{item.label}</span>
                    <span className="absolute start-0 top-full block text-sky-600 transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-y-full">
                      {item.label}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2.5">
            <span className="mono-label hidden items-center gap-2 text-muted xl:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              {t.city} <LiveClock className="text-ink" />
            </span>
            <LangSwitch />
            <Pill href="#contact" size="sm" className="hidden sm:inline-flex">
              {t.ui.bookCall}
            </Pill>
            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              className="grid h-11 w-11 place-items-center rounded-full bg-ink text-white lg:hidden"
              aria-expanded={open}
              aria-label={open ? t.ui.closeMenu : t.ui.openMenu}
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 top-0 h-[1.5px] w-5 bg-current transition ${open ? 'translate-y-[5px] rotate-45' : ''}`} />
                <span className={`absolute bottom-0 left-0 h-[1.5px] w-5 bg-current transition ${open ? '-translate-y-[5.5px] -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] flex flex-col justify-between bg-night px-6 pb-8 pt-28 text-white lg:hidden"
            initial={{ clipPath: `circle(0% at ${origin})` }}
            animate={{ clipPath: `circle(150% at ${origin})` }}
            exit={{ clipPath: `circle(0% at ${origin})` }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="space-y-1">
              {links.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, transition: { delay: 0.2 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
                >
                  <a href={item.href} onClick={go(item.href)} className="flex items-baseline gap-4 py-1.5 text-5xl font-medium tracking-tight">
                    <span className="mono-label text-sky-400">0{i + 1}</span>
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="flex items-end justify-between">
              <div className="mono-label text-white/60">
                {t.city} <LiveClock className="text-white" />
              </div>
              <Pill href="#contact" variant="sky" onClick={() => setOpen(false)}>
                {t.ui.bookCall}
              </Pill>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
