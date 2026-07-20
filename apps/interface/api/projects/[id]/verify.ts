import { VercelRequest, VercelResponse } from '@vercel/node'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import withCors from '../../lib/cors.js'
import { db } from '../../lib/db.js'
import { projectsTable, verificationsTable } from '../../lib/schema.js'

const verifySchema = z.object({
  client: z.string().min(1).max(100),
  auraScore: z.number().optional(),
  auraLevel: z.number().int().optional(),
  userId: z.string()
})

async function handler(req: VercelRequest, res: VercelResponse) {
  const rawId = Array.isArray(req.query['id']) ? req.query['id'][0] : req.query['id']
  const projectId = Number(rawId)

  let body: z.infer<typeof verifySchema>
  try {
    body = verifySchema.parse(req.body)
    if (!Number.isInteger(projectId)) {
      return res.status(400).json({ error: 'Invalid project id' })
    }
  } catch {
    return res.status(400).json({ error: 'Invalid request' })
  }

  const log = (msg: string, extra?: unknown) =>
    console.log(`[verify project=${projectId} user=${body.userId}] ${msg}`, extra ?? '')

  try {
    log('start')

    const [project] = await db
      .select({
        id: projectsTable.id,
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
      log('project not found or inactive')
      return res.status(400).json({ error: 'Invalid project or no tokens' })
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
      log('already verified')
      return res.status(200).json({ message: 'Already verified', data: alreadyVerified })
    }

    log('fetching brightid verification')
    let apiRes: Response
    try {
      apiRes = await fetch(
        `${process.env['VITE_SOME_AURA_BACKEND_URL']}/brightid/v6/verifications/${project.brightIdAppId}/${body.userId}?signed=nacl`,
        { signal: AbortSignal.timeout(10_000) }
      )
    } catch (err) {
      log('brightid fetch failed/timeout', err)
      return res.status(504).json({ error: 'Verification service unavailable' })
    }
    log(`brightid responded status=${apiRes.status}`)

    if (!apiRes.ok) {
      log('brightid non-ok status')
      return res.status(502).json({ error: 'Verification service error' })
    }

    const payload = await apiRes.json()

    return res.json(payload)

    // log(payload)

    // const verification = payload[0] as
    //   | {
    //       verification: string
    //       unique: boolean
    //       appUserId: string
    //       app: string
    //       verificationHash: string
    //       sig: {
    //         r: string
    //         s: string
    //         v: number
    //       }
    //       publicKey: string
    //     }
    //   | undefined

    // if (!verification?.unique) {
    //   log('user not unique/verified')
    //   return res.status(400).json({ error: 'User is not verified' })
    // }

    // try {
    //   await db.transaction(async (tx) => {
    //     await tx.insert(verificationsTable).values({
    //       userId: body.userId,
    //       projectId,
    //       client: body.client,
    //       auraScore: body.auraScore === undefined ? undefined : Math.round(body.auraScore),
    //       auraLevel: body.auraLevel,
    //       verifiedAt: now,
    //       signature: JSON.stringify(verification.sig)
    //     })

    //     await tx
    //       .update(projectsTable)
    //       .set({ remainingtokens: (project.remainingtokens ?? 0) - 1 })
    //       .where(eq(projectsTable.id, projectId))
    //   })
    // } catch (err) {
    //   // 23505 = unique_violation: concurrent request already verified this user+project
    //   if ((err as { code?: string })?.code === '23505') {
    //     log('concurrent verify race, already inserted')
    //     return res.status(200).json({ message: 'Already verified' })
    //   }
    //   throw err
    // }

    // log('verification success')
    // return res.status(200).json({
    //   message: 'verification success',
    //   data: {
    //     userId: body.userId,
    //     projectId,
    //     client: body.client,
    //     signature: verification.sig,
    //     auraScore: body.auraScore === undefined ? undefined : Math.round(body.auraScore),
    //     auraLevel: body.auraLevel,
    //     verifiedAt: now
    //   }
    // })
  } catch (error) {
    log('unhandled error', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors(handler)
