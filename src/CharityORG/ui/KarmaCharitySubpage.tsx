import React from "react";
import { Context } from "./Context";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Player } from "@player";
import { KarmaCharityBankSubpage } from "./KarmaCharityBankSubpage";
import { KarmaCharityPrestigeSubpage } from "./KarmaCharityPrestigeSubpage";
import { KarmaCharityBoostVisibilitySubpage } from "./KarmaCharityBoostVisibilitySubpage";
import { KarmaCharityBoostTerrorSubpage } from "./KarmaCharityBoostTerrorSubpage";
import { KarmaCharityBoostTimeSubpage } from "./KarmaCharityBoostTimeSubpage";
import { KarmaCharityReputationSubpage } from "./KarmaCharityReputationSubpage";
import { KarmaCharityTruthSubpage } from "./KarmaCharityTruthSubpage";
import { KarmaCharityDebtReliefSubpage } from "./KarmaCharityDebtReliefSubpage";

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
        <Tab label="Bank" />
        <Tab label="Debt Relief" />
        <Tab label="Prestige" />
        <Tab label="Boost Visibility" />
        <Tab label="Reduce Terror" />
        <Tab label="Time Booster" />
        <Tab label="Reputation" />
        <Tab label="See the truth" />
      </Tabs>
      {value === 0 && <KarmaCharityBankSubpage />}
      {value === 1 && <KarmaCharityDebtReliefSubpage />}
      {value === 2 && <KarmaCharityPrestigeSubpage />}
      {value === 3 && <KarmaCharityBoostVisibilitySubpage />}
      {value === 4 && <KarmaCharityBoostTerrorSubpage />}
      {value === 5 && <KarmaCharityBoostTimeSubpage />}
      {value === 6 && <KarmaCharityReputationSubpage />}
      {value === 7 && <KarmaCharityTruthSubpage />}
    </Context.CharityORG.Provider>
  );

  //<>
  //  <Box display="flex">
  //    <Typography>Charties have the ability to spend their Karma on various things.  This is your entry point into that realm.  Purchases are not cheap, but they can be powerful.<br></br>
  //    Select what you would like to spend your Karma on:</Typography>
  // </Box>
  // {value === 0 && <ManagementSubpage />}
  // {value === 1 && <EquipmentsSubpage />}
  // {value === 2 && <KarmaSubpage />}
  //</>
  //);
}
