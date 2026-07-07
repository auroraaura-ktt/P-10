import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../context/useAuth'

export default function ProtectedRoute({ children, roles, redirectTo }) {
  const { isAuthenticated, user, ready } = useAuth()
  const location = useLocation()
  const destination = redirectTo || (roles?.includes('admin') ? '/admin-login' : '/login')

  if (!ready) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to={destination} replace state={{ from: location }} />
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to={destination} replace />
  }

  return children
}
