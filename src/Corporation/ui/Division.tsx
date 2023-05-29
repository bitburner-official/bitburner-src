// React Component for managing the Corporation's Industry UI
// This Industry component does NOT include the city tabs at the top
import React from "react";

import Box from "@mui/material/Box";

import { CityName } from "../../Enums";
import { OfficeSpace } from "../OfficeSpace";
import { Warehouse } from "../Warehouse";
import { useCorporation, useDivision } from "./Context";
import { DivisionOffice } from "./DivisionOffice";
import { DivisionOverview } from "./DivisionOverview";
import { DivisionWarehouse } from "./DivisionWarehouse";

interface IProps {
  city: CityName;
  warehouse?: Warehouse;
  office: OfficeSpace;
  rerender: () => void;
}

export function Division(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const division = useDivision();
  return (
    <Box display="flex">
      <Box sx={{ width: "50%" }}>
        <DivisionOverview rerender={props.rerender} />
        <DivisionOffice rerender={props.rerender} office={props.office} />
      </Box>
      <Box sx={{ width: "50%" }}>
        <DivisionWarehouse
          rerender={props.rerender}
          corp={corp}
          currentCity={props.city}
          division={division}
          warehouse={props.warehouse}
        />
      </Box>
    </Box>
  );
}
