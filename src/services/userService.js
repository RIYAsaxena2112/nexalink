import { db } from './firebase'
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";


async function createUserIfNotExists(user) { 
    const userRef=doc(db,'users',user.uid);

    const docSnap=await getDoc(userRef);

    if(!docSnap.exists()){
        await setDoc(userRef,{
            uid:user.uid,
            name:user.displayName,
            role:null,
            createdAt:serverTimestamp()
        });
        console.log("New user created.");
    }else{
        console.log("User already exists.");
    }
}

async function getUserRole(uid) {   
    const userRef=doc(db,'users',uid);
    const docSnap=await getDoc(userRef);

    if(!docSnap.exists()){
        return null;
    }
    return docSnap.data().role;
}

export { createUserIfNotExists, getUserRole }

// export default createUserIfNotExists;
// export default getUserRole;