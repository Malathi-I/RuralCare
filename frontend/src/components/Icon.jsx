/**
 * Small line icons used across the RuralCare landing page.
 *
 * They are 24x24, stroke-based and inherit `currentColor`, so they always
 * match the surrounding text colour and stay visually consistent.
 *
 * Inline SVG is used deliberately: no icon font or image request, which
 * keeps the page fast on the low-bandwidth connections this product targets.
 */

const ICON_PATHS = {
  stethoscope:
    'M6 3v5a4 4 0 0 0 8 0V3M4 3h4m4 0h4M10 12v3a5 5 0 0 0 5 5h1m0 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  hospital:
    'M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M12 8v3M10.5 9.5h3',
  calendar: 'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4M8 14h3',
  book: 'M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2zM9 3v18',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4-4',
  compare: 'M8 4v16M4 8h8M16 20V4m-4 12h8',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4',
  check: 'M20 6L9 17l-5-5',
  globe:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c3 4 3 14 0 18-3-4-3-14 0-18',
  wifi: 'M2 8.5a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8.5 15.5a6 6 0 0 1 7 0M12 19h.01',
  offline:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c3 4 3 14 0 18-3-4-3-14 0-18M3 3l18 18',
  lock: 'M6 11h12v10H6zM9 11V7a3 3 0 0 1 6 0v4M12 15v2',
  users:
    'M8 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2 21v-2a6 6 0 0 1 12 0v2M17 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 4 6',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3 2',
  pin: 'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5',
  // Open eye: used by the show-password toggle.
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6',
  // Closed eye with a strike-through: used by the hide-password toggle.
  eyeOff:
    'M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8M9.4 5.4A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.4 4.2M6.2 6.7A17.4 17.4 0 0 0 2 12s3.6 7 10 7a10.5 10.5 0 0 0 3.9-.7',
  sparkle:
    'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z',
};

/** Renders one of the shared line icons at a consistent size. */
export default function Icon({ name, size = 22, className = '' }) {
  const d = ICON_PATHS[name];
  if (!d) return null;

  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      /* Purely decorative: the adjacent label always carries the meaning. */
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}