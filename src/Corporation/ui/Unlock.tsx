// React Components for the Unlock upgrade buttons on the overview page
import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { CorpUnlocks } from "../data/CorporationUnlocks";
import { CorpUnlockName } from "../data/Enums";
import { useCorporation } from "./Context";
import { MoneyCost } from "./MoneyCost";

interface UnlockProps {
  name: CorpUnlockName;
  rerender: () => void;
}

export function Unlock(props: UnlockProps): React.ReactElement {
  const corp = useCorporation();
  const data = CorpUnlocks[props.name];
  const tooltip = data.desc;
  const price = data.price;

  function onClick(): void {
    // corp.unlock handles displaying a dialog on failure
    const message = corp.purchaseUnlock(props.name);
    if (message) dialogBoxCreate(`Error while attempting to purchase ${props.name}:\n${message}`);
    // Rerenders the parent, which should remove this item if the purchase was successful
    props.rerender();
  }

  return (
    <Grid item xs={4}>
      <Box display="flex" alignItems="center" flexDirection="row-reverse">
        <Button disabled={corp.funds < data.price || corp.unlocks.has(props.name)} sx={{ mx: 1 }} onClick={onClick}>
          <MoneyCost money={price} corp={corp} />
        </Button>
        <Tooltip title={tooltip}>
          <Typography>{data.name}</Typography>
        </Tooltip>
      </Box>
    </Grid>
  );
}
