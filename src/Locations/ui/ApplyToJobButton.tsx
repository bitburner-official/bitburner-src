import * as React from "react";

import { Company } from "../../Company/Company";
import { CompanyPosition } from "../../Company/CompanyPosition";
import { getJobRequirements } from "../../Company/GetJobRequirements";

import { Player } from "@player";
import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";
import { Requirement } from "../../ui/Components/Requirement";
import { Typography } from "@mui/material";

interface IProps {
  company: Company;
  entryPosType: CompanyPosition;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  text: string;
}

/** React Component for a button that's used to apply for a job */
export function ApplyToJobButton(props: IProps): React.ReactElement {
  const pos = Player.getNextCompanyPosition(props.company, props.entryPosType);
  let disabledText;
  let tooltip;

  if (pos == null) {
    disabledText = "You are already at the highest position for your field! No promotion available.";
  } else {
    if (!props.company.hasPosition(pos as CompanyPosition)) {
      disabledText = `You are already at the highest position available at ${props.company.name}. No promotion available.`;
    } else {
      const reqs = getJobRequirements(props.company, pos);

      tooltip = (
        <>
          <Typography sx={{ textAlign: "center" }}>
            <b>{pos.name}</b>
          </Typography>
          {reqs.length == 0
            ? "Accepting all applicants"
            : reqs.map((req, i) => <Requirement key={i} fulfilled={req.isSatisfied(Player)} value={req.toString()} />)}
        </>
      );
    }
  }

  return (
    <ButtonWithTooltip normalTooltip={tooltip} disabledTooltip={disabledText} onClick={props.onClick}>
      {props.text}
    </ButtonWithTooltip>
  );
}
