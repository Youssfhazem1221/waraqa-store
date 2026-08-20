// ============================================================
// Waraqa Store — Icon Component
// ============================================================
// All 23 icons from the ecommerce-kit, rendered as inline SVG.
// Uses currentColor for easy theming via parent text colour.
// ============================================================

import React from 'react';

export type IconName =
  | 'search' | 'bag' | 'cart' | 'user' | 'heart' | 'menu' | 'close'
  | 'filter' | 'chevron-right' | 'chevron-down' | 'chevron-left'
  | 'arrow-right' | 'plus' | 'minus' | 'star'
  | 'truck' | 'returns' | 'shield' | 'leaf' | 'gift'
  | 'card' | 'lock' | 'mail' | 'box' | 'whatsapp' | 'check';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  'aria-hidden'?: boolean;
}

const paths: Record<IconName, React.ReactNode> = {
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/></>,
  bag: <><path d="M7 7.5C4.8 7.5 3.6 9 3.9 11.2l1 7.1C5.1 20 6.5 21 8.3 21h7.4c1.8 0 3.2-1 3.4-2.7l1-7.1c.3-2.2-.9-3.7-3.1-3.7z"/><path d="M8.7 7.5V6.6a3.3 3.3 0 0 1 6.6 0v.9"/></>,
  cart: <><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2.2l2.3 11.3a1.2 1.2 0 0 0 1.2 1H18a1.2 1.2 0 0 0 1.2-1L21 8H6.2"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/></>,
  heart: <path d="M12 20.5C6 16.6 3 13 3 9.3 3 6.4 5.2 4.5 7.7 4.5c1.7 0 3.3.9 4.3 2.4 1-1.5 2.6-2.4 4.3-2.4C18.8 4.5 21 6.4 21 9.3c0 3.7-3 7.3-9 11.2z"/>,
  menu: <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>,
  close: <><path d="M6 6l12 12"/><path d="M18 6L6 18"/></>,
  filter: <path d="M3 5h18l-7 8.2V20l-4-2v-4.8z"/>,
  'chevron-right': <path d="M9.5 5.5l6 6.5-6 6.5"/>,
  'chevron-down': <path d="M5.5 9.5l6.5 6 6.5-6"/>,
  'chevron-left': <path d="M14.5 5.5l-6 6.5 6 6.5"/>,
  'arrow-right': <><path d="M4 12h15"/><path d="M13 6l6 6-6 6"/></>,
  plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
  minus: <path d="M5 12h14"/>,
  star: <path d="M12 3.5l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 17.3 6.7 20l1.1-6L3.4 9.8l6-.8z"/>,
  truck: <><path d="M3 6.5h11v9.5H3z"/><path d="M14 9.5h3.6L21 13v3h-7z"/><circle cx="7" cy="18.2" r="1.6"/><circle cx="17.5" cy="18.2" r="1.6"/></>,
  returns: <><path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M3.5 4v4h4"/></>,
  shield: <><path d="M12 3l7 2.8v5.6c0 4.4-3 7.6-7 9.1-4-1.5-7-4.7-7-9.1V5.8z"/><path d="M9 12l2.2 2.2L15.2 10"/></>,
  leaf: <><path d="M5 19.5C5 11 11 5 20.5 5 20.5 14 14.5 20 6 20c-.4 0-.7 0-1-.5z"/><path d="M5.5 19.5C9 15 13.5 11.8 18 9.7"/></>,
  gift: <><rect x="4" y="10" width="16" height="10.5" rx="1.4"/><path d="M3.2 7h17.6v3H3.2z"/><path d="M12 7v13.5"/><path d="M12 7C10.2 7 8 6.4 8 4.6 8 3.5 8.8 3 9.7 3.3 11.3 3.9 12 6 12 7z"/><path d="M12 7c1.8 0 4-.6 4-2.4 0-1.1-.8-1.6-1.7-1.3C12.7 3.9 12 6 12 7z"/></>,
  card: <><rect x="3" y="6" width="18" height="12" rx="2.2"/><path d="M3 10h18"/></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>,
  mail: <><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.6 7.5l8.4 5.6 8.4-5.6"/></>,
  box: <><path d="M12 3l8 4.4v9.2L12 21l-8-4.4V7.4z"/><path d="M4.3 7.6L12 12l7.7-4.4"/><path d="M12 12v9"/></>,
  whatsapp: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="currentColor" stroke="none"/>,
  check: <><path d="M20 6L9 17l-5-5"/></>,
};

export default function Icon({ name, size = 24, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={props['aria-hidden'] ?? true}
    >
      {paths[name]}
    </svg>
  );
}
