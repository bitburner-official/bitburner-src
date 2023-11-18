import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { formatNumber } from "../../ui/formatNumber";
import Box from "@mui/material/Box";
import { TextField } from "@mui/material";
import { Player } from "@player";

let spend = 0;

/** React Component for the popup that manages Karma spending */
export function KarmaCharityPrestigeSubpage(): React.ReactElement {
  const charityORG = (function () {
    if (Player.charityORG === null) throw new Error("Charity should not be null");
    return Player.charityORG;
  })();
  const [, setValue] = React.useState(0);

  function updateSpend(e: React.ChangeEvent<HTMLInputElement>): void {
    spend = parseInt(e.currentTarget.value);
    if (isNaN(spend)) {
      spend = 0;
    }
    if (spend > Player.karma) {
      spend = 0;
    }
    if (spend < 0) {
      spend = 0;
    }
    setValue(spend);
    e.currentTarget.value = spend > 0 ? spend.toString() : "";
  }
  function purchasePrestige(): void {
    const prestige = (spend * 1000) / charityORG.volunteers.length;
    for (const volunteer of charityORG.volunteers) {
      volunteer.earnedPrestige += prestige;
    }
    charityORG.prestige += spend * 1000;
    Player.karma -= spend;
  }
  return (
    <>
      <Typography>Karma:</Typography>
      <Box display="grid" alignItems="center">
        <TextField
          type="number"
          style={{
            width: "100px",
          }}
          onChange={updateSpend}
          placeholder={String(spend)}
        />
        <Typography>
          Every 1 karma gives 1,000 Prestige, divided evenly among your volunteers<br></br>Available:
          {formatNumber(Player.karma)}
        </Typography>
      </Box>
      <Button onClick={() => purchasePrestige()}>Purchase Prestige</Button>
    </>
  );
}
