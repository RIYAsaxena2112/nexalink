import { useNavigate } from "react-router-dom"
import { db } from "../services/firebase"
import { doc, setDoc } from "firebase/firestore"
import { useAuth } from "../context/AuthContext"
import { logOut } from "../services/auth"

const RoleSelection = () => {
  const { user, setRole } = useAuth()
  const navigate = useNavigate()

  const handleRoleChoice = async (chosenRole) => {
    if (!user) return

    try {
      const userRef = doc(db, "users", user.uid)

      await setDoc(
        userRef,
        { role: chosenRole ,
        ...(chosenRole === 'volunteer' && { registrationComplete: false })
      },{ merge: true })

      setRole(chosenRole)

      if (chosenRole === "ngo") {
        navigate("/dashboard")
      } else {
        navigate("/volunteer-registration")
      }
    } catch (error) {
      console.error("Error updating role:", error)
      alert("Failed to save selection. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">

      {/* ================= Main Card ================= */}
      <div className="w-full max-w-4xl bg-[var(--surface)] rounded-2xl shadow-xl p-10 text-center">

        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Choose Your Role
        </h1>

        <p className="text-[var(--text-secondary)] mb-10">
          Select how you want to participate in NexaLink.
        </p>

        {/* ================= Role Cards ================= */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* NGO CARD */}
          <div className="border border-gray-700 rounded-xl p-8 hover:border-teal-500 transition" style={{ backgroundColor: '#1A1D27' }}>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl">
                🏢
              </div>
            </div>

            <h2 className="text-xl font-semibold text-white mb-2">
              I represent an NGO
            </h2>

            <p className="text-[var(--text-secondary)] mb-6">
              Submit needs, coordinate relief operations, assign volunteers,
              and monitor urgent situations in real time.
            </p>

            <button
              onClick={() => handleRoleChoice("ngo")}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Select NGO Role
            </button>
          </div>

          {/* VOLUNTEER CARD */}
          <div className="border border-gray-700 rounded-xl p-8 hover:border-teal-500 transition"style={{ backgroundColor: '#1A1D27' }}>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl">
                🙋
              </div>
            </div>

            <h2 className="text-xl font-semibold text-white mb-2">
              I want to volunteer
            </h2>

            <p className="text-[var(--text-secondary)] mb-6">
              Discover nearby needs, offer your skills, assist NGOs,
              and contribute directly to meaningful impact.
            </p>

            <button
              onClick={() => handleRoleChoice("volunteer")}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Select Volunteer Role
            </button>
          </div>

        </div>

        {/* Sign Out */}
        <div className="flex justify-center mt-10">
  <button
    onClick={logOut}
    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition"
  >
    Sign Out
  </button>
</div>        
        
      </div>
    </div>
  )
}

export default RoleSelection