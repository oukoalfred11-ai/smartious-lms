import { useId } from 'react'

// The Smartious crest, drawn to match the official logo (/brand/logo.png):
// crimson shield with a gold rim, gold star, open book. The same drawing is
// public/favicon.svg. Vector, so it stays sharp at any size.
export default function SmartiousCrest({ size = 40, label = 'Smartious Homeschool' }) {
  const id = 'crest-' + useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={label} style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B8243D" />
          <stop offset="100%" stopColor="#86122A" />
        </linearGradient>
      </defs>
      <path d="M12.5 2 H51.5 Q57 2 57 7.5 V35 Q57 49.5 32 62 Q7 49.5 7 35 V7.5 Q7 2 12.5 2 Z" fill={`url(#${id})`} stroke="#D3A54B" strokeWidth="0.9" />
      <path d="M14 5.2 H50 Q53.8 5.2 53.8 9 V35 Q53.8 47.5 32 58.4 Q10.2 47.5 10.2 35 V9 Q10.2 5.2 14 5.2 Z" stroke="#D9AE5C" strokeOpacity=".55" strokeWidth=".6" />
      <path d="M32 9.5 L33.9 15.2 L39.9 15.2 L35 18.7 L36.9 24.4 L32 20.9 L27.1 24.4 L29 18.7 L24.1 15.2 L30.1 15.2 Z" fill="#D7A23C" />
      <path d="M18 27 Q24.5 26.2 31 28 V47 Q24.5 45.4 18 46 Z" fill="#FFFFFF" />
      <path d="M46 27 Q39.5 26.2 33 28 V47 Q39.5 45.4 46 46 Z" fill="#F4F1F2" />
      <path d="M20.5 32 H28.5 M20.5 35.5 H28.5 M20.5 39 H28.5 M35.5 32 H43.5 M35.5 35.5 H43.5 M35.5 39 H43.5" stroke="#D9A3B0" strokeWidth=".7" strokeLinecap="round" />
    </svg>
  )
}
