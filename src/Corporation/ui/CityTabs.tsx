// React Components for the Corporation UI's City navigation tabs
// These allow player to navigate between different cities for each industry
import type { OfficeSpace } from "../OfficeSpace";

import React, { useState } from "react";
import { Tab, Tabs } from "@mui/material";
import { CityName } from "@enums";
import { Division } from "./Division";
import { ExpandNewCity } from "./ExpandNewCity";
import { useDivision } from "./Context";
import { getRecordKeys } from "../../Types/Record";

interface IProps {
  city: CityName | "Expand";
  rerender: () => void;
}

export function CityTabs(props: IProps): React.ReactElement {
  const division = useDivision();
  const [city, setCity] = useState(props.city);

  let mainContent: JSX.Element;
  if (city === "Expand") {
    mainContent = <ExpandNewCity cityStateSetter={setCity} />;
  } else {
    const office = division.offices[city];
    if (!office) {
      setCity(CityName.Sector12);
      return <></>;
    }
    mainContent = (
      <Division rerender={props.rerender} city={city} warehouse={division.warehouses[city]} office={office} />
    );
  }
  const canExpand = Object.values(CityName).length > getRecordKeys(division.offices).length;
  function handleChange(event: React.SyntheticEvent, tab: CityName | "Expand"): void {
    setCity(tab);
  }

  return (
    <>
      <Tabs variant="fullWidth" value={city} onChange={handleChange} sx={{ maxWidth: "65vw" }}>
        {Object.values(division.offices).map(
          (office: OfficeSpace | 0) =>
            office !== 0 && <Tab key={office.city} label={office.city} value={office.city} />,
        )}
        {canExpand && <Tab label={"Expand"} value={"Expand"} />}
      </Tabs>
      {mainContent}
    </>
  );
}
