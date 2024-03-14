import React from "react";
import { Context } from "./Context";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Player } from "@player";
import { KarmaTimeOrbSubpage } from "./KarmaTimeOrbSubpage";
import { KarmaTimeGateSubpage } from "./KarmaTimeGateSubpage";
//import { KarmaSleeveReduceShockSubpage } from "./KarmaSleeveReduceShockSubpage";
//import { KarmaSleeveSyncSubpage } from "./KarmaSleeveSyncSubpage";
//import { KarmaSleeveAugmentsSubpage } from "./KarmaSleeveAugmentsSubpage";

/** React Component for the popup that manages Karma spending */
export function KarmaTimeSubpage(): React.ReactElement {
  const charityORG = (function () {
    if (Player.charityORG === null) throw new Error("Charity should not be null");
    return Player.charityORG;
  })();
  const [value, setValue] = React.useState(0);

  function handleChange(event: React.SyntheticEvent, tab: number): void {
    setValue(tab);
  }

  if (Player.sleeves.length <= 0) {
    return <Typography>The entineers are busy away tinkering on Sleeves. Come back when you have some!</Typography>;
  }

  return (
    <Context.CharityORG.Provider value={charityORG}>
      <Box display="grid">
        <Typography sx={{ lineHeight: "1em", whiteSpace: "pre" }}>
          <br></br>
          {" ______                                                      __"}
          <br></br>
          {"/\\__  _\\__                          /'\\_/`\\                 /\\ \\      __"}
          <br></br>
          {"\\/_/\\ \\/\\_\\    ___ ___      __     /\\      \\     __      ___\\ \\ \\___ /\\_\\    ___      __"}{" "}
          <br></br>
          {
            "   \\ \\ \\/\\ \\ /' __` __`\\  /'__`\\   \\ \\ \\__\\ \\  /'__`\\   /'___\\ \\  _ `\\/\\ \\ /' _ `\\  /'__`\\"
          }{" "}
          <br></br>
          {
            "    \\ \\ \\ \\ \\/\\ \\/\\ \\/\\ \\/\\  __/    \\ \\ \\_/\\ \\/\\ \\_\\.\\_/\\ \\__/\\ \\ \\ \\ \\ \\ \\/\\ \\/\\ \\/\\  __/"
          }
          <br></br>
          {
            "     \\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\ \\____\\    \\ \\_\\\\ \\_\\ \\__/.\\_\\ \\____\\\\ \\_\\ \\_\\ \\_\\ \\_\\ \\_\\ \\____\\"
          }
          <br></br>
          {
            "      \\/_/\\/_/\\/_/\\/_/\\/_/\\/____/     \\/_/ \\/_/\\/__/\\/_/\\/____/ \\/_/\\/_/\\/_/\\/_/\\/_/\\/____/"
          }
          <br></br>
        </Typography>
      </Box>
      <Tabs variant="fullWidth" value={value} onChange={handleChange} sx={{ minWidth: "fit-content", maxWidth: "45%" }}>
        <Tab label="Time Orb" />
        <Tab label="Time Gate" />
      </Tabs>
      {value === 0 && <KarmaTimeOrbSubpage />}
      {value === 1 && <KarmaTimeGateSubpage />}
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
