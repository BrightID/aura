import useCallbackOnRouteChange from 'hooks/useCallbackOnRouteChange';
import * as React from 'react';
import { FC } from 'react';
import { FaTimes } from 'react-icons/fa';

export const Modal: FC<{
  title?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isOpen: boolean;
  noButtonPadding?: boolean;
  children: React.ReactNode;
  closeModalHandler?: () => void;
}> = ({
  title,
  children,
  size,
  isOpen,
  closeModalHandler,
  className,
  noButtonPadding,
}) => {
  useCallbackOnRouteChange(closeModalHandler);
  return (
    <>
      {isOpen && (
        <div
          className={`fixed z-[100] bg-[#4F4F4F80] dark:bg-button-primary/10 left-0 top-0 w-full h-full overflow-hidden backdrop-blur-sm flex items-center justify-center bg-modal-backdrop ${className}`}
          onClick={(_e) => closeModalHandler?.()}
          data-testid="modal-wrapper"
        >
          <div
            className={`modal-content bg-card text-card-foreground max-w-[400px] w-[90%] px-5 pt-5 pb-5 relative max-h-screen overflow-auto styled-scroll -z-10 ${
              size === 'sm' ? '' : ''
            } ${noButtonPadding ? 'pb-0' : ''} rounded-3xl`}
            onClick={(e) => e.stopPropagation()}
            data-testid="modal-content"
          >
            <div className="modal-header flex justify-between items-center sticky top-0 z-20">
              <p className="font-bold">{title ?? ''}</p>

              <FaTimes
                className="cursor-pointer"
                width="15px"
                height="15px"
                onClick={closeModalHandler}
              />
            </div>
            <div className="scrollable-content mt-3 w-full flex gap-2 overflow-y-auto max-h-[calc(100vh-100px)]">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
