import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './features/auth/authContext'
import { PrivateRoute } from './shared/components/PrivateRoute'
import { LoginPage } from './features/auth/LoginPage'
import { PublicPage } from './features/public/PublicPage'
import { EventsPage } from './features/events/EventsPage'
import { EventDetailPage } from './features/events/EventDetailPage'
import { TeamDetailPage } from './features/teams/TeamDetailPage'
import { GroupsPage } from './features/groups/GroupsPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicPage />} />
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Protected admin routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<EventsPage />} />
          <Route path="/admin/events/:id" element={<EventDetailPage />} />
          <Route path="/admin/events/:eventId/teams/:teamId" element={<TeamDetailPage />} />
          <Route path="/admin/groups" element={<GroupsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
