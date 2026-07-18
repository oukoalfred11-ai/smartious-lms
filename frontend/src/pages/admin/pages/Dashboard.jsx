import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useStore, useToast, useAuth, api } from '../../../context/ctx.jsx'
import Modal from '../../../components/ui/Modal.jsx'

// ── Shared ───────────────────────────────────────────────────
import { TOKENS, ModuleIcon, PCard, PSection, PTile, PKpi, PlanBadge, PNavigation } from './modules/SharedDashboard.jsx'
import { ParentLinkSection, UserFormFields } from './modules/ModalsShared.jsx'

// ── Page modules ─────────────────────────────────────────────
import { DashboardModule }          from './modules/DashboardModule.jsx'
import { AnalyticsModule }          from './modules/AnalyticsModule.jsx'
import { UsersModule }              from './modules/UsersModule.jsx'
import { TeachersModule }           from './modules/TeachersModule.jsx'
import { DocumentsModule }          from './modules/DocumentsModule.jsx'
import { FrontDeskModule }          from './modules/FrontDeskModule.jsx'
import { AssessmentModule }         from './modules/AssessmentModule.jsx'
import { CRMModule }                from './modules/CRMModule.jsx'
import { SalesPerformanceModule }   from './modules/SalesPerformanceModule.jsx'
import { CommunicationModule }      from './modules/CommunicationModule.jsx'
import { StudentsManagementModule } from './modules/StudentsManagementModule.jsx'
import { PayrollModule }            from './modules/PayrollModule.jsx'
import { LeaveModule }              from './modules/LeaveModule.jsx'
import { ProgrammesModule }         from './modules/ProgrammesModule.jsx'
import { LiveLessonsModule }        from './modules/LiveLessonsModule.jsx'
import { GroupRoomsModule }         from './modules/GroupRoomsModule.jsx'
import { CurriculumModule }         from './modules/CurriculumModule.jsx'
import { BillingModule, InvoicesTab } from './modules/BillingModule.jsx'
import { WebsiteModule }            from './modules/WebsiteModule.jsx'
import { SettingsModule }           from './modules/SettingsModule.jsx'
import { MshauriModule }            from './modules/MshauriModule.jsx'
import { UserFormFields, ParentLinkSection } from './modules/ModalsShared.jsx'

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
        payload.curriculum = Array.isArray(userForm.curriculum) ? userForm.curriculum : (userForm.curriculum ? [userForm.curriculum] : [])
        payload.subjects = userForm.subjects || []
        payload.teachingSpecialties = userForm.teachingSpecialties || []
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
      } else if (['admin','accountant','sales','ops_manager'].includes(userForm.role)) {
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
      { items: ['dashboard','analytics','users','teachers','allocations','communication','frontdesk','documents','assessment','payroll','leave','programmes','livelessons','grouprooms','curriculum','billing','website','settings','ai'] },
    ],
    accountant:  [{ items: ['dashboard','analytics','billing','payroll','settings'] }],
    sales:       [{ items: ['dashboard','salesperf','crm','assessment','frontdesk','communication','documents','settings'] }],
    ops_manager: [{ items: ['dashboard','analytics','users','teachers','allocations','communication','frontdesk','assessment','documents','payroll','leave','programmes','livelessons','grouprooms','curriculum','settings','ai'] }],
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
        {safePage === 'dashboard'   && <DashboardModule  setPage={setPage} userStats={userStats} pendingAllocations={pendingAllocations} refreshKey={refreshKey} auth={auth} toast={toast} openAddUser={openAddUser} adminFirst={adminFirst} />}
        {safePage === 'analytics'   && <AnalyticsModule  setPage={setPage} refreshKey={refreshKey} toast={toast} />}
        {safePage === 'users'       && <UsersModule      refreshKey={refreshKey} toast={toast} setUserForm={setUserForm} setUserModal={setUserModal} openAddUser={openAddUser} />}
        {safePage === 'teachers'    && <TeachersModule   refreshKey={refreshKey} toast={toast} openAddUser={openAddUser} />}
        {safePage === 'allocations' && <StudentsManagementModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'communication' && <CommunicationModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'frontdesk' && <FrontDeskModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'documents' && <DocumentsModule toast={toast} />}
        {safePage === 'assessment' && <AssessmentModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'crm' && <CRMModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'salesperf' && <SalesPerformanceModule toast={toast} refreshKey={refreshKey}/>}
        {safePage === 'payroll'     && <PayrollModule    refreshKey={refreshKey} toast={toast} />}
        {safePage === 'leave'       && <LeaveModule      refreshKey={refreshKey} toast={toast} />}
        {safePage === 'programmes'  && <ProgrammesModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'livelessons' && <LiveLessonsModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'grouprooms'  && <GroupRoomsModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'curriculum'  && <CurriculumModule refreshKey={refreshKey} toast={toast} />}
        {safePage === 'billing'     && <BillingModule    refreshKey={refreshKey} toast={toast} />}
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
