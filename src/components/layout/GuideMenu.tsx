'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

/** Desktop "Paper guide" dropdown: one entry per medium, plus the full guide. */
export default function GuideMenu() {
  const { t, lp } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const isActive = pathname.startsWith(lp('/paper-guide'));
  // A mouse opens the menu on hover, and the click that usually follows used
  // to shut it again. That click now keeps it open; the next one toggles. A
  // tap has no hover (its emulated mouseenter opened the menu and the click
  // closed it), so touch and pen only toggle on click.
  const openedByHover = useRef(false);

  // Close on outside press and Escape; links close it themselves on click.
  // pointerdown rather than mousedown: iOS sends no mouse events for a tap on
  // something that isn't clickable.
  useEffect(() => {
    if (!open) {
      openedByHover.current = false;
      return;
    }
    const onDown = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const items = [
    { anchor: 'pencil', label: t.nav.guidePencil, weight: t.guide.dryWeight, img: '/guide/pencil.jpg' },
    { anchor: 'ink', label: t.nav.guideInk, weight: t.guide.inkWeight, img: '/guide/ink.jpg' },
    { anchor: 'watercolour', label: t.nav.guideWet, weight: t.guide.wetWeight, img: '/guide/wash.jpg' },
  ];

  return (
    <div ref={wrap} className="relative" onPointerLeave={(e) => { if (e.pointerType === 'mouse') setOpen(false); }}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          if (openedByHover.current) {
            openedByHover.current = false;
            return;
          }
          setOpen((o) => !o);
        }}
        onPointerEnter={(e) => {
          if (e.pointerType !== 'mouse' || open) return;
          openedByHover.current = true;
          setOpen(true);
        }}
        className={`py-2 inline-flex items-center gap-1 underline-offset-[6px] decoration-1 transition-colors cursor-pointer ${
          isActive ? 'text-maroon underline' : 'text-char/75 hover:text-maroon'
        }`}
      >
        {t.nav.paperGuide}
        <svg aria-hidden viewBox="0 0 12 12" className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2.5 4.5 6 8l3.5-3.5" /></svg>
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute start-0 top-full z-50 pt-2"
      >
        <div className="w-[340px] bg-cream border border-line shadow-[0_18px_40px_rgba(32,21,19,.18)] p-2">
          <ul>
            {items.map((it) => (
              <li key={it.anchor}>
                <Link href={lp(`/paper-guide#${it.anchor}`)} onClick={() => setOpen(false)} className="flex items-center gap-3 p-2 hover:bg-kraft/15 group">
                  <span className="relative w-14 h-10 shrink-0 overflow-hidden border border-line">
                    <Image src={it.img} alt="" aria-hidden fill sizes="56px" className="object-cover object-right" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-char group-hover:text-maroon">{it.label}</span>
                    <span className="block text-xs text-muted">{it.weight}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={lp('/paper-guide')} onClick={() => setOpen(false)} className="mt-1 block border-t border-line px-2 pt-3 pb-2 hover:text-maroon">
            <span className="block text-sm font-semibold text-maroon">{t.nav.guideAll}</span>
            <span className="block text-xs text-muted">{t.nav.guideAllDesc}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
