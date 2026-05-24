import { signInWithGoogle } from "../services/auth"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useEffect } from "react"

const Login = () => {
  const { user, role } = useAuth()
  const navigate = useNavigate()

  // ===============================
  // Redirect after login
  // ===============================
  useEffect(() => {
    if (!user) return

    if (role === null) {
      navigate("/role-selection")
    } else if (role === "ngo") {
      navigate("/dashboard")
    } else if (role === "volunteer") {
      navigate("/volunteer-dashboard")
    }
  }, [user, role, navigate])

  const handleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  return (
    // <div className="min-h-screen bg-(--bg-primary) flex items-center justify-center px-4">
    <div className="min-h-screen flex items-center justify-center px-4" style={{backgroundColor:'var(--bg-primary)'}}>

      {/* ================= Card ================= */}
      <div 
  className="w-full max-w-md rounded-2xl shadow-xl p-10 text-center"
  style={{ backgroundColor: 'var(--color-surface)' }}
>
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-teal-500 flex items-center justify-center text-white text-xl font-bold">
            N
          </div>
        </div>

        {/* Heading */}
          <h1 className="text-3xl font-bold" style={{color:'var(--text-primary'}}>
          NexaLink
        </h1>

        {/* Tagline */}
        <p className="mt-2 mb-8" style={{color:'var(--text-secondary'}}>
          Connecting needs to action.
        </p>

        {/* Google Button */}
        <button
          onClick={handleLogin}
          className="
            w-full
            bg-teal-500
            hover:bg-teal-600
            text-white
            font-semibold
            py-3
            rounded-lg
            transition
            duration-200
            shadow-md
            flex
            items-center
            justify-center
            gap-3
          "
        >
          {/* Google Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="w-5 h-5"
          >
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20 0-1.3-.1-2.3-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.9 6.1 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.1 0 9.8-2 13.3-5.3l-6.1-5c-2 1.5-4.5 2.3-7.2 2.3-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 39.7 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.5-6.1 7l6.1 5C39.8 36.4 44 30.8 44 24c0-1.3-.1-2.3-.4-3.5z"/>
          </svg>

          Sign in with Google
        </button>

      </div>
    </div>
  )
}

export default Login