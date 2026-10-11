// The Smartious crest (shield, star, open book) as an SVG group, drawn in a
// 64×72 box. Shared by every icon and splash so they always match.
export const crest = (id = 'c') => `
  <defs>
    <linearGradient id="${id}-body" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#A8203A"/><stop offset="1" stop-color="#6B0F1E"/>
    </linearGradient>
    <linearGradient id="${id}-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F3D36B"/><stop offset=".55" stop-color="#C9A030"/><stop offset="1" stop-color="#A47E1B"/>
    </linearGradient>
    <linearGradient id="${id}-sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <path d="M4 4 L60 4 L60 44 Q60 56 32 68 Q4 56 4 44 Z" fill="url(#${id}-gold)"/>
  <path d="M7 7 L57 7 L57 44 Q57 54 32 65 Q7 54 7 44 Z" fill="url(#${id}-body)"/>
  <path d="M7 7 L57 7 L57 30 Q32 36 7 30 Z" fill="url(#${id}-sheen)"/>
  <path d="M11 11 L53 11 L53 44 Q53 52 32 61 Q11 52 11 44 Z" fill="none" stroke="#E9C766" stroke-width=".6" opacity=".55"/>
  <polygon points="32,15 34,21 40.3,21 35.2,24.8 37.2,30.8 32,27.1 26.8,30.8 28.8,24.8 23.7,21 30,21" fill="url(#${id}-gold)"/>
  <path d="M15.5 36.5 Q24 32.4 31.4 34.6 L31.4 53 Q24 50.8 15.5 54.6 Z" fill="#FFFDF8"/>
  <path d="M48.5 36.5 Q40 32.4 32.6 34.6 L32.6 53 Q40 50.8 48.5 54.6 Z" fill="#FFFDF8"/>
  <g stroke="#D9B85A" stroke-width=".7" stroke-linecap="round" opacity=".9">
    <line x1="19.5" y1="40.2" x2="28.5" y2="39"/><line x1="19.5" y1="43.4" x2="28.5" y2="42.2"/><line x1="19.5" y1="46.6" x2="28.5" y2="45.4"/>
    <line x1="35.5" y1="39" x2="44.5" y2="40.2"/><line x1="35.5" y1="42.2" x2="44.5" y2="43.4"/><line x1="35.5" y1="45.4" x2="44.5" y2="46.6"/>
  </g>`

// Crest scaled so its height is `h` and centred at (cx, cy).
export const placeCrest = (cx, cy, h, id) => {
  const k = h / 72
  return `<g transform="translate(${cx - 32 * k} ${cy - 36 * k}) scale(${k})">${crest(id)}</g>`
}
