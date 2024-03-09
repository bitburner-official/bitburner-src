import type { CompanyPosition } from "../CompanyPosition";
import type { Company } from "../Company";

import * as React from "react";

import { Player } from "@player";
import { Typography } from "@mui/material";
import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";
import { JobSummary } from "./JobSummary";
import { Requirement } from "../../ui/Components/Requirement";
import { getJobRequirements } from "../GetJobRequirements";

interface ApplyToJobProps {
  company: Company;
  position: CompanyPosition;
  qualified: boolean;
}

/** React Component for a button that's used to apply for a job */
export function ApplyToJobButton({ company, position, qualified }: ApplyToJobProps): React.ReactElement {
  const reqs = getJobRequirements(company, position);
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
      <JobSummary company={company} position={position} />
      {position.isPartTime && (
        <Typography>
          <br />
          Part-time jobs have no penalty for
          <br /> doing something else simultaneously.
        </Typography>
      )}
      <br />
      {positionRequirements}
    </>
  );

  function applyForJob(): void {
    Player.applyForJob(company, position);
  }

  return (
    <ButtonWithTooltip
      disabledTooltip={!qualified && positionDetails}
      normalTooltip={positionDetails}
      onClick={applyForJob}
      tooltipProps={{ style: { display: "grid" } }}
    >
      {position.applyText}
    </ButtonWithTooltip>
  );
}
