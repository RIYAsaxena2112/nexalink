import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'


const ProtectedRoute = ({ children })=>{
    const { user,role }=useAuth();
    //const { role }=useAuth();
    if(!user){
        return <Navigate to='/login'/>
    }
    if(role===null){
        return <Navigate to='/role-selection'></Navigate>
    }
    return children;
        
}
    //return user ? children:<Navigate to='/login'/>


export default ProtectedRoute;