import React, { useState, useEffect } from 'react'
import { api } from '../../context/ctx.jsx'

/**
 * CurriculumSubjectSelector
 * Dynamic curriculum and subject selection component
 * 
 * Props:
 *   - curriculum: string/array - currently selected curriculum (string for student, array for teacher)
 *   - subjects: array - currently selected subject IDs
 *   - onCurriculumChange: function - callback when curriculum changes
 *   - onSubjectsChange: function - callback when subjects change
 *   - role: string - user role ('student' or 'teacher')
 *   - allowQuickAdd: boolean - allow creating new subjects
 *   - onQuickAdd: function - callback when new subject is added
 */
export default function CurriculumSubjectSelector({
  curriculum,
  subjects,
  onCurriculumChange,
  onSubjectsChange,
  role = 'student',
  allowQuickAdd = false,
  onQuickAdd
}) {
  const [availableSubjects, setAvailableSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddForm, setQuickAddForm] = useState({ subjectName: '', category: '', curriculum: '' })
  const [quickAddLoading, setQuickAddLoading] = useState(false)
  const [quickAddError, setQuickAddError] = useState('')

  const curricula = ['IGCSE', 'A-Level', 'IB Diploma', 'IB MYP', 'Kenya CBC', 'BNC', 'American']

  // Helper function to normalize curriculum to array for teachers
  const getCurriculumArray = () => {
    if (role === 'teacher') {
      return Array.isArray(curriculum) ? curriculum : (curriculum ? [curriculum] : [])
    }
    return curriculum ? [curriculum] : []
  }

  // Track if this is the initial load for auto-selection
  const [hasAutoSelected, setHasAutoSelected] = useState(false)

  // Fetch subjects when curriculum changes
  useEffect(() => {
    const curriculumList = getCurriculumArray()
    if (curriculumList.length === 0) {
      setAvailableSubjects([])
      setHasAutoSelected(false)
      return
    }

    const fetchSubjects = async () => {
      setLoading(true)
      try {
        // Fetch subjects for all selected curriculums
        const allSubjects = []
        for (const curr of curriculumList) {
          const res = await api.get(`/subjects/curriculum/${curr}`)
          const subjectsWithCurr = (res.data.subjects || []).map(s => ({
            ...s,
            belongsToCurriculum: curr
          }))
          allSubjects.push(...subjectsWithCurr)
        }
        setAvailableSubjects(allSubjects)
      } catch (e) {
        console.error('Failed to fetch subjects:', e.message)
        setAvailableSubjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchSubjects()
  }, [curriculum, role])

  const handleSubjectToggle = (subjectId) => {
    const newSubjects = Array.isArray(subjects) ? [...subjects] : []
    const index = newSubjects.indexOf(subjectId)
    
    if (index > -1) {
      newSubjects.splice(index, 1)
    } else {
      newSubjects.push(subjectId)
    }
    
    if (onSubjectsChange) {
      onSubjectsChange(newSubjects)
    }
  }

  const handleQuickAdd = async () => {
    if (!quickAddForm.subjectName.trim() || !quickAddForm.category.trim()) {
      setQuickAddError('Subject name and category are required')
      return
    }

    if (role === 'teacher' && !quickAddForm.curriculum) {
      setQuickAddError('Please select a curriculum for this subject')
      return
    }

    setQuickAddLoading(true)
    setQuickAddError('')

    try {
      const curriculumForSubject = role === 'teacher' ? quickAddForm.curriculum : curriculum
      const res = await api.post('/subjects', {
        curriculum: curriculumForSubject,
        subjectName: quickAddForm.subjectName.trim(),
        category: quickAddForm.category.trim(),
        code: ''
      })

      // Add new subject to available subjects
      const newSubject = {
        ...res.data.subject,
        belongsToCurriculum: curriculumForSubject
      }
      setAvailableSubjects([...availableSubjects, newSubject])

      // Auto-select the new subject
      handleSubjectToggle(res.data.subject._id)

      // Reset form
      setQuickAddForm({ subjectName: '', category: '', curriculum: '' })
      setShowQuickAdd(false)

      // Call callback if provided
      if (onQuickAdd) {
        onQuickAdd(res.data.subject)
      }
    } catch (e) {
      setQuickAddError(e.response?.data?.message || 'Failed to create subject')
    } finally {
      setQuickAddLoading(false)
    }
  }

  const handleCurriculumToggle = (curr) => {
    const curriculumList = getCurriculumArray()
    let newCurriculums
    
    if (curriculumList.includes(curr)) {
      newCurriculums = curriculumList.filter(c => c !== curr)
    } else {
      newCurriculums = [...curriculumList, curr]
    }
    
    // Clear subjects when curriculums change
    onSubjectsChange([])
    onCurriculumChange(role === 'teacher' ? newCurriculums : (newCurriculums.length > 0 ? newCurriculums[0] : ''))
  }

  const selectedCount = Array.isArray(subjects) ? subjects.length : 0
  const curriculumList = getCurriculumArray()
  const hasMultipleCurriculums = curriculumList.length > 1

  return (
    <>
      {/* Curriculum Selector */}
      <div className="fg">
        <label className="fl">Curriculum {role === 'teacher' ? '*' : ''}</label>
        {role === 'teacher' ? (
          // Multi-select for teachers
          <div style={{
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--rmd)',
            padding: 10,
            maxHeight: 200,
            overflowY: 'auto'
          }}>
            {curricula.map(c => (
              <div
                key={c}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border)'
                }}
              >
                <input
                  type="checkbox"
                  id={`curriculum-${c}`}
                  checked={curriculumList.includes(c)}
                  onChange={() => handleCurriculumToggle(c)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <label
                  htmlFor={`curriculum-${c}`}
                  style={{
                    flex: 1,
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: 13,
                    color: 'var(--s900)'
                  }}
                >
                  {c}
                </label>
              </div>
            ))}
          </div>
        ) : (
           // Single select for students
           <select
             className="fsel"
             value={curriculum || ''}
             onChange={(e) => {
               onCurriculumChange(e.target.value)
               // Clear subjects when curriculum changes so user can select new ones
               onSubjectsChange([])
             }}
           >
             <option value="">Select curriculum...</option>
             {curricula.map(c => <option key={c} value={c}>{c}</option>)}
           </select>
        )}
      </div>

      {/* Subject Selector */}
      {(role === 'student' ? curriculum : curriculumList.length > 0) && (
        <div className="fg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="fl">{role === 'teacher' ? 'Teach' : 'Study'} Subjects {role === 'teacher' ? '*' : ''}</label>
            {allowQuickAdd && (
              <button
                type="button"
                style={{
                  fontSize: 12,
                  padding: '4px 8px',
                  background: 'var(--b50)',
                  color: 'var(--b700)',
                  border: '1px solid var(--b200)',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
                onClick={() => setShowQuickAdd(!showQuickAdd)}
              >
                {showQuickAdd ? '✕ Cancel' : '+ Add Subject'}
              </button>
            )}
          </div>

          {showQuickAdd && allowQuickAdd && (
            <div style={{
              background: 'var(--b50)',
              border: '1px solid var(--b200)',
              borderRadius: 'var(--rmd)',
              padding: 12,
              marginBottom: 12
            }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--b700)', marginBottom: 8 }}>
                Quick Add Subject
              </div>
              {role === 'teacher' && (
                <select
                  className="fsel"
                  value={quickAddForm.curriculum}
                  onChange={(e) => setQuickAddForm(f => ({ ...f, curriculum: e.target.value }))}
                  style={{ marginBottom: 8 }}
                >
                  <option value="">Select curriculum...</option>
                  {curriculumList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
              <input
                type="text"
                className="fi"
                placeholder="Subject name"
                value={quickAddForm.subjectName}
                onChange={(e) => setQuickAddForm(f => ({ ...f, subjectName: e.target.value }))}
                style={{ marginBottom: 8 }}
              />
              <input
                type="text"
                className="fi"
                placeholder="Category (e.g., Mathematics, Sciences)"
                value={quickAddForm.category}
                onChange={(e) => setQuickAddForm(f => ({ ...f, category: e.target.value }))}
                style={{ marginBottom: 8 }}
              />
              {quickAddError && (
                <div style={{ fontSize: 12, color: 'var(--r600)', marginBottom: 8 }}>
                  {quickAddError}
                </div>
              )}
              <button
                type="button"
                className="btn btn-p btn-sm"
                onClick={handleQuickAdd}
                disabled={quickAddLoading}
              >
                {quickAddLoading ? 'Adding...' : 'Add Subject'}
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ fontSize: 13, color: 'var(--s500)', padding: 10 }}>
              Loading subjects...
            </div>
          ) : availableSubjects.length > 0 ? (
            <div style={{
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--rmd)',
              padding: 10,
              maxHeight: 250,
              overflowY: 'auto'
            }}>
              {availableSubjects.map(subject => (
                <div
                  key={subject._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border)'
                  }}
                >
                  <input
                    type="checkbox"
                    id={`subject-${subject._id}`}
                    checked={Array.isArray(subjects) && subjects.includes(subject._id)}
                    onChange={() => handleSubjectToggle(subject._id)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label
                    htmlFor={`subject-${subject._id}`}
                    style={{
                      flex: 1,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--s900)' }}>
                      {subject.subjectName}
                    </span>
                    <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                      {subject.category && (
                        <span style={{ color: 'var(--s400)' }}>
                          {subject.category}
                        </span>
                      )}
                      {hasMultipleCurriculums && (
                        <span style={{ color: 'var(--b600)', fontWeight: 600 }}>
                          {subject.belongsToCurriculum}
                        </span>
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--s500)', padding: 10 }}>
              No subjects available for selected curriculum{curriculumList.length > 1 ? 's' : ''}
            </div>
          )}

          {!loading && availableSubjects.length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--s400)', marginTop: 8 }}>
              Selected: {selectedCount} subject{selectedCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </>
  )
}

