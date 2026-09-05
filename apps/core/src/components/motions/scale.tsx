import type { ParentProps } from 'solid-js';
import { Motion } from 'solid-motionone';

export interface ScaleProps extends ParentProps {
  delay: number;
}

export default function Scale({ children, delay }: ScaleProps) {
  return (
    <Motion.div
      animate={{ scale: [0, 1] }}
      transition={{ duration: 0.5, easing: 'ease-in-out', delay }}
    >
      {children}
    </Motion.div>
  );
}
