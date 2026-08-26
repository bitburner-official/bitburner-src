import type { CompanyPosition } from "../CompanyPosition";
import type { Company } from "../Company";

import * as React from "react";

import { Player } from "@player";
import { Typography } from "@mui/material";
import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";
import { JobSummary } from "./JobSummary";
import { Requirement } from "../../ui/Components/Requirement";
import { getJobRequirements } from "../GetJobRequirements";
import { dialogBoxCreate } from "../../ui/React/DialogBox";

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
      <Typography>接受所有申请者</Typography>
    ) : (
      <>
        <Typography>要求：</Typography>
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
          兼职工作可以
          <br /> 同时进行其他活动而不会受到惩罚。
        </Typography>
      )}
      <br />
      {positionRequirements}
    </>
  );

  function applyForJob(): void {
    const result = Player.applyForJob(company, position);
    if (result.message) {
      dialogBoxCreate(result.message);
    }
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
