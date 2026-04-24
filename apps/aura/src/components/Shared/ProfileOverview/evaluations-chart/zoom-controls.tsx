import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"
import { MdRefresh } from "react-icons/md"

export type ZoomControlsProps = {
  onReset: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onPanLeft: () => void
  onPanRight: () => void
  disabledZoomIn: boolean
  disabledZoomOut: boolean
  disabledPanLeft: boolean
  disabledPanRight: boolean
}

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
    <a-button
      variant="ghost"
      size="icon"
      onClick={onReset}
      disabled={disabledZoomIn}
      className="text-xs sm:text-sm"
    >
      <MdRefresh className="size-4" />
    </a-button>
    <a-button
      size="icon"
      className="text-xs sm:text-sm"
      variant="ghost"
      onClick={onZoomIn}
      disabled={disabledZoomIn}
    >
      <ZoomInIcon className="size-4" />
    </a-button>
    <a-button
      size="icon"
      className="text-xs sm:text-sm"
      variant="ghost"
      onClick={onZoomOut}
      disabled={disabledZoomOut}
    >
      <ZoomOutIcon className="size-4" />
    </a-button>
    <a-button
      size="icon"
      className="text-xs sm:text-sm"
      variant="ghost"
      onClick={onPanLeft}
      disabled={disabledPanLeft}
    >
      <ArrowLeftIcon className="size-4" />
    </a-button>
    <a-button
      size="icon"
      className="text-xs sm:text-sm"
      variant="ghost"
      onClick={onPanRight}
      disabled={disabledPanRight}
    >
      <ArrowRightIcon className="size-4" />
    </a-button>
  </div>
)

export default ZoomControls
