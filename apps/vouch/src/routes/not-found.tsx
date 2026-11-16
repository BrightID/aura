import { Navigate } from '@solidjs/router';
import { useApp } from '@/app';

export default function NotFound() {
  return <Navigate href={useApp().href('/')} />;
}
