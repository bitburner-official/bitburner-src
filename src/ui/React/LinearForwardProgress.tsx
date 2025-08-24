import * as React from "react";
import { useRef } from "react";
import LinearProgress from "@mui/material/LinearProgress";

interface LinearForwardProgressProps {
  value: number;
  backgroundColor?: React.CSSProperties["color"];
  barColor?: React.CSSProperties["color"];
}

export const LinearForwardProgress = React.forwardRef<unknown, LinearForwardProgressProps>(
  function LinearForwardProgress({ value, backgroundColor, barColor, ...otherProps }, ref): React.ReactElement {
    const previousValueRef = useRef(value);
    const animationKeyRef = useRef(0);

    const isDecreasing = value < previousValueRef.current;
    const previousValue = previousValueRef.current;

    // Update ref for next render
    previousValueRef.current = value;

    if (isDecreasing) {
      // Increment animation key to force new CSS animation
      animationKeyRef.current += 1;

      // MUI LinearProgress uses translateX where:
      // translateX(-100%) = 0% progress, translateX(0%) = 100% progress
      const startPos = previousValue - 100;
      const endPos = value - 100;
      const animationName = `forwardAnim${animationKeyRef.current}`;

      // Calculate timing: proportional split between fill-to-100% and reset-to-final phases
      const firstPhasePercent = ((100 - previousValue) / (100 - previousValue + value)).toFixed(2);

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
              [`@keyframes ${animationName}`]: {
                "0%": { transform: `translateX(${startPos}%)` },
                [`${firstPhasePercent}%`]: { transform: "translateX(0%)" },
                [`${firstPhasePercent + 0.01}%`]: { transform: "translateX(-100%)" },
                "100%": { transform: `translateX(${endPos}%)` },
              },
              animation: `${animationName} 0.4s ease-out`,
            },
          }}
        />
      );
    }

    // Normal increasing progress - use default MUI transition
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
          },
        }}
      />
    );
  },
);
