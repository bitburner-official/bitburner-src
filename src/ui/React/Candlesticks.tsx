import React from "react";
import { Settings } from "../../Settings/Settings";
import { sparklineGeometry } from "./Sparkline";

/**
 * Fraction of a candle's slot left empty on each side, so neighboring bodies do not touch. A share
 * of the slot rather than a fixed distance: slots stretch with the container, and a fixed gap would
 * disappear on wide panels and eat narrow candles whole.
 */
const candleGapFraction = 0.15;
/** A doji's body would be zero-tall; give it a hairline so the open/close level still shows. */
const minBodyHeight = 1;
/** Thin against the body, per convention, but thick enough to survive the panel's own opacity. */
const wickStrokeWidth = 1.5;

interface Candle {
  /** Array indices of the first and last tick this candle covers. */
  firstIndex: number;
  lastIndex: number;
  open: number;
  close: number;
  high: number;
  low: number;
}

/**
 * Groups raw ticks into open/high/low/close candles of `interval` ticks each. Buckets are keyed by
 * absolute tick index (`offset` + array position), not array position, so a candle's window is fixed
 * in time: candles march left rigidly as ticks age out and a new one forms at the right edge,
 * instead of every window shifting by one tick per update. The newest candle is usually partial
 * (still forming) and the oldest may be too (its early ticks already dropped).
 */
function aggregate(data: readonly number[], interval: number, offset: number): Candle[] {
  const candles: Candle[] = [];
  for (let i = 0; i < data.length; i++) {
    const price = data[i];
    const last = candles[candles.length - 1];
    if (
      last !== undefined &&
      Math.floor((offset + i) / interval) === Math.floor((offset + last.firstIndex) / interval)
    ) {
      last.lastIndex = i;
      last.close = price;
      last.high = Math.max(last.high, price);
      last.low = Math.min(last.low, price);
    } else {
      candles.push({ firstIndex: i, lastIndex: i, open: price, close: price, high: price, low: price });
    }
  }
  return candles;
}

interface CandlesticksProps {
  /** Raw per-tick series to aggregate and plot, oldest first. */
  data: readonly number[];
  /** Ticks per candle. */
  interval: number;
  /** Number of ticks the full width represents, exactly as {@link Sparkline}'s capacity. */
  capacity?: number;
  /** Absolute index of `data[0]` - how many older ticks have been dropped. Anchors candle windows. */
  offset?: number;
  /** For candles that closed at or above their open. Defaults to the theme's success color. */
  upColor?: string;
  /** For candles that closed below their open. Defaults to the theme's error color. */
  downColor?: string;
  /**
   * As {@link Sparkline}'s fadeIn: fraction of the width over which the oldest end ramps in. Unlike
   * the line's gradient, the ramp is sampled once per candle, at its center - a gradient across a
   * filled body shows up as a smear inside the mark, where on a thin line it reads as a fade.
   */
  fadeIn?: number;
  /** Tick index (not candle index) to mark with a vertical rule, for a hover readout. */
  highlightIndex?: number;
}

/**
 * Candlestick chart over the same coordinate space as {@link Sparkline}: fills its container,
 * fixed right-anchored time axis, memoized with `data` compared by reference. It takes the raw
 * per-tick series and aggregates internally, so call sites swap renderers without reshaping data -
 * and so the aggregation reruns only when `data` is actually replaced, not on every render the memo
 * absorbs.
 *
 * Candles are colored individually by their own close-vs-open direction. That is the mark's meaning
 * - unlike the line, whose single color had to come from somewhere and comes from the forecast.
 */
function CandlesticksInner({
  data,
  interval,
  capacity,
  offset = 0,
  upColor,
  downColor,
  fadeIn = 0,
  highlightIndex,
}: CandlesticksProps): React.ReactElement | null {
  // Same bail-out as Sparkline: nothing meaningful to draw.
  if (data.length < 2 || !data.every((value) => Number.isFinite(value))) return null;

  const up = upColor ?? Settings.theme.success;
  const down = downColor ?? Settings.theme.error;
  const { xOf, yOf, step, viewWidth, viewHeight } = sparklineGeometry(data, capacity);
  const ticksPerCandle = Math.max(1, Math.floor(interval));
  const candles = aggregate(data, ticksPerCandle, offset);
  const colorOf = (candle: Candle): string => (candle.close >= candle.open ? up : down);

  // The same ramp Sparkline's gradient describes - 0 at the series' start, 1 at fadeIn of the way
  // to the right edge - evaluated at a single x.
  const fadeSpan = fadeIn > 0 ? Math.min(fadeIn, 1) * (viewWidth - xOf(0)) : 0;
  const opacityAt = (x: number): number => (fadeSpan <= 0 ? 1 : Math.min(1, Math.max(0, (x - xOf(0)) / fadeSpan)));

  const highlighted = highlightIndex !== undefined && highlightIndex >= 0 && highlightIndex < data.length;
  const highlightedCandle = highlighted
    ? candles.find((candle) => highlightIndex >= candle.firstIndex && highlightIndex <= candle.lastIndex)
    : undefined;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      {highlightedCandle !== undefined && highlightIndex !== undefined && (
        // The cursor rule, dimmed like the candle it crosses, so it fades out along with the marks
        // it points at - the candle equivalent of the line's gradient-painted cursor.
        <line
          x1={xOf(highlightIndex)}
          y1={0}
          x2={xOf(highlightIndex)}
          y2={viewHeight}
          stroke={colorOf(highlightedCandle)}
          strokeOpacity={0.5 * opacityAt(xOf(highlightIndex))}
          vectorEffect="non-scaling-stroke"
        />
      )}
      {candles.map((candle) => {
        // A candle's slot spans its ticks plus the half-step each end tick owns, clamped to the
        // chart. Partial candles (forming at the right, aging out at the left) simply have fewer
        // ticks and draw narrower - the forming candle visibly grows into its slot.
        const slotLeft = Math.max(0, xOf(candle.firstIndex) - step / 2);
        const slotRight = Math.min(viewWidth, xOf(candle.lastIndex) + step / 2);
        const inset = (slotRight - slotLeft) * candleGapFraction;
        const bodyTop = Math.min(yOf(candle.open), yOf(candle.close));
        const bodyHeight = Math.max(minBodyHeight, Math.abs(yOf(candle.open) - yOf(candle.close)));
        const color = colorOf(candle);
        const centerX = (slotLeft + slotRight) / 2;
        // The bucket number: stable for a candle's whole lifetime, unlike its first retained tick.
        const key = Math.floor((offset + candle.firstIndex) / ticksPerCandle);
        return (
          <g key={key} opacity={opacityAt(centerX)}>
            <line
              x1={centerX}
              y1={yOf(candle.high)}
              x2={centerX}
              y2={yOf(candle.low)}
              stroke={color}
              strokeWidth={wickStrokeWidth}
              vectorEffect="non-scaling-stroke"
            />
            <rect
              x={slotLeft + inset}
              y={bodyTop}
              width={slotRight - slotLeft - 2 * inset}
              height={bodyHeight}
              fill={color}
            />
          </g>
        );
      })}
    </svg>
  );
}

export const Candlesticks = React.memo(CandlesticksInner);
