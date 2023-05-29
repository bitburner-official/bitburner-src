import React from "react";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

import { Bladeburner } from "../Bladeburner";
import { BlackOpPage } from "./BlackOpPage";
import { ContractPage } from "./ContractPage";
import { GeneralActionPage } from "./GeneralActionPage";
import { OperationPage } from "./OperationPage";
import { SkillPage } from "./SkillPage";

interface IProps {
  bladeburner: Bladeburner;
}

export function AllPages(props: IProps): React.ReactElement {
  const [value, setValue] = React.useState(0);

  function handleChange(event: React.SyntheticEvent, tab: number): void {
    setValue(tab);
  }

  return (
    <>
      <Tabs variant="fullWidth" value={value} onChange={handleChange}>
        <Tab label="General" />
        <Tab label="Contracts" />
        <Tab label="Operations" />
        <Tab label="BlackOps" />
        <Tab label="Skills" />
      </Tabs>
      <Box sx={{ p: 1 }}>
        {value === 0 && <GeneralActionPage bladeburner={props.bladeburner} />}
        {value === 1 && <ContractPage bladeburner={props.bladeburner} />}
        {value === 2 && <OperationPage bladeburner={props.bladeburner} />}
        {value === 3 && <BlackOpPage bladeburner={props.bladeburner} />}
        {value === 4 && <SkillPage bladeburner={props.bladeburner} />}
      </Box>
    </>
  );
}
