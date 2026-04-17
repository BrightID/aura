import useCallbackOnRouteChange from 'hooks/useCallbackOnRouteChange';
import * as React from 'react';
import { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const Modal: FC<{
  title?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isOpen: boolean;
  noButtonPadding?: boolean;
  children: React.ReactNode;
  closeModalHandler?: () => void;
}> = ({ title, children, isOpen, closeModalHandler, className, noButtonPadding }) => {
  useCallbackOnRouteChange(closeModalHandler);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && closeModalHandler?.()}
    >
      <DialogContent
        data-testid="modal-content"
        className={[noButtonPadding ? 'pb-0' : '', className ?? ''].join(' ').trim()}
      >
        <DialogHeader data-testid="modal-wrapper">
          <DialogTitle>{title ?? ''}</DialogTitle>
        </DialogHeader>
        <div className="mt-3 w-full flex gap-2 overflow-y-auto max-h-[calc(100vh-100px)]">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
