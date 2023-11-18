import React from "react";
import { Context } from "./Context";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import { KarmaCharitySubpage } from "./KarmaCharitySubpage";
import { KarmaSleeveSubpage } from "./KarmaSleeveSubpage";
import Box from "@mui/material/Box";
import { Player } from "@player";

/** React Component for the popup that manages Karma spending */
export function KarmaSubpage(): React.ReactElement {
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
          Charties have the ability to spend their Karma on various things. This is your entry point into that realm.
          Purchases are not cheap, but they can be powerful.<br></br>
          Select what you would like to spend your Karma on:
        </Typography>
      </Box>
      <Tabs variant="fullWidth" value={value} onChange={handleChange} sx={{ minWidth: "fit-content", maxWidth: "45%" }}>
        <Tab label="None" />
        <Tab label="Boost Charity" />
        <Tab label="Sleeves" />
        <Tab label="Factions" />
        <Tab label="Time" />
      </Tabs>
      {value === 1 && <KarmaCharitySubpage />}
      {value === 2 && <KarmaSleeveSubpage />}
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
