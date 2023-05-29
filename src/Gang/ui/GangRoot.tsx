import React, { useEffect, useState } from "react";

import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { Player } from "@player";

import { Context } from "./Context";
import { EquipmentsSubpage } from "./EquipmentsSubpage";
import { ManagementSubpage } from "./ManagementSubpage";
import { TerritorySubpage } from "./TerritorySubpage";

/** React Component for all the gang stuff. */
export function GangRoot(): React.ReactElement {
  const gang = (function () {
    if (Player.gang === null) throw new Error("Gang should not be null");
    return Player.gang;
  })();
  const [value, setValue] = React.useState(0);

  function handleChange(event: React.SyntheticEvent, tab: number): void {
    setValue(tab);
  }

  const setRerender = useState(false)[1];

  useEffect(() => {
    const id = setInterval(() => setRerender((old) => !old), 200);
    return () => clearInterval(id);
  }, []);

  return (
    <Context.Gang.Provider value={gang}>
      <Tabs variant="fullWidth" value={value} onChange={handleChange} sx={{ minWidth: "fit-content", maxWidth: "45%" }}>
        <Tab label="Management" />
        <Tab label="Equipment" />
        <Tab label="Territory" />
      </Tabs>
      {value === 0 && <ManagementSubpage />}
      {value === 1 && <EquipmentsSubpage />}
      {value === 2 && <TerritorySubpage />}
    </Context.Gang.Provider>
  );
}
