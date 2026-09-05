import { Navigate } from '@solidjs/router';

/** /home → default view. */
export default function HomeIndex() {
  return <Navigate href="/home/player" />;
}
