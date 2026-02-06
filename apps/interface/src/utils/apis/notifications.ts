import type { AuraEvaluation, BrightIdConnection, Verification } from '@/types/brightid'
import { auraGetVerifiedAPI } from '.'

export type AuraNodeBrightIdConnection = BrightIdConnection & {
  auraEvaluations?: AuraEvaluation[]
  verifications: Verification[]
}

export type AuraNodeConnectionsResponse = {
  data: {
    connections: AuraNodeBrightIdConnection[]
  }
}

export const fetchInboundConnections = (
  brightId: string
): Promise<AuraNodeBrightIdConnection[]> => {
  return auraGetVerifiedAPI
    .GET(`/brightid/v6/users/${brightId}/connections/inbound?withVerifications=true` as never)

    .then((res: { data?: AuraNodeConnectionsResponse }) => res.data?.data.connections ?? [])
}
