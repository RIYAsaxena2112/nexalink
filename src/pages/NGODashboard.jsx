import { useAuth } from '../context/AuthContext'
import { logOut } from '../services/auth'

const NGODashboard =()=>{
    const { user }=useAuth();
    return(
        <div>
            <h2>Welcome, {user?.displayName}</h2>
            <button onClick={logOut}>Sign Out</button>
        </div>
    )
}

export default NGODashboard;