import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Pill, Timestamp } from '../components/ui';
import { chapterTimes, egp, maxSaving } from '../content/shared';
import { lite } from '../lib/prefs';
import { useT } from '../i18n';

function Item({ f, i, open, onToggle }) {
  return (
    <div className={`border-b border-line transition-colors ${open ? 'bg-white' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-5 px-2 py-6 text-start md:px-4"
        data-cursor="hover"
      >
        <span dir="ltr" className="w-8 font-mono text-[12px] text-sky-600">
          {String(i + 1).padStart(2, '0')}
        </span>
        <span className="flex-1 text-[19px] font-medium tracking-[-0.015em] md:text-[22px]">{f.q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0, backgroundColor: open ? '#50B4E8' : '#ffffff', color: open ? '#ffffff' : '#0a1824' }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full shadow-[0_0_0_1px_var(--color-line)]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: lite ? 0.3 : 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-7 pe-4 ps-[60px] text-[16px] leading-relaxed text-muted md:ps-[68px]">{typeof f.a === 'function' ? f.a(egp(maxSaving())) : f.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  const t = useT();
  const fq = t.faq;
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative bg-paper py-28 md:py-36">
      <div className="frame grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Timestamp time={chapterTimes[8]} label={t.chapters[8]} />
          <h2 className="display mt-6 text-[12vw] md:text-[5vw] xl:text-[4.6rem]">
            {fq.title}
            <br />
            <span className="serif-accent text-sky-500">{fq.accent}</span>
          </h2>
          <p className="mt-5 max-w-sm text-muted">{fq.sub}</p>
          <div className="mt-7">
            <Pill href="#contact" variant="light">
              {fq.cta}
            </Pill>
          </div>
        </div>
        <div className="border-t border-line">
          {fq.items.map((f, i) => (
            <Item key={f.q} f={f} i={i} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
