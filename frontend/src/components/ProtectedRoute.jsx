import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="np-panel" style={{ textAlign: 'center', padding: '2rem 3rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.05rem', margin: 0 }}>
            Verifying registry credentials...
          </p>
        </div>
      </div>
    )
  }

  if (!user || !localStorage.getItem('token')) {
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
