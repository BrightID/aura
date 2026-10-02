import { QueryClient } from '@aura/query';
import createClient from 'openapi-fetch';
import { AURA_NODE_URL } from '@/lib/constants/domains';
import type { paths } from '@/lib/schema';
import type { BrightID } from '@/types/brightid';
import type { Project } from '@/types/projects';

export const clientAPI = createClient<paths>({
  // Same-origin on the landing host. Override for a standalone API.
  baseUrl: import.meta.env.VITE_SOME_AURA_API_URL ?? '/api',
});

// aura-node is CORS-open → call it directly.
export const auraNodeAPI = createClient({
  baseUrl: `${AURA_NODE_URL}/profile`,
});

export const auraGetVerifiedAPI = createClient({
  baseUrl:
    import.meta.env.VITE_SOME_AURA_BACKEND_URL ?? 'https://aura.brightid.org',
});

export const queryClient = new QueryClient();

export const getBrightId = async (id: string) => {
  const res = await auraGetVerifiedAPI.GET(
    `/brightid/v6/users/${id}/profile` as never,
  );

  return (res.data as BrightID | undefined)?.data;
};

export const getProjects = async () => {
  const res = await clientAPI.GET('/projects');

  return (res.data! ?? []) as Project[];
};

export interface VerifyProjectResult {
  userId: string;
  projectId: number;
  client: string;
  /** Base64 nacl detached signature from the Aura node. */
  signature: string;
  /** Base64 nacl public key of the node that signed `signature`. */
  publicKey: string;
  /** sha256 of the verification expression included in the signed message. */
  verificationHash?: string | null;
  auraScore?: number | null;
  auraLevel?: number | null;
  verifiedAt: string;
}

/**
 * Calls the verify endpoint to generate a verification signature for a
 * verified user. Returns the signature payload on success.
 */
export const verifyProject = async (
  projectId: number,
  payload: {
    userId: string;
    client: string;
    auraScore?: number;
    auraLevel?: number;
  },
) => {
  const res = await clientAPI.POST(
    '/projects/{id}/verify' as never,
    {
      params: { path: { id: String(projectId) } },
      body: payload,
    } as never,
  );

  if ((res as { error?: unknown }).error) {
    throw new Error('Failed to generate verification signature');
  }

  return (res as { data?: { data?: VerifyProjectResult } }).data?.data;
};
