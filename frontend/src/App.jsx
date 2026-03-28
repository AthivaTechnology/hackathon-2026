import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import OnboardingRoute from './components/layout/OnboardingRoute'
import ProtectedRoute from './components/layout/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import VerifyOTPPage from './pages/VerifyOTPPage'
import SetupProfilePage from './pages/SetupProfilePage'
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
          <Route path="/verify-otp" element={<VerifyOTPPage />} />

          {/* Onboarding — authenticated but name not yet set */}
          <Route path="/setup-profile" element={<ProtectedRoute><SetupProfilePage /></ProtectedRoute>} />

          {/* Hackathon — single */}
          <Route path="/hackathon" element={<OnboardingRoute><HackathonDetailPage /></OnboardingRoute>} />
          <Route path="/hackathon/submit" element={<OnboardingRoute roles={['PARTICIPANT']}><SubmissionFormPage /></OnboardingRoute>} />

          {/* Submissions */}
          <Route path="/submissions/:id" element={<OnboardingRoute><SubmissionDetailPage /></OnboardingRoute>} />
          <Route path="/submissions/:id/evaluate" element={<OnboardingRoute roles={['JUDGE']}><EvaluationFormPage /></OnboardingRoute>} />

          {/* Admin */}
          <Route path="/admin/users" element={<OnboardingRoute roles={['ADMIN']}><UsersPage /></OnboardingRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
