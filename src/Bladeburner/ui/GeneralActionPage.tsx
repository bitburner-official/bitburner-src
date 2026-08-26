import type { Bladeburner } from "../Bladeburner";

import * as React from "react";
import { Typography } from "@mui/material";
import { GeneralActionElem } from "./GeneralActionElem";
import { GeneralActions } from "../data/GeneralActions";

interface GeneralActionPageProps {
  bladeburner: Bladeburner;
}

export function GeneralActionPage({ bladeburner }: GeneralActionPageProps): React.ReactElement {
  const actions = Object.values(GeneralActions);
  return (
    <>
      <Typography>这些是协助你履行Bladeburner职责的通用行动。</Typography>
      {actions.map((action) => (
        <GeneralActionElem key={action.name} bladeburner={bladeburner} action={action} />
      ))}
    </>
  );
}
