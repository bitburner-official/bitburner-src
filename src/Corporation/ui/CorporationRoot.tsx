// React Components for the Corporation UI's navigation tabs
// These are the tabs at the top of the UI that let you switch to different
// divisions, see an overview of your corporation, or create a new industry
import React, { useState } from "react";
import { MainPanel } from "./MainPanel";
import { IndustryType } from "../data/Enums";
import { ExpandIndustryTab } from "./ExpandIndustryTab";
import { Player } from "@player";
import { Context } from "./Context";
import { Overview } from "./Overview";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useRerender } from "../../ui/React/hooks";

export function CorporationRoot(): React.ReactElement {
  const rerender = useRerender(200);
  const corporation = Player.corporation;
  if (corporation === null) return <></>;
  const [divisionName, setDivisionName] = useState<string | number>("Overview");
  function handleChange(event: React.SyntheticEvent, tab: string | number): void {
    setDivisionName(tab);
  }

  const canExpand =
    Object.values(IndustryType).filter(
      (industryType) => corporation.divisions.find((division) => division.type === industryType) === undefined,
    ).length > 0;

  return (
    <Context.Corporation.Provider value={corporation}>
      <Tabs variant="scrollable" value={divisionName} onChange={handleChange} sx={{ maxWidth: "65vw" }} scrollButtons>
        <Tab label={corporation.name} value={"Overview"} />
        {corporation.divisions.map((div) => (
          <Tab key={div.name} label={div.name} value={div.name} />
        ))}
        {canExpand && <Tab label={"Expand"} value={-1} />}
      </Tabs>
      {divisionName === "Overview" && <Overview rerender={rerender} />}
      {divisionName === -1 && <ExpandIndustryTab setDivisionName={setDivisionName} />}
      {typeof divisionName === "string" && divisionName !== "Overview" && (
        <MainPanel rerender={rerender} divisionName={divisionName + ""} />
      )}
    </Context.Corporation.Provider>
  );
}
