/**
 * Lightweight inline SVG artwork for the RuralCare landing page.
 *
 * These are hand-built illustrations rather than photographs or stock
 * images, which means:
 *  - no copyright or licensing concerns
 *  - no external server and no hotlinked URL, so the page works offline
 *  - a few kilobytes each, which matters for low-bandwidth villages
 *  - they inherit theme colours, so they stay consistent with the brand
 *
 * Accessibility: an illustration that carries meaning receives a translated
 * `alt` and is exposed as role="img". Decorative shapes are hidden from
 * assistive technology with aria-hidden instead.
 */

/** Shared wrapper so all artwork shares sizing and accessibility rules. */
function Illustration({ viewBox, alt, className = '', children, ...rest }) {
  const decorative = !alt;

  return (
    <svg
      viewBox={viewBox}
      className={`art ${className}`.trim()}
      width="100%"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={decorative ? undefined : alt}
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/**
 * Hero artwork: a healthcare professional talking with a rural patient
 * outside a small community clinic. Warm, calm and deliberately generic -
 * no exaggerated medical imagery, just people and a place of care.
 */
export function HeroCareIllustration({ alt }) {
  return (
    <Illustration viewBox="0 0 520 420" alt={alt} className="art--hero">
      <defs>
        <linearGradient id="rcHeroSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8f4f2" />
          <stop offset="100%" stopColor="#d3e8e5" />
        </linearGradient>
        <linearGradient id="rcHeroGown" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e8f1f0" />
        </linearGradient>
      </defs>

      <rect width="520" height="420" fill="url(#rcHeroSky)" />

      {/* Rolling hills behind the clinic */}
      <path
        d="M0 250c70-46 128-58 196-30s118 26 176-6 92-30 148-8v214H0z"
        fill="#bcded8"
      />
      <path d="M0 296c86-32 150-28 216-4s140 18 304-16v144H0z" fill="#a8d3cb" />

      {/* Sun, kept subtle so it never reads as stock imagery */}
      <circle cx="432" cy="76" r="34" fill="#ffffff" opacity="0.65" />

      {/* Community clinic building */}
      <rect x="52" y="150" width="168" height="150" rx="10" fill="#ffffff" />
      <rect x="52" y="150" width="168" height="26" rx="10" fill="#0f766e" />
      <rect x="122" y="228" width="42" height="72" rx="5" fill="#dbeceb" />
      <rect x="74" y="196" width="30" height="24" rx="4" fill="#cfe6e4" />
      <rect x="168" y="196" width="30" height="24" rx="4" fill="#cfe6e4" />

      {/* Clinic cross sign */}
      <rect x="128" y="112" width="16" height="44" rx="7" fill="#0f766e" />
      <rect x="114" y="126" width="44" height="16" rx="7" fill="#0f766e" />

      {/* Ground line */}
      <rect x="0" y="300" width="520" height="8" fill="#8fc4bb" />

      {/* Healthcare professional */}
      <g>
        <circle cx="286" cy="196" r="27" fill="#e8c9a8" />
        <path d="M259 192a27 27 0 0 1 54 0z" fill="#3f4a52" />
        <path
          d="M248 300v-52a38 38 0 0 1 76 0v52z"
          fill="url(#rcHeroGown)"
          stroke="#c9dedb"
          strokeWidth="2"
        />
        {/* Stethoscope */}
        <path
          d="M296 252c0 18-10 26-22 26"
          fill="none"
          stroke="#0f766e"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="272" cy="281" r="7" fill="#0f766e" />
        {/* Clipboard */}
        <rect x="316" y="258" width="28" height="38" rx="4" fill="#0e7490" />
        <rect x="322" y="266" width="16" height="3" rx="1.5" fill="#ffffff" />
        <rect x="322" y="274" width="16" height="3" rx="1.5" fill="#ffffff" />
      </g>

      {/* Rural patient seated on a stool */}
      <g>
        <circle cx="404" cy="214" r="25" fill="#e8c9a8" />
        <path d="M379 210a25 25 0 0 1 50 0z" fill="#5b4636" />
        <path d="M368 300v-40a36 36 0 0 1 72 0v40z" fill="#e9a15c" />
        <rect x="356" y="300" width="96" height="8" rx="4" fill="#7fb3aa" />
        <rect x="362" y="308" width="8" height="24" rx="4" fill="#7fb3aa" />
        <rect x="438" y="308" width="8" height="24" rx="4" fill="#7fb3aa" />
      </g>

      {/* Ground shadows anchor the figures */}
      <ellipse cx="286" cy="304" rx="46" ry="8" fill="#7fb3aa" opacity="0.55" />
      <ellipse cx="404" cy="306" rx="52" ry="8" fill="#7fb3aa" opacity="0.55" />
    </Illustration>
  );
}
/** Empty-state artwork: a doctor with a stethoscope. */
export function DoctorEmptyIllustration({ alt }) {
  return (
    <Illustration viewBox="0 0 200 150" alt={alt} className="art--empty">
      <circle cx="100" cy="70" r="58" fill="#e6f2f1" />
      <circle cx="100" cy="58" r="22" fill="#e8c9a8" />
      <path d="M78 55a22 22 0 0 1 44 0z" fill="#3f4a52" />
      <path d="M66 132v-46a34 34 0 0 1 68 0v46z" fill="#ffffff" />
      <path
        d="M118 96c0 20-10 30-24 30"
        fill="none"
        stroke="#0f766e"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="92" cy="128" r="7" fill="#0f766e" />
      <rect x="52" y="18" width="12" height="32" rx="5" fill="#0e7490" />
      <rect x="42" y="28" width="32" height="12" rx="5" fill="#0e7490" />
    </Illustration>
  );
}

/** Empty-state artwork: a small community clinic building. */
export function ClinicEmptyIllustration({ alt }) {
  return (
    <Illustration viewBox="0 0 200 150" alt={alt} className="art--empty">
      <circle cx="100" cy="70" r="58" fill="#e6f2f1" />
      <rect x="56" y="56" width="88" height="62" rx="8" fill="#ffffff" />
      <rect x="56" y="56" width="88" height="14" rx="8" fill="#0f766e" />
      <rect x="88" y="84" width="24" height="34" rx="4" fill="#dbeceb" />
      <rect x="66" y="78" width="16" height="12" rx="3" fill="#cfe6e4" />
      <rect x="118" y="78" width="16" height="12" rx="3" fill="#cfe6e4" />
      <rect x="96" y="34" width="8" height="22" rx="4" fill="#0f766e" />
      <rect x="89" y="41" width="22" height="8" rx="4" fill="#0f766e" />
      <rect x="46" y="118" width="108" height="6" rx="3" fill="#a8d3cb" />
    </Illustration>
  );
}
/** Decorative artwork for the problem / solution section. */
export function CommunityIllustration({ alt }) {
  return (
    <Illustration viewBox="0 0 420 300" alt={alt} className="art--panel">
      <rect width="420" height="300" fill="#eef6f5" rx="12" />
      <path
        d="M0 208c62-34 108-42 164-20s106 22 158-4 62-16 98 2v114H0z"
        fill="#cfe6e4"
      />
      <path d="M0 246c74-24 128-20 184-2s118 12 236-14v70H0z" fill="#bcded8" />

      <g>
        <path d="M44 176l30-26 30 26v50H44z" fill="#ffffff" />
        <path d="M38 178l36-30 36 30z" fill="#0f766e" />
        <rect x="66" y="196" width="16" height="30" rx="3" fill="#dbeceb" />

        <path d="M132 188l26-22 26 22v38h-52z" fill="#ffffff" />
        <path d="M127 190l31-26 31 26z" fill="#0e7490" />
        <rect x="150" y="204" width="14" height="22" rx="3" fill="#dbeceb" />

        <path d="M216 180l28-24 28 24v46h-56z" fill="#ffffff" />
        <path d="M211 182l33-28 33 28z" fill="#0f766e" />
        <rect x="236" y="198" width="16" height="28" rx="3" fill="#dbeceb" />
      </g>

      <path
        d="M40 268c96-18 168-6 236 10s92 4 112-8"
        fill="none"
        stroke="#8fc4bb"
        strokeWidth="8"
        strokeLinecap="round"
      />

      <rect x="316" y="146" width="66" height="56" rx="7" fill="#ffffff" />
      <rect x="316" y="146" width="66" height="12" rx="7" fill="#0f766e" />
      <rect x="344" y="124" width="8" height="22" rx="4" fill="#0e7490" />
      <rect x="337" y="131" width="22" height="8" rx="4" fill="#0e7490" />
    </Illustration>
  );
}

export default Illustration;

/** Empty-state artwork: an open health-information leaflet. */
export function ArticleEmptyIllustration({ alt }) {
  return (
    <Illustration viewBox="0 0 200 150" alt={alt} className="art--empty">
      <circle cx="100" cy="70" r="58" fill="#e6f2f1" />
      <rect x="58" y="42" width="84" height="66" rx="8" fill="#ffffff" />
      <rect x="100" y="42" width="42" height="66" rx="8" fill="#f4f9f8" />
      <rect x="68" y="56" width="24" height="4" rx="2" fill="#a8d3cb" />
      <rect x="68" y="68" width="24" height="4" rx="2" fill="#a8d3cb" />
      <rect x="68" y="80" width="16" height="4" rx="2" fill="#a8d3cb" />
      <rect x="110" y="56" width="24" height="4" rx="2" fill="#0f766e" opacity="0.5" />
      <rect x="110" y="68" width="24" height="4" rx="2" fill="#a8d3cb" />
      <rect x="110" y="80" width="24" height="4" rx="2" fill="#a8d3cb" />
      <rect x="88" y="96" width="24" height="22" rx="4" fill="#0e7490" />
      <rect x="94" y="100" width="12" height="5" rx="2" fill="#ffffff" />
      <rect x="94" y="108" width="12" height="5" rx="2" fill="#ffffff" />
    </Illustration>
  );
}