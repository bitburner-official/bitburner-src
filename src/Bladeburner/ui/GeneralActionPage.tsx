import * as React from "react";

import Typography from "@mui/material/Typography";

import { Bladeburner } from "../Bladeburner";
import { GeneralActionList } from "./GeneralActionList";

interface IProps {
  bladeburner: Bladeburner;
}

export function GeneralActionPage(props: IProps): React.ReactElement {
  return (
    <>
      <Typography>These are generic actions that will assist you in your Bladeburner duties.</Typography>
      <GeneralActionList bladeburner={props.bladeburner} />
    </>
  );
}
