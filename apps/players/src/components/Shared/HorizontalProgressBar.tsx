export const HorizontalProgressBar = ({
  percentage = 20,
  isWidthFull = false,
  className = '',
  ...props
}: {
  percentage: number;
  isWidthFull?: boolean;
  className?: string;
}) => {
  return (
    <div
      className={`relative bg-gray70 dark:bg-gray20 rounded-sm h-2.5 ${isWidthFull ? 'w-full' : 'w-24'
        } ${className}`}
    >
      <div
        {...props}
        style={{
          width: `${percentage}%`,
        }}
        className={`absolute bg-green10 rounded-sm h-full`}
      ></div>
    </div>
  );
};
