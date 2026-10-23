import { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import withCors from './lib/cors.js';
import { db } from './lib/db.js';
import {
  publicRead,
  setPublicReadCacheHeaders,
} from './lib/public-read-cache.js';
import { projectsTable } from './lib/schema.js';

const loadActiveProjects = () =>
  db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.isActive, true));

const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'GET') {
    const projects = await publicRead('active-projects', loadActiveProjects);
    setPublicReadCacheHeaders(res);
    return res.send(projects);
  }

  const projects = await loadActiveProjects();
  res.send(projects);
};

export default withCors(handler);
