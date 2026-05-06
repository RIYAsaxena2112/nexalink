import { useNavigate } from "react-router-dom";
import { db } from "../services/firebase";
import { doc,setDoc } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';
import { logOut } from "../services/auth"; 

const RoleSelection=()=>{
const { user,setRole }=useAuth();
const navigate=useNavigate();

const handleRoleChoice=async (chosenRole)=>{
    if(!user){
        return;
    }
    try{
        const userRef=doc(db,'users',user.uid);
        await setDoc(userRef,{role: chosenRole},{merge:true});

        setRole(chosenRole);

        if(chosenRole==='ngo'){
            navigate('/dashboard');
        }else{
            navigate('/volunteer-registration');
        }
    }catch(error){
        console.error("Error updating role:", error);
        alert("Failed to save selection. Please try again.");
    }
};

 return(
        <div>
            <button id="ngo" onClick={()=>handleRoleChoice('ngo')}>I am a NGO</button>
            <br/><br />
            <button id="volunteer" onClick={()=>handleRoleChoice('volunteer')}>I am a volunteer.</button>
            <br></br>
            <button onClick={logOut}>Sign Out</button>
            </div>
    );   
}

export default RoleSelection;


