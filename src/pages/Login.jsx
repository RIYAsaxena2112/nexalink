import { signInWithGoogle } from '../services/auth'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'

const Login =()=>{
    const { user,role }=useAuth();
    const navigate=useNavigate();

    useEffect(()=>{
        if(user){
             if (role === null){
                navigate('/role-selection')
             } 
    else if(role === 'ngo'){
 navigate('/dashboard')
    } 
    else if (role === 'volunteer') {
        navigate('/volunteer-dashboard')
    }
}
},[user,role])

    const handleLogin = async()=>{
        try{
            await signInWithGoogle();
        } catch(error){
            console.error('Login failed:', error);
        }
    }

    return(
        <div>
            <h1>NexaLink</h1>
            <p>Connecting needs to action.</p>
            <button onClick={handleLogin}>Sign in with Google</button>
        </div>
    )
}

export default Login;