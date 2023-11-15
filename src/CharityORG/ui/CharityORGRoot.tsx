import React from "react";
import { ManagementSubpage } from "./ManagementSubpage";
//import { TerritorySubpage } from "./TerritorySubpage";
import { EquipmentsSubpage } from "./EquipmentsSubpage";
//import Typography from "@mui/material/Typography";
//import TextField from "@mui/material/TextField";
import { Player } from "@player";
import { Context } from "./Context";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import { useRerender } from "../../ui/React/hooks";

/** React Component for all the gang stuff. */
export function CharityORGRoot(): React.ReactElement {
  const charityORG = (function () {
    if (Player.charityORG === null) throw new Error("Charity should not be null");
    return Player.charityORG;
  })();
  const [value, setValue] = React.useState(0);

  function handleChange(event: React.SyntheticEvent, tab: number): void {
    setValue(tab);
  }

  useRerender(200);
  /*return (
    <Typography>Name: {charityORG.name}  Bank: ${charityORG.bank}  Terror: {charityORG.terror}</Typography>
  );*/
  return (
    <Context.CharityORG.Provider value={charityORG}>
      <Tabs variant="fullWidth" value={value} onChange={handleChange} sx={{ minWidth: "fit-content", maxWidth: "45%" }}>
        <Tab label="Management" />
        <Tab label="Equipment" />
      </Tabs>
      {value === 0 && <ManagementSubpage />}
      {value === 1 && <EquipmentsSubpage />}
    </Context.CharityORG.Provider>
  );
  /*
  return (
    <Context.CharityORG.Provider value={charityORG}>
      <Tabs variant="fullWidth" value={value} onChange={handleChange} sx={{ minWidth: "fit-content", maxWidth: "45%" }}>
        <Tab label="Management" />
        <Tab label="Equipment" />
        <Tab label="Territory" />
      </Tabs>
      <Typography>Name: {charityORG.name}  Bank: ${charityORG.bank}</Typography>
      {value === 0 && <ManagementSubpage />}
      {value === 1 && <EquipmentsSubpage />}
      {value === 2 && <TerritorySubpage />}
    </Context.CharityORG.Provider>
  );
  */
}
