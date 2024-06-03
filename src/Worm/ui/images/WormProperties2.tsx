import { useTheme } from "@mui/material";
import React from "react";

export function WormProperties2(props: React.SVGProps<SVGSVGElement>) {
  const theme = useTheme();

  return (
    <svg viewBox="0 0 260 260" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient
          id="color-1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(1, 0, 0, 1, 728.371552, 466.914902)"
        >
          <title>{"BACKGROUND"}</title>
          <stop
            style={{
              stopColor: theme.colors.backgroundprimary,
            }}
          />
        </linearGradient>
        <linearGradient
          id="color-2"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(1, 0, 0, 1, 2449.520569, 1511.764923)"
        >
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
          stroke: "url('#color-2')",
          fill: "url('#color-1')",
        }}
        cx={55}
        cy={55}
        rx={50}
        ry={50}
      />
      <ellipse
        style={{
          stroke: "url('#color-2')",
          fill: "url('#color-1')",
        }}
        cx={205}
        cy={55}
        rx={50}
        ry={50}
      />
      <ellipse
        style={{
          stroke: "url('#color-2')",
          fill: "url('#color-1')",
        }}
        cx={55}
        cy={205}
        rx={50}
        ry={50}
      />
      <ellipse
        style={{
          stroke: "url('#color-2')",
          fill: "url('#color-1')",
        }}
        cx={205}
        cy={205}
        rx={50}
        ry={50}
      />
      <path
        d="M 105 54 h 45 v -2 l 5 3 l -5 3 v -2 h -45 Z"
        style={{
          stroke: "url('#color-2')",
        }}
      />
      <path
        d="M 204 105 v 45 h -2 l 3 5 l 3 -5 h -2 v -45 Z"
        style={{
          stroke: "url('#color-2')",
        }}
      />
      <path
        d="M 155 204 h -45 v -2 l -5 3 l 5 3 v -2 h 45 Z"
        style={{
          stroke: "url('#color-2')",
        }}
      />
      <path
        d="M 54 155 v -45 h -2 l 3 -5 l 3 5 h -2 v 45 Z"
        style={{
          stroke: "url('#color-2')",
        }}
      />
      <text
        style={{
          fill: "url('#color-0')",
          fontFamily: theme.typography.fontFamily,
          fontSize: 18,
          textAnchor: "middle",
          whiteSpace: "pre",
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
          textAnchor: "middle",
          whiteSpace: "pre",
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
          textAnchor: "middle",
          whiteSpace: "pre",
        }}
        x={55}
        y={210}
      >
        {"s03"}
      </text>
      <text
        style={{
          fill: "url('#color-0')",
          fontFamily: theme.typography.fontFamily,
          fontSize: 18,
          textAnchor: "middle",
          whiteSpace: "pre",
        }}
        x={205}
        y={210}
      >
        {"s02"}
      </text>
      <text
        style={{
          fill: "url('#color-0')",
          fontFamily: theme.typography.fontFamily,
          fontSize: 18,
          textAnchor: "middle",
          whiteSpace: "pre",
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
          textAnchor: "middle",
          whiteSpace: "pre",
        }}
        x={220}
        y={135}
      >
        {"B"}
      </text>
      <text
        style={{
          fill: "url('#color-0')",
          fontFamily: theme.typography.fontFamily,
          fontSize: 18,
          textAnchor: "middle",
          whiteSpace: "pre",
        }}
        x={130}
        y={195}
      >
        {"C"}
      </text>
      <text
        style={{
          fill: "url('#color-0')",
          fontFamily: theme.typography.fontFamily,
          fontSize: 18,
          textAnchor: "middle",
          whiteSpace: "pre",
        }}
        x={70}
        y={135}
      >
        {"D"}
      </text>
      <path
        d="M 0 0 h 105 v -2 l 5 3 l -5 3 v -2 h -105 Z"
        style={{
          stroke: "url('#color-2')",
        }}
        transform="matrix(0.7071, 0.7071, -0.7071, 0.7071, 91, 91)"
      />
      <text
        style={{
          fill: "url('#color-0')",
          fontFamily: theme.typography.fontFamily,
          fontSize: 18,
          textAnchor: "middle",
          whiteSpace: "pre",
        }}
        x={135}
        y={125}
      >
        {"E"}
      </text>
    </svg>
  );
}
