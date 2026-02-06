import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../lib/db.js'
import { projectsTable, verificationsTable } from '../../lib/schema.js'

const verifySchema = z.object({
  client: z.string().min(1).max(100),
  auraScore: z.number().int().optional(),
  auraLevel: z.number().int().optional(),
  userId: z.string()
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = verifySchema.parse(await req.json())
    const projectId = Number(params.id)

    const [project] = await db
      .select({
        remainingtokens: projectsTable.remainingtokens,
        creatorId: projectsTable.creatorId,
        brightIdAppId: projectsTable.brightIdAppId
      })
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, projectId),
          // gt(projectsTable.remainingtokens, -1000),
          eq(projectsTable.isActive, true)
          // TODO: add deadline filtering aswell
        )
      )
      .limit(1)

    if (!project) {
      return Response.json({ error: 'Invalid project or no tokens' }, { status: 400 })
    }

    const now = new Date()

    const alreadyVerified = await db
      .select()
      .from(verificationsTable)
      .where(
        and(eq(verificationsTable.userId, body.userId), eq(verificationsTable.projectId, projectId))
      )
      .limit(1)

    if (alreadyVerified.length > 0) {
      return Response.json({ message: 'Already verified', data: alreadyVerified }, { status: 200 })
    }

    const res = await fetch(
      `${process.env['VITE_SOME_AURA_BACKEND_URL']}/brightid/v6/verifications/${project.brightIdAppId}/${body.userId}?signed=nacl`
    )

    const verification = (await res.json())[0] as {
      verification: string
      unique: true
      appUserId: string
      app: string
      verificationHash: string
      sig: {
        r: string
        s: string
        v: number
      }
      publicKey: string
    }

    if (!verification.unique)
      return Response.json({ error: 'User is not verified' }, { status: 400 })

    await db.transaction(async (tx) => {
      await tx.insert(verificationsTable).values({
        userId: body.userId,
        projectId,
        client: body.client,
        auraScore: body.auraScore,
        auraLevel: body.auraLevel,
        verifiedAt: now,
        signature: JSON.stringify(verification.sig)
      })

      await tx
        .update(projectsTable)
        .set({ remainingtokens: (project.remainingtokens ?? 0) - 1 })
        .where(eq(projectsTable.id, projectId))
    })

    return Response.json({
      message: 'verification success',
      data: {
        userId: body.userId,
        projectId,
        client: body.client,
        signature: verification.sig,
        auraScore: body.auraScore,
        auraLevel: body.auraLevel,
        verifiedAt: now
      }
    })
  } catch (error) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}
