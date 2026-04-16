import React, { useEffect, useRef, useMemo } from "react";
import { ProgressBar } from "../../ui/React/Progress";
import { clampNumber } from "../../utils/helpers/clampNumber";

type GameTimerProps = {
  endTimestamp: number;
};

export function GameTimer({ endTimestamp }: GameTimerProps): React.ReactElement {
  // We need a stable DOM element to perform animations with. This is
  // antithetical to the React philosophy, so things get a bit awkward.
  const ref: React.Ref<Element> = useRef(null);
  const changeRef = useRef({ startTimestamp: 0, endTimestamp: 0 });
  // Animation timing starts when we are asked to render, even though we can't
  // actually begin it until later. We're using a ref to keep this updated in
  // a very low-overhead way.
  const state = changeRef.current;
  if (state.endTimestamp !== endTimestamp) {
    state.endTimestamp = endTimestamp;
    state.startTimestamp = performance.now();
  }
  useEffect(() => {
    // All manipulation must be done in an effect, since this is after React's
    // "commit," where the DOM is materialized.
    const ele = ref.current?.firstElementChild;
    const startTimestamp = changeRef.current.startTimestamp;
    if (!ele) return;
    ele.animate([{ transform: "translateX(0%)" }, { transform: "translateX(-100%)" }], {
      // If duration is negative, ele.animate will throw "TypeError: duration must be non-negative or auto". It may
      // happen when the player uses the debugger.
      duration: clampNumber(endTimestamp - startTimestamp, 0),
      // The delay will be negative. This is because the animation starts
      // partway completed, due to the time taken to invoke the effect.
      delay: startTimestamp - performance.now(),
    });
  }, [endTimestamp]);
  // Never rerender the actual ProgressBar
  return useMemo(() => <ProgressBar ref={ref} variant="determinate" value={100} color="primary" />, []);
}
