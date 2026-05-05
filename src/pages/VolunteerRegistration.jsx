import { useState } from "react"
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
import { doc,setDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom'

const VolunteerRegistration=()=>{
    const navigate = useNavigate()
    const { user }=useAuth();
    const [name, setName]=useState(user.displayName);
    const [locationName, setLocationName]=useState('');
    const [skills, setSkills] = useState([])

    const availableSkills = ['food', 'medical', 'rescue', 'shelter', 'logistics']

    const handleSubmit=async()=>{
        if(!user){
            return;
        }      
        try{
           const userRef=doc(db,'users',user.uid);
        await setDoc(userRef,{name,locationName,skills,available:true},{merge:true});
        navigate('/volunteer-dashboard');
        } catch(error){
            console.error("Error registering the volunteer:", error);
        alert("Failed to register volunteer. Please try again.");
        }
        
        
    }
    const handleSkillToggle = (skill) => {
      if (skills.includes(skill)) {
        setSkills(skills.filter(s => s !== skill))
      } else {
        setSkills([...skills, skill])
      }
    }

    return(
        <div>
            <input
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Your name"
/>
<input
  type="text"
  value={locationName}
  onChange={(e) => setLocationName(e.target.value)}
  placeholder="Your location e.g. Mumbai, Maharashtra"
/>
            {availableSkills.map(skill => (
            <label key={skill}>
              <input
                type="checkbox"
                checked={skills.includes(skill)}
                onChange={() => handleSkillToggle(skill)}
              />
              {skill}
            </label>
        ))}
            <button id="submit" onClick={handleSubmit}>Submit</button>
        </div>
    )
}

export default VolunteerRegistration;

// Your component needs:

// handleSubmit that calls setDoc with { merge: true } adding skills, locationName, available: true
// Redirect to /volunteer-dashboard on success
{/* <label for='skill'>Skills</label>
            <br></br>
            <input type="checkbox" name="skill">Food</input><br></br>
            <input type="checkbox" name="skill">Medical</input><br></br>
            <input type="checkbox" name="skill">Rescue</input><br></br>
            <input type="checkbox" name="skill">Shelter</input><br></br>
            <input type="checkbox" name="skill">Logistics</input><br></br> */}