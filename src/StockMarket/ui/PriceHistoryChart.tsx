import React from "react";
import Typography from "@mui/material/Typography";
import type { Stock } from "../Stock";
import { useCycleRerender } from "../../ui/React/hooks";
import { Settings } from "../../Settings/Settings";
import { Money } from "../../ui/React/Money";

export function PriceHistoryChart({ stock }: { stock: Stock }) {
  const [hoveredDataPoint, setHoveredDataPoint] = React.useState<number | null>(null);

  useCycleRerender();

  const prices = stock.priceHistory.map((v) => v.price);
  if (prices.length === 0) {
    return null;
  }

  const width = 800;
  const height = 500;
  const padding = 20;

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = Math.max(maxPrice - minPrice, Number.EPSILON);

  const points = stock.priceHistory.map((entry, index) => {
    const x = padding + (index / Math.max(prices.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((entry.price - minPrice) / range) * (height - padding * 2);
    return { x, y };
  });

  return (
    <div style={{ padding: 10 }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          background: Settings.theme.backgroundprimary,
          marginBottom: "10px",
        }}
      >
        <polyline
          points={points.map(({ x, y }) => `${x},${y}`).join(" ")}
          fill="none"
          stroke={Settings.theme.primary}
          strokeWidth={2}
        />

        {/* Wide invisible hit area that snaps the cursor to the nearest data point. */}
        <polyline
          points={points.map(({ x, y }) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="transparent"
          strokeWidth={20}
          onMouseMove={(event) => {
            const svg = event.currentTarget.ownerSVGElement;
            if (svg == null) {
              return;
            }

            const rect = svg.getBoundingClientRect();
            const mouseX = ((event.clientX - rect.left) / rect.width) * width;
            const index = Math.round(((mouseX - padding) / (width - padding * 2)) * (prices.length - 1));
            if (index >= 0 && index < prices.length) {
              setHoveredDataPoint(index);
            }
          }}
          onMouseLeave={() => setHoveredDataPoint(null)}
        />

        {points.map(({ x, y }, index) => (
          <React.Fragment key={index}>
            <circle
              stroke={Settings.theme.primary}
              cx={x}
              cy={y}
              r={10}
              onMouseEnter={() => setHoveredDataPoint(index)}
              onMouseLeave={() => setHoveredDataPoint(null)}
            />
          </React.Fragment>
        ))}
      </svg>
      <Typography>
        The price history contains at most 10 data points.
        <br />
        Hover over the chart to view details for the nearest data point.
        <br />
        Time: {hoveredDataPoint !== null && new Date(stock.priceHistory[hoveredDataPoint].time).toLocaleTimeString()}
        <br />
        Price: {hoveredDataPoint !== null && <Money money={stock.priceHistory[hoveredDataPoint].price} />}
      </Typography>
    </div>
  );
}
