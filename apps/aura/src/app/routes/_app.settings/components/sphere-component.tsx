import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

export default function SphereComponent({ className }: { className?: string }) {
  const sphereWrapper = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let sphere: any;
    let initialized = false;
    let isMounted = true;

    import('@/components/Shared/shaders/shpere').then(({ Sphere }) => {
      if (!sphereWrapper.current || initialized || !isMounted) return;
      sphereWrapper.current.innerHTML = '';

      initialized = true;
      sphere = new Sphere(sphereWrapper.current);
    });

    return () => {
      isMounted = false;
      sphere?.destroy();
    };
  }, []);

  return (
    <div
      ref={sphereWrapper}
      className={cn('mx-auto h-20 w-20', className)}
    ></div>
  );
}
