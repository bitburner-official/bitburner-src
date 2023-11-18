import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { formatNumber } from "../../ui/formatNumber";
import Box from "@mui/material/Box";
import { TextField } from "@mui/material";
import { Player } from "@player";

let spend = 0;

/** React Component for the popup that manages Karma spending */
export function KarmaCharityBoostTimeSubpage(): React.ReactElement {
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
  function purchaseTime(): void {
    charityORG.storedCycles += spend * 5 * 10;
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
          Every 1 karma gives 10 second of bonus time to your Charity.<br></br>Available:{formatNumber(Player.karma)}
        </Typography>
      </Box>
      <Button onClick={() => purchaseTime()}>Purchase Time</Button>
    </>
  );
}
