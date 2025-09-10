import * as React from "react";
import { useRef } from "react";
import LinearProgress from "@mui/material/LinearProgress";

interface LinearForwardProgressProps {
  value: number;
  backgroundColor?: React.CSSProperties["color"];
  barColor?: React.CSSProperties["color"];
}

// Round percentage to nearest 5% interval to limit keyframe definitions
const roundToInterval = (value: number, interval = 5): number => {
  return Math.round(value / interval) * interval;
};

// Generate predefined keyframes for forward animations
const generateKeyframes = (startPercent: number, endPercent: number) => {
  const startPos = startPercent - 100;
  const endPos = endPercent - 100;

  return {
    "0%": { transform: `translateX(${startPos}%)` },
    "50%": { transform: "translateX(0%)" },
    "50.01%": { transform: "translateX(-100%)" },
    "100%": { transform: `translateX(${endPos}%)` },
  };
};

export const LinearForwardProgress = React.forwardRef<unknown, LinearForwardProgressProps>(
  function LinearForwardProgress({ value, backgroundColor, barColor, ...otherProps }, ref): React.ReactElement {
    const previousValueRef = useRef(value);

    const isDecreasing = value < previousValueRef.current;
    const previousValue = previousValueRef.current;

    // Update ref for next render
    previousValueRef.current = value;

    let animationStyles = {};

    if (isDecreasing) {
      // Round values to 5% intervals to limit keyframe definitions
      const roundedStartPercent = roundToInterval(previousValue);
      const roundedEndPercent = roundToInterval(value);

      // Use rounded values for animation name to ensure reuse of keyframes
      const animationName = `forwardAnim_${roundedStartPercent}_${roundedEndPercent}`;

      const keyframes = generateKeyframes(roundedStartPercent, roundedEndPercent);

      animationStyles = {
        [`@keyframes ${animationName}`]: keyframes,
        animation: `${animationName} 0.2s linear`,
      };
    }

    return (
      <LinearProgress
        variant="determinate"
        value={value}
        ref={ref}
        {...otherProps}
        sx={{
          backgroundColor,
          "& .MuiLinearProgress-bar1Determinate": {
            backgroundColor: barColor,
            transition: "transform 0.2s linear",
            ...animationStyles,
          },
        }}
      />
    );
  },
);
