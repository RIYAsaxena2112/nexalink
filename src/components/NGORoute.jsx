import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NGORoute = ({ children }) => {
  const { user, role, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to='/login' />
  if (role === null) return <Navigate to='/role-selection' />
  if (role !== 'ngo') return <Navigate to='/volunteer-dashboard' />
  return children
}

export default NGORoute