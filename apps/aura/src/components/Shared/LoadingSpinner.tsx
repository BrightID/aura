// src/components/LoadingSpinner.tsx
import React from 'react';

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  spinnerClassName?: string;
}

const LoadingSpinner = ({
  spinnerClassName,
  className,
  ...props
}: LoadingSpinnerProps) => {
  return (
    <div className={`flex justify-center items-center ${className}`} {...props}>
      <div
        className={`animate-spin-slow w-full h-full rounded-full border-2 border-gray-300 border-t-transparent ${spinnerClassName}`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
