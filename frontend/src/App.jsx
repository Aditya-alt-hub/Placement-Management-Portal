import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// Public Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'

// Student Pages
import StudentDashboard from './pages/student/Dashboard'
import StudentProfile from './pages/student/Profile'
import StudentDrives from './pages/student/Drives'
import DriveDetail from './pages/student/DriveDetail'
import StudentApplications from './pages/student/Applications'
import StudentInterviews from './pages/student/Interviews'
import AIAnalysis from './pages/student/AIAnalysis'

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard'
import RecruiterCompany from './pages/recruiter/Company'
import RecruiterDrives from './pages/recruiter/Drives'
import DriveForm from './pages/recruiter/DriveForm'
import RecruiterApplications from './pages/recruiter/Applications'
import RecruiterInterviews from './pages/recruiter/Interviews'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminCompanies from './pages/admin/Companies'
import AdminAnalytics from './pages/admin/Analytics'
import AdminAnnouncements from './pages/admin/Announcements'

function AppLayout({ children }) {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <footer className="newsprint-sheet" style={{ paddingTop: '1.5rem' }}>
        <div className="np-footer-bottom" style={{ borderTop: 'var(--dp-border-hairline) solid var(--dp-color-rule)', padding: '1rem 0' }}>
          <span>&copy; {new Date().getFullYear()} The Placement Chronicle &middot; University Placement Portal</span>
          <span>Verified Institutional Ledger &middot; Newsprint Standard</span>
        </div>
      </footer>
    </div>
  )
}

function ProtectedLayout({ children, role }) {
  return (
    <ProtectedRoute role={role}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={
            <ProtectedLayout role="student"><StudentDashboard /></ProtectedLayout>
          } />
          <Route path="/student/profile" element={
            <ProtectedLayout role="student"><StudentProfile /></ProtectedLayout>
          } />
          <Route path="/student/drives" element={
            <ProtectedLayout role="student"><StudentDrives /></ProtectedLayout>
          } />
          <Route path="/student/drives/:id" element={
            <ProtectedLayout role="student"><DriveDetail /></ProtectedLayout>
          } />
          <Route path="/student/applications" element={
            <ProtectedLayout role="student"><StudentApplications /></ProtectedLayout>
          } />
          <Route path="/student/interviews" element={
            <ProtectedLayout role="student"><StudentInterviews /></ProtectedLayout>
          } />
          <Route path="/student/ai" element={
            <ProtectedLayout role="student"><AIAnalysis /></ProtectedLayout>
          } />

          {/* Recruiter Routes */}
          <Route path="/recruiter/dashboard" element={
            <ProtectedLayout role="recruiter"><RecruiterDashboard /></ProtectedLayout>
          } />
          <Route path="/recruiter/company" element={
            <ProtectedLayout role="recruiter"><RecruiterCompany /></ProtectedLayout>
          } />
          <Route path="/recruiter/drives" element={
            <ProtectedLayout role="recruiter"><RecruiterDrives /></ProtectedLayout>
          } />
          <Route path="/recruiter/drives/new" element={
            <ProtectedLayout role="recruiter"><DriveForm /></ProtectedLayout>
          } />
          <Route path="/recruiter/drives/:id/edit" element={
            <ProtectedLayout role="recruiter"><DriveForm /></ProtectedLayout>
          } />
          <Route path="/recruiter/applications" element={
            <ProtectedLayout role="recruiter"><RecruiterApplications /></ProtectedLayout>
          } />
          <Route path="/recruiter/interviews" element={
            <ProtectedLayout role="recruiter"><RecruiterInterviews /></ProtectedLayout>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedLayout role="admin"><AdminDashboard /></ProtectedLayout>
          } />
          <Route path="/admin/companies" element={
            <ProtectedLayout role="admin"><AdminCompanies /></ProtectedLayout>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedLayout role="admin"><AdminAnalytics /></ProtectedLayout>
          } />
          <Route path="/admin/announcements" element={
            <ProtectedLayout role="admin"><AdminAnnouncements /></ProtectedLayout>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
