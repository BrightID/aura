import { VercelRequest, VercelResponse } from '@vercel/node'
import { eq } from 'drizzle-orm'
import { getAuth } from 'firebase-admin/auth'
import { z } from 'zod'
import withCors from '../lib/cors.js'
import { db } from '../lib/db.js'
import setupFirebaseApp from '../lib/firebase.js'
import { brightIdAppsTable, projectsTable } from '../lib/schema.js'

setupFirebaseApp()

const schema = z.object({
  projectId: z.number().int(),
  brightIdApp: z.object({
    key: z.string(),
    name: z.string(),
    sponsoring: z.boolean().optional().default(true),
    testing: z.boolean().optional().default(false),
    idsAsHex: z.boolean().optional().default(false),
    soulbound: z.boolean().optional().default(false),
    soulboundMessage: z.string().nullable().optional(),
    usingBlindSig: z.boolean().optional().default(false),
    verifications: z.string().nullable().optional(),
    verificationExpirationLength: z.number().int().nullable().optional(),
    nodeUrl: z.string().nullable().optional(),
    context: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    links: z.string().nullable().optional(),
    images: z.string().nullable().optional(),
    callbackUrl: z.string().nullable().optional()
  })
})

async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers['authorization']?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const { uid } = await getAuth().verifyIdToken(token)
    const { projectId, brightIdApp } = schema.parse(req.body)

    const [project] = await db
      .select({ creatorId: projectsTable.creatorId })
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .limit(1)

    if (!project || project.creatorId !== uid) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const updated = await db
      .update(brightIdAppsTable)
      .set({
        name: brightIdApp.name,
        sponsoring: brightIdApp.sponsoring,
        testing: brightIdApp.testing,
        idsAsHex: brightIdApp.idsAsHex,
        soulbound: brightIdApp.soulbound,
        soulboundMessage: brightIdApp.soulboundMessage ?? null,
        usingBlindSig: brightIdApp.usingBlindSig,
        verifications: brightIdApp.verifications ?? null,
        verificationExpirationLength: brightIdApp.verificationExpirationLength ?? null,
        nodeUrl: brightIdApp.nodeUrl ?? null,
        context: brightIdApp.context ?? null,
        description: brightIdApp.description ?? null,
        links: brightIdApp.links ?? null,
        images: brightIdApp.images ?? null,
        callbackUrl: brightIdApp.callbackUrl ?? null
      })
      .where(eq(brightIdAppsTable.key, brightIdApp.key))
      .returning()

    if (updated.length === 0) {
      await db.insert(brightIdAppsTable).values({
        key: brightIdApp.key,
        name: brightIdApp.name,
        sponsoring: brightIdApp.sponsoring,
        testing: brightIdApp.testing,
        idsAsHex: brightIdApp.idsAsHex,
        soulbound: brightIdApp.soulbound,
        soulboundMessage: brightIdApp.soulboundMessage ?? null,
        usingBlindSig: brightIdApp.usingBlindSig,
        verifications: brightIdApp.verifications ?? null,
        verificationExpirationLength: brightIdApp.verificationExpirationLength ?? null,
        nodeUrl: brightIdApp.nodeUrl ?? null,
        context: brightIdApp.context ?? null,
        description: brightIdApp.description ?? null,
        links: brightIdApp.links ?? null,
        images: brightIdApp.images ?? null,
        callbackUrl: brightIdApp.callbackUrl ?? null
      })
    }

    await db
      .update(projectsTable)
      .set({ brightIdAppId: brightIdApp.key })
      .where(eq(projectsTable.id, projectId))

    return res.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(z.treeifyError(error))
    }
    console.error(error)
    return res.status(500).json({ error: 'Internal error', debug: `${error}` })
  }
}

export default withCors(handler)
