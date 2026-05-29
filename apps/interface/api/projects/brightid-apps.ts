import { VercelRequest, VercelResponse } from '@vercel/node'
import { and, eq, isNotNull } from 'drizzle-orm'
import withCors from '../lib/cors.js'
import { db } from '../lib/db.js'
import { brightIdAppsTable, projectsTable } from '../lib/schema.js'

type BrightIdAppsResponse = Record<string, unknown>[]

const CACHE_TTL_MS = 60 * 1000
let cache: { data: BrightIdAppsResponse; expiresAt: number } | null = null

function parseTextArray(value: string | null, fallback?: string | null) {
  if (!value?.trim()) return fallback ? [fallback] : undefined

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
    }
  } catch {
    // Some existing values may be stored as plain text instead of JSON.
  }

  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatJoinedDate(value: Date | null) {
  if (!value) return undefined

  return `${value.getUTCMonth() + 1}/${value.getUTCDate()}/${value.getUTCFullYear()}`
}

function setIfPresent(target: Record<string, unknown>, key: string, value: unknown) {
  if (value === null || value === undefined) return
  if (Array.isArray(value) && value.length === 0) return
  if (typeof value === 'string' && value.trim() === '') return

  target[key] = value
}

const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  if (cache && Date.now() < cache.expiresAt) {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30')
    return res.json(cache.data)
  }

  const rows = await db
    .select({
      projectId: projectsTable.id,
      projectDescription: projectsTable.description,
      projectImage: projectsTable.image,
      projectLogoUrl: projectsTable.logoUrl,
      projectWebsiteUrl: projectsTable.websiteUrl,
      app: {
        key: brightIdAppsTable.key,
        name: brightIdAppsTable.name,
        sponsoring: brightIdAppsTable.sponsoring,
        testing: brightIdAppsTable.testing,
        idsAsHex: brightIdAppsTable.idsAsHex,
        soulbound: brightIdAppsTable.soulbound,
        soulboundMessage: brightIdAppsTable.soulboundMessage,
        usingBlindSig: brightIdAppsTable.usingBlindSig,
        verifications: brightIdAppsTable.verifications,
        verificationExpirationLength: brightIdAppsTable.verificationExpirationLength,
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
    .innerJoin(brightIdAppsTable, eq(projectsTable.brightIdAppId, brightIdAppsTable.key))
    .where(and(eq(projectsTable.isActive, true), isNotNull(projectsTable.brightIdAppId)))
    .orderBy(projectsTable.id)

  const apps = rows.reduce<BrightIdAppsResponse>((acc, row) => {
    const app = row.app
    const images = parseTextArray(app.images, row.projectLogoUrl ?? row.projectImage)
    const links = parseTextArray(app.links, row.projectWebsiteUrl)
    const verifications = parseTextArray(app.verifications)
    const output: Record<string, unknown> = {
      key: app.key,
      name: app.name,
      sponsoring: app.sponsoring,
      testing: app.testing,
      idsAsHex: app.idsAsHex,
      soulbound: app.soulbound,
      usingBlindSig: app.usingBlindSig
    }

    setIfPresent(output, 'soulboundMessage', app.soulboundMessage)
    setIfPresent(output, 'verifications', verifications)
    setIfPresent(output, 'verificationExpirationLength', app.verificationExpirationLength)
    setIfPresent(output, 'nodeUrl', app.nodeUrl)
    setIfPresent(output, 'description', app.description ?? row.projectDescription)
    setIfPresent(output, 'context', app.context)
    setIfPresent(output, 'links', links)
    setIfPresent(output, 'images', images)
    setIfPresent(output, 'callbackUrl', app.callbackUrl)
    setIfPresent(output, 'joined', formatJoinedDate(app.joined))

    acc.push(output)
    return acc
  }, [])

  cache = { data: apps, expiresAt: Date.now() + CACHE_TTL_MS }
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30')
  return res.json(apps)
}

export default withCors(handler)
