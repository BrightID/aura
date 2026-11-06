import Icon from '@/components/ui/icon';
/**
 * Zoom/pan controls for the evaluations chart — ported from the old aura
 * `ZoomControls`. The chart shows a sliding window over the bars; these
 * buttons narrow it (zoom in), widen it (zoom out), slide it (pan) or restore
 * the full range (reset).
 */
export default function ZoomControls(props: {
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPanLeft: () => void;
  onPanRight: () => void;
  disabledZoomIn: boolean;
  disabledZoomOut: boolean;
  disabledPanLeft: boolean;
  disabledPanRight: boolean;
}) {
  return (
    <div class="flex justify-end gap-0.5">
      <button
        class="a-button"
        type="button"
        data-variant="ghost"
        data-size="icon"
        data-testid="chart-zoom-reset"
        disabled={props.disabledZoomOut}
        onClick={() => props.onReset()}
      >
        <Icon name="refresh-cw" label="Reset zoom" />
      </button>
      <button
        class="a-button"
        type="button"
        data-variant="ghost"
        data-size="icon"
        data-testid="chart-zoom-in"
        disabled={props.disabledZoomIn}
        onClick={() => props.onZoomIn()}
      >
        <Icon name="zoom-in" label="Zoom in" />
      </button>
      <button
        class="a-button"
        type="button"
        data-variant="ghost"
        data-size="icon"
        data-testid="chart-zoom-out"
        disabled={props.disabledZoomOut}
        onClick={() => props.onZoomOut()}
      >
        <Icon name="zoom-out" label="Zoom out" />
      </button>
      <button
        class="a-button"
        type="button"
        data-variant="ghost"
        data-size="icon"
        data-testid="chart-pan-left"
        disabled={props.disabledPanLeft}
        onClick={() => props.onPanLeft()}
      >
        <Icon name="arrow-left" label="Pan left" />
      </button>
      <button
        class="a-button"
        type="button"
        data-variant="ghost"
        data-size="icon"
        data-testid="chart-pan-right"
        disabled={props.disabledPanRight}
        onClick={() => props.onPanRight()}
      >
        <Icon name="arrow-right" label="Pan right" />
      </button>
    </div>
  );
}
