import {getApp,getApps,initializeApp} from "firebase/app";
import {GoogleAuthProvider,browserLocalPersistence,getAuth,onAuthStateChanged,setPersistence,signInWithPopup,signOut,type User} from "firebase/auth";
import {deleteDoc,doc,getDoc,getFirestore,serverTimestamp,setDoc} from "firebase/firestore";

const firebaseConfig={
 apiKey:"AIzaSyD7GFSk6jJZ2dyPgwZJH9gbKv6aPZ7UMZ4",
 authDomain:"cinematic-archives-hq.firebaseapp.com",
 projectId:"cinematic-archives-hq",
 storageBucket:"cinematic-archives-hq.firebasestorage.app",
 messagingSenderId:"568480330615",
 appId:"1:568480330615:web:e1921db69c8b5191912772"
};
const app=getApps().length?getApp():initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app),provider=new GoogleAuthProvider();
provider.setCustomParameters({prompt:"select_account"});
export type AuthUser=User;
export type CloudArchive={schemaVersion:number;archiveId:"pokemon";appVersion:string;catalogVersion:string;updatedAt:string;activeProfileId:string;profiles:unknown[]};
const archiveDocument=(uid:string)=>doc(db,"users",uid,"archives","pokemon");
export const observeAuth=(callback:(user:AuthUser|null)=>void)=>onAuthStateChanged(auth,callback);
export async function signInWithGoogle(){await setPersistence(auth,browserLocalPersistence);return(await signInWithPopup(auth,provider)).user}
export const signOutGoogle=()=>signOut(auth);
export async function readCloudArchive(uid:string):Promise<CloudArchive|null>{const snapshot=await getDoc(archiveDocument(uid));return snapshot.exists()?snapshot.data() as CloudArchive:null}
export async function writeCloudArchive(uid:string,archive:CloudArchive){const safe=JSON.parse(JSON.stringify(archive));await setDoc(archiveDocument(uid),{...safe,serverUpdatedAt:serverTimestamp()})}
export const deleteCloudArchive=(uid:string)=>deleteDoc(archiveDocument(uid));
