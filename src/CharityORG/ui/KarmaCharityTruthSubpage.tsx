import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { formatNumber } from "../../ui/formatNumber";
import Box from "@mui/material/Box";
import { TextField } from "@mui/material";
import { Player } from "@player";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { AugmentationName } from "@enums";
//import { Faction } from "../../Faction/Faction";

let spend = 0;

/** React Component for the popup that manages Karma spending */
export function KarmaCharityTruthSubpage(): React.ReactElement {
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
  function purchaseTruth(): void {
    if (Player.hasAugmentation(AugmentationName.TheRedPill, false)) {
      dialogBoxCreate("You can already learn the truth...");
    } else if (spend < 500000) {
      dialogBoxCreate("You need to spend more to learn the truth...");
    } else {
      dialogBoxCreate("You may now learn the truth...");
      Player.karma -= 500000;
      Player.queueAugmentation(AugmentationName.TheRedPill);
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
        <Typography>
          For ?? karma you can learn the truth from your charity. We will only charge what's needed...<br></br>
          Available:{formatNumber(Player.karma)}
        </Typography>
      </Box>
      <Button onClick={() => purchaseTruth()}>Purchase Truth</Button>
    </>
  );
}
