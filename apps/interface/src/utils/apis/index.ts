import { AURA_NODE_URL_PROXY } from '@/lib/constants/domains'
import type { paths } from '@/lib/schema'
import type { BrightID } from '@/types/brightid'
import type { Project } from '@/types/projects'
import { QueryClient } from '@tanstack/query-core'
import createClient from 'openapi-fetch'

export const clientAPI = createClient<paths>({
  baseUrl: '/api'
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
