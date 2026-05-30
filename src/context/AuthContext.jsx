import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../services/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { createUserIfNotExists } from '../services/userService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState(null)
  const [registrationComplete, setRegistrationComplete] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        await createUserIfNotExists(currentUser)
        const docSnap = await getDoc(doc(db, 'users', currentUser.uid))
        const userData = docSnap.data()
        setUser(currentUser)
        setRole(userData?.role || null)
        setRegistrationComplete(userData?.registrationComplete || false)
      } else {
        setUser(null)
        setRole(null)
        setRegistrationComplete(false)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, role, setRole, registrationComplete, setRegistrationComplete }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)