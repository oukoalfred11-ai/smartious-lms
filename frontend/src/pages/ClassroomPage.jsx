/**
 * pages/ClassroomPage.jsx — mounts the native Smartious Classroom at
 * /classroom/:liveClassId. Guarded in App.jsx for teacher, student,
 * admin, dos, and ops_manager. During the pilot this page is reached
 * by pasting the URL or via a "Smartious Classroom (beta)" button;
 * the meetingLink flow stays the default.
 */
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/ctx.jsx'
import LiveClassroom from '../components/ui/LiveClassroom.jsx'
import { classroomReturnPath } from '../lib/joinClassroom.js'

export default function ClassroomPage() {
  const { liveClassId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  return (
    <LiveClassroom
      liveClassId={liveClassId}
      user={user}
      // A teacher lands on the end-of-lesson pop-up: close the lesson,
      // check the homework and choose the next lesson.
      // Everyone else goes back to the portal page they joined from.
      onLeave={() => navigate(user?.role === 'teacher' ? `/teacher?ended=${liveClassId}` : (classroomReturnPath() || '/portal'))}
    />
  )
}
