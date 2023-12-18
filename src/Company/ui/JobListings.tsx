import type { Company } from "../Company";
import type { CompanyPosition } from "../CompanyPosition";

import React from "react";

import { CompanyPositions } from "../CompanyPositions";
import { ApplyToJobButton } from "./ApplyToJobButton";
import { Player } from "@player";

interface IJobListingsProps {
  company: Company;
  currentPosition: CompanyPosition | null;
}

export function JobListings(props: IJobListingsProps): React.ReactElement {
  const { company, currentPosition } = props;

  const jobsToShow = [];
  for (const jobName of company.companyPositions) {
    const offeredPos = CompanyPositions[jobName];
    const underqualified = !Player.isQualified(props.company, offeredPos);
    const isCurrentPosition = jobName == props.currentPosition?.name;
    const nextPos = offeredPos.nextPosition && CompanyPositions[offeredPos.nextPosition];
    const overqualified = nextPos != null && Player.isQualified(props.company, nextPos);
    const shouldShowApplyButton =
      !isCurrentPosition && !overqualified && (!underqualified || offeredPos.requiredReputation == 0);

    if (shouldShowApplyButton) {
      jobsToShow.push(offeredPos);
    }
  }

  return (
    <>
      {jobsToShow.map((position) => (
        <ApplyToJobButton key={position.name} company={company} position={position} currentPosition={currentPosition} />
      ))}
    </>
  );
}
