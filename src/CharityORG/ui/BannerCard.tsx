import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { BannerPiece } from "../CharityEvent";
import { formatNumber, formatPercent } from "../../ui/formatNumber";

const f = (x: number) => formatPercent(x, x - 1 < 0.1 ? 2 : 1);
/** React Component for the popup that manages gang members upgrades */
export function BannerCard(banner: BannerPiece | undefined): React.ReactElement {
  if (banner === undefined) return <></>;

  return (
    <>
      <Box display="grid" width="99%">
        <Typography>{banner.short_name}</Typography>
        <Typography>Total Power: {formatNumber(banner.totalPower)}</Typography>
        {banner.effects.map((n, i) =>
          n.effect === "lucky" ? (
            <Typography key={i}> {n.effect + ": " + formatNumber(n.strength)} </Typography>
          ) : (
            <Typography key={i}> {n.effect.replaceAll("_", " ") + ": " + f(n.strength)} </Typography>
          ),
        )}
      </Box>
    </>
  );
}
