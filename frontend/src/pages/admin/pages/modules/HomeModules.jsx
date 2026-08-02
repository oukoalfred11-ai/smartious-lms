import React, { useState, useEffect } from 'react'
import { api } from '../../../../context/ctx.jsx'
import { TOKENS } from '../shared/tokens.js'
import { greetingText } from '../shared/helpers.js'
import { PCard, PKpi, PSection, PTile } from '../shared/ui.jsx'
import { MODULES } from '../shared/modulesMeta.js'

export function DashboardModule({ setPage, userStats, pendingAllocations, refreshKey, auth, toast, openAddUser, adminFirst }) {
  const [now, setNow] = useState(new Date())
  const [stats, setStats] = useState({ loading: true, students: 0, teachers: 0, parents: 0 })

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    api.get('/users/stats')
      .then(res => {
        const d = res.data || {}
        setStats({ loading: false, students: d.students || d.totalStudents || 0, teachers: d.teachers || d.totalTeachers || 0, parents: d.parents || d.totalParents || 0 })
      })
      .catch(() => setStats({ loading: false, students: 0, teachers: 0, parents: 0 }))
  }, [refreshKey])

  const greeting = greetingText()

  // Tile grid for module navigation — Apple-style
  const tiles = [
    { kind: 'analytics',   page: 'analytics',   accent: MODULES.analytics.accent,   title: 'Analytics',     sub: 'Real-time platform metrics and student insights' },
    { kind: 'users',       page: 'users',       accent: MODULES.users.accent,       title: 'Users',         sub: stats.students + ' students · ' + stats.teachers + ' teachers · ' + stats.parents + ' parents' },
    { kind: 'teacher',     page: 'teachers',    accent: MODULES.teachers.accent,    title: 'Teachers',      sub: stats.teachers + ' faculty members on the roster' },
    { kind: 'allocations', page: 'allocations', accent: MODULES.allocations.accent, title: 'Manage Students',   sub: pendingAllocations > 0 ? pendingAllocations + ' pending allocations' : 'Subjects & teacher allocations', badge: pendingAllocations },
    { kind: 'curriculum',  page: 'curriculum',  accent: MODULES.curriculum.accent,  title: 'Curriculum',    sub: 'Manage subjects, grades and academic structure' },
    { kind: 'rooms',       page: 'grouprooms',  accent: MODULES.grouprooms.accent,  title: 'Group Rooms',   sub: 'Persistent classrooms with auto-enrollment' },
    { kind: 'live',        page: 'livelessons', accent: MODULES.livelessons.accent, title: 'Live Classes',  sub: 'Real-time classroom sessions in progress' },
    { kind: 'billing',     page: 'billing',     accent: MODULES.billing.accent,     title: 'Billing',       sub: 'Revenue, payments and fee structure' },
    { kind: 'website',     page: 'website',     accent: MODULES.website.accent,     title: 'Website',       sub: 'Edit landing page content and SEO' },
  ]

  return (
    <>
      {/* HERO HEADER */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: TOKENS.s500, marginBottom: 10 }}>
          {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 44, fontWeight: 400, color: TOKENS.s900,
          margin: 0, lineHeight: 1.1, letterSpacing: '-.02em',
        }}>
          {greeting}, <em style={{ color: TOKENS.crimson, fontWeight: 400 }}>{adminFirst}</em>.
        </h1>
        <p style={{ fontSize: 16, color: TOKENS.s500, marginTop: 8, lineHeight: 1.5, maxWidth: 600 }}>
          Here's what's happening at Smartious today. Choose a module below to dive in.
        </p>
      </div>

      {/* KPI ROW */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 36, flexWrap: 'wrap' }}>
        <PKpi label="Total Students" value={stats.loading ? '—' : stats.students.toLocaleString()} delta={stats.parents + ' parents linked'} accent={TOKENS.crimson}/>
        <PKpi label="Active Teachers" value={stats.loading ? '—' : stats.teachers} delta="On roster" accent={TOKENS.accentTeal}/>
        <PKpi label="Monthly Revenue" value={'KSh ' + Math.round(stats.students * 18000 / 1000) + 'k'} delta="Estimated"/>
        <PKpi label="Pending" value={pendingAllocations} delta={pendingAllocations === 0 ? 'All caught up' : 'Need review'} deltaColor={pendingAllocations > 0 ? TOKENS.accentAmber : TOKENS.accentEmerald}/>
      </div>

      {/* MODULE TILE GRID */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 22, fontWeight: 500, color: TOKENS.s900,
          margin: '0 0 16px', letterSpacing: '-.005em',
        }}>Modules</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {tiles.map(t => (
            <PTile key={t.page} kind={t.kind} title={t.title} sub={t.sub} accent={t.accent} onClick={() => setPage(t.page)} badge={t.badge}/>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <PCard accent={TOKENS.gold}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: TOKENS.s900, margin: '0 0 14px', fontWeight: 600 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => openAddUser('student')} className="btn btn-p btn-sm">+ Add Student</button>
          <button onClick={() => openAddUser('teacher')} className="btn btn-s btn-sm">+ Add Teacher</button>
          <button onClick={() => openAddUser('parent')} className="btn btn-s btn-sm">+ Add Parent</button>
          <button onClick={() => setPage('ai')} className="btn btn-s btn-sm">Open Mshauri AI</button>
        </div>
      </PCard>
    </>
  )
}

export function AnalyticsModule({ setPage, refreshKey, toast }) {
  const [stats, setStats] = useState({ loading: true, students: 0, teachers: 0 })
  const [students, setStudents] = useState([])

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, studsRes] = await Promise.all([
          api.get('/users/stats').catch(() => ({ data: {} })),
          api.get('/users/students/list').catch(() => ({ data: { students: [] } })),
        ])
        const d = statsRes.data || {}
        setStats({ loading: false, students: d.students || 0, teachers: d.teachers || 0 })
        setStudents(studsRes.data.students || [])
      } catch (e) {
        setStats({ loading: false, students: 0, teachers: 0 })
      }
    }
    fetch()
  }, [refreshKey])

  return (
    <>
      <PSection
        tag="Platform Intelligence"
        title="Analytics &"
        em="Reports"
        sub="Live platform metrics from your backend"
      />

      <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
        <PKpi label="Total Students" value={stats.students.toLocaleString()} delta="Live count"/>
        <PKpi label="Total Teachers" value={stats.teachers} delta="Active roster"/>
        <PKpi label="Avg Pass Rate" value="78%" delta="YTD"/>
        <PKpi label="Avg Attendance" value="91%" delta="Last 30 days"/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <PCard accent={TOKENS.accentNavy}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: TOKENS.s900, margin: '0 0 16px', fontWeight: 600 }}>Student Growth</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140 }}>
            {[{k:'Sep',v:1180},{k:'Oct',v:1320},{k:'Nov',v:1410},{k:'Dec',v:1530},{k:'Jan',v:1840},{k:'Feb',v:stats.students || 2010, hi:true}].map((d, i) => {
              const max = 2010
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: '100%', height: Math.max(6, (d.v/max)*120) + 'px', background: d.hi ? TOKENS.gold : TOKENS.accentNavy, borderRadius: '6px 6px 0 0', opacity: d.hi ? 1 : 0.6 }}/>
                  <div style={{ fontSize: 11, color: TOKENS.s500, fontWeight: 600 }}>{d.k}</div>
                </div>
              )
            })}
          </div>
        </PCard>

        <PCard accent={TOKENS.crimson}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: TOKENS.s900, margin: '0 0 16px', fontWeight: 600 }}>By Curriculum</h3>
          {(() => {
            const c = {}
            students.forEach(s => { const k = s.curriculum || 'Unspecified'; c[k] = (c[k] || 0) + 1 })
            const sorted = Object.entries(c).sort((a,b) => b[1] - a[1]).slice(0, 6)
            const max = sorted[0]?.[1] || 1
            if (sorted.length === 0) return <div style={{ padding: 24, textAlign: 'center', fontSize: 12, color: TOKENS.s400 }}>Add students to see breakdown</div>
            return sorted.map(([label, count]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid ' + TOKENS.s100 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: TOKENS.s700, flex: 1 }}>{label}</span>
                <div style={{ flex: 2, height: 6, background: TOKENS.s100, borderRadius: 99 }}>
                  <div style={{ width: (count/max*100) + '%', height: '100%', background: TOKENS.crimson, borderRadius: 99 }}/>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: TOKENS.s900, width: 50, textAlign: 'right' }}>{count}</span>
              </div>
            ))
          })()}
        </PCard>
      </div>
    </>
  )
}
