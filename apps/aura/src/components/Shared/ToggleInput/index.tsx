import Tooltip from 'components/Shared/Tooltip';
import { FaLock } from 'react-icons/fa';

export const ToggleInput = ({
  option1,
  option2,
  isChecked,
  setIsChecked,
  option2Disabled = false,
  disabledHelpText = '',
  tooltipFirstTab,
  tooltipSecondTab,
}: {
  option1: string;
  option2: string;
  isChecked: boolean;
  setIsChecked: (isChecked: boolean) => void;
  option2Disabled?: boolean;
  disabledHelpText?: string;
  tooltipFirstTab?: string;
  tooltipSecondTab?: string;
}) => {
  return (
    <div className="min-h-[52px] w-full rounded-lg border bg-card/90 px-1.5 py-1.5 dark:bg-dark-primary">
      <div className="relative flex h-10 flex-wrap overflow-hidden">
        {/* Background Toggle Effect */}
        <p
          className={`absolute bottom-0 top-0 w-1/2 rounded-md bg-button-primary transition-all duration-300 ease-in-out dark:bg-foreground ${
            isChecked ? 'left-0 right-1/2' : 'left-1/2 right-0'
          }`}
        ></p>

        {/* First Tab */}
        <Tooltip
          tooltipClassName="font-normal"
          content={tooltipFirstTab ?? option1}
          className={`z-10 flex w-1/2 cursor-pointer items-center justify-center bg-transparent transition-all duration-300 ease-in-out ${
            isChecked
              ? 'font-bold text-primary text-white dark:text-black'
              : 'font-medium text-black dark:text-white'
          }`}
          onClick={() => setIsChecked(true)}
          data-testid="table-view-switch-option-one"
        >
          {option1}
        </Tooltip>

        {/* Second Tab */}
        {option2Disabled ? (
          <Tooltip
            className={`z-10 flex h-full w-1/2 cursor-pointer items-center justify-center bg-transparent transition-all duration-300 ease-in-out ${
              isChecked
                ? 'font-medium text-black dark:text-white'
                : 'font-bold text-white dark:text-black'
            } cursor-not-allowed text-black opacity-60 dark:text-gray50`}
            data-testid="table-view-switch-option-two"
            content={disabledHelpText}
          >
            {option2Disabled && <FaLock className="mr-1" />}
            {option2}
          </Tooltip>
        ) : (
          <Tooltip
            tooltipClassName="font-normal"
            content={tooltipSecondTab ?? option2}
            className={`z-10 flex h-full w-1/2 cursor-pointer items-center justify-center bg-transparent transition-all duration-300 ease-in-out ${
              isChecked
                ? 'font-medium text-black dark:text-white'
                : 'font-bold text-white dark:text-black'
            }`}
            onClick={() => setIsChecked(false)}
            data-testid="table-view-switch-option-two"
          >
            {option2Disabled && <FaLock className="mr-1" />}
            {option2}
          </Tooltip>
        )}
      </div>
    </div>
  );
};
