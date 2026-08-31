import React, { useState } from 'react'
import BirthdayBanner from '../../../components/BirthdayBanner.jsx'
import SuggestionBox from '../../../components/SuggestionBox.jsx'
import { useToast, useAuth, api } from '../../../context/ctx.jsx'
import Modal from '../../../components/ui/Modal.jsx'
import { TOKENS } from './shared/tokens.js'
import { ModuleIcon } from './shared/ui.jsx'
import { MODULES } from './shared/modulesMeta.js'
import { DashboardModule, AnalyticsModule } from './modules/HomeModules.jsx'
import UsersModule, { UserFormFields } from './modules/UsersModule.jsx'
import TeachersModule from './modules/TeachersModule.jsx'
import DocumentsModule from './modules/DocumentsModule.jsx'
import FrontDeskModule from './modules/FrontDeskModule.jsx'
import AssessmentModule from './modules/AssessmentModule.jsx'
import CRMModule, { SalesPerformanceModule } from './modules/CRMModule.jsx'
import { DOSAnalyticsModule, DOSExamsModule, DOSHomeworkModule, DOSAttendanceModule, DOSTimetableModule, CheckInModule, DOSBreakModule } from './modules/DOSModules.jsx'
import ReportsModule from './modules/ReportsModule.jsx'
import CommunicationModule from './modules/CommunicationModule.jsx'
import StudentsManagementModule from './modules/AllocationsModule.jsx'
import QuestionBankModule from './modules/QuestionBankModule.jsx'
import MarkingReviewModule from './modules/MarkingReviewModule.jsx'
import { COOReportOverviewModule, TeacherRatingsModule } from './modules/RatingsModule.jsx'
import PayrollModule from './modules/PayrollModule.jsx'
import StudentSessionsModule from './modules/StudentSessionsModule.jsx'
import CurriculumModule from './modules/CurriculumModule.jsx'
import BillingModule, { FeeCollectionModule } from './modules/BillingModule.jsx'
import CommunityModule from './modules/CommunityModule.jsx'
import LiveClassesModule from './modules/LiveClassesModule.jsx'
import AnnouncementsModule from './modules/AnnouncementsModule.jsx'
import StudioModule from './modules/StudioModule.jsx'
import SettingsModule from './modules/SettingsModule.jsx'
import { LeaveModule, ProgrammesModule, LiveLessonsModule, GroupRoomsModule, WebsiteModule, MshauriModule, SuggestionsModule } from './modules/MiscModules.jsx'

// ═══════════════════════════════════════════════════════════
// SMARTIOUS ADMIN DASHBOARD — PREMIUM REDESIGN
// ═══════════════════════════════════════════════════════════
// Design language: Apple Numbers / Calendar — warm, refined, generous whitespace
// Brand: Crimson #7D1025, Gold #C9A030, Cream #FBFAF5
// Module accent colors layered on top of brand
// Illustrated SVG icons for each module category
// Hybrid navigation: top nav + collapsible left rail + tile grid landings


const DEFAULT_USER_FORM = {
  firstName: '', lastName: '', email: '', phone: '', role: 'student',
  programme: 'Homeschool', deliveryMode: 'Virtual',
  curriculum: '', grade: '', plan: 'Basic',
  subjects: [], teachingSpecialties: [],
  bio: '', linkedStudents: [],
  _id: null,
}

const resetForm = () => ({ ...DEFAULT_USER_FORM })

function PNavigation({ page, setPage, adminFirst, onLogout, forcedRole }) {
  const [railOpen, setRailOpen] = useState(true)
  const auth = useAuth()

  // Group modules into nav sections
  // Role-based module access — each role sees only its permitted modules
  const role = forcedRole || auth?.user?.role || 'admin'

  // Portal identity per role — shown in the top nav bar
  const PORTAL_META = {
    admin:       { label: 'Admin Portal',      color: TOKENS.crimson },
    accountant:  { label: 'Accounts Portal',   color: TOKENS.accentEmerald },
    dos:         { label: 'Dean of Studies',    color: TOKENS.accentNavy },
    sales:       { label: 'Sales Portal',      color: TOKENS.accentNavy },
    ops_manager: { label: 'Operations Portal', color: TOKENS.accentAmber },
  }
  const portalMeta = PORTAL_META[role] || PORTAL_META.admin

  const ROLE_SECTIONS = {
    admin: [
      { label: 'Overview',    items: ['dashboard', 'analytics'] },
      { label: 'People',      items: ['users', 'teachers', 'allocations', 'sessions', 'communication', 'community', 'announcements', 'liveclasses'] },
      { label: 'Reports',     items: ['reports'] },
      { label: 'Operations',  items: ['frontdesk', 'assessment', 'documents', 'payroll', 'leave', 'programmes'] },
      { label: 'Teaching',    items: ['livelessons', 'grouprooms', 'curriculum'] },
      { label: 'Question Bank', items: ['questionbank', 'markingreview'] },
      { label: 'Marketing',   items: ['studio'] },
      { label: 'System',      items: ['billing', 'website', 'settings', 'ai', 'suggestions'] },
    ],
    accountant: [
      { label: 'Overview',    items: ['checkin', 'dashboard', 'analytics'] },
      { label: 'Fee Management', items: ['feecollection', 'billing', 'sessions'] },
      { label: 'Finance',     items: ['payroll'] },
      { label: 'System',      items: ['settings'] },
    ],
    dos: [
      { label: 'Overview',      items: ['checkin', 'dosanalytics'] },
      { label: 'Exams',         items: ['exams'] },
      { label: 'Homework',      items: ['doshomework'] },
      { label: 'Attendance',    items: ['dosattend'] },
      { label: 'Student Sessions', items: ['sessions'] },
      { label: 'Breaks',        items: ['dosbreaks'] },
      { label: 'Timetables',    items: ['dostimetable'] },
      { label: 'Question Bank', items: ['questionbank', 'markingreview'] },
      { label: 'Reports',       items: ['reports'] },
      { label: 'System',        items: ['settings'] },
    ],
    sales: [
      { label: 'Overview',    items: ['checkin', 'dashboard', 'salesperf'] },
      { label: 'CRM',         items: ['crm'] },
      { label: 'Admissions',  items: ['assessment', 'frontdesk', 'communication'] },
      { label: 'Content',     items: ['documents'] },
      { label: 'System',      items: ['settings'] },
    ],
    ops_manager: [
      { label: 'Overview',    items: ['checkin', 'dashboard', 'analytics'] },
      { label: 'People',      items: ['users', 'teachers', 'allocations', 'sessions', 'communication'] },
      { label: 'Reports',     items: ['cooreports', 'reports'] },
      { label: 'Performance', items: ['teacherratings'] },
      { label: 'Operations',  items: ['crm', 'frontdesk', 'assessment', 'documents', 'leave', 'programmes'] },
      // Curriculum and Question Bank moved to the Admin Portal.
      { label: 'Teaching',    items: ['livelessons', 'grouprooms'] },
      { label: 'System',      items: ['settings', 'ai'] },
    ],
  }
  const SECTIONS = ROLE_SECTIONS[role] || ROLE_SECTIONS.admin

  // Guard: if the current page is not in this role's allowed modules, fall back to dashboard
  const allowedPages = (ROLE_SECTIONS[role] || ROLE_SECTIONS.admin).flatMap(s => s.items)
  const safePage = allowedPages.includes(page) ? page : 'dashboard'
  const currentMod = MODULES[safePage] || MODULES.dashboard

  return (
    <>
      {/* TOP NAV BAR */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid ' + TOKENS.s100,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '12px 28px', maxWidth: 1600, margin: '0 auto',
        }}>
          {/* Sidebar toggle */}
          <button onClick={() => setRailOpen(v => !v)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: 8, borderRadius: 8, color: TOKENS.s700,
            display: 'flex', alignItems: 'center',
          }} title={railOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, ' + TOKENS.crimson + ' 0%, ' + TOKENS.crimsonDeep + ' 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px ' + TOKENS.crimson + '40',
            }}>
              <span style={{ color: TOKENS.goldLight, fontSize: 16, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>S</span>
            </div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 20, fontWeight: 600, color: TOKENS.s900,
              letterSpacing: '-.01em',
            }}>
              Smart<em style={{ color: TOKENS.gold, fontStyle: 'italic', fontWeight: 500 }}>ious</em>
            </div>
          </div>

          {/* Current module breadcrumb */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 99,
            background: currentMod.accent + '10',
            border: '1px solid ' + currentMod.accent + '20',
          }}>
            <ModuleIcon kind={currentMod.icon} size={20} accent={currentMod.accent}/>
            <span style={{ fontSize: 13, fontWeight: 600, color: currentMod.accent }}>
              {currentMod.label}
            </span>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }}/>

          {/* Right: admin info + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: TOKENS.s900 }}>{adminFirst}</div>
              <div style={{ fontSize: 10, color: TOKENS.s500, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                {{
                  admin:       'Administrator',
                  dos:         'Dean of Studies',
                  accountant:  'Accountant',
                  sales:       'Sales & Front Desk',
                  ops_manager: 'Operations Manager',
                }[role] || 'Administrator'}
              </div>
            </div>
            <button onClick={onLogout} title="Sign out" style={{
              width: 36, height: 36, borderRadius: 10,
              background: TOKENS.s50, border: '1px solid ' + TOKENS.s200,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: TOKENS.s700,
            }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* SIDE RAIL */}
      <div style={{
        position: 'fixed', top: 60, left: 0, bottom: 0,
        width: railOpen ? 240 : 0,
        background: TOKENS.cream,
        borderRight: railOpen ? '1px solid ' + TOKENS.s100 : 'none',
        overflow: 'hidden',
        transition: 'width 0.25s cubic-bezier(.4,0,.2,1)',
        zIndex: 40,
      }}>
        <div style={{ width: 240, padding: '20px 12px', overflowY: 'auto', height: '100%' }}>
          {SECTIONS.map(section => (
            <div key={section.label} style={{ marginBottom: 18 }}>
              <div style={{
                fontSize: 10, fontWeight: 800, letterSpacing: '.14em',
                textTransform: 'uppercase', color: TOKENS.s400,
                padding: '0 12px', marginBottom: 8,
              }}>{section.label}</div>
              {section.items.map(modKey => {
                const mod = MODULES[modKey]
                const active = page === modKey
                return (
                  <button
                    key={modKey}
                    onClick={() => setPage(modKey)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 10,
                      background: active ? TOKENS.white : 'transparent',
                      border: 'none', cursor: 'pointer',
                      color: active ? mod.accent : TOKENS.s700,
                      fontWeight: active ? 700 : 500, fontSize: 13.5,
                      textAlign: 'left', marginBottom: 2,
                      boxShadow: active ? '0 1px 3px rgba(0,0,0,.04), 0 0 0 1px ' + mod.accent + '20' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.6)' }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                  >
                    <ModuleIcon kind={mod.icon} size={22} accent={active ? mod.accent : TOKENS.s500}/>
                    <span>{mod.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default function AdminDashboard({ page, setPage, userStats, pendingAllocations, refreshKey, onUserSaved, forcedRole = undefined }) {
  const toast = useToast()
  const auth = useAuth()

  const [userModal, setUserModal] = useState(false)
  const [userForm, setUserForm] = useState(resetForm())
  const [credentialsOverlay, setCredentialsOverlay] = useState(null)

  const openAddUser = (defaultRole = 'student') => {
    setUserForm({ ...resetForm(), role: defaultRole })
    setUserModal(true)
  }

  const closeUserModal = () => {
    setUserModal(false)
    setUserForm(resetForm())
  }

  const saveUser = async () => {
    if (!userForm.firstName.trim() || !userForm.lastName.trim() || !userForm.email.trim()) {
      toast.error('First name, last name, and email are required')
      return
    }
    if (!/\S+@\S+\.\S+/.test(userForm.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    try {
      const payload = {
        firstName: userForm.firstName.trim(),
        lastName: userForm.lastName.trim(),
        email: userForm.email.trim().toLowerCase(),
        phone: userForm.phone || '',
        role: userForm.role,
        isActive: true,
      }

      if (userForm.role === 'student') {
        const ACADEMIC = ['Homeschool', 'Tuition', 'IUFP']
        payload.programme = userForm.programme || 'Homeschool'
        payload.deliveryMode = userForm.deliveryMode || 'Virtual'
        // Advisory programmes (Study Abroad, Pre-University) carry no
        // curriculum / subjects — only academic programmes do.
        const isAcademic = ACADEMIC.includes(payload.programme)
        payload.curriculum = isAcademic ? (userForm.curriculum || null) : null
        payload.gradeLevel = isAcademic ? (userForm.grade || null) : null
        payload.plan = userForm.plan || 'Basic'
        payload.subjects = isAcademic ? (userForm.subjects || []) : []
        payload.dateOfBirth = userForm.dateOfBirth || null
        payload.homeAddress = userForm.homeAddress || ''
        payload.medicalNotes = userForm.medicalNotes || ''
        payload.avatar = userForm.avatar || ''
      } else if (userForm.role === 'teacher') {
        payload.curriculum = Array.isArray(userForm.curriculum) ? userForm.curriculum.filter(Boolean) : (userForm.curriculum ? [userForm.curriculum] : [])
        // subjects must be plain strings — backend Teacher record stores them as strings
        const rawSubjects = userForm.subjects || []
        payload.subjects = rawSubjects.filter(s => typeof s === 'string' && s.trim())
        // Don't send teachingSpecialties — not needed, backend handles it
        payload.plan = 'Staff'
        payload.bio = userForm.bio || ''
        payload.qualifications = userForm.qualifications || []
        payload.certifications = userForm.certifications || []
        payload.specializations = userForm.specializations || []
        payload.yearsOfExperience = userForm.yearsOfExperience || 0
        payload.avatar = userForm.avatar || ''
      } else if (userForm.role === 'parent') {
        payload.bio = userForm.bio || ''
        payload.linkedStudents = userForm.linkedStudents || []
        payload.plan = 'Basic'
        payload.avatar = userForm.avatar || ''
      } else if (['admin','accountant','sales','ops_manager','dos'].includes(userForm.role)) {
        payload.plan = 'Staff'
      }

      if (userForm._id) {
        await api.patch('/users/' + userForm._id, payload)
        toast.ok(userForm.firstName + ' updated')
      } else {
        const res = await api.post('/users', payload)
        if (res.data.credentials) {
          setCredentialsOverlay(res.data.credentials)
        }
        toast.ok(userForm.firstName + ' created successfully')
      }

      closeUserModal()
      if (onUserSaved) onUserSaved()
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Could not save user'
      toast.error('Save failed: ' + msg)
    }
  }

  const adminFirst = auth?.user?.firstName || 'Alfred'

  // Role-based page access — mirrors the logic inside PNavigation
  const role = auth?.user?.role || 'admin'
  const ROLE_SECTIONS_MAIN = {
    admin:       [
      { items: ['dashboard','analytics','users','teachers','allocations','sessions','communication','announcements','liveclasses','reports','frontdesk','documents','assessment','payroll','leave','programmes','livelessons','grouprooms','curriculum','questionbank','markingreview','cooreports','teacherratings','feecollection','crm','billing','studio','website','settings','ai','suggestions','community'] },
    ],
    accountant:  [{ items: ['checkin','dashboard','analytics','feecollection','billing','sessions','payroll','settings'] }],
    sales:       [{ items: ['checkin','dashboard','salesperf','crm','assessment','frontdesk','communication','documents','settings'] }],
    dos:         [{ items: ['checkin','dosanalytics','exams','doshomework','dosattend','sessions','dosbreaks','dostimetable','questionbank','markingreview','reports','settings'] }],
    ops_manager: [{ items: ['checkin','dashboard','analytics','users','teachers','allocations','sessions','communication','cooreports','reports','teacherratings','crm','frontdesk','assessment','documents','leave','programmes','livelessons','grouprooms','settings','ai'] }],
  }
  const allowedPages = (ROLE_SECTIONS_MAIN[role] || ROLE_SECTIONS_MAIN.admin).flatMap(s => s.items)
  const safePage = allowedPages.includes(page) ? page : 'dashboard'

  return (
    <div style={{
      background: TOKENS.s50, minHeight: '100vh',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
      color: TOKENS.s900,
    }}>
      <PNavigation page={page} setPage={setPage} adminFirst={adminFirst} forcedRole={forcedRole} onLogout={() => { localStorage.removeItem('sm_token'); localStorage.removeItem('sm_user'); window.location.href = '/login' }}/>

      <div style={{
        marginLeft: 240,
        padding: '40px 48px',
        maxWidth: 1400,
        transition: 'margin-left 0.25s',
      }}>
        <BirthdayBanner />
        <SuggestionBox />
        {safePage === 'dashboard'   && forcedRole && <RoleOverview role={forcedRole} setPage={setPage} userStats={userStats} pendingAllocations={pendingAllocations} auth={auth} />}
        {safePage === 'dashboard'   && !forcedRole && <DashboardModule  setPage={setPage} userStats={userStats} pendingAllocations={pendingAllocations} refreshKey={refreshKey} auth={auth} toast={toast} openAddUser={openAddUser} adminFirst={adminFirst} />}
        {safePage === 'analytics'   && <AnalyticsModule  setPage={setPage} refreshKey={refreshKey} toast={toast} />}
        {safePage === 'users'       && <UsersModule      refreshKey={refreshKey} toast={toast} setUserForm={setUserForm} setUserModal={setUserModal} openAddUser={openAddUser} />}
        {safePage === 'teachers'    && <TeachersModule   refreshKey={refreshKey} toast={toast} openAddUser={openAddUser} />}
        {safePage === 'allocations' && <StudentsManagementModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'communication' && <CommunicationModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'community' && <CommunityModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'liveclasses' && <LiveClassesModule toast={toast} />}
        {safePage === 'announcements' && <AnnouncementsModule toast={toast} />}
        {safePage === 'frontdesk' && <FrontDeskModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'documents' && <DocumentsModule toast={toast} />}
        {safePage === 'assessment' && <AssessmentModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'crm' && <CRMModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'salesperf' && <SalesPerformanceModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'reports'      && <ReportsModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'dosanalytics'  && <DOSAnalyticsModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'exams'         && <DOSExamsModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'doshomework'   && <DOSHomeworkModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'dosattend'     && <DOSAttendanceModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'checkin'       && <CheckInModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'dosbreaks'     && <DOSBreakModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'dostimetable'  && <DOSTimetableModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'payroll'        && <PayrollModule         refreshKey={refreshKey} toast={toast}/>}
        {safePage === 'sessions'    && <StudentSessionsModule toast={toast} refreshKey={refreshKey} />}
        {safePage === 'suggestions' && <SuggestionsModule toast={toast} refreshKey={refreshKey} />}
        {safePage === 'questionbank'   && <QuestionBankModule   refreshKey={refreshKey} toast={toast}/>}
        {safePage === 'cooreports'    && <COOReportOverviewModule refreshKey={refreshKey} toast={toast}/>}
        {safePage === 'teacherratings'&& <TeacherRatingsModule    refreshKey={refreshKey} toast={toast}/>}
        {safePage === 'leave'       && <LeaveModule      refreshKey={refreshKey} toast={toast} />}
        {safePage === 'programmes'  && <ProgrammesModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'livelessons' && <LiveLessonsModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'grouprooms'  && <GroupRoomsModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'curriculum'  && <CurriculumModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'markingreview' && <MarkingReviewModule toast={toast} />}
        {safePage === 'billing'        && <BillingModule       refreshKey={refreshKey} toast={toast}/>}
        {safePage === 'studio'         && <StudioModule        toast={toast}/>}
        {safePage === 'feecollection' && <FeeCollectionModule refreshKey={refreshKey} toast={toast}/>}
        {safePage === 'website'     && <WebsiteModule    refreshKey={refreshKey} toast={toast} />}
        {safePage === 'settings'    && <SettingsModule   refreshKey={refreshKey} toast={toast} />}
        {safePage === 'ai'          && <MshauriModule    refreshKey={refreshKey} toast={toast} />}
      </div>

      {userModal && (
        <Modal
          open={userModal}
          onClose={closeUserModal}
          title={userForm._id ? 'Edit User' : 'Add New User'}
          size="lg"
          footer={
            <>
              <button className="btn btn-s" onClick={closeUserModal}>Cancel</button>
              <button className="btn btn-p" onClick={saveUser}>
                {userForm._id ? 'Update User' : 'Create User'}
              </button>
            </>
          }
        >
          <UserFormFields userForm={userForm} setUserForm={setUserForm} toast={toast} />
        </Modal>
      )}

      {credentialsOverlay && (
        <Modal
          open={!!credentialsOverlay}
          onClose={() => setCredentialsOverlay(null)}
          title="User Created — Login Credentials"
          size="md"
          footer={<button className="btn btn-p" onClick={() => setCredentialsOverlay(null)}>Done</button>}
        >
          <div style={{ padding: '4px 0' }}>
            <div style={{ background: TOKENS.goldPale, border: '1px solid ' + TOKENS.gold, padding: 14, borderRadius: 10, marginBottom: 14, fontSize: 13, color: TOKENS.s700, lineHeight: 1.6 }}>
              <strong>Important:</strong> Share these credentials. The user must change their password on first login. A welcome email has been sent automatically.
            </div>
            <div className="fg">
              <label className="fl">Email</label>
              <input className="fi mono" readOnly value={credentialsOverlay.email || ''} />
            </div>
            <div className="fg">
              <label className="fl">Temporary Password</label>
              <input className="fi mono" readOnly value={credentialsOverlay.tempPassword || credentialsOverlay.password || ''} />
            </div>
            <button
              className="btn btn-g btn-sm"
              onClick={() => {
                const pw = credentialsOverlay.tempPassword || credentialsOverlay.password || ''
                navigator.clipboard?.writeText('Email: ' + credentialsOverlay.email + '\nPassword: ' + pw)
                toast.ok('Copied to clipboard')
              }}
            >Copy Both</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Role-specific overview dashboards for sub-admin portals ──
function RoleOverview({ role, setPage, userStats, pendingAllocations, auth }) {
  const META = {
    accountant: { title: 'Finance Overview', sub: 'Fees, billing and payroll at a glance.',
      tiles: [['feecollection','Fee Collection','Chase due and overdue fees'],['billing','Billing','Invoices, payments and revenue'],['sessions','Student Sessions','Fee holds and account pauses'],['payroll','Payroll','Staff salaries and payslips']] },
    sales: { title: 'Sales Overview', sub: 'Your pipeline from first enquiry to enrolment.',
      tiles: [['crm','CRM','Work your enquiry pipeline'],['assessment','Assessments','Move requests to paid and accepted'],['frontdesk','Front Desk','New leads and walk-ins'],['salesperf','My Performance','Your conversions and commissions']] },
    dos: { title: 'Academics Overview', sub: 'Teaching quality, assessment and student progress.',
      tiles: [['dosanalytics','Performance Analytics','School-wide academic trends'],['exams','Exams','Set and track assessments'],['sessions','Student Sessions','Holidays, breaks and report-backs'],['reports','Reports','Generate and publish term reports']] },
    ops_manager: { title: 'Operations Overview', sub: 'People, allocations and day-to-day running.',
      tiles: [['users','Users','Manage students, parents and staff'],['allocations','Manage Students','Match students with teachers'],['sessions','Student Sessions','Pause and restore student accounts'],['leave','Leave','Approve staff leave requests']] },
  }
  const meta = META[role] || META.ops_manager
  const kpis = [
    ['Students', userStats?.students ?? userStats?.byRole?.student ?? '—'],
    ['Teachers', userStats?.teachers ?? userStats?.byRole?.teacher ?? '—'],
    ['Parents', userStats?.parents ?? userStats?.byRole?.parent ?? '—'],
    ['Pending allocations', pendingAllocations ?? '—'],
  ]
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: TOKENS.ink || '#080C14' }}>{meta.title}</div>
        <div style={{ fontSize: 13.5, color: '#6B7280', marginTop: 4 }}>Welcome back, {auth?.user?.firstName || ''}. {meta.sub}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 22 }}>
        {kpis.map(([l, v]) => (
          <div key={l} style={{ background: '#fff', border: '1px solid ' + TOKENS.line, borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em' }}>{l}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: TOKENS.crimson, marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Quick actions</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
        {meta.tiles.map(([id, label, desc]) => (
          <button key={id} onClick={() => setPage(id)}
            style={{ textAlign: 'left', background: '#fff', border: '1px solid ' + TOKENS.line, borderRadius: 14, padding: '18px 20px', cursor: 'pointer' }}>
            <div style={{ width: 34, height: 4, background: TOKENS.gold, borderRadius: 2, marginBottom: 12 }} />
            <div style={{ fontWeight: 800, fontSize: 15, color: TOKENS.ink || '#080C14' }}>{label}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 1.5 }}>{desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
