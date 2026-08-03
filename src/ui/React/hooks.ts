import { useCallback, useEffect, useRef, useState } from "react";
import { GameCycleEvents } from "../../engine";

/** Hook that returns a function for the component. Optionally set an interval to rerender the component.
 * @param autoRerenderTime: Optional. If provided and nonzero, used as the ms interval to automatically call the rerender function.
 */
export function useRerender(autoRerenderTime?: number) {
  const [__, setRerender] = useState(0);

  const rerender = useCallback(() => setRerender((currentValue) => currentValue + 1), []);

  useEffect(() => {
    if (!autoRerenderTime) return;
    const intervalID = setInterval(rerender, autoRerenderTime);
    return () => clearInterval(intervalID);
  }, [rerender, autoRerenderTime]);

  return rerender;
}

/** Hook that rerenders the component shortly after the game engine processes a cycle.
 * @returns a function that will trigger a rerender.
 */
export function useCycleRerender(): () => void {
  const rerender = useRerender();

  useEffect(() => {
    const unsubscribe = GameCycleEvents.subscribe(rerender);
    return unsubscribe;
  }, [rerender]);
  return rerender;
}

/**
 * Tracks an element's rendered width in CSS pixels. Attach the returned ref to the element; the
 * width is null until it has been measured, so callers can tell "not measured yet" from "zero wide".
 *
 * For layout decisions that CSS cannot express on its own - whether there is enough room left for a
 * thing to be worth drawing at all.
 */
export function useElementWidth<T extends HTMLElement>(): [React.RefCallback<T>, number | null] {
  const [width, setWidth] = useState<number | null>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const frame = useRef<number | null>(null);
  const measured = useRef<number | null>(null);

  // A callback ref rather than useEffect + useRef: this fires on both attach and detach, so the
  // observer follows the element even if it is swapped out.
  const ref = useCallback((element: T | null) => {
    observer.current?.disconnect();
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    measured.current = null;
    if (!element) {
      observer.current = null;
      setWidth(null);
      return;
    }
    observer.current = new ResizeObserver((entries) => {
      const next = entries[0].contentRect.width;
      // A ResizeObserver reports any change to the box, height included, so an element whose height
      // is being animated reports on every frame of that animation with the same width each time.
      // Nothing downstream cares, so drop those here rather than scheduling a frame per report.
      if (next === measured.current) return;
      measured.current = next;
      // Deferring to the next frame is what keeps a layout change made in response to this
      // measurement from re-entering the observer before it has finished delivering - the browser
      // reports that as "ResizeObserver loop completed with undelivered notifications". Callers
      // whose layout can feed back into their own width still need hysteresis on top of this.
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => setWidth(next));
    });
    observer.current.observe(element);
  }, []);

  return [ref, width];
}

export function useBoolean(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((old) => !old);
  }, []);

  const on = useCallback(() => {
    setValue(true);
  }, []);

  const off = useCallback(() => {
    setValue(false);
  }, []);

  return [value, { toggle, on, off }] as const;
}
