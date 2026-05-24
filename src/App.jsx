import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import NGODashboard from './pages/NGODashboard'
import ProtectedRoute from './components/ProtectedRoute'
import SubmitNeed from './pages/SubmitNeed'
import MapView from './pages/MapView'
import RoleSelection from './pages/RoleSelection'
import VolunteerRegistration from './pages/VolunteerRegistration'
import VolunteerDashboard from './pages/VolunteerDashboard'
import NGORoute from './components/NGORoute'
import VolunteerRoute from './components/VolunteerRoute'

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
         
            <Route path='/dashboard' element={<NGORoute><NGODashboard /></NGORoute>} />
<Route path='/submit' element={<NGORoute><SubmitNeed /></NGORoute>} />
<Route path='/map' element={<NGORoute><MapView /></NGORoute>} />
          

  <Route path='/volunteer-dashboard' element={<VolunteerRoute><VolunteerDashboard /></VolunteerRoute>} />
<Route path='/volunteer-registration' element={
  <ProtectedRoute>
    <VolunteerRegistration />
    </ProtectedRoute>
  } />



<Route path='/role-selection' element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
   <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;
          
          
       