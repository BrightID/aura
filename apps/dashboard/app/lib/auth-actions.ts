import { signInWithPopup, signInWithEmailLink, signOut } from "firebase/auth"
import { auth, googleProvider, appleProvider, setupRecaptcha } from "./firebase"

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider)

export const loginWithApple = () => signInWithPopup(auth, appleProvider)

export const logUserOut = () => signOut(auth)

export const sendOtp = async (email: string) => {
  signInWithEmailLink(auth, email, window.location.href)
}
