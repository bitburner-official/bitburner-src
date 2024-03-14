import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import { EquipmentsSubpage } from "./EquipmentsSubpage";
import { ItemsItemsSubpage } from "./ItemsItemsSubpage";
import { ItemsBannerSubpage } from "./ItemsBannerSubpage";
import Box from "@mui/material/Box";

/** React Component for the popup that manages Karma spending */
export function ItemsSubpage(): React.ReactElement {
  const [value, setValue] = React.useState(0);

  function handleChange(event: React.SyntheticEvent, tab: number): void {
    setValue(tab);
  }

  return (
    <span>
      <Box display="flex">
        <Typography>
          Here you can see the items you have as well as the gear you can purchase.<br></br>
        </Typography>
      </Box>
      <Tabs variant="fullWidth" value={value} onChange={handleChange} sx={{ minWidth: "fit-content", maxWidth: "45%" }}>
        <Tab label="Equipment" />
        <Tab label="Items" />
        <Tab label="Banner" />
      </Tabs>
      {value === 0 && <EquipmentsSubpage />}
      {value === 1 && <ItemsItemsSubpage />}
      {value === 2 && <ItemsBannerSubpage />}
    </span>
  );
}
