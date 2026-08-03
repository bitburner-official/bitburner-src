/**
 * Price history charts for a stock ticker.
 *
 * The two views are laid out differently on purpose. A collapsed row is dense, so its chart sits
 * *beside* the text in whatever space is left over and disappears when there is none. An expanded
 * panel is mostly empty, so its chart is drawn *behind* the content, costing no vertical space; what
 * keeps that line off the text is the fade, since the panel's text is left-aligned and a line that
 * ramps in from the left is faintest exactly where the text is.
 *
 * Both go through this module, so the marks a stock is drawn with (a line or candlesticks, per the
 * `StockChartType` setting) can change in one place.
 */
import React, { useEffect, useMemo, useState } from "react";

import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { Stock } from "../Stock";
import { getStockPriceHistory, getStockPriceHistoryOffset, getMaxPriceHistoryLength } from "../PriceHistory";
import { StockMarketConstants } from "../data/Constants";

import { Settings } from "../../Settings/Settings";
import { StockChartTypeSetting } from "../../Settings/SettingEnums";
import { Sparkline, sparklineGeometry } from "../../ui/React/Sparkline";
import { Candlesticks } from "../../ui/React/Candlesticks";
import { forecastLength, maxForecastLength } from "./StockTickerHeaderText";
import { useElementWidth } from "../../ui/React/hooks";
import { formatMoney } from "../../ui/formatNumber";

/** Whether both views draw candlesticks (per the `StockChartType` setting). */
function candleChartSelected(): boolean {
  return Settings.StockChartType === StockChartTypeSetting.Candlestick;
}
/**
 * Widest the candle chart's box gets, in px, anchored to the panel's right edge. The chart
 * stretches to its container, and where a stretched line is still a line, stretched candles become
 * huge slabs that walk left behind the panel's text. Capping the box keeps each candle at a
 * readable width and, on wide windows, keeps the whole chart out from behind the text. Candle view
 * only - the line keeps filling the panel.
 */
const maxCandleChartWidth = 800;
/**
 * Left-over panel width, in px, at which the candle chart is clear of the panel's text (the text
 * block is ~460px wide). Past that the fade is dropped: it exists to keep marks from fighting the
 * text, and when nothing is behind the text it only dims data.
 */
const candleTextClearance = 480;

/**
 * Span a collapsed row's chart covers. Shorter than the full buffer because a row is only tall
 * enough for a trend - the whole history at that height is mush.
 */
const collapsedPointCount = 60;

const rowChartHeight = "22px";
/**
 * A row's chart takes the space the header text leaves, up to this much of the row. Kept to a
 * narrow sliver: a row's line is a glance at the recent trend, and the wider it gets the more it
 * competes with the header text for the eye.
 */
const maxRowChartWidth = "12.5%";
/** Below this, the leftover space is too cramped for a line to say anything, so none is drawn. */
const minRowChartWidth = 60;
/** Nearly half the line: at this width the ramp is what keeps the older end from reading as clutter. */
const rowFadeIn = 0.48;
/**
 * Least space between the end of the header text and the start of the line, in characters of that
 * text. Padding rather than a margin on purpose: `useElementWidth` measures `contentRect`, which
 * excludes padding, so the gap never counts as room to draw in.
 */
const rowChartGapChars = 2;

/** How strongly the panel's line reads against the text drawn over it. */
const expandedOpacity = 0.55;
const expandedFadeIn = 0.4;
/**
 * Share of the fade ramp excluded from the hover-readout zone, in both views. Left of this point
 * the marks are mostly faded — a readout there describes data the eye can barely see, and in the
 * expanded panel that stretch is exactly where the foreground text sits, so hovering the text kept
 * popping a readout. The zone also never starts before the series itself does: while the buffer is
 * filling, the empty left of the fixed time axis reads out nothing.
 *
 * Raise this toward 1 to trim more of the fade, lower it toward 0 to trim less
 */
const fadeHoverTrim = 0.5;
/**
 * Extra air, in label lines, between the bottom of the panel's chart and the label beneath it. The
 * line is allowed behind the panel's text, where the fade keeps it faint, but not through the label
 * - that one is short, sits at the far end of the line where the fade has already gone, and reads
 * as struck through when the line crosses it.
 */
const labelClearanceGap = 0.25;
/**
 * Below this panel width, the corner label is given its own line instead of being tucked into the
 * bottom-right, where it would collide with the last line of the panel's text. An approximation:
 * the real threshold depends on how long that line's formatted numbers happen to be.
 */
const narrowPanelWidth = 560;
/** Gap between the widths at which the label switches layouts. See the effect that uses it. */
const narrowPanelHysteresis = 40;

/**
 * The line takes its color from the stock's forecast - the same signal the header reports as
 * `Price Forecast: ++`, computed the same way.
 *
 * Coloring by the window's own start-to-end direction was unstable: on a nearly flat series the
 * color flipped as soon as the first point aged out of the buffer, which is what made rows change
 * color for no visible reason.
 */
function forecastColor(stock: Stock): string {
  const bullish = stock.otlkMag < 0 ? !stock.b : stock.b;
  return bullish ? Settings.theme.success : Settings.theme.error;
}

/**
 * Elapsed time as `11m 54s`. Local rather than `convertTimeMsToTimeElapsedString`, which spells its
 * units out in full - too long for a readout that sits in a corner of the panel. That helper is
 * shared with other game systems, so it is not ours to shorten.
 *
 * Only minutes and seconds, because the history buffer is capped well under an hour.
 */
function formatElapsedShort(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes === 0 ? `${seconds}s` : `${minutes}m ${seconds}s`;
}

interface IProps {
  stock: Stock;
}

/**
 * Recent price history beside a collapsed ticker row. A glance: no labels, no cursor - just a
 * tooltip summarizing the window (its span and its low/high) for anyone who pauses on it.
 *
 * Sizing is left to flexbox - the box takes what the header text does not, up to its cap, and an
 * auto left margin keeps it against the right edge when the cap leaves slack. Measuring only
 * decides whether the room it ended up with is worth drawing in.
 */
export function StockPriceRowChart({ stock, hidden }: IProps & { hidden?: boolean }): React.ReactElement {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const history = getStockPriceHistory(stock.symbol);
  // Pad by however many characters of forecast this row happens to be short of the longest one, so
  // every row's chart is measured against the same amount of room and the list shows its lines all
  // together or not at all. Without this the decision is made per row against a leftover that
  // differs by the width of a `+`, which lands some rows either side of the cutoff at the window
  // widths where it bites. `ch` because the header is monospace, so a character is a fixed width.
  const gap = `${rowChartGapChars + maxForecastLength - forecastLength(stock)}ch`;
  // Slicing allocates, and the chart components compare `data` by reference to skip the ticker's
  // 5Hz re-render, so the window has to be as stable as the history it comes from.
  const window = useMemo(() => history.slice(-collapsedPointCount), [history]);
  const summary = useMemo(() => {
    if (window.length < 2 || !window.every((value) => Number.isFinite(value))) return "";
    const min = window.reduce((acc, value) => Math.min(acc, value), Infinity);
    const max = window.reduce((acc, value) => Math.max(acc, value), -Infinity);
    const span = formatElapsedShort((window.length - 1) * StockMarketConstants.msPerStockUpdate);
    return `Last ${span} - Low ${formatMoney(min)} - High ${formatMoney(max)}`;
  }, [window]);
  const hasRoom = width !== null && width >= minRowChartWidth;
  const showChart = hasRoom && !hidden && Settings.ShowStockChartInCollapsedRows;
  // The absolute index of window[0]: what the buffer has dropped, plus what the slice skipped.
  const offset = getStockPriceHistoryOffset(stock.symbol) + Math.max(0, history.length - window.length);
  // Share of the chart's width the tooltip responds over, anchored right: the drawn series minus
  // the mostly-faded start of its ramp (see fadeHoverTrim). The empty left of a still-filling axis
  // and the faded edge both stay inert.
  const hoverWidth = useMemo(() => {
    if (window.length < 2) return 0;
    const { xOf, viewWidth } = sparklineGeometry(window, collapsedPointCount);
    const seriesStart = xOf(0) / viewWidth;
    const hoverStart = seriesStart + fadeHoverTrim * rowFadeIn * (1 - seriesStart);
    return `${((1 - hoverStart) * 100).toFixed(1)}%`;
  }, [window]);

  // The box is kept even when nothing is drawn in it, so expanding a ticker does not shift the row
  // it was expanded from.
  return (
    <Box
      ref={ref}
      sx={{
        // Relies on content-box sizing (the project has no CssBaseline): the flex basis sizes the
        // *content* box, with the `ch` padding on top, which is what keeps every row's chart the
        // same width in both regimes (cap-limited when wide, leftover-limited when narrow). A
        // global `box-sizing: border-box` would silently break the list's all-or-none behavior.
        flex: `0 1 ${maxRowChartWidth}`,
        minWidth: 0,
        ml: "auto",
        mr: 2,
        pl: gap,
        height: rowChartHeight,
      }}
    >
      {showChart && (
        <Box sx={{ position: "relative", height: "100%" }}>
          {candleChartSelected() ? (
            <Candlesticks
              data={window}
              capacity={collapsedPointCount}
              interval={Settings.StockChartTicksPerCandle}
              offset={offset}
              fadeIn={rowFadeIn}
            />
          ) : (
            <Sparkline
              data={window}
              capacity={collapsedPointCount}
              color={forecastColor(stock)}
              strokeWidth={1.5}
              fadeIn={rowFadeIn}
            />
          )}
          <Tooltip title={summary}>
            <Box sx={{ position: "absolute", top: 0, bottom: 0, right: 0, width: hoverWidth }} />
          </Tooltip>
        </Box>
      )}
    </Box>
  );
}

interface IDetailProps extends IProps {
  /**
   * Rendered above the chart rather than over it. The trade controls are the one part of the panel
   * with enough visual weight to fight with a line behind them.
   */
  controls: React.ReactNode;
}

/**
 * Full price history behind an expanded ticker, with a hover readout.
 *
 * Takes the panel's content as children rather than rendering above it: the chart has to sit behind
 * that content, and hover has to be tracked across the whole panel, since the content covers the
 * chart even where it looks empty.
 */
export function StockPriceDetail({
  stock,
  controls,
  children,
}: React.PropsWithChildren<IDetailProps>): React.ReactElement {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const history = getStockPriceHistory(stock.symbol);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [labelInFlow, setLabelInFlow] = useState(false);

  useEffect(() => {
    if (width === null) return;
    // Hysteresis. Giving the label its own line changes the panel's height, which can add or remove
    // the page's scrollbar, which changes this width again - a loop that would otherwise flicker
    // between the two layouts. Switching at different widths in each direction settles it.
    setLabelInFlow((inFlow) => {
      if (width < narrowPanelWidth) return true;
      if (width > narrowPanelWidth + narrowPanelHysteresis) return false;
      return inFlow;
    });
  }, [width]);

  // Room kept for the label at the bottom of the panel. One line of it, whichever layout it is in:
  // in flow it is a row of its own down there, and absolute it is pinned to the same edge. Read at
  // render rather than at module load, since line height is a player setting.
  const labelClearance = `${Settings.styles.lineHeight + labelClearanceGap}em`;

  const candles = candleChartSelected();
  const capacity = getMaxPriceHistoryLength();
  const geometry = sparklineGeometry(history, capacity);
  const color = forecastColor(stock);
  const lastIndex = history.length - 1;
  const hasChart = history.length >= 2;
  const hovered = hoverIndex !== null && hoverIndex <= lastIndex ? hoverIndex : null;

  // The candle chart drops its fade once its capped box is clear of the panel's text (see
  // candleTextClearance); the line always fades, since it always runs behind the text.
  const chartFadeIn =
    candles && width !== null && width - maxCandleChartWidth >= candleTextClearance ? 0 : expandedFadeIn;
  // Where the hover readout starts responding, as a fraction of the chart's box: at the series
  // itself (the empty left of a still-filling axis reads out nothing), plus the mostly-faded start
  // of the ramp (see fadeHoverTrim) — which is also what keeps hovers over the foreground text from
  // popping the readout.
  const seriesStart = hasChart ? geometry.xOf(0) / geometry.viewWidth : 0;
  const hoverStart = seriesStart + fadeHoverTrim * chartFadeIn * (1 - seriesStart);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>): void {
    const bounds = event.currentTarget.getBoundingClientRect();
    // The candle chart's box may be narrower than the panel and right-anchored; the fraction has to
    // be taken over the box the chart actually draws in — a pointer left of that box, or left of
    // where the hover zone starts inside it, reads out nothing.
    const chartWidth = candles ? Math.min(bounds.width, maxCandleChartWidth) : bounds.width;
    const fraction = (event.clientX - (bounds.right - chartWidth)) / chartWidth;
    setHoverIndex(fraction < hoverStart ? null : geometry.indexAtFraction(fraction));
  }

  // The hover readout replaces the range rather than sitting beside it, so the line never reflows
  // and neither value is reachable only by hovering.
  const label =
    hovered === null
      ? `Low ${formatMoney(geometry.min)} - High ${formatMoney(geometry.max)}`
      : `${formatMoney(history[hovered])} - ${
          hovered === lastIndex
            ? "now"
            : `${formatElapsedShort((lastIndex - hovered) * StockMarketConstants.msPerStockUpdate)} ago`
        }`;

  return (
    <>
      {controls}
      <Box
        ref={ref}
        sx={{ position: "relative" }}
        onMouseMove={hasChart ? handleMouseMove : undefined}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {hasChart && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: labelClearance,
              zIndex: 0,
              pointerEvents: "none",
              opacity: expandedOpacity,
              // See maxCandleChartWidth. Until the panel has been measured, assume it is narrow.
              ...(candles ? { width: "100%", maxWidth: `${maxCandleChartWidth}px` } : { left: 0 }),
            }}
          >
            {candles ? (
              <Candlesticks
                data={history}
                capacity={capacity}
                interval={Settings.StockChartTicksPerCandle}
                offset={getStockPriceHistoryOffset(stock.symbol)}
                fadeIn={chartFadeIn}
                highlightIndex={hovered ?? undefined}
              />
            ) : (
              <Sparkline
                data={history}
                capacity={capacity}
                color={color}
                fadeIn={chartFadeIn}
                highlightIndex={hovered ?? undefined}
              />
            )}
          </Box>
        )}
        <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
        {hasChart && (
          <Typography
            sx={
              labelInFlow
                ? { textAlign: "right", position: "relative", zIndex: 1 }
                : { position: "absolute", right: 0, bottom: 0, zIndex: 1, pointerEvents: "none" }
            }
            // Fixed, not the line's color: the label is a readout, and having it change color on
            // hover reads as the value itself having changed meaning.
            color={Settings.theme.secondary}
          >
            {label}
          </Typography>
        )}
      </Box>
    </>
  );
}
