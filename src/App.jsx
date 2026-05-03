import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import NGODashboard from './pages/NGODashboard'
import ProtectedRoute from './components/ProtectedRoute'
import SubmitNeed from './pages/SubmitNeed'
import MapView from './pages/MapView'

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <NGODashboard />              
            </ProtectedRoute>
          } />
          <Route path='/submit' element={
            <ProtectedRoute>
              <SubmitNeed />
            </ProtectedRoute>
          } />
          <Route path='/map' element={
            <ProtectedRoute>
              <MapView />
            </ProtectedRoute>
          }/>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;