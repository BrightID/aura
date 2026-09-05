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
      <a-button
        variant="ghost"
        size="icon-sm"
        data-testid="chart-zoom-reset"
        disabled={props.disabledZoomOut}
        onClick={() => props.onReset()}
      >
        <a-icon name="refresh-cw" label="Reset zoom" />
      </a-button>
      <a-button
        variant="ghost"
        size="icon-sm"
        data-testid="chart-zoom-in"
        disabled={props.disabledZoomIn}
        onClick={() => props.onZoomIn()}
      >
        <a-icon name="zoom-in" label="Zoom in" />
      </a-button>
      <a-button
        variant="ghost"
        size="icon-sm"
        data-testid="chart-zoom-out"
        disabled={props.disabledZoomOut}
        onClick={() => props.onZoomOut()}
      >
        <a-icon name="zoom-out" label="Zoom out" />
      </a-button>
      <a-button
        variant="ghost"
        size="icon-sm"
        data-testid="chart-pan-left"
        disabled={props.disabledPanLeft}
        onClick={() => props.onPanLeft()}
      >
        <a-icon name="arrow-left" label="Pan left" />
      </a-button>
      <a-button
        variant="ghost"
        size="icon-sm"
        data-testid="chart-pan-right"
        disabled={props.disabledPanRight}
        onClick={() => props.onPanRight()}
      >
        <a-icon name="arrow-right" label="Pan right" />
      </a-button>
    </div>
  );
}
