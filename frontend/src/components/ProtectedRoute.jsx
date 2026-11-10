import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="nb-loading">
        <div className="nb-spinner" />
        <span className="uppercase tracking-wider text-sm">Loading...</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    // Redirect to appropriate dashboard
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />
    if (user.role === 'recruiter') return <Navigate to="/recruiter/dashboard" replace />
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    return <Navigate to="/" replace />
  }

  return children
}
