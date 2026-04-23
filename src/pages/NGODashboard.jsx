import { useAuth } from '../context/AuthContext'
import { logOut } from '../services/auth'
import { Link } from "react-router-dom";

const NGODashboard =()=>{
    const { user }=useAuth();
    return(
        <div>
            <h2>Welcome, {user?.displayName}</h2>
            <button onClick={logOut}>Sign Out</button>
            <br></br>
            <Link
        to="/submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit New Need
      </Link>
        </div>
    )
}

export default NGODashboard;