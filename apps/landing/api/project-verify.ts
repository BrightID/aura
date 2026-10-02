import { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import withCors from './lib/cors.js';
import { db, sql } from './lib/db.js';
import {
  brightIdAppsTable,
  projectsTable,
  verificationsTable,
} from './lib/schema.js';

const verifySchema = z.object({
  client: z.string().min(1).max(100),
  auraScore: z.number().optional(),
  auraLevel: z.number().int().optional(),
  userId: z.string(),
});

const APP_USER_ID_NOT_FOUND = 61;

type NodeVerification = {
  unique?: boolean;
  verification?: string;
  sig?: string;
  publicKey?: string;
  verificationHash?: string;
};

type StoredSignature = {
  sig: string;
  publicKey: string;
  verificationHash?: string | null;
};

type PublicVerification = {
  userId: string;
  projectId: number;
  client: string;
  signature: string;
  publicKey: string;
  verificationHash: string | null;
  auraScore: number | null;
  auraLevel: number | null;
  verifiedAt: Date | string | null;
};

function nodeBase() {
  return (
    process.env['VITE_SOME_AURA_BACKEND_URL'] ?? 'https://aura-node.brightid.org'
  ).replace(/\/$/, '');
}

function scriptLines(raw: string | null | undefined) {
  return (raw ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function asInt(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.round(value)
    : null;
}

function subjectStats(body: unknown): {
  auraLevel: number | null;
  auraScore: number | null;
} {
  const verifications = (
    body as { data?: { verifications?: unknown } } | null
  )?.data?.verifications;
  if (!Array.isArray(verifications)) {
    return { auraLevel: null, auraScore: null };
  }
  const aura = verifications.find(
    (v) => (v as { name?: string }).name === 'Aura',
  ) as { domains?: { name?: string; categories?: unknown[] }[] } | undefined;
  const domain = aura?.domains?.find((d) => d?.name === 'BrightID');
  const subject = domain?.categories?.find(
    (c) => (c as { name?: string }).name === 'subject',
  ) as { level?: unknown; score?: unknown } | undefined;
  return {
    auraLevel: asInt(subject?.level),
    auraScore: asInt(subject?.score),
  };
}

async function readSubject(base: string, userId: string) {
  try {
    const res = await fetch(
      `${base}/brightid/v6/users/${encodeURIComponent(userId)}/profile`,
      { signal: AbortSignal.timeout(10_000) },
    );
    if (!res.ok) return { auraLevel: null, auraScore: null };
    return subjectStats(await res.json());
  } catch {
    return { auraLevel: null, auraScore: null };
  }
}

function parseStoredSignature(raw: string): StoredSignature {
  try {
    const parsed = JSON.parse(raw) as Partial<StoredSignature>;
    if (typeof parsed.sig === 'string' && parsed.sig) {
      return {
        sig: parsed.sig,
        publicKey: typeof parsed.publicKey === 'string' ? parsed.publicKey : '',
        verificationHash:
          typeof parsed.verificationHash === 'string'
            ? parsed.verificationHash
            : undefined,
      };
    }
  } catch {
    // Older rows stored the signature text directly.
  }
  return { sig: raw, publicKey: '' };
}

function toPublicVerification(row: {
  userId: string;
  projectId: number;
  client: string;
  signature: string;
  auraScore: number | null;
  auraLevel: number | null;
  verifiedAt: Date | string | null;
}): PublicVerification {
  const stored = parseStoredSignature(row.signature);
  return {
    userId: row.userId,
    projectId: row.projectId,
    client: row.client,
    signature: stored.sig,
    publicKey: stored.publicKey,
    verificationHash: stored.verificationHash ?? null,
    auraScore: row.auraScore,
    auraLevel: row.auraLevel,
    verifiedAt: row.verifiedAt,
  };
}

type UpstreamBody = {
  errorNum?: number;
  errorMessage?: string;
  error?: string;
};

async function upstreamOf(apiRes: Response) {
  let body: UpstreamBody | null = null;
  try {
    body = (await apiRes.json()) as UpstreamBody;
  } catch {
    body = null;
  }
  return {
    status: apiRes.status,
    errorNum: body?.errorNum,
    errorMessage: body?.errorMessage ?? body?.error ?? null,
  };
}

async function handler(req: VercelRequest, res: VercelResponse) {
  const rawId = Array.isArray(req.query['id'])
    ? req.query['id'][0]
    : req.query['id'];
  const projectId = Number(rawId);

  let body: z.infer<typeof verifySchema>;
  try {
    body = verifySchema.parse(req.body);
    if (!Number.isInteger(projectId)) {
      return res.status(400).json({ error: 'Invalid project id' });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const log = (msg: string, extra?: unknown) =>
    console.log(
      `[verify project=${projectId} user=${body.userId}] ${msg}`,
      extra ?? '',
    );

  try {
    log('start');

    const [project] = await db
      .select({
        id: projectsTable.id,
        remainingtokens: projectsTable.remainingtokens,
        brightIdAppId: projectsTable.brightIdAppId,
        verificationScript: brightIdAppsTable.verifications,
      })
      .from(projectsTable)
      .leftJoin(
        brightIdAppsTable,
        eq(projectsTable.brightIdAppId, brightIdAppsTable.key),
      )
      .where(and(eq(projectsTable.id, projectId), eq(projectsTable.isActive, true)))
      .limit(1);

    if (!project) {
      log('project not found or inactive');
      return res.status(400).json({ error: 'Invalid project or no tokens' });
    }

    if (!project.brightIdAppId) {
      log('project has no brightid app');
      return res.status(400).json({ error: 'Project has no BrightID app' });
    }

    const lines = scriptLines(project.verificationScript);
    if (lines.length === 0) {
      log('project has no verification script');
      return res.status(400).json({ error: 'Project has no verification script' });
    }

    const alreadyVerified = await db
      .select()
      .from(verificationsTable)
      .where(
        and(
          eq(verificationsTable.userId, body.userId),
          eq(verificationsTable.projectId, projectId),
        ),
      )
      .limit(1);

    if (alreadyVerified.length > 0 && alreadyVerified[0]) {
      log('already verified');
      return res.status(200).json({
        message: 'Already verified',
        data: toPublicVerification(alreadyVerified[0]),
      });
    }

    const base = nodeBase();
    log('fetching brightid verification');
    let apiRes: Response;
    try {
      apiRes = await fetch(
        `${base}/brightid/v6/verifications/${encodeURIComponent(project.brightIdAppId)}/${encodeURIComponent(body.userId)}?signed=nacl`,
        { signal: AbortSignal.timeout(10_000) },
      );
    } catch (err) {
      log('brightid fetch failed/timeout', err);
      return res
        .status(504)
        .json({ error: 'Verification service unavailable' });
    }
    log(`brightid responded status=${apiRes.status}`);

    if (!apiRes.ok) {
      const upstream = await upstreamOf(apiRes);
      log('brightid non-ok status', upstream);
      if (
        apiRes.status === 404 &&
        upstream.errorNum === APP_USER_ID_NOT_FOUND
      ) {
        return res.status(400).json({ error: 'User is not verified', upstream });
      }
      return res.status(502).json({
        error: 'Verification service error',
        upstream,
      });
    }

    const payload = (await apiRes.json()) as { data?: NodeVerification[] };
    const results = Array.isArray(payload.data) ? payload.data : [];
    const matched = lines.map((line) =>
      results.find((item) => (item.verification ?? '').trim() === line),
    );
    if (matched.some((item) => !item || item.unique !== true)) {
      log('user not unique/verified');
      return res.status(400).json({ error: 'User is not verified' });
    }

    const signed = matched[0];
    if (
      !signed ||
      typeof signed.sig !== 'string' ||
      !signed.sig ||
      typeof signed.publicKey !== 'string' ||
      !signed.publicKey
    ) {
      log('node response missing signature', signed);
      return res.status(502).json({
        error: 'Verification service error',
        upstream: {
          status: apiRes.status,
          errorMessage: 'missing signature',
        },
      });
    }

    const { auraLevel, auraScore } = await readSubject(base, body.userId);
    const verifiedAt = new Date();
    const signature = JSON.stringify({
      sig: signed.sig,
      publicKey: signed.publicKey,
      verificationHash: signed.verificationHash ?? null,
      projectId,
    });

    const data: PublicVerification = {
      userId: body.userId,
      projectId,
      client: body.client,
      signature: signed.sig,
      publicKey: signed.publicKey,
      verificationHash: signed.verificationHash ?? null,
      auraScore,
      auraLevel,
      verifiedAt,
    };

    try {
      // neon-http has no interactive transaction. sql.transaction is one round trip.
      await sql.transaction([
        sql`INSERT INTO "verifications" ("userId", "projectId", "client", "signature", "auraScore", "auraLevel", "verifiedAt")
            VALUES (${body.userId}, ${projectId}, ${body.client}, ${signature}, ${auraScore}, ${auraLevel}, ${verifiedAt.toISOString()})`,
        sql`UPDATE "projects"
            SET "remainingtokens" = COALESCE("remainingtokens", 0) - 1
            WHERE "id" = ${projectId}`,
      ]);
    } catch (err) {
      // 23505 = unique_violation: concurrent request already verified this user+project
      if ((err as { code?: string })?.code === '23505') {
        log('concurrent verify race, already inserted');
        const [row] = await db
          .select()
          .from(verificationsTable)
          .where(
            and(
              eq(verificationsTable.userId, body.userId),
              eq(verificationsTable.projectId, projectId),
            ),
          )
          .limit(1);
        if (row) {
          return res.status(200).json({
            message: 'Already verified',
            data: toPublicVerification(row),
          });
        }
        return res.status(200).json({ message: 'Already verified' });
      }
      throw err;
    }

    log('verification success');
    return res.status(200).json({
      message: 'verification success',
      data,
    });
  } catch (error) {
    log('unhandled error', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withCors(handler);
