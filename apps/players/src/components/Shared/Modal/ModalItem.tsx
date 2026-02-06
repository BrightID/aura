import * as React from 'react';

export interface ModalItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon?: React.ReactNode;
  isSelected: boolean;
}

export const ModalItem = ({
  title,
  icon,
  isSelected,
  className,
  onClick,
  ...props
}: ModalItemProps) => {
  return (
    <div
      className={`flex min-w-[30%] items-center justify-center gap-3 rounded px-3 py-2.5 ${
        onClick ? 'cursor-pointer' : ''
      } ${
        isSelected
          ? 'bg-pastel-purple dark:bg-primary-d1'
          : 'bg-gray30 dark:bg-button-primary'
      } ${className ? className : ''} `}
      onClick={onClick}
      {...props}
    >
      {icon}
      <p
        className={`text-sm ${
          isSelected
            ? 'font-bold text-black'
            : 'font-medium text-black2 dark:text-gray-100'
        }`}
      >
        {title}
      </p>
    </div>
  );
};
