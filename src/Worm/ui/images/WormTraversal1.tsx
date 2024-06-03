import { useTheme } from "@mui/material";
import React from "react";

export function WormTraversal1(props: React.SVGProps<SVGSVGElement>) {
  const theme = useTheme();

  return (
    <svg viewBox="0 0 410 110" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="color-1" gradientUnits="userSpaceOnUse">
          <title>{"BACKGROUND"}</title>
          <stop
            style={{
              stopColor: theme.colors.backgroundprimary,
            }}
          />
        </linearGradient>
        <linearGradient id="color-2" gradientUnits="userSpaceOnUse">
          <title>{"OUTLINE"}</title>
          <stop
            style={{
              stopColor: theme.palette.primary.main,
            }}
          />
        </linearGradient>
        <linearGradient id="color-0" gradientUnits="userSpaceOnUse">
          <title>{"TEXT"}</title>
          <stop
            style={{
              stopColor: theme.palette.primary.main,
            }}
          />
        </linearGradient>
      </defs>
      <ellipse
        style={{
          fill: "url('#color-1')",
          stroke: "url('#color-2')",
        }}
        cx={55}
        cy={55}
        rx={50}
        ry={50}
      />
      <ellipse
        style={{
          fill: "url(#color-1)",
          stroke: "url(#color-2)",
        }}
        cx={205}
        cy={55}
        rx={50}
        ry={50}
      />
      <ellipse
        style={{
          fill: "url(#color-1)",
          stroke: "url(#color-2)",
        }}
        cx={355}
        cy={55}
        rx={50}
        ry={50}
      />
      <path
        d="M 105 54 H 150 L 150 52 L 155 55 L 150 58 L 150 56 H 105 V 56 Z"
        style={{
          stroke: "url('#color-2')",
        }}
      />
      <path
        d="M 255 54 H 300 L 300 52 L 305 55 L 300 58 L 300 56 H 255 V 56 Z"
        style={{
          stroke: "url('#color-2')",
        }}
      />
      <text
        style={{
          fill: "url('#color-0')",
          fontFamily: theme.typography.fontFamily,
          fontSize: 18,
          whiteSpace: "pre",
          textAnchor: "middle",
        }}
        x={130}
        y={45}
      >
        {"A"}
      </text>
      <text
        style={{
          fill: "url('#color-0')",
          fontFamily: theme.typography.fontFamily,
          fontSize: 18,
          whiteSpace: "pre",
          textAnchor: "middle",
        }}
        x={280}
        y={45}
      >
        {"B"}
      </text>
      <text
        style={{
          fill: "url('#color-0')",
          fontFamily: theme.typography.fontFamily,
          fontSize: 18,
          whiteSpace: "pre",
          textAnchor: "middle",
        }}
        x={55}
        y={60}
      >
        {"s00"}
      </text>
      <text
        style={{
          fill: "url('#color-0')",
          fontFamily: theme.typography.fontFamily,
          fontSize: 18,
          whiteSpace: "pre",
          textAnchor: "middle",
        }}
        x={205}
        y={60}
      >
        {"s01"}
      </text>
      <text
        style={{
          fill: "url('#color-0')",
          fontFamily: theme.typography.fontFamily,
          fontSize: 18,
          whiteSpace: "pre",
          textAnchor: "middle",
        }}
        x={355}
        y={60}
      >
        {"s02"}
      </text>
    </svg>
  );
}
