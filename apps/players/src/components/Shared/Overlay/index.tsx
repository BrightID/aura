import useCallbackOnRouteChange from 'hooks/useCallbackOnRouteChange';
import * as React from 'react';
import { FC } from 'react';

import { FadeIn } from '../../animations';

const Overlay: FC<{
  title?: string;
  className?: string;
  isOpen: boolean;
  noButtonPadding?: boolean;
  children: React.ReactNode;
  closeOverlayHandler?: () => void;
}> = ({
  title,
  children,
  isOpen,
  closeOverlayHandler,
  className,
  noButtonPadding,
}) => {
    useCallbackOnRouteChange(closeOverlayHandler);
    return (
      <>
        {isOpen && (
          <div
            className={`fixed z-[100] left-0 top-0 right-0 bottom-0 overflow-hidden backdrop-blur-[10px] bg-overlay-bg bg-opacity-50 flex items-start justify-center ${className}`}
            onClick={(_e) => closeOverlayHandler?.()}
            data-testid="overlay-wrapper"
          >
            <div
              className={`overlay-content max-w-[460px] w-full px-5 py-9 relative overflow-hidden -z-10 rounded-3xl`}
              onClick={(e) => e.stopPropagation()}
              data-testid="overlay-content"
            >
              <div className="overlay-header flex items-center mb-4">
                {title && (
                  <p className="text-white text-2xl font-bold">{title}</p>
                )}

                <FadeIn
                  className="cursor-pointer ml-auto"
                  delay={0.1}
                  duration={0.5}
                >
                  <img
                    onClick={closeOverlayHandler}
                    src="/assets/images/Shared/close-overlay-icon.svg"
                    alt={'X'}
                  />
                </FadeIn>
              </div>
              <div className="z-10 styled-scroll">{children}</div>
            </div>
          </div>
        )}
      </>
    );
  };

export default Overlay;
