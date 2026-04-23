import { useState } from "react";
import axios from "axios";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase"; 
import { useAuth } from "../context/AuthContext";

export default function SubmitNeed() {
    const { user }=useAuth();
  // ✅ State
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      // 1️⃣ Call backend parsing API
      const res = await axios.post("http://localhost:5000/api/parse-need", {
        rawText,
      });

      const parsedData = res.data.data;

      // 2️⃣ Save to Firestore
      await addDoc(collection(db, "needs"), {
        rawText,
        ...parsedData,
        submittedBy: user?.uid || "anonymous",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // 3️⃣ Success UI
      setMessage("✅ Need submitted successfully!");
      setRawText("");

    } catch (err) {
      console.error(err);
      setMessage("❌ Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ UI
  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-3">
        Submit NGO Need
      </h2>

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Paste raw need text here..."
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          className="w-full border p-3 rounded mb-3"
          rows={6}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Submitting..." : "Submit Need"}
        </button>
      </form>

      {message && (
        <p className="mt-3 font-medium">{message}</p>
      )}
    </div>
  );
}