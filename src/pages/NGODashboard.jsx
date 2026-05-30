import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { logOut } from "../services/auth";
import { doc, setDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../services/firebase";
import axios from "axios";

const NGODashboard = () => {
  const { user, setRole, setRegistrationComplete } = useAuth();
  const navigate=useNavigate();

  const [needs, setNeeds] = useState([]);
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [explanations, setExplanations] = useState({});
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

   const handleResetAccount = async () => {
  await setDoc(doc(db, 'users', user.uid), {
    role: null,
    registrationComplete: false,
    skills: [],
    locationName: '',
    available: false
  }, { merge: true })

  setRole(null)
  setRegistrationComplete(false)
  navigate('/role-selection')
}

    {/* ================= RESET ACCOUNT ================= */}
<div className="px-6 py-8 text-center">
  {!showResetConfirm ? (
    <button
      onClick={() => setShowResetConfirm(true)}
      className="text-gray-500 hover:text-red-400 text-xs transition underline"
    >
      Reset Account
    </button>
  ) : (
    <div
      style={{ backgroundColor: "#1A1D27" }}
      className="max-w-sm mx-auto rounded-xl p-6 border border-red-800"
    >
      <p className="text-white font-semibold mb-2">Reset your account?</p>
      <p className="text-gray-400 text-sm mb-6">
        This will clear your role and skills. You'll need to set up your account again.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => setShowResetConfirm(false)}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleResetAccount}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition text-sm"
        >
          Yes, Reset
        </button>
      </div>
    </div>
  )}
</div>

  /* -------------------- FIRESTORE LISTENER -------------------- */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "needs"),
      where("submittedBy", "==", user.uid),
      orderBy("urgency", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setNeeds(data);
    });

    return () => unsubscribe();
  }, [user]);

  /* -------------------- STATUS + URGENCY -------------------- */

  const urgencyClasses = {
    high: "bg-red-500 text-white px-2 py-1 rounded text-xs font-bold",
    medium: "bg-orange-400 text-white px-2 py-1 rounded text-xs font-bold",
    low: "bg-green-500 text-white px-2 py-1 rounded text-xs font-bold",
    none: "bg-gray-500 text-white px-2 py-1 rounded text-xs font-bold",
  };

  const getUrgencyClass = (urgency) => {
    if (!urgency) return urgencyClasses.none;
    if (urgency >= 8) return urgencyClasses.high;
    if (urgency >= 5) return urgencyClasses.medium;
    return urgencyClasses.low;
  };

  const statusClasses = {
    pending: "bg-orange-400 text-white px-2 py-1 rounded text-xs font-bold",
    assigned: "bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold",
    resolved: "bg-green-500 text-white px-2 py-1 rounded text-xs font-bold",
    default: "bg-gray-500 text-white px-2 py-1 rounded text-xs font-bold",
  };

  const getStatusClass = (status) =>
    statusClasses[status] || statusClasses.default;

  /* -------------------- AI EXPLANATION -------------------- */

  const handleUrgency = async (need, e) => {
    e.stopPropagation();
    setSelectedNeed(need);

    if (explanations[need.id]) return;

    setLoadingExplanation(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/explain-urgency`,
        {
          rawText: need.rawText,
          urgency: need.urgency,
        }
      );

      setExplanations((prev) => ({
        ...prev,
        [need.id]: res.data.explanation,
      }));
    } finally {
      setLoadingExplanation(false);
    }
  };

  /* -------------------- STATS -------------------- */

  const pendingCount = needs.filter((n) => n.status === "pending").length;
  const resolvedCount = needs.filter((n) => n.status === "resolved").length;

  /* ============================================================ */

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">

      <nav
  style={{ backgroundColor: "#1A1D27" }}
  className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 gap-3"
>
  <span className="text-teal-500 font-bold text-xl">NexaLink</span>

  <div className="flex flex-wrap gap-2">
    <Link to="/submit" className="bg-teal-500 hover:bg-teal-600 px-3 py-2 rounded text-sm">
      Submit Need
    </Link>
    <Link to="/map" className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm">
      Map
    </Link>
    <button onClick={logOut} className="border border-gray-600 px-3 py-2 rounded hover:bg-gray-700 text-sm">
      Sign Out
    </button>    
  </div>
</nav>

      {/* ================= HEADER ================= */}
      <div className="px-6 pt-6">
        <h2 className="text-2xl font-semibold">
          Welcome, {user?.displayName}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Manage and track your NGO needs
        </p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-3 gap-4 p-6">
        <StatCard title="Total Needs" value={needs.length} />
        <StatCard title="Pending" value={pendingCount} />
        <StatCard title="Resolved" value={resolvedCount} />
      </div>

      {/* ================= TABLE ================= */}
              <div className="hidden md:block px-6 pb-10">
  <div style={{ backgroundColor: "#1A1D27" }} className="rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#111827] text-gray-400">
              <tr>
                <th className="p-3 text-left">Urgency</th>
                <th className="p-3 text-left">Summary</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Categories</th>
                <th className="p-3 text-left">Affected</th>
                <th className="p-3 text-left">Assigned To</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">AI</th>
              </tr>
            </thead>

            <tbody>
              {needs.map((need) => (
                <tr
                  key={need.id}
                  onClick={() => setSelectedNeed(need)}
                  className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition"
                >
                  <td className="p-3">
                    <span className={getUrgencyClass(need.urgency)}>
                      {need.urgency ?? "N/A"}
                    </span>
                  </td>

                  <td>{need.summary}</td>
                  <td>{need.locationName}</td>
                  <td>{need.category?.join(", ")}</td>
                  <td>{need.affected}</td>
                  <td>{need.assignedToName}</td>

                  <td>
                    <span className={getStatusClass(need.status)}>
                      {need.status}
                    </span>
                  </td>

                  <td>
                    <button
                      onClick={(e) => handleUrgency(need, e)}
                      className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-xs"
                    >
                      Explain
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= CARDS (mobile) ================= */}
<div className="md:hidden px-4 pb-10 space-y-4">
  {needs.map((need) => (
    <div
      key={need.id}
      onClick={() => setSelectedNeed(need)}
      style={{ backgroundColor: "#1A1D27" }}
      className="rounded-xl p-4 border border-gray-800 cursor-pointer hover:border-teal-500 transition"
    >
      <div className="flex justify-between items-start mb-2">
        <span className={getUrgencyClass(need.urgency)}>
          {need.urgency ?? 'N/A'}
        </span>
        <span className={getStatusClass(need.status)}>
          {need.status}
        </span>
      </div>
      <p className="text-sm font-medium mb-2">{need.summary}</p>
      <p className="text-gray-400 text-xs">📍 {need.locationName}</p>
      <p className="text-gray-400 text-xs">👥 {need.affected} affected</p>
      <p className="text-gray-400 text-xs mt-1">{need.category?.join(', ')}</p>
      <button
        onClick={(e) => handleUrgency(need, e)}
        className="mt-3 w-full bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-xs"
      >
        Explain Urgency
      </button>
    </div>
  ))}
</div>

      {/* ================= DETAIL PANEL ================= */}
      {selectedNeed && (
        <div className="fixed inset-0 bg-black/60 flex justify-end z-50">
          <div className="w-[420px] h-full bg-[#111827] p-6 overflow-y-auto shadow-xl">

            <h2 className="text-xl font-bold mb-4">Need Details</h2>

            <p className="mb-2"><b>Summary:</b> {selectedNeed.summary}</p>
            <p className="mb-2"><b>Location:</b> {selectedNeed.locationName}</p>
            <p className="mb-2"><b>Status:</b> {selectedNeed.status}</p>
            <p className="mb-2">
              <b>Assigned:</b> {selectedNeed.assignedToName || "Unassigned"}
            </p>

            <div className="mt-4">
              <b>Raw Text</b>
              <p className="text-gray-400 text-sm mt-1">
                {selectedNeed.rawText}
              </p>
            </div>

            {/* AI Explanation */}
            {loadingExplanation && (
              <p className="mt-4 text-teal-400">
                🤖 Generating AI explanation...
              </p>
            )}

            {explanations[selectedNeed.id] && (
              <div className="bg-teal-500/20 p-3 rounded mt-4">
                <b>AI Urgency Insight</b>
                <p className="text-sm mt-1">
                  {explanations[selectedNeed.id]}
                </p>
              </div>
            )}

            <button
              onClick={() => setSelectedNeed(null)}
              className="mt-6 w-full bg-gray-700 hover:bg-gray-600 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="px-6 py-4 text-center">
  <button
    onClick={handleResetAccount}
    className="bg-rose-700 hover:bg-rose-800 text-white font-medium text-base px-8 py-4 rounded-xl shadow-md transition"
    >
    Reset Account
  </button>
</div>
    </div>
  );
};

/* ================= STAT CARD ================= */

const StatCard = ({ title, value }) => (
  <div
    style={{ backgroundColor: "#1A1D27" }}
    className="rounded-xl p-4 text-center"
  >
    <p className="text-3xl font-bold text-white">{value}</p>
    <p className="text-gray-400 text-sm">{title}</p>
  </div>
);

export default NGODashboard;