import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { db } from "../services/firebase"
import { doc, setDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { logOut } from "../services/auth"

const VolunteerRegistration = () => {
  const navigate = useNavigate()
  const { user, setRegistrationComplete } = useAuth()

  const [name, setName] = useState(user?.displayName || "")
  const [locationName, setLocationName] = useState("")
  const [skills, setSkills] = useState([])

  const availableSkills = [
    "food",
    "medical",
    "rescue",
    "shelter",
    "logistics"
  ]

  // Toggle skill chips
  const handleSkillToggle = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill))
    } else {
      setSkills([...skills, skill])
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    try {
      const userRef = doc(db, "users", user.uid)

      await setDoc(
        userRef,
        {
          name,
          locationName,
          skills,
          available: true,
          registrationComplete:true
        },
        { merge: true }
      )
      setRegistrationComplete(true)
      navigate("/volunteer-dashboard")
    } catch (error) {
      console.error("Error registering volunteer:", error)
      alert("Failed to register volunteer. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">

      {/* ================= Card ================= */}
      <div className="w-full max-w-lg bg-[var(--surface)] rounded-2xl shadow-xl p-8">

        {/* Heading */}
        <h1 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-2">
          Complete Your Profile
        </h1>

        <p className="text-[var(--text-secondary)] text-center mb-8">
          Help NGOs discover your skills and assign you to meaningful work.
        </p>

        {/* Name */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-teal-500"
        />

        {/* Location */}
        <input
          type="text"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="Your location (e.g. Mumbai, Maharashtra)"
          className="w-full mb-6 px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-teal-500"
        />

        {/* Skills */}
        <label className="block text-sm text-[var(--text-secondary)] mb-3">
          Select Your Skills
        </label>

        <div className="flex flex-wrap gap-3 mb-8">
          {availableSkills.map(skill => {
            const selected = skills.includes(skill)

            return (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillToggle(skill)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition
                  ${
                    selected
                      ? "bg-teal-500 text-white"
                      : "border border-gray-600 text-gray-300 hover:border-teal-400"
                  }
                `}
              >
                {skill}
              </button>
            )
          })}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-lg transition"
        >
          Complete Registration
        </button>

<div className="flex justify-center mt-6">
  <button
    onClick={logOut}
    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition text-sm"
  >
    Sign Out
  </button>
</div>
      </div>
    </div>
  )
}

export default VolunteerRegistration