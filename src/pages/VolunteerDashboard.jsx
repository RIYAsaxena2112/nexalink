import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { db } from "../services/firebase"
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore"
import { logOut } from "../services/auth"

const VolunteerDashboard = () => {
  const { user } = useAuth()

  const [matchedNeeds, setMatchedNeeds] = useState([])

  /* ================================
      ACCEPT NEED
  ================================= */
  const handleAccept = async (needId) => {
    await updateDoc(doc(db, "needs", needId), {
      status: "assigned",
      assignedTo: user.uid,
      assignedToName: user.displayName,
    })
  }

  /* ================================
      MARK RESOLVED
  ================================= */
  const handleResolve = async (needId) => {
    await updateDoc(doc(db, "needs", needId), {
      status: "resolved",
    })
  }

  /* ================================
      FIRESTORE MATCHING
  ================================= */
  useEffect(() => {
    let unsubscribe

    const init = async () => {
      // volunteer profile
      const docSnap = await getDoc(doc(db, "users", user.uid))

      const volunteerSkills = docSnap.data()?.skills || []

      // fetch needs
      const q = query(
        collection(db, "needs"),
        where("status", "in", ["pending", "assigned"])
      )

      unsubscribe = onSnapshot(q, (snapshot) => {
        const matched = snapshot.docs
          .map((d) => ({
            id: d.id,
            ...d.data(),
          }))
          .filter((need) => {
            const skillSet = new Set(volunteerSkills)

            return need.category?.some((cat) =>
              skillSet.has(cat)
            )
          })

        setMatchedNeeds(matched)
      })
    }

    init()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [user])

  /* ================================
      HELPERS
  ================================= */

  const getUrgencyClass = (urgency) => {
    if (!urgency) {
      return "bg-gray-500 text-white"
    }

    if (urgency >= 8) {
      return "bg-red-500 text-white"
    }

    if (urgency >= 5) {
      return "bg-orange-400 text-white"
    }

    return "bg-green-500 text-white"
  }

  /* ================================
      COUNTS
  ================================= */

  const assignedCount = matchedNeeds.filter(
    (n) => n.status === "assigned"
  ).length

  /* ================================
      UI
  ================================= */

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">

      {/* ================= NAVBAR ================= */}
      <nav
        style={{ backgroundColor: "#1A1D27" }}
        className="px-6 py-4 flex items-center justify-between border-b border-gray-800"
      >
        <span className="text-teal-500 font-bold text-xl">
          NexaLink
        </span>

        <button
          onClick={logOut}
          className="border border-gray-600 px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          Sign Out
        </button>
      </nav>

      {/* ================= HEADER ================= */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-bold">
          Your Matched Needs
        </h1>

        <p className="text-gray-400 mt-2">
          {matchedNeeds.length} needs match your skills
        </p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-2 gap-4 px-6 mb-8">
        <StatCard
          title="Matched Needs"
          value={matchedNeeds.length}
        />

        <StatCard
          title="Assigned Needs"
          value={assignedCount}
        />
      </div>

      {/* ================= NEEDS GRID ================= */}
      <div className="px-6 pb-10">
        {matchedNeeds.length === 0 ? (
          <div
            style={{ backgroundColor: "#1A1D27" }}
            className="rounded-2xl p-10 text-center border border-gray-800"
          >
            <p className="text-xl font-semibold text-white">
              No matching needs right now
            </p>

            <p className="text-gray-400 mt-2">
              Check back later for new opportunities.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

            {matchedNeeds.map((need) => (
              <div
                key={need.id}
                style={{ backgroundColor: "#1A1D27" }}
                className="rounded-2xl border border-gray-800 p-5 hover:border-teal-500 transition shadow-lg"
              >

                {/* ================= TOP ROW ================= */}
                <div className="flex items-start justify-between mb-4">

                  <span className={`${getUrgencyClass(need.urgency)} px-3 py-1 rounded-full text-xs font-bold`}>
  {need.urgency ? `${need.urgency} URGENT` : 'UNKNOWN'}
</span>

                  {/* categories */}
                  <div className="flex flex-wrap justify-end gap-2">
                    {need.category?.map((cat) => (
                      <span
                        key={cat}
                        className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ================= SUMMARY ================= */}
                <div className="mb-6">
                  <p className="text-lg font-semibold leading-relaxed">
                    {need.summary}
                  </p>
                </div>

                {/* ================= META ================= */}
                <div className="space-y-2 text-sm text-gray-400 mb-6">

                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{need.locationName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    {/* <span>
                      {need.affected || "N/A"} affected
                    </span> */}
                    <span className={`${getUrgencyClass(need.urgency)} px-3 py-1 rounded-full text-xs font-bold`}>
  {need.urgency ? `${need.urgency} URGENT` : 'UNKNOWN'}
</span>
                  </div>

                  {need.assignedToName && (
                    <div className="flex items-center gap-2">
                      <span>🙋</span>
                      <span>
                        Assigned to {need.assignedToName}
                      </span>
                    </div>
                  )}
                </div>

                {/* ================= ACTIONS ================= */}
                <div className="mt-auto">

                  {need.status === "pending" && (
                    <button
                      onClick={() => handleAccept(need.id)}
                      className="w-full bg-teal-500 hover:bg-teal-600 transition text-white font-semibold py-3 rounded-lg"
                    >
                      Accept Need
                    </button>
                  )}

                  {need.status === "assigned" &&
                    need.assignedTo === user.uid && (
                      <button
                        onClick={() => handleResolve(need.id)}
                        className="w-full bg-green-600 hover:bg-green-700 transition text-white font-semibold py-3 rounded-lg"
                      >
                        Mark Resolved
                      </button>
                    )}

                  {need.status === "assigned" &&
                    need.assignedTo !== user.uid && (
                      <div className="w-full bg-gray-700 text-gray-300 py-3 rounded-lg text-center text-sm">
                        Already Assigned
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ================================
    STAT CARD
================================= */

const StatCard = ({ title, value }) => (
  <div
    style={{ backgroundColor: "#1A1D27" }}
    className="rounded-xl p-4 text-center border border-gray-800"
  >
    <p className="text-3xl font-bold text-white">
      {value}
    </p>

    <p className="text-gray-400 text-sm mt-1">
      {title}
    </p>
  </div>
)

export default VolunteerDashboard