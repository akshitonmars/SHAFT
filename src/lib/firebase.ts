import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  getAuth,
} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAbvZW8IOxSzWnlD6Ap6huUtHYqwUuTpPc",
  authDomain: "shaft-d426a.firebaseapp.com",
  projectId: "shaft-d426a",
  storageBucket: "shaft-d426a.firebasestorage.app",
  messagingSenderId: "317833932737",
  appId: "1:317833932737:web:6f58eb85595c36249f8940",
  measurementId: "G-29KYQJYQQP",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
export const githubProvider = new GithubAuthProvider()
