/**
 * Hub.jsx — one menu item, several related pages as tabs. Used to merge
 * Dean & Operations modules that covered the same ground (attendance,
 * performance, oversight, reports) without losing any of them.
 */
import React, { useEffect, useState } from 'react'
import { TOKENS } from './tokens.js'

export default function Hub({ tabs, tab }) {
  const first = tabs[0][0]
  const [cur, setCur] = useState(tab && tabs.some(t => t[0] === tab) ? tab : first)
  // Opening an old menu link (e.g. Marks Entry) selects its tab.
  useEffect(() => { if (tab && tabs.some(t => t[0] === tab)) setCur(tab) }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps
  const active = tabs.find(t => t[0] === cur) || tabs[0]
  return (
    <div>
      <div role="tablist" style={{ display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: `1px solid ${TOKENS.line}`, marginBottom: 18 }}>
        {tabs.map(([id, label]) => {
          const on = id === active[0]
          return (
            <button key={id} role="tab" aria-selected={on} type="button" onClick={() => setCur(id)}
              style={{ border: 'none', background: 'none', padding: '9px 14px', marginBottom: -1, cursor: 'pointer', fontSize: 13.5, fontWeight: on ? 800 : 600,
                color: on ? TOKENS.crimson : TOKENS.s500, borderBottom: `2px solid ${on ? TOKENS.crimson : 'transparent'}` }}>
              {label}
            </button>
          )
        })}
      </div>
      <div key={active[0]}>{active[2]}</div>
    </div>
  )
}
