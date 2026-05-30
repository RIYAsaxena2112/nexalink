import { useState } from "react";
import axios from "axios";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { logOut } from "../services/auth";

export default function SubmitNeed() {
  const { user } = useAuth();

  const [rawText, setRawText] = useState("");
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // ✅ Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setIsError(false);

      // 1️⃣ Parse Need
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/parse-need`,
        { rawText }
      );

      const parsedData = res.data.data;

      // 2️⃣ Geocode Location
      const geoRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/geocode`,
        { locationName }
      );

      const { lat, lng } = geoRes.data.data;

      // 3️⃣ Save to Firestore
      await addDoc(collection(db, "needs"), {
        rawText,
        ...parsedData,
        locationName,
        coordinates: { lat, lng },
        submittedBy: user?.uid || "anonymous",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setMessage("Need submitted successfully!");
      setRawText("");
      setLocationName("");
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{backgroundColor: '#0F1117'}}>

        {/* Floating Top Right Dashboard Button */}
    <div className="absolute top-6 right-6">
      <Link 
        to="/dashboard" 
        className="text-sm font-semibold text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700 bg-[#1A1D27]/80 backdrop-blur px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg"
      >
        Dashboard →
      </Link>
    </div>

      {/* Card */}
      <div className="w-full max-w-lg rounded-2xl shadow-xl p-8" style={{backgroundColor: '#1A1D27'}}>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            Submit NGO Need
          </h1>
          <p className="text-gray-400 mt-2">
            Describe what help is required and NexaLink will match volunteers.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Need Text */}
          <textarea
            placeholder="Paste raw need text here..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={6}
            required
            className="w-full bg-[#020617] border border-gray-700 text-white p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          {/* Location */}
          <input
            type="text"
            placeholder="Location (e.g. Dharavi, Mumbai)"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            required
            className="w-full bg-[#020617] border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

            <button
  onClick={handleSubmit}
  disabled={loading}
  className={`w-full font-semibold py-3 rounded-lg transition ${
    loading
      ? 'bg-gray-600 cursor-not-allowed text-gray-400'
      : 'bg-teal-500 hover:bg-teal-600 text-white'
  }`}
>
  {loading ? 'Processing...' : 'Submit Need'}
</button>
        </form>

        {/* Message */}
        {message && (
          <div
            className={`mt-5 text-center p-3 rounded-lg text-sm font-medium
            ${
              isError
                ? "bg-red-500/20 text-red-400"
                : "bg-teal-500/20 text-teal-400"
            }`}
          >
            {message}
          </div>
        )}

        {/* Sign Out */}
        <button
          onClick={logOut}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition mt-4"          
        >
          Sign Out
        </button>
      </div>
    </div>
  );
} 