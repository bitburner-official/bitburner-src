import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import LinearProgress from "@mui/material/LinearProgress";

interface LinearForwardProgressProps {
  value: number;
  backgroundColor?: React.CSSProperties["color"];
  barColor?: React.CSSProperties["color"];
}

export function LinearForwardProgress({
  value,
  backgroundColor,
  barColor,
}: LinearForwardProgressProps): React.ReactElement {
  const TRANSITION_TO_FULL_DURATION = 200;
  const ONE_FRAME_RESET_DELAY = 16;

  const [displayProgress, setDisplayProgress] = useState(value);
  const [isInDecreasingAnimation, setIsInDecreasingAnimation] = useState(false);
  const [isAnimatingToFull, setIsAnimatingToFull] = useState(false);

  const previousProgressRef = useRef(value);
  const animationTimeouts = useRef<(NodeJS.Timeout | null)[]>([]);

  const clearAnimationTimeouts = useCallback(() => {
    animationTimeouts.current.forEach((timeout) => {
      if (timeout) clearTimeout(timeout);
    });
    animationTimeouts.current = [];
  }, []);

  const startDecreasingAnimation = useCallback(() => {
    setIsInDecreasingAnimation(true);
    setIsAnimatingToFull(true);

    // Phase 1: Animate to 100% with linear transition
    setDisplayProgress(100);

    // Phase 2: After reaching 100%, reset to 0% and animate to new value
    const fullTransitionTimeout = setTimeout(() => {
      setIsAnimatingToFull(false);
      setDisplayProgress(0); // Instant reset with no transition

      // Phase 3: Brief delay, then animate to final value
      const resetTimeout = setTimeout(() => {
        setDisplayProgress(value);
        setIsInDecreasingAnimation(false);
      }, ONE_FRAME_RESET_DELAY);

      animationTimeouts.current[1] = resetTimeout;
    }, TRANSITION_TO_FULL_DURATION);

    animationTimeouts.current[0] = fullTransitionTimeout;
  }, [value]);

  useEffect(() => {
    if (value === previousProgressRef.current || isInDecreasingAnimation) {
      return;
    }

    clearAnimationTimeouts();

    if (value > previousProgressRef.current) {
      // Progress increased: use normal MUI transition
      setDisplayProgress(value);
    } else {
      // Progress decreased: use two-phase forward-only animation
      startDecreasingAnimation();
    }

    previousProgressRef.current = value;
  }, [value, isInDecreasingAnimation, clearAnimationTimeouts, startDecreasingAnimation]);

  // Cleanup timeouts on component unmount
  useEffect(() => {
    return clearAnimationTimeouts;
  }, [clearAnimationTimeouts]);

  const getTransitionStyle = () => {
    if (isAnimatingToFull) {
      return { transition: `transform ${TRANSITION_TO_FULL_DURATION}ms linear` };
    }
    if (isInDecreasingAnimation && displayProgress === 0) {
      return { transition: "none" };
    }
    // Default MUI transition
    return {};
  };

  return (
    <LinearProgress
      variant="determinate"
      value={displayProgress}
      sx={{
        backgroundColor,
        "& .MuiLinearProgress-bar1Determinate": {
          backgroundColor: barColor,
          ...getTransitionStyle(),
        },
      }}
    />
  );
}
