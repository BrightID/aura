import { QueryClient } from '@aura/query'
import createClient from 'openapi-fetch'
import { AURA_NODE_URL_PROXY } from '@/lib/constants/domains'
import type { paths } from '@/lib/schema'
import type { BrightID } from '@/types/brightid'
import type { Project } from '@/types/projects'

export const clientAPI = createClient<paths>({
  baseUrl: 'https://aura-get-verified.vercel.app/api'
})

const baseUrl = AURA_NODE_URL_PROXY

export const auraNodeAPI = createClient({
  baseUrl: `${baseUrl}/profile`
})

export const auraGetVerifiedAPI = createClient({
  baseUrl: import.meta.env.VITE_SOME_AURA_BACKEND_URL
})

export const queryClient = new QueryClient()

export const getBrightId = async (id: string) => {
  const res = await auraGetVerifiedAPI.GET(`/brightid/v6/users/${id}/profile` as never)

  return (res.data as BrightID | undefined)?.data
}

export const getProjects = async () => {
  const res = await clientAPI.GET('/projects')

  return (res.data! ?? []) as Project[]
}

export interface VerificationSignature {
  r: string
  s: string
  v: number
}

export interface VerifyProjectResult {
  userId: string
  projectId: number
  client: string
  signature: VerificationSignature
  auraScore?: number
  auraLevel?: number
  verifiedAt: string
}

/**
 * Calls the interface app's verify endpoint to generate a verification
 * signature for a verified user. Returns the signature payload on success.
 */
export const verifyProject = async (
  projectId: number,
  payload: {
    userId: string
    client: string
    auraScore?: number
    auraLevel?: number
  }
) => {
  const res = await clientAPI.POST(
    '/projects/{id}/verify' as never,
    {
      params: { path: { id: String(projectId) } },
      body: payload
    } as never
  )

  if ((res as { error?: unknown }).error) {
    throw new Error('Failed to generate verification signature')
  }

  return (res as { data?: { data?: VerifyProjectResult } }).data?.data
}
