import React from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { formatNumber } from "../../ui/formatNumber";
import Box from "@mui/material/Box";
import { TextField } from "@mui/material";
import { Player } from "@player";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { AugmentationName } from "@enums";

/** React Component for the popup that manages Karma spending */
export function KarmaCharityTruthSubpage(): React.ReactElement {
  const [spend, setSpend] = React.useState(0);

  function updateSpend(e: React.ChangeEvent<HTMLInputElement>): void {
    const spendVal = Number.parseInt(e.currentTarget.value);
    if (spendVal > Player.karma || spendVal < 0) {
      setSpend(0);
      e.currentTarget.value = "";
      return;
    }
    setSpend(spendVal);
  }
  function purchaseTruth(): void {
    if (spend > Player.karma) return;
    if (Player.hasAugmentation(AugmentationName.TheRedPill, false)) {
      dialogBoxCreate("You can already learn the truth...");
    } else if (spend < 5000000000000) {
      dialogBoxCreate("You need to spend more to learn the truth...");
    } else {
      dialogBoxCreate("You may now learn the truth...");
      Player.karma -= 5000000000000;
      Player.queueAugmentation(AugmentationName.TheRedPill);
      setSpend(spend);
    }
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
          For ?? karma you can learn the truth from your charity. We will only charge what's needed...<br></br>
          Available:{formatNumber(Player.karma)}
        </Typography>
      </Box>
      <Button onClick={() => purchaseTruth()}>Purchase Truth</Button>
    </>
  );
}
