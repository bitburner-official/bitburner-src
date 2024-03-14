import React from "react";
import { Context } from "./Context";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Player } from "@player";
import { KarmaSpecialBuySubpage } from "./KarmaSpecialBuySubpage";
import { KarmaSpecialManageSubpage } from "./KarmaSpecialManageSubpage";

/** React Component for the popup that manages Karma spending */
export function KarmaSpecialSubpage(): React.ReactElement {
  const charityORG = (function () {
    if (Player.charityORG === null) throw new Error("Charity should not be null");
    return Player.charityORG;
  })();
  const [value, setValue] = React.useState(0);

  function handleChange(event: React.SyntheticEvent, tab: number): void {
    setValue(tab);
  }

  if (!charityORG.completed) {
    return (
      <Typography>
        Techs and Admins are scurrying about, trying to keep their networks up. Come back once the gangs have been
        broken and they may have something special for you!
      </Typography>
    );
  } else if (Player.bitNodeN !== 15) {
    return (
      <Typography>
        These techs cannot work on your systems. Please return to BitNode 15 in order to buy/upgrade your Charity
        Servers.
      </Typography>
    );
  }

  return (
    <Context.CharityORG.Provider value={charityORG}>
      <Box display="flex">
        <Typography>
          Now that you have defeated the Gangs, charities from all around the world are able to upgrade their
          infrastructure! Because of this, they are able to offer you their older equipment at discount rates! Don't
          worry, these are special servers that will follow you wherever you go. As they are linked on the quantom level
          to this spot, you will need to come back here to upgrade them. They will show up as pre-rooted servers on your
          network at every reset.
        </Typography>
      </Box>
      <Tabs variant="fullWidth" value={value} onChange={handleChange} sx={{ minWidth: "fit-content", maxWidth: "45%" }}>
        <Tab label="Buy Server" />
        <Tab label="Manage Server" />
      </Tabs>
      {value === 0 && <KarmaSpecialBuySubpage />}
      {value === 1 && <KarmaSpecialManageSubpage />}
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
