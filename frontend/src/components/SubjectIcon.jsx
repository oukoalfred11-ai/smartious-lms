/* ═══════════════════════════════════════════════════════════════════
   SubjectIcon.jsx — the coloured SVG icon for each subject
   ───────────────────────────────────────────────────────────────────
   One line-art glyph and tint per subject family (mathematics, physics,
   chemistry, biology, English and literature, business and accounting,
   computer science and ICT, economics, geography, history), with a
   document glyph for everything else. Used by the practice picker and
   the student dashboard.
     size   — glyph size in px (the tile is size + pad)
     pad    — space around the glyph (default 22)
     radius — tile corner radius (default 14)
     center — centre the tile in its row (default true, as in practice)
   The svg sets fill="none" so outline shapes (the physics atom's
   ellipses, the globe and clock circles) draw as outlines, not blobs;
   the small solid dots set their own fill.
═══════════════════════════════════════════════════════════════════ */

export default function SubjectIcon({ name, size = 34, pad = 22, radius = 14, center = true }) {
  const P = (d, extra={}) => <path d={d} fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...extra}/>
  const key = (name||'').toLowerCase()
  let stroke='#7D1025', bg='#FDE7EC', body=null
  if (key.includes('math')) { stroke='#7C3AED'; bg='#EDE9FE'
    body=<g stroke={stroke}>{P('M4 4h16v16H4z')}{P('M8 9h8M8 15h4')}<circle cx="16" cy="15" r="1.4" fill={stroke} stroke="none"/></g> }
  else if (key.includes('physic')) { stroke='#2563EB'; bg='#DBEAFE'
    body=<g stroke={stroke}><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.6" fill={stroke} stroke="none"/></g> }
  else if (key.includes('chem')) { stroke='#059669'; bg='#D1FAE5'
    body=<g stroke={stroke}>{P('M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3')}{P('M7.5 15h9')}</g> }
  else if (key.includes('bio')) { stroke='#16A34A'; bg='#DCFCE7'
    body=<g stroke={stroke}>{P('M12 2c3 3 3 7 0 10c-3 3-3 7 0 10')}{P('M12 2c-3 3-3 7 0 10c3 3 3 7 0 10')}{P('M8.5 7h7M8.5 17h7M7.5 12h9')}</g> }
  else if (key.includes('english') || key.includes('literature')) { stroke='#D97706'; bg='#FEF3C7'
    body=<g stroke={stroke}>{P('M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z')}{P('M4 19.5A2.5 2.5 0 0 0 6.5 22H20')}{P('M9 7h7M9 11h5')}</g> }
  else if (key.includes('business') || key.includes('account') || key.includes('commerce')) { stroke='#0891B2'; bg='#CFFAFE'
    body=<g stroke={stroke}>{P('M4 20V10M10 20V4M16 20v-7M21 20H3')}<circle cx="16" cy="9" r="1.3" fill={stroke} stroke="none"/></g> }
  else if (key.includes('computer') || key.includes('ict')) { stroke='#4F46E5'; bg='#E0E7FF'
    body=<g stroke={stroke}>{P('M9 8l-4 4 4 4M15 8l4 4-4 4M13 5l-2 14')}</g> }
  else if (key.includes('econom')) { stroke='#B45309'; bg='#FDE68A'
    body=<g stroke={stroke}>{P('M3 17l5-5 4 3 6-7')}{P('M18 8h3v3')}</g> }
  else if (key.includes('geo')) { stroke='#0D9488'; bg='#CCFBF1'
    body=<g stroke={stroke}><circle cx="12" cy="12" r="9"/>{P('M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18')}</g> }
  else if (key.includes('hist')) { stroke='#9F1239'; bg='#FFE4E6'
    body=<g stroke={stroke}><circle cx="12" cy="12" r="9"/>{P('M12 7v5l3.5 2')}</g> }
  else { body=<g stroke={stroke}>{P('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z')}{P('M14 2v6h6M9 13h6M9 17h4')}</g> }
  return (
    <div style={{ width:size+pad, height:size+pad, borderRadius:radius, background:bg, display:'flex', alignItems:'center', justifyContent:'center', margin:center ? '0 auto' : 0, flexShrink:0 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">{body}</svg>
    </div>
  )
}
