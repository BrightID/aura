import '@aura/ui';
import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import './app.css';
import { router } from './router';

let root: Root | undefined;

export function mount(el: HTMLElement) {
  root?.unmount();
  root = createRoot(el);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
  return () => {
    root?.unmount();
    root = undefined;
  };
}
