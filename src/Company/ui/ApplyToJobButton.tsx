import * as React from "react";

import { Company } from "../Company";
import { CompanyPosition } from "../CompanyPosition";

import { Player } from "@player";
import { Typography } from "@mui/material";
import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";
import { CompanyPositions } from "../CompanyPositions";
import { JobSummary } from "./JobSummary";
import { Requirement } from "../../ui/Components/Requirement";
import { getJobRequirements } from "../GetJobRequirements";

interface IProps {
  company: Company;
  position: CompanyPosition;
  currentPosition: CompanyPosition | null;
}

/** React Component for a button that's used to apply for a job */
export function ApplyToJobButton(props: IProps): React.ReactElement {
  const underqualified = !Player.isQualified(props.company, props.position);
  const nextPos = props.position.nextPosition && CompanyPositions[props.position.nextPosition];
  const overqualified = nextPos != null && Player.isQualified(props.company, nextPos);

  const reqs = getJobRequirements(props.company, props.position);
  const positionRequirements =
    reqs.length == 0 ? (
      <Typography>Accepting all applicants</Typography>
    ) : (
      <>
        <Typography>Requirements:</Typography>
        {reqs.map((req, i) => (
          <Requirement key={i} fulfilled={req.isSatisfied(Player)} value={req.toString()} />
        ))}
      </>
    );

  const positionDetails = (
    <>
      <JobSummary company={props.company} position={props.position} overqualified={overqualified} />
      {props.position.isPartTime && (
        <Typography>
          <br />
          Part-time jobs have no penalty for
          <br /> doing something else simultaneously.
        </Typography>
      )}
      <br />
      {positionRequirements}
      {overqualified && (
        <Typography>
          <br />
          You are overqualified for this position.
        </Typography>
      )}
    </>
  );

  function applyForJob(): void {
    Player.applyForJob(props.company, props.position);
  }

  return (
    <ButtonWithTooltip
      disabledTooltip={underqualified && positionDetails}
      normalTooltip={positionDetails}
      onClick={applyForJob}
      tooltipProps={{ style: { display: "grid" } }}
    >
      {props.position.applyText}
    </ButtonWithTooltip>
  );
}
