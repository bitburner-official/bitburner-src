import type { Company } from "../Company";
import type { CompanyPosition } from "../CompanyPosition";
import type { JobField } from "@enums";

import React from "react";
import { Typography } from "@mui/material";
import { Modal } from "../../ui/React/Modal";

import { CompanyPositions } from "../CompanyPositions";
import { ApplyToJobButton } from "./ApplyToJobButton";

interface IProps {
  open: boolean;
  onClose: () => void;
  company: Company;
  currentPosition: CompanyPosition | null;
}

export function JobListingsModal(props: IProps): React.ReactElement {
  const { company, currentPosition } = props;

  const jobFields: Map<JobField, CompanyPosition[]> = new Map();
  for (const jobName of company.companyPositions) {
    const offeredPos = CompanyPositions[jobName];
    let track = jobFields.get(offeredPos.field);
    if (!track) {
      track = [];
      jobFields.set(offeredPos.field, track);
    }
    track.push(offeredPos);
  }

  return (
    <Modal open={props.open} onClose={props.onClose} sx={{ scrollbarWidth: "initial" }}>
      <Typography variant="h5" style={{ textAlign: "center" }}>
        Job Listings for {company.name}
      </Typography>
      {Array.from(jobFields.entries()).map(([jobField, positions]) => (
        <div key={jobField}>
          <Typography variant="h6" sx={{ mt: 1 }}>
            {jobField}
          </Typography>
          {positions.map((position) => (
            <ApplyToJobButton
              key={position.name}
              company={company}
              position={position}
              currentPosition={currentPosition}
            />
          ))}
        </div>
      ))}
    </Modal>
  );
}
