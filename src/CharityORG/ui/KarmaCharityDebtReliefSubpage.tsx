import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { formatNumber } from "../../ui/formatNumber";
import Box from "@mui/material/Box";
import { TextField } from "@mui/material";
import { Player } from "@player";
import { dialogBoxCreate } from "../../ui/React/DialogBox";

let spend = 0;

/** React Component for the popup that manages Karma spending */
export function KarmaCharityDebtReliefSubpage(): React.ReactElement {
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
  function purchaseRelief(): void {
    if (charityORG.bank >= 0) {
      dialogBoxCreate("But you are not in debt!");
    }
    const maxspend = (charityORG.bank * -1) / 10000000;
    if (maxspend < spend) {
      //Only spend what we need
      Player.karma -= maxspend;
      charityORG.bank += 10000000; // * maxspend;
    } else {
      //Spend it all
      Player.karma -= spend;
      charityORG.bank += 10000000; // * spend;
    }
  }
  return (
    <>
      <Typography>Karma:</Typography>
      <Box display="flex" alignItems="center">
        <TextField
          type="number"
          style={{
            width: "100px",
          }}
          onChange={updateSpend}
          placeholder={String(spend)}
        />
        <Typography>Every 1 karma relieves $10,000,000 debt. Available:{formatNumber(Player.karma)}</Typography>
      </Box>
      <Button onClick={() => purchaseRelief()}>Purchase Debt Relief</Button>
    </>
  );
}
