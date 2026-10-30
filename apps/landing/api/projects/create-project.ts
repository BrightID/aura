import { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuth } from 'firebase-admin/auth';
import z, { ZodError } from 'zod';
import withCors from '../lib/cors.js';
import { db } from '../lib/db.js';
import setupFirebaseApp from '../lib/firebase.js';
import { projectsTable } from '../lib/schema.js';

setupFirebaseApp();

const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1).max(255),
  requirementLevel: z.number().int().positive().optional(),
  image: z.url().optional().nullable(),
  landingMarkdown: z.string().optional(),
  logoUrl: z.url().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  websiteUrl: z.url().optional(),
  brightIdAppId: z.string().max(500).optional(),
});

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { uid } = await getAuth().verifyIdToken(token);
    const {
      name,
      description,
      image,
      landingMarkdown,
      logoUrl,
      isActive,
      websiteUrl,
      brightIdAppId,
    } = createProjectSchema.parse(req.body);

    await db.insert(projectsTable).values({
      name,
      description,
      image,
      landingMarkdown,
      logoUrl,
      isActive,
      websiteUrl,
      brightIdAppId,
      creatorId: uid,
      // Free-plan starting balance. A later payment overwrites remainingtokens with that plan's token count. It does not add to this 1000.
      remainingtokens: 1000,
      requirementLevel: 1,
    });

    res.status(201).json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json(z.treeifyError(error));
    }

    console.log(error);

    res
      .status(400)
      .json({ error: (error as Error).message || 'Invalid request' });
  }
}

export default withCors(handler);
