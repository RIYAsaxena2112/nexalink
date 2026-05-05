import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../services/firebase'
import { createUserIfNotExists, getUserRole } from '../services/userService';

const AuthContext=createContext();

export const AuthProvider = ({ children })=>{
    const [user,setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth,async(currentUser)=>{
            if(currentUser){
                await createUserIfNotExists(currentUser)
                const userRole=await getUserRole(currentUser.uid);
                setUser(currentUser);
                setRole(userRole);
            }else{
                setUser(null);
                setRole(null);
            }
            
            setLoading(false);
           
        })
        return unsubscribe;
    },[])

    return(
        <AuthContext.Provider value={{user,loading,role,setRole}}>
            {!loading && children}
        </AuthContext.Provider>
    )    
}
export const useAuth = ()=> useContext(AuthContext);
