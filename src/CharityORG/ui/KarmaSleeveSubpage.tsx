import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Player } from "@player";
import { KarmaSleeveOverclockSubpage } from "./KarmaSleeveOverclockSubpage";
import { KarmaSleeveReduceShockSubpage } from "./KarmaSleeveReduceShockSubpage";
import { KarmaSleeveSyncSubpage } from "./KarmaSleeveSyncSubpage";
import { KarmaSleeveAugmentsSubpage } from "./KarmaSleeveAugmentsSubpage";

/** React Component for the popup that manages Karma spending */
export function KarmaSleeveSubpage(): React.ReactElement {
  const [value, setValue] = React.useState(0);

  function handleChange(event: React.SyntheticEvent, tab: number): void {
    setValue(tab);
  }

  if (Player.sleeves.length <= 0) {
    return <Typography>The entineers are busy away tinkering on Sleeves. Come back when you have some!</Typography>;
  }

  return (
    <span>
      <Box display="flex">
        <Typography>
          <br></br>Have your charities engineers give your sleeves a once over. Possibly an overclock?:
        </Typography>
      </Box>
      <Tabs variant="fullWidth" value={value} onChange={handleChange} sx={{ minWidth: "fit-content", maxWidth: "45%" }}>
        <Tab label="Overclock" />
        <Tab label="Reduce Shock" />
        <Tab label="Sync Up" />
        <Tab label="Augments" />
      </Tabs>
      {value === 0 && <KarmaSleeveOverclockSubpage />}
      {value === 1 && <KarmaSleeveReduceShockSubpage />}
      {value === 2 && <KarmaSleeveSyncSubpage />}
      {value === 3 && <KarmaSleeveAugmentsSubpage />}
    </span>
  );
}
