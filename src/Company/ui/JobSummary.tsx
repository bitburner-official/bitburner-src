import { Typography } from "@mui/material";
import { Player } from "@player";
import * as React from "react";
import { CONSTANTS } from "../../Constants";
import { calculateCompanyWorkStats } from "../../Work/Formulas";
import { MoneyRate } from "../../ui/React/MoneyRate";
import { ReputationRate } from "../../ui/React/ReputationRate";
import { StatsTable } from "../../ui/React/StatsTable";
import type { Company } from "../Company";
import type { CompanyPosition } from "../CompanyPosition";

const CYCLES_PER_SEC = 1000 / CONSTANTS.MilliPerCycle;
interface IJobSummaryProps {
  company: Company;
  position: CompanyPosition;
  overqualified?: boolean;
}

export function JobSummary(props: IJobSummaryProps): React.ReactElement {
  const workStats = calculateCompanyWorkStats(Player, props.company, props.position, props.company.favor);
  return (
    <>
      <Typography>
        <u>{props.position.name}</u>
      </Typography>
      <StatsTable
        wide
        rows={[
          ["Wages:", <MoneyRate key="money" money={workStats.money * CYCLES_PER_SEC} />],
          ["Reputation:", <ReputationRate key="rep" reputation={workStats.reputation * CYCLES_PER_SEC} />],
        ]}
      />
    </>
  );
}
