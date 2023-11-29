import * as React from "react";

import { Company } from "../../Company/Company";
import { CompanyPosition } from "../../Company/CompanyPosition";
import { getJobRequirements } from "../../Company/GetJobRequirements";
import { Settings } from "../../Settings/Settings";

import { Player } from "@player";
import { Requirement } from "../../ui/Components/Requirement";
import { Tooltip, Typography, Box } from "@mui/material";
import { calculateCompanyWorkStats } from "../../Work/Formulas";
import { MoneyRate } from "../../ui/React/MoneyRate";
import { ReputationRate } from "../../ui/React/ReputationRate";
import { StatsTable } from "../../ui/React/StatsTable";
import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";
import { CompanyPositions } from "../../Company/CompanyPositions";
import { Work } from "@mui/icons-material";

interface IProps {
  company: Company;
  position: CompanyPosition;
  currentPosition: CompanyPosition | null;
}

/** React Component for a button that's used to apply for a job */
export function ApplyToJobButton(props: IProps): React.ReactElement {
  const reqs = getJobRequirements(props.company, props.position);
  const workStats = calculateCompanyWorkStats(Player, props.company, props.position, props.company.favor);
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
      <Typography>
        <u>{props.position.name}</u>
        <StatsTable
          rows={[
            ["Wages:", <MoneyRate key="money" money={workStats.money} />],
            ["Reputation:", <ReputationRate key="rep" reputation={workStats.reputation} />],
          ]}
        />
      </Typography>
      <br />
      {positionRequirements}
    </>
  );

  const underqualified = !Player.isQualified(props.company, props.position);
  const isCurrentPosition = props.position == props.currentPosition;
  const nextPos = props.position.nextPosition && CompanyPositions[props.position.nextPosition];
  const overqualified = nextPos && Player.isQualified(props.company, nextPos);

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
  } else if (!underqualified) {
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
        <Typography sx={{ color }}>{props.position.name}</Typography>
      </Tooltip>
      <div style={{ color, display: "flex", justifyContent: "center" }}>{control}</div>
    </Box>
  );
}
