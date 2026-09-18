import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuth } from 'firebase-admin/auth';
import setupFirebaseApp from './firebase.js';

export async function requireUid(
  req: VercelRequest,
  res: VercelResponse,
): Promise<string | null> {
  const header = req.headers.authorization;
  const token =
    typeof header === 'string' && header.startsWith('Bearer ')
      ? header.slice(7).trim()
      : undefined;

  if (!token || token === 'undefined' || token === 'null') {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  try {
    setupFirebaseApp();
    const { uid } = await getAuth().verifyIdToken(token);
    return uid;
  } catch (error) {
    const code = (error as { code?: string }).code ?? '';
    if (code.startsWith('auth/')) {
      console.log(error);
      res.status(401).json({ error: 'Invalid token' });
      return null;
    }
    console.error(error);
    res.status(500).json({ error: 'Auth service error' });
    return null;
  }
}
