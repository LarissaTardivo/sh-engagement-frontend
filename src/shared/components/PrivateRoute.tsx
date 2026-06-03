import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/authContext'

export function PrivateRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
