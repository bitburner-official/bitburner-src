import type { Company } from "../Company";
import type { CompanyPosition } from "../CompanyPosition";

import React from "react";

import { CompanyPositions } from "../CompanyPositions";
import { ApplyToJobButton } from "./ApplyToJobButton";
import { Player } from "@player";

interface JobListingsProps {
  company: Company;
  currentPosition: CompanyPosition | null;
}

export function JobListings({ company, currentPosition }: JobListingsProps): React.ReactElement {
  const jobNames = [...company.companyPositions];
  const qualifiedJobs = new Set(jobNames.filter((jobName) => Player.isQualified(company, CompanyPositions[jobName])));
  const jobsToShow = [];
  for (const jobName of jobNames) {
    if (jobName === currentPosition?.name) continue;
    const job = CompanyPositions[jobName];
    const nextJobName = job.nextPosition;
    // Don't show a job if we already qualify for a later job offered by this company
    if (nextJobName && qualifiedJobs.has(nextJobName)) continue;
    // Don't show a job if we don't qualify for it, unless it's a starting job or a promotion from current job
    if (!qualifiedJobs.has(jobName) && job.requiredReputation > 0 && jobName !== currentPosition?.nextPosition) {
      continue;
    }
    jobsToShow.push(job);
  }

  return (
    <>
      {jobsToShow.map((job) => (
        <ApplyToJobButton key={job.name} company={company} position={job} qualified={qualifiedJobs.has(job.name)} />
      ))}
    </>
  );
}
