// React Component for the element that contains the actual info/data
// for the Corporation UI. This panel lies below the header tabs and will
// be filled with whatever is needed based on the routing/navigation
import React from "react";

import { CityTabs } from "./CityTabs";
import { Context, useCorporation } from "./Context";

import { CityName } from "@enums";

interface IProps {
  divisionName: string;
  rerender: () => void;
}

export function MainPanel(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const division = corp.divisions.get(props.divisionName);
  if (!division) throw new Error("Cannot find division");
  return (
    <Context.Division.Provider value={division}>
      <CityTabs rerender={props.rerender} city={CityName.Sector12} />
    </Context.Division.Provider>
  );
}
