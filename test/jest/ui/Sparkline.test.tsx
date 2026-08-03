/**
 * The geometry contract every stock chart renderer draws against, plus Sparkline's own bail-outs.
 * Coordinates are asserted from the math, not from the component, so a regression in the geometry
 * cannot hide behind a matching regression in the renderer.
 */
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Sparkline, sparklineGeometry } from "../../../src/ui/React/Sparkline";

// The nominal viewBox the geometry maps into. Restated here so a change to the coordinate space
// fails loudly instead of silently rescaling every assertion below.
const viewWidth = 1000;
const viewHeight = 100;
const verticalInset = 4;

describe("sparklineGeometry", () => {
  it("exposes the coordinate space it maps into", () => {
    const geometry = sparklineGeometry([1, 2]);
    expect(geometry.viewWidth).toBe(viewWidth);
    expect(geometry.viewHeight).toBe(viewHeight);
  });

  it("anchors a short series to the right edge on a fixed time axis", () => {
    // 3 points against a 10-point axis: the newest sits on the right edge, the others one fixed
    // step apart, and the left ~three quarters of the width stays empty.
    const { xOf, step } = sparklineGeometry([10, 20, 30], 10);
    expect(step).toBeCloseTo(viewWidth / 9);
    expect(xOf(2)).toBe(viewWidth);
    expect(xOf(1)).toBeCloseTo(viewWidth - viewWidth / 9);
    expect(xOf(0)).toBeCloseTo(viewWidth - 2 * (viewWidth / 9));
  });

  it("falls back to filling the width when the series outgrows its capacity", () => {
    // 5 points on a 3-point axis must not be squeezed: the axis widens to fit them.
    const { xOf, step } = sparklineGeometry([1, 2, 3, 4, 5], 3);
    expect(step).toBeCloseTo(viewWidth / 4);
    expect(xOf(0)).toBeCloseTo(0);
    expect(xOf(4)).toBe(viewWidth);
  });

  it("normalizes values into the inset vertical range", () => {
    const { yOf } = sparklineGeometry([10, 20, 30]);
    expect(yOf(10)).toBeCloseTo(viewHeight - verticalInset); // min at the bottom
    expect(yOf(30)).toBeCloseTo(verticalInset); // max at the top
    expect(yOf(20)).toBeCloseTo(viewHeight / 2);
  });

  it("centers a flat series instead of dividing by zero", () => {
    const { yOf, min, max } = sparklineGeometry([7, 7, 7]);
    expect(min).toBe(7);
    expect(max).toBe(7);
    expect(yOf(7)).toBe(viewHeight / 2);
  });

  it("clamps indexAtFraction at both ends", () => {
    const { indexAtFraction, xOf } = sparklineGeometry([10, 20, 30], 10);
    // Left of where the series starts: clamps to the oldest point rather than going negative.
    expect(indexAtFraction(0)).toBe(0);
    // Right edge: the newest point, never past it.
    expect(indexAtFraction(1)).toBe(2);
    // On a point exactly: that point.
    expect(indexAtFraction(xOf(1) / viewWidth)).toBe(1);
  });

  it("maps fractions to the nearest index when the series fills the width", () => {
    const { indexAtFraction } = sparklineGeometry([1, 2, 3, 4, 5]);
    expect(indexAtFraction(0)).toBe(0);
    expect(indexAtFraction(0.5)).toBe(2);
    expect(indexAtFraction(1)).toBe(4);
  });

  it("degrades to a single right-anchored point without NaN", () => {
    const { xOf, yOf, indexAtFraction, step } = sparklineGeometry([5]);
    expect(step).toBe(0);
    expect(xOf(0)).toBe(viewWidth);
    expect(yOf(5)).toBe(viewHeight / 2);
    expect(indexAtFraction(0.37)).toBe(0);
  });
});

describe("Sparkline", () => {
  it("renders nothing for series it cannot draw meaningfully", () => {
    expect(renderToStaticMarkup(<Sparkline data={[]} />)).toBe("");
    expect(renderToStaticMarkup(<Sparkline data={[5]} />)).toBe("");
    expect(renderToStaticMarkup(<Sparkline data={[1, NaN, 3]} />)).toBe("");
    expect(renderToStaticMarkup(<Sparkline data={[1, Infinity]} />)).toBe("");
  });

  it("draws the series at the geometry's coordinates", () => {
    const data = [10, 30];
    const { xOf, yOf } = sparklineGeometry(data, 4);
    const html = renderToStaticMarkup(<Sparkline data={data} capacity={4} color="LINE" />);
    const expectedPoints = data.map((value, index) => `${xOf(index).toFixed(2)},${yOf(value).toFixed(2)}`).join(" ");
    expect(html).toContain(`points="${expectedPoints}"`);
    expect(html).toContain('stroke="LINE"');
    expect(html).not.toContain("linearGradient");
  });

  it("paints through a gradient when fading in, including the hover cursor", () => {
    const data = [10, 20, 30];
    const { xOf } = sparklineGeometry(data);
    const html = renderToStaticMarkup(<Sparkline data={data} color="LINE" fadeIn={0.4} highlightIndex={1} />);
    expect(html).toContain("linearGradient");
    // Both the polyline and the cursor rule take the gradient paint, so they fade together.
    expect(html.match(/stroke="url\(#/g)).toHaveLength(2);
    expect(html).toContain(`x1="${xOf(1)}"`);
  });
});
