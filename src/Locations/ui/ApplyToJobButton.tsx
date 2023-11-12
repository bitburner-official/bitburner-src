import * as React from "react";

import { Company } from "../../Company/Company";
import { CompanyPosition } from "../../Company/CompanyPosition";
import { getJobRequirementText } from "../../Company/GetJobRequirementText";

import { Player } from "@player";
import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";

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
  let reqs;

  if (pos == null) {
    disabledText = "You are already at the highest position for your field! No promotion available.";
  } else {
    if (!props.company.hasPosition(pos as CompanyPosition)) {
      disabledText = `You are already at the highest position available at ${props.company.name}. No promotion available.`;
    } else {
      reqs = (
        <>
          <b>{pos.name}</b>
          <br />
          <span dangerouslySetInnerHTML={{ __html: getJobRequirementText(props.company, pos, true) }}></span>
        </>
      );
    }
  }

  return (
    <ButtonWithTooltip normalTooltip={reqs} disabledTooltip={disabledText} onClick={props.onClick}>
      {props.text}
    </ButtonWithTooltip>
  );
}
