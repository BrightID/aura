import { Outlet } from 'react-router';
import '@/routes/_panel/styles.css';

export default function LoginLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-background px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-[8%] h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-24 right-[8%] h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
      </div>
      <Outlet />
    </div>
  );
}
