import { useState,useEffect } from 'react';
import { useAuth } from '../context/AuthContext'
import { logOut } from '../services/auth'
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase';
import axios from 'axios';

const NGODashboard =()=>{
    const { user }=useAuth();
    const [needs, setNeeds] = useState([]);
    const [selectedNeed, setSelectedNeed] = useState(null);
    const [explanations, setExplanations] = useState({});
    const [loadingExplanation, setLoadingExplanation] = useState(false);

  const urgencyClasses = {
  high: 'bg-red-500 text-white px-2 py-1 rounded text-xs font-bold',
  medium: 'bg-orange-400 text-white px-2 py-1 rounded text-xs font-bold',
  low: 'bg-green-500 text-white px-2 py-1 rounded text-xs font-bold',
  none: 'bg-gray-400 text-white px-2 py-1 rounded text-xs font-bold'
}

const getUrgencyClass = (urgency) => {
  if (!urgency) return urgencyClasses.none
  if (urgency >= 8) return urgencyClasses.high
  if (urgency >= 5) return urgencyClasses.medium
  return urgencyClasses.low
}

const statusClasses = {
  pending: 'bg-orange-400 text-white px-2 py-1 rounded text-xs font-bold',
  assigned: 'bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold',
  resolved: 'bg-green-500 text-white px-2 py-1 rounded text-xs font-bold',
  default: 'bg-gray-400 text-white px-2 py-1 rounded text-xs font-bold'
}

const handleUrgency = async (need, e) => {
  e.stopPropagation()

  setSelectedNeed(need)

  if (explanations[need.id]) return // already generated
  setLoadingExplanation(true)

  try{
    const res = await axios.post(
    "http://localhost:5000/api/explain-urgency",
    {
      rawText: need.rawText,
      urgency: need.urgency
    }
  )

  setExplanations(prev => ({
    ...prev,
    [need.id]: res.data.explanation
  }))
  }finally {
    setLoadingExplanation(false)  
  }
  
}

const getStatusClass = (status) => {
  return statusClasses[status] || statusClasses.default
}
    useEffect(()=>{
        let unsubscribe;
         const q = query(
          collection(db, "needs"), 
          where("submittedBy", "==", user.uid), 
          orderBy("urgency", "desc")
        );
        unsubscribe=onSnapshot(q,(snapshot)=>{
            const matched=snapshot.docs
            .map(d=>({id:d.id,...d.data()}));
            setNeeds(matched);
        })
        return()=>unsubscribe && unsubscribe();
    },[])
    return(
        <div>
            <header>
                <h2>Welcome, {user?.displayName}</h2>
                <button onClick={logOut} className="bg-blue-600 text-white px-4 py-2 rounded">Sign Out</button>
                <br></br>
                <br></br>
                <Link to="/submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >Submit New Need
          </Link>
          <br></br><br></br>
          <Link to="/map" className='bg-blue-600 text-white px-4 py-2 rounded'>
          Check Map
          </Link>
            </header>

            <table>
                <thead>
    <tr>
      <th>Urgency</th>
      <th>Summary</th>
      <th>Location</th>
      <th>Categories</th>
      <th>Affected</th>
      <th>Assigned To</th>
      <th>Status</th>
      <th>AI Insight</th>
    </tr>
  </thead>
  <tbody>
    {needs.map(need => (
      <tr key={need.id} onClick={() => setSelectedNeed(need)}>
        <td><span className={getUrgencyClass(need.urgency)}>
          {need.urgency ?? 'N/A'}
         </span>
        </td>
        <td>{need.summary}</td>
        <td>{need.locationName}</td>
        <td>{need.category?.join(', ')}</td>
        <td>{need.affected}</td>
        <td>{need.assignedToName}</td>
        <td><span className={getStatusClass(need.status)}>
           {need.status ?? 'N/A'}
         </span></td>
         <td><button
  onClick={(e) => handleUrgency(need, e)}
  className="bg-purple-600 text-white px-2 py-1 rounded"
>
  Explain Urgency
</button></td>
               
      </tr>
    ))}
  </tbody>
            </table>
            {selectedNeed && (
  <div>
    <h2>Selected Need</h2>
    <p>{selectedNeed.summary}</p>
    <p>Raw text: {selectedNeed.rawText}</p>
    <p>Status: {selectedNeed.status}</p>
    <p>Assigned To: {selectedNeed.assignedToName}</p>
    <br/>

    {loadingExplanation && (
      <p>🤖 Generating AI explanation...</p>
    )}
    
        {explanations[selectedNeed.id] && (
          <div className="bg-gray-100 p-3 rounded mt-2">
            <b>AI Urgency Explanation:</b>
            <p>{explanations[selectedNeed.id]}</p>
          </div>
        )}       
        
    <button onClick={() => setSelectedNeed(null)} className='bg-blue-600 text-white px-4 py-2 rounded'>Close</button>
  </div>
)}
        </div>
    )
}

export default NGODashboard;

