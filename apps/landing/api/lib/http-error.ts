import type { VercelResponse } from '@vercel/node';

export function sendInternalError(res: VercelResponse, error: unknown) {
  console.error(error);
  const err = error as {
    cause?: { code?: string; message?: string };
    code?: string;
    message?: string;
  };
  const cause = err.cause ?? err;
  return res.status(500).json({
    error: 'Internal server error',
    code: cause.code,
    message: cause.message,
  });
}
