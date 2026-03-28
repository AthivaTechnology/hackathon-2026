import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function OnboardingRoute({ children, roles }) {
  const { user } = useAuthStore()

  if (!user) return <Navigate to="/login" replace />
  if (!user.name) return <Navigate to="/setup-profile" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/hackathon" replace />

  return children
}
