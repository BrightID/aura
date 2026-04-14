import { motion, useAnimation } from 'framer-motion';
import { FC, ReactNode, useEffect } from 'react';

export const MoveUpIn: FC<{
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  y_end?: string | number;
}> = ({ delay, duration, children, className, y, y_end }) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: y_end || 0,
      transition: {
        duration: duration || 0.5,
        delay: delay || 0,
        ease: 'easeInOut',
      },
    });
  }, [controls, delay, duration, y_end]);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: y || 100 }}
      exit={{ opacity: 0, y: y_end || 100, transition: { duration: 0.1 } }}
      animate={controls}
    >
      {children}
    </motion.div>
  );
};

export const MoveRightIn: FC<{
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}> = ({ delay, duration, children, className }) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      opacity: 1,
      x: 0,
      transition: { duration: duration || 0.5, delay: delay || 0.3 },
    });
  }, [controls, delay, duration]);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: 50 }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.1 } }}
      animate={controls}
    >
      {children}
    </motion.div>
  );
};

export const MoveX: FC<{
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  opacity: number;
  x: number;
}> = ({ delay, duration, children, opacity, className, x }) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      opacity: 1,
      x: 0,
      transition: { duration: duration || 0.3, delay: delay || 0 },
    });
  }, [controls, delay, duration]);

  return (
    <motion.div
      className={className}
      initial={{ opacity, x }}
      exit={{ opacity: 1, x: -1 * x, transition: { duration: 0.1 } }}
      animate={controls}
    >
      {children}
    </motion.div>
  );
};

export const FadeIn: FC<{
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}> = ({ delay, duration, children, className }) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      opacity: 1,
      transition: { duration: duration || 0.5, delay: delay || 0 },
    });
  }, [controls, delay, duration]);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      animate={controls}
    >
      {children}
    </motion.div>
  );
};

export const SwingIn: FC<{
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}> = ({ delay, duration, children, className }) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      scaleX: [1, -1, 1],
      transition: { duration: duration || 0.5, delay: delay || 0 },
    });
  }, [controls, delay, duration]);

  return (
    <motion.div
      className={className}
      initial={{ scaleX: 1 }}
      exit={{ scaleX: 0, transition: { duration: 0.3 } }}
      animate={controls}
    >
      {children}
    </motion.div>
  );
};

export const Scale: FC<{
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  scale?: number;
}> = ({ delay, duration, children, className, scale }) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      opacity: 1,
      scale: 1,
      transition: { duration: duration || 0.3, delay: delay || 0 },
    });
  }, [controls, delay, duration]);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: scale || 0 }}
      exit={{ opacity: 0, scale: scale || 0, transition: { duration: 0.1 } }}
      animate={controls}
    >
      {children}
    </motion.div>
  );
};

export const BookOpen: FC<{
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  size?: number;
  orientation?: 'horizontal' | 'vertical';
}> = ({ delay, duration, children, orientation, size, className }) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start(
      orientation === 'vertical'
        ? {
            height: size || 'auto',
            transition: { duration: duration || 0.3, delay: delay || 0 },
          }
        : {
            width: size || 'auto',
            transition: { duration: duration || 0.3, delay: delay || 0 },
          },
    );
  }, [controls, delay, duration, orientation, size]);

  return (
    <motion.div
      className={className}
      initial={orientation === 'vertical' ? { height: 0 } : { width: 0 }}
      exit={
        orientation === 'vertical'
          ? { height: 0, transition: { duration: 0.1 } }
          : { width: 0, transition: { duration: 0.1 } }
      }
      animate={controls}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedText: FC<{
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  startSize?: number;
  endSize?: number;
  startWeight?: number;
  endWeight?: number;
  startOpacity?: number;
  endOpacity?: number;
  startColor?: string;
  endColor?: string;
}> = ({
  delay,
  duration,
  children,
  className,
  startSize,
  endSize,
  startWeight,
  endWeight,
  startOpacity,
  endOpacity,
  startColor,
  endColor,
}) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      fontWeight: endWeight,
      fontSize: endSize + 'px' || 'inherit',
      opacity: endOpacity || 1,
      color: endColor,
      transition: { duration: duration || 0.3, delay: delay || 0 },
    });
  }, [controls, delay, duration, endColor, endOpacity, endSize, endWeight]);

  return (
    <motion.p
      className={className}
      initial={{
        opacity: startOpacity || 1,
        fontWeight: startWeight,
        color: startColor,
        fontSize: startSize + 'px' || 'inherit',
      }}
      animate={controls}
    >
      {children}
    </motion.p>
  );
};

export const Transition: FC<{
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  startX?: number;
  endX?: number;
  startY?: number;
  endY?: number;
}> = ({ delay, duration, children, className, startX, endX, startY, endY }) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      x: endX || 0,
      y: endY || 0,
      transition: { duration: duration || 0.3, delay: delay || 0 },
    });
  }, [controls, delay, duration, endX, endY]);

  return (
    <motion.div
      className={className}
      initial={{ x: startX || 0, y: startY || 0 }}
      animate={controls}
    >
      {children}
    </motion.div>
  );
};
