import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider} from './firebase'

export const signInWithGoogle=()=>{
    return signInWithPopup(auth,googleProvider);
}

export const logOut =()=>{
    return signOut(auth);
}