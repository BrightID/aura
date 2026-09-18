import { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureSchema } from './ensure-schema.js';
import { sendInternalError } from './http-error.js';

export default function withCors(next: CallableFunction) {
  return async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, PUT, PATCH, DELETE, POST, OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    try {
      await ensureSchema();
      return await next(req, res);
    } catch (e) {
      console.error('Error resolving the response', e);
      if (!res.headersSent) sendInternalError(res, e);
    }
  };
}
