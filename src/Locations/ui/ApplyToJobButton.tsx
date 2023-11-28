import * as React from "react";

import { Company } from "../../Company/Company";
import { CompanyPosition } from "../../Company/CompanyPosition";
import { getJobRequirements } from "../../Company/GetJobRequirements";
import { Settings } from "../../Settings/Settings";

import { Player } from "@player";
import { Requirement } from "../../ui/Components/Requirement";
import { Button, Tooltip, Typography } from "@mui/material";

interface IProps {
  company: Company;
  position: CompanyPosition;
  currentPosition: CompanyPosition | null;
}

/** React Component for a button that's used to apply for a job */
export function ApplyToJobButton(props: IProps): React.ReactElement {
  const reqs = getJobRequirements(props.company, props.position);
  const positionReqs = (
    <>
      <Typography sx={{ textAlign: "center" }}>{props.position.name}</Typography>
      {reqs.length == 0
        ? "Accepting all applicants"
        : reqs.map((req, i) => <Requirement key={i} fulfilled={req.isSatisfied(Player)} value={req.toString()} />)}
    </>
  );

  const underqualified = !Player.isQualified(props.company, props.position);
  const overqualified =
    props.currentPosition?.field == props.position.field && props.currentPosition.rank > props.position.rank;
  const isCurrentPosition = props.position == props.currentPosition;

  function applyForJob(): void {
    Player.applyForJob(props.company, props.position);
  }

  return (
    <Tooltip title={positionReqs}>
      <Typography
        style={{
          color: isCurrentPosition
            ? Settings.theme.primarylight
            : overqualified
            ? Settings.theme.primarydark
            : Settings.theme.primary,
        }}
      >
        <Button disabled={underqualified} onClick={applyForJob}>
          Apply
        </Button>
        &nbsp;
        <span>
          {props.position.name}
          {props.position == props.currentPosition && " (Your current position)"}
        </span>
      </Typography>
    </Tooltip>
  );
}
