/**
 * The candlestick renderer's aggregation and placement rules: OHLC per bucket, bucket boundaries
 * keyed by absolute tick index (offset), per-candle up/down coloring, right-edge clamping, and the
 * per-candle (not per-pixel) fade. Assertions parse the emitted SVG markup - the recipe this
 * container allows in place of a browser.
 */
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Candlesticks } from "../../../src/ui/React/Candlesticks";
import { sparklineGeometry } from "../../../src/ui/React/Sparkline";

/** Every `<tag ...>` occurrence in `markup`, as one attribute record per element. */
function elements(markup: string, tag: string): Record<string, string>[] {
  const out: Record<string, string>[] = [];
  for (const match of markup.matchAll(new RegExp(`<${tag} ([^>]*?)/?>`, "g"))) {
    const attrs: Record<string, string> = {};
    for (const attr of match[1].matchAll(/([\w-]+)="([^"]*)"/g)) attrs[attr[1]] = attr[2];
    out.push(attrs);
  }
  return out;
}

// 12 ticks at offset 3 with interval 5 span absolute indices 3..14, i.e. buckets [3,4] [5..9]
// [10..14]: a 2-tick partial first candle, then two complete ones.
const data = [10, 12, 11, 14, 13, 9, 8, 15, 16, 12, 11, 20];
const interval = 5;
const offset = 3;
const capacity = 24;

function render(extra?: Partial<React.ComponentProps<typeof Candlesticks>>): string {
  return renderToStaticMarkup(
    <Candlesticks
      data={data}
      interval={interval}
      offset={offset}
      capacity={capacity}
      upColor="UP"
      downColor="DOWN"
      {...extra}
    />,
  );
}

describe("Candlesticks", () => {
  it("renders nothing for series it cannot draw meaningfully", () => {
    expect(renderToStaticMarkup(<Candlesticks data={[]} interval={5} />)).toBe("");
    expect(renderToStaticMarkup(<Candlesticks data={[5]} interval={5} />)).toBe("");
    expect(renderToStaticMarkup(<Candlesticks data={[1, NaN, 3]} interval={5} />)).toBe("");
  });

  it("buckets by absolute tick index, so the offset shifts the boundaries", () => {
    // Offset 3: ticks 0,1 complete bucket [3,4]; the first candle covers 2 ticks.
    // Offset 0: ticks 0..4 form bucket [0..4]; the first candle covers 5 ticks and is wider.
    const withOffset = elements(render(), "rect");
    const withoutOffset = elements(render({ offset: 0 }), "rect");
    expect(withOffset).toHaveLength(3);
    expect(withoutOffset).toHaveLength(3);
    expect(Number(withOffset[0].width)).toBeLessThan(Number(withoutOffset[0].width));
  });

  it("computes OHLC per bucket and colors each candle by its own direction", () => {
    // [10,12] rises; [11,14,13,9,8] opens 11 closes 8; [15,16,12,11,20] opens 15 closes 20.
    const fills = elements(render(), "rect").map((rect) => rect.fill);
    expect(fills).toEqual(["UP", "DOWN", "UP"]);

    // Wick ends sit at the bucket's high and low on the shared vertical scale.
    const { yOf } = sparklineGeometry(data, capacity);
    const wicks = elements(render(), "line");
    expect(Number(wicks[1].y1)).toBeCloseTo(yOf(14));
    expect(Number(wicks[1].y2)).toBeCloseTo(yOf(8));
    // Body spans open to close, top edge first.
    const bodies = elements(render(), "rect");
    expect(Number(bodies[1].y)).toBeCloseTo(yOf(11));
    expect(Number(bodies[1].y) + Number(bodies[1].height)).toBeCloseTo(yOf(8));
  });

  it("keeps the newest candle inside the right edge", () => {
    for (const rect of elements(render(), "rect")) {
      expect(Number(rect.x) + Number(rect.width)).toBeLessThanOrEqual(1000 + 1e-6);
    }
  });

  it("fades per candle - uniform within each body, no gradients, newest at full strength", () => {
    const html = render({ fadeIn: 0.5 });
    expect(html).not.toContain("linearGradient");
    const opacities = elements(html, "g").map((group) => Number(group.opacity));
    expect(opacities).toHaveLength(3);
    // Monotonically stronger toward the newest candle, which is fully opaque.
    expect(opacities[0]).toBeLessThan(opacities[1]);
    expect(opacities[1]).toBeLessThanOrEqual(opacities[2]);
    expect(opacities[2]).toBe(1);
  });

  it("treats a nonsense interval as one tick per candle", () => {
    const rects = elements(render({ interval: 0, offset: 0 }), "rect");
    expect(rects).toHaveLength(data.length);
  });

  it("marks the hovered tick with a rule dimmed like its candle", () => {
    const { xOf } = sparklineGeometry(data, capacity);
    // Tick 4 falls in the middle (DOWN) bucket.
    const wicksAndRule = elements(render({ highlightIndex: 4 }), "line");
    const rule = wicksAndRule.find((line) => line["stroke-opacity"] !== undefined);
    expect(rule).toBeDefined();
    expect(Number(rule?.x1)).toBeCloseTo(xOf(4));
    expect(rule?.stroke).toBe("DOWN");
  });
});
