import { VercelRequest, VercelResponse } from '@vercel/node'
import { eq } from 'drizzle-orm'
import { getAuth } from 'firebase-admin/auth'
import withCors from '../lib/cors.js'
import { db } from '../lib/db.js'
import setupFirebaseApp from '../lib/firebase.js'
import { brightIdAppsTable, projectsTable } from '../lib/schema.js'

setupFirebaseApp()

async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers['authorization']?.split('Bearer ')[1]

  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const { uid } = await getAuth().verifyIdToken(token)

    const projects = await db
      .select({
        id: projectsTable.id,
        name: projectsTable.name,
        description: projectsTable.description,
        requirementLevel: projectsTable.requirementLevel,
        isActive: projectsTable.isActive,
        image: projectsTable.image,
        logoUrl: projectsTable.logoUrl,
        websiteUrl: projectsTable.websiteUrl,
        remainingtokens: projectsTable.remainingtokens,
        selectedPlanId: projectsTable.selectedPlanId,
        deadline: projectsTable.deadline,
        createdAt: projectsTable.createdAt,
        brightIdAppId: projectsTable.brightIdAppId,
        brightIdApp: {
          key: brightIdAppsTable.key,
          name: brightIdAppsTable.name,
          sponsoring: brightIdAppsTable.sponsoring,
          testing: brightIdAppsTable.testing,
          idsAsHex: brightIdAppsTable.idsAsHex,
          soulbound: brightIdAppsTable.soulbound,
          soulboundMessage: brightIdAppsTable.soulboundMessage,
          usingBlindSig: brightIdAppsTable.usingBlindSig,
          verifications: brightIdAppsTable.verifications,
          verificationExpiration: brightIdAppsTable.verificationExpirationLength,
          nodeUrl: brightIdAppsTable.nodeUrl,
          context: brightIdAppsTable.context,
          description: brightIdAppsTable.description,
          links: brightIdAppsTable.links,
          images: brightIdAppsTable.images,
          callbackUrl: brightIdAppsTable.callbackUrl,
          joined: brightIdAppsTable.joined
        }
      })
      .from(projectsTable)
      .where(eq(projectsTable.creatorId, uid))
      .leftJoin(brightIdAppsTable, eq(projectsTable.brightIdAppId, brightIdAppsTable.key))
      .orderBy(projectsTable.createdAt)

    return res.send({ projects })
  } catch (error) {
    console.log(error)
    return res.status(401).send({ error: 'Invalid token' })
  }
}

export default withCors(handler)
