import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { logOut } from "../services/auth";
import { Link } from "react-router-dom";
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
  const { user } = useAuth();

  const [needs, setNeeds] = useState([]);
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [explanations, setExplanations] = useState({});
  const [loadingExplanation, setLoadingExplanation] = useState(false);

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

      {/* ================= NAVBAR ================= */}
      <nav
        style={{ backgroundColor: "#1A1D27" }}
        className="px-6 py-4 flex items-center justify-between border-b border-gray-800"
      >
        <span className="text-teal-500 font-bold text-xl">NexaLink</span>

        <div className="flex gap-3">
          <Link
            to="/submit"
            className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded"
          >
            Submit Need
          </Link>

          <Link
            to="/map"
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
          >
            Map
          </Link>

          <button
            onClick={logOut}
            className="border border-gray-600 px-4 py-2 rounded hover:bg-gray-700"
          >
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
      <div className="px-6 pb-10">
        <div
          style={{ backgroundColor: "#1A1D27" }}
          className="rounded-xl overflow-hidden"
        >
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