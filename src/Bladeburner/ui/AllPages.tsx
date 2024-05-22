import type { Bladeburner } from "../Bladeburner";

import React from "react";
import { Box, Tab, Tabs } from "@mui/material";

import { GeneralActionPage } from "./GeneralActionPage";
import { ContractPage } from "./ContractPage";
import { OperationPage } from "./OperationPage";
import { BlackOpPage } from "./BlackOpPage";
import { SkillPage } from "./SkillPage";

interface IProps {
  bladeburner: Bladeburner;
}

export function AllPages({ bladeburner }: IProps): React.ReactElement {
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
        {value === 0 && <GeneralActionPage bladeburner={bladeburner} />}
        {value === 1 && <ContractPage bladeburner={bladeburner} />}
        {value === 2 && <OperationPage bladeburner={bladeburner} />}
        {value === 3 && <BlackOpPage bladeburner={bladeburner} />}
        {value === 4 && <SkillPage bladeburner={bladeburner} />}
      </Box>
    </>
  );
}
