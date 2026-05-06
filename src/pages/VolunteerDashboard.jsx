import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
import { collection, query, where, doc,getDoc, onSnapshot } from "firebase/firestore";
import { logOut } from "../services/auth";
import { useNavigate } from "react-router-dom";

const VolunteerDashboard=()=>{
  const { user } = useAuth()

const [matchedNeeds, setMatchedNeeds] = useState([])
  useEffect(() => {
  let unsubscribe

  const init = async () => {
    // 1. fetch volunteer skills
    const docSnap =await getDoc(doc(db,'users',user.uid));
    const volunteerSkills = docSnap.data()?.skills || []

    // 2. build query
    const q = query(collection(db, 'needs'), where('status', '==', 'pending'))

    // 3. listen and filter
    unsubscribe = onSnapshot(q, (snapshot) => {
      const matched = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(need => {
          const skillSet = new Set(volunteerSkills)
          return need.category?.some(cat => skillSet.has(cat))
        })
      setMatchedNeeds(matched)
    })
  }

  init()
  return () => unsubscribe && unsubscribe()
}, [])

  return (
  <div>
    <h2>Matched Needs</h2>
    {matchedNeeds.map(need => (
      <div key={need.id}>
        <p>Urgency: {need.urgency}</p>
        <p>Location: {need.locationName}</p>
        <p>{need.summary}</p>
        <p>Categories: {need.category?.join(', ')}</p>
      </div>
    ))}
    <br></br>
    <button onClick={logOut}>Sign Out</button>    
  </div>  
);
}
export default VolunteerDashboard;
