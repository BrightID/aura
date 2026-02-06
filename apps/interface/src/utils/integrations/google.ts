import { auth } from '@/lib/firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { Contact } from './contacts'

export async function getContactsList() {
  const provider = new GoogleAuthProvider()
  provider.addScope('https://www.googleapis.com/auth/contacts.readonly')

  try {
    const result = await signInWithPopup(auth, provider)
    const credential = GoogleAuthProvider.credentialFromResult(result)
    const accessToken = credential?.accessToken
    const peopleApiUrl =
      'https://people.googleapis.com/v1/people/me/connections' +
      '?personFields=names,emailAddresses,phoneNumbers'

    // Make a direct fetch request to the Google People API
    const response = await fetch(peopleApiUrl, {
      headers: {
        // Authorize the request with the access token from Firebase Auth
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json' // We want JSON back
      }
    })

    if (!response.ok) {
      // If the response isn't OK (e.g., 401, 403, 500), throw an error
      const errorData = await response.json()
      throw new Error(
        `Google People API error: ${response.status} - ${errorData.message || 'Unknown API error'}`
      )
    }

    const data = await response.json()

    return data.connections as Contact[]
  } catch (error) {
    console.error('Error during sign-in:', error)
  }
}
