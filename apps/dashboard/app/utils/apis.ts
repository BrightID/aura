import type { Project } from '~/components/projects-table';
import { API_BASE_URL } from '~/constants';
import { auth } from '~/lib/firebase';

export async function getAuthHeaders() {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Not authenticated');
  return { authorization: `Bearer ${token}` };
}

export async function getUserProjects() {
  const res = await fetch(`${API_BASE_URL}/api/projects/list`, {
    headers: await getAuthHeaders(),
  });

  if (!res.ok) throw new Error('Failed');
  const json = await res.json();
  return json.projects as Project[];
}
