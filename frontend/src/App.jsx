import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/layout/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import HackathonDetailPage from './pages/HackathonDetailPage'
import SubmissionFormPage from './pages/SubmissionFormPage'
import SubmissionDetailPage from './pages/SubmissionDetailPage'
import EvaluationFormPage from './pages/EvaluationFormPage'
import UsersPage from './pages/admin/UsersPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ background: '#0d0d14' }}>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Hackathon — single */}
          <Route path="/hackathon" element={<ProtectedRoute><HackathonDetailPage /></ProtectedRoute>} />
          <Route path="/hackathon/submit" element={<ProtectedRoute roles={['PARTICIPANT']}><SubmissionFormPage /></ProtectedRoute>} />

          {/* Submissions */}
          <Route path="/submissions/:id" element={<ProtectedRoute><SubmissionDetailPage /></ProtectedRoute>} />
          <Route path="/submissions/:id/evaluate" element={<ProtectedRoute roles={['JUDGE']}><EvaluationFormPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><UsersPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
