import React, { useRef } from "react";
import { Settings } from "../../Settings/Settings";

/**
 * Nominal viewBox. The SVG stretches to fill its container on both axes, so these are arbitrary
 * units rather than pixels - only their ratios to each other matter.
 */
const viewWidth = 1000;
const viewHeight = 100;
/** Keeps a stroke of any width from being clipped against the top and bottom edges. */
const verticalInset = 4;

interface SparklineProps {
  /** Series to plot, oldest first. Auto-normalized to fill the vertical space. */
  data: readonly number[];
  /**
   * Number of points the full width represents. The series is drawn against the right edge and
   * occupies only as much of the width as it has points for, so the horizontal scale stays fixed
   * while a series is still filling up rather than stretching a handful of points across the chart.
   * Defaults to the series' own length, which fills the width.
   */
  capacity?: number;
  /** Defaults to the active theme's primary color. */
  color?: string;
  /** In CSS pixels - unaffected by how far the container stretches the chart. */
  strokeWidth?: number;
  /**
   * Fraction of the width (0-1) over which the oldest end ramps from transparent to opaque. Use it
   * where the start of the series is only where recording began, not a real boundary in the data,
   * or to keep the line clear of content it is drawn behind.
   */
  fadeIn?: number;
  /** Index to mark with a vertical rule, for a hover readout. */
  highlightIndex?: number;
}

/**
 * Maps series indices and values onto the coordinates {@link Sparkline} draws at, so a caller
 * overlaying its own marks stays aligned with the line.
 */
export function sparklineGeometry(data: readonly number[], capacity = data.length) {
  const lastIndex = data.length - 1;
  const min = data.reduce((acc, value) => Math.min(acc, value), Infinity);
  const max = data.reduce((acc, value) => Math.max(acc, value), -Infinity);
  const span = max - min;
  // Never squeeze the series: a capacity smaller than the data just falls back to filling the width.
  const slots = Math.max(capacity, data.length);
  /** Horizontal distance between adjacent points. Fixed by capacity, not by how much data exists. */
  const step = slots <= 1 ? 0 : viewWidth / (slots - 1);

  // Anchored to the right edge, so the newest point is always in the same place and older points
  // march leftwards as they age.
  const xOf = (index: number): number => viewWidth - (lastIndex - index) * step;
  // A flat series has no span to normalize against, so center it instead of dividing by zero.
  const yOf = (value: number): number =>
    span === 0
      ? viewHeight / 2
      : viewHeight - verticalInset - ((value - min) / span) * (viewHeight - 2 * verticalInset);
  /**
   * Series index nearest a horizontal position given as a 0-1 fraction of the rendered width.
   * Taking a fraction rather than a pixel offset keeps callers independent of how wide the
   * container happens to be. Positions left of the series clamp to its oldest point.
   */
  const indexAtFraction = (fraction: number): number =>
    step === 0
      ? 0
      : Math.min(lastIndex, Math.max(0, Math.round(lastIndex - (viewWidth - fraction * viewWidth) / step)));

  // viewWidth/viewHeight/step are exposed so a caller drawing marks of its own (in its own svg with
  // the same viewBox) knows the coordinate space the mapping functions return positions in.
  return { xOf, yOf, indexAtFraction, min, max, step, viewWidth, viewHeight };
}

// SVG gradients are referenced by document-wide id, and the Stock Market renders one sparkline per
// stock, so each instance needs an id of its own. React 17 has no useId.
let nextGradientId = 0;

/**
 * Minimal single-series line chart with no axes, grid or legend. Renders as inline SVG so it
 * inherits the active theme and needs no charting dependency.
 *
 * Fills its container on both axes, which lets it be laid out as a background behind other content;
 * give the container a size. The line is deliberately the only mark - end dots would be distorted
 * by the non-uniform stretch, and read as noise behind text anyway.
 *
 * Memoized: callers re-render far more often than their data changes, and `data` is compared by
 * reference, so pass a series that is replaced rather than mutated.
 */
function SparklineInner({
  data,
  capacity,
  color,
  strokeWidth = 2,
  fadeIn = 0,
  highlightIndex,
}: SparklineProps): React.ReactElement | null {
  const gradientId = useRef<string>();
  if (gradientId.current === undefined) gradientId.current = `sparkline-fade-${nextGradientId++}`;

  // Nothing meaningful to draw. Bail out rather than emit a polyline full of NaN.
  if (data.length < 2 || !data.every((value) => Number.isFinite(value))) return null;

  const stroke = color ?? Settings.theme.primary;
  const { xOf, yOf } = sparklineGeometry(data, capacity);
  const points = data.map((value, index) => `${xOf(index).toFixed(2)},${yOf(value).toFixed(2)}`).join(" ");
  const highlighted = highlightIndex !== undefined && highlightIndex >= 0 && highlightIndex < data.length;
  const strokePaint = fadeIn > 0 ? `url(#${gradientId.current})` : stroke;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      // The container decides both dimensions, so the drawing is stretched to match rather than
      // letterboxed. `non-scaling-stroke` below keeps that stretch off the line weight.
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      {fadeIn > 0 && (
        <defs>
          {/* Spans the series rather than the viewBox, so the ramp stays a fixed share of the line
              even when a short series only occupies part of the width. */}
          <linearGradient
            id={gradientId.current}
            gradientUnits="userSpaceOnUse"
            x1={xOf(0)}
            y1={0}
            x2={viewWidth}
            y2={0}
          >
            <stop offset={0} stopColor={stroke} stopOpacity={0} />
            <stop offset={Math.min(fadeIn, 1)} stopColor={stroke} stopOpacity={1} />
          </linearGradient>
        </defs>
      )}
      {highlighted && (
        // Painted with the same gradient as the line. It runs horizontally, so a vertical rule
        // takes a single opacity from it - the one the line itself has at that x. The cursor then
        // fades out along with the part of the series it is pointing at, instead of staying solid
        // over a line that has faded to nothing.
        <line
          x1={xOf(highlightIndex)}
          y1={0}
          x2={xOf(highlightIndex)}
          y2={viewHeight}
          stroke={strokePaint}
          strokeOpacity={0.5}
          vectorEffect="non-scaling-stroke"
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={strokePaint}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export const Sparkline = React.memo(SparklineInner);
