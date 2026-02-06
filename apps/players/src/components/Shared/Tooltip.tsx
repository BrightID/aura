import { FC, HTMLProps, PropsWithChildren, ReactNode, useState } from 'react';

const Tooltip: FC<
  PropsWithChildren &
  HTMLProps<HTMLDivElement> & {
    content?: ReactNode;
    tooltipClassName?: string;
    position?:
    | 'bottom'
    | 'top'
    | 'left'
    | 'right'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';
  }
> = ({
  children,
  content,
  position = 'top',
  className = '',
  tooltipClassName = '',
  ...rest
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const showTooltip = () => setIsVisible(true);
    const hideTooltip = () => setIsVisible(false);

    // Define position classes for tooltip placement
    const positionClasses = {
      top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
      'top-left': 'bottom-full right-full transform mr-2 mb-2',
      'top-right': 'bottom-full left-full transform ml-2 mb-2',
      'bottom-left': 'top-full right-full transform mr-2 mt-2',
      'bottom-right': 'top-full left-full transform ml-2 mt-2',
    };

    return (
      <div className={`relative inline-block ${className}`} {...rest}>
        <span onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
          {children}
        </span>
        <div
          className={`absolute z-10 whitespace-nowrap text-black bg-gray-200 dark:bg-gray-800 h-auto dark:text-white text-sm rounded px-2 py-1 shadow-lg transition-opacity duration-300 transform ${isVisible
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95 pointer-events-none'
            } ${positionClasses[position]} ${tooltipClassName}`}
        >
          {content}
        </div>
      </div>
    );
  };

export default Tooltip;
