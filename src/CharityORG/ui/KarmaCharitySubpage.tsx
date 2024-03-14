import React from "react";
import { Context } from "./Context";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Player } from "@player";
import { KarmaCharityTruthSubpage } from "./KarmaCharityTruthSubpage";
import { KarmaCharityMultiSubpage } from "./KarmaCharityMultiSubpage";
import { KarmaCharityGeneralSubpage } from "./KarmaCharityGeneralSubpage";

/** React Component for the popup that manages Karma spending */
export function KarmaCharitySubpage(): React.ReactElement {
  const charityORG = (function () {
    if (Player.charityORG === null) throw new Error("Charity should not be null");
    return Player.charityORG;
  })();
  const [value, setValue] = React.useState(0);

  function handleChange(event: React.SyntheticEvent, tab: number): void {
    setValue(tab);
  }

  return (
    <Context.CharityORG.Provider value={charityORG}>
      <Box display="flex">
        <Typography>
          <br></br>Boosting your charity is more powerful than boosting anything else.<br></br>Please choose the boost
          type that you would like:
        </Typography>
      </Box>
      <Tabs variant="fullWidth" value={value} onChange={handleChange} sx={{ minWidth: "fit-content", maxWidth: "45%" }}>
        <Tab label="Boosts" />
        <Tab label="General" />
        <Tab label="See the truth" />
      </Tabs>
      {value === 0 && <KarmaCharityMultiSubpage />}
      {value === 1 && <KarmaCharityGeneralSubpage />}
      {value === 2 && <KarmaCharityTruthSubpage />}
    </Context.CharityORG.Provider>
  );
}
