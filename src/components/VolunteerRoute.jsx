import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const VolunteerRoute = ({ children }) => {
  const { user, role, loading, registrationComplete } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to='/login' />
  if (role === null) return <Navigate to='/role-selection' />
  if (role === 'volunteer' && !registrationComplete) return <Navigate to='/volunteer-registration' />
  if (role !== 'volunteer') return <Navigate to='/dashboard' />
  return children
}

export default VolunteerRoute;