import { Button } from '@/components/ui/button';
import { MdRefresh } from 'react-icons/md';
import {
  ZoomInIcon,
  ZoomOutIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from 'lucide-react';

export type ZoomControlsProps = {
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPanLeft: () => void;
  onPanRight: () => void;
  disabledZoomIn: boolean;
  disabledZoomOut: boolean;
  disabledPanLeft: boolean;
  disabledPanRight: boolean;
};

const ZoomControls = ({
  onReset,
  onZoomIn,
  onZoomOut,
  onPanLeft,
  onPanRight,
  disabledZoomIn,
  disabledZoomOut,
  disabledPanLeft,
  disabledPanRight,
}: ZoomControlsProps) => (
  <div className="my-2 flex justify-end sm:mb-4">
    <Button
      variant="ghost"
      size="icon"
      onClick={onReset}
      disabled={disabledZoomIn}
      className="h-6 w-6 text-xs sm:text-sm"
    >
      <MdRefresh className="h-2 w-2" />
    </Button>
    <Button
      size="icon"
      className="h-6 w-6 text-xs sm:text-sm"
      variant="ghost"
      onClick={onZoomIn}
      disabled={disabledZoomIn}
    >
      <ZoomInIcon className="h-2 w-2" />
    </Button>
    <Button
      size="icon"
      className="h-6 w-6 text-xs sm:text-sm"
      variant="ghost"
      onClick={onZoomOut}
      disabled={disabledZoomOut}
    >
      <ZoomOutIcon className="h-2 w-2" />
    </Button>
    <Button
      size="icon"
      className="h-6 w-6 text-xs sm:text-sm"
      variant="ghost"
      onClick={onPanLeft}
      disabled={disabledPanLeft}
    >
      <ArrowLeftIcon className="h-2 w-2" />
    </Button>
    <Button
      size="icon"
      className="h-6 w-6 text-xs sm:text-sm"
      variant="ghost"
      onClick={onPanRight}
      disabled={disabledPanRight}
    >
      <ArrowRightIcon className="h-2 w-2" />
    </Button>
  </div>
);

export default ZoomControls;
