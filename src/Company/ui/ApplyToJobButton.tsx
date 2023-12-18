import * as React from "react";

import { Company } from "../Company";
import { CompanyPosition } from "../CompanyPosition";
import { Settings } from "../../Settings/Settings";

import { Player } from "@player";
import { Tooltip, Typography, Box } from "@mui/material";
import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";
import { CompanyPositions } from "../CompanyPositions";
import { Work } from "@mui/icons-material";
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
  const isCurrentPosition = props.position == props.currentPosition;
  const nextPos = props.position.nextPosition && CompanyPositions[props.position.nextPosition];
  const overqualified = nextPos != null && Player.isQualified(props.company, nextPos);
  const shouldShowApplyButton = !overqualified && (!underqualified || props.position.requiredReputation == 0);
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

  let color = Settings.theme.primary;
  let control = null;

  if (isCurrentPosition) {
    color = Settings.theme.primarylight;
    control = (
      <Tooltip title={"This is your current position"}>
        <Work />
      </Tooltip>
    );
  } else if (overqualified) {
    color = Settings.theme.primarydark;
  } else if (shouldShowApplyButton) {
    control = (
      <ButtonWithTooltip
        disabledTooltip={underqualified && "You do not meet the requirements"}
        normalTooltip={props.position.applyText}
        onClick={applyForJob}
      >
        Apply
      </ButtonWithTooltip>
    );
  }

  return (
    <Box
      display="grid"
      sx={{
        alignItems: "center",
        gridTemplateColumns: "1fr 80px",
        minWidth: "fit-content",
        minHeight: "2em",
        gap: 0.5,
        pl: 4,
      }}
    >
      <Tooltip title={positionDetails}>
        <Typography sx={{ color, whiteSpace: "nowrap" }}>{props.position.name}</Typography>
      </Tooltip>
      <div style={{ color, display: "flex", justifyContent: "center" }}>{control}</div>
    </Box>
  );
}
