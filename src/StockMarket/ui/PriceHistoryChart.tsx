import React from "react";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/Info";
import type { Stock } from "../Stock";
import { useCycleRerender } from "../../ui/React/hooks";
import { Settings } from "../../Settings/Settings";
import { Money } from "../../ui/React/Money";

export function PriceHistoryChart({
  stock,
  width = 720,
  height = 280,
}: {
  stock: Stock;
  width?: number;
  height?: number;
}) {
  const [hoveredDataPoint, setHoveredDataPoint] = React.useState<Stock["priceHistory"][number] | null>(null);

  useCycleRerender();

  const prices = stock.priceHistory.map((v) => v.price);
  const padding = 20;

  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const range = Math.max(maxPrice - minPrice, Number.EPSILON);

  const points = stock.priceHistory.map((entry, index) => {
    const x = padding + (index / Math.max(prices.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((entry.price - minPrice) / range) * (height - padding * 2);
    return { x, y };
  });

  return (
    <div>
      <Tooltip
        title={
          <Typography>
            The price history contains at most 10 data points.
            <br />
            Hover over the chart to view details for the nearest data point.
          </Typography>
        }
      >
        <Typography sx={{ display: "flex", alignItems: "center" }}>
          Price history
          <InfoIcon sx={{ fontSize: "1.2em", marginLeft: "10px" }} />
        </Typography>
      </Tooltip>
      <div
        style={{
          position: "relative",
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{
            background: Settings.theme.backgroundprimary,
          }}
          onMouseLeave={() => setHoveredDataPoint(null)}
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
              if (prices.length === 0) {
                return;
              }
              const svg = event.currentTarget.ownerSVGElement;
              if (svg == null) {
                return;
              }

              const rect = svg.getBoundingClientRect();
              const mouseX = ((event.clientX - rect.left) / rect.width) * width;
              const index = Math.round(((mouseX - padding) / (width - padding * 2)) * (prices.length - 1));
              if (index >= 0 && index < prices.length) {
                setHoveredDataPoint(stock.priceHistory[index]);
              }
            }}
          />

          {points.map(({ x, y }, index) => {
            const entry = stock.priceHistory[index];
            return (
              <Tooltip
                key={index}
                open={hoveredDataPoint === entry}
                title={
                  <>
                    <div>{new Date(stock.priceHistory[index].timeMs).toLocaleTimeString()}</div>
                    <div>
                      <Money money={stock.priceHistory[index].price} />
                    </div>
                  </>
                }
                placement="right"
              >
                <circle
                  stroke={Settings.theme.primary}
                  cx={x}
                  cy={y}
                  r={10}
                  onMouseEnter={() => setHoveredDataPoint(entry)}
                />
              </Tooltip>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
