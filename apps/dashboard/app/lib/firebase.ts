import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  type Auth,
} from "firebase/auth"
import { getDatabase, ref, set } from "firebase/database"
import { getFirestore, Firestore } from "firebase/firestore"
import type { ReactNode } from "react"
// import { getAnalytics } from "firebase/analytics";

if (!import.meta.env.VITE_SOME_FIREBASE_API_KEY) {
  throw new Error(
    "Firebase API Key is not defined. Please create a .env.local file and add your Firebase project credentials. See .env.example for reference."
  )
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_SOME_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_SOME_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_SOME_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_SOME_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_SOME_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_SOME_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_SOME_FIREBASE_MEASUREMENT_ID,
}

let app: FirebaseApp
let auth: Auth
let db: Firestore

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]!
}

auth = getAuth(app)
db = getFirestore(app)

export const setupRecaptcha = (containerId: string | HTMLElement) => {
  return new RecaptchaVerifier(auth, containerId, { size: "invisible" })
}

export const fbDb = getDatabase(app)

export function writeData(path: string, data: unknown) {
  return set(ref(fbDb, path), data)
}

export { app, auth, db }

export const googleProvider = new GoogleAuthProvider()

export const appleProvider = new OAuthProvider("apple.com")

appleProvider.addScope("email")
appleProvider.addScope("name")
