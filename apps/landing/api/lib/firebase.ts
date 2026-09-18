import { cert, getApps, initializeApp } from 'firebase-admin/app';

export default function setupFirebaseApp() {
  if (getApps().length) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase admin env missing');
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}
