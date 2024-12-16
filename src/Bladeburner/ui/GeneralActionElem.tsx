import type { Bladeburner } from "../Bladeburner";
import type { GeneralAction } from "../Actions/GeneralAction";

import React from "react";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { Player } from "@player";
import { Paper, Typography } from "@mui/material";
import { useRerender } from "../../ui/React/hooks";
import { ActionHeader } from "./ActionHeader";
import { BladeburnerGeneralActionName } from "@enums";
import { SuccessChance } from "./SuccessChance";

interface GeneralActionElemProps {
  bladeburner: Bladeburner;
  action: GeneralAction;
}

export function GeneralActionElem({ bladeburner, action }: GeneralActionElemProps): React.ReactElement {
  const rerender = useRerender();
  const actionTime = action.getActionTime(bladeburner, Player);

  return (
    <Paper sx={{ my: 1, p: 1 }}>
      <ActionHeader bladeburner={bladeburner} action={action} rerender={rerender}></ActionHeader>
      <br />
      <Typography whiteSpace={"pre-wrap"}>{action.desc}</Typography>
      <br />
      <Typography>
        Time Required: {convertTimeMsToTimeElapsedString(actionTime * 1000)}
        {action.name === BladeburnerGeneralActionName.Recruitment && (
          <>
            <br />
            <SuccessChance action={action} bladeburner={bladeburner} />
          </>
        )}
      </Typography>
    </Paper>
  );
}
