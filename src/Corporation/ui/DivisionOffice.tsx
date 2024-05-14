// React Component for displaying an Industry's OfficeSpace information
// (bottom-left panel in the Industry UI)
import React, { useState } from "react";

import { OfficeSpace } from "../OfficeSpace";
import { CorpUnlockName, CorpEmployeeJob, CorpUpgradeName, CorpProductResearchName } from "@enums";
import { buyTea } from "../Actions";

import { MoneyCost } from "./MoneyCost";
import { formatBigNumber, formatCorpStat, formatCorpMultiplier } from "../../ui/formatNumber";

import { UpgradeOfficeSizeModal } from "./modals/UpgradeOfficeSizeModal";
import { ThrowPartyModal } from "./modals/ThrowPartyModal";
import { Money } from "../../ui/React/Money";
import { useCorporation, useDivision } from "./Context";

import Typography from "@mui/material/Typography";
import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Tooltip from "@mui/material/Tooltip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import { TableCell } from "../../ui/React/Table";
import { Box } from "@mui/material";
import { StatsTable } from "../../ui/React/StatsTable";

interface OfficeProps {
  office: OfficeSpace;
  rerender: () => void;
}

interface IAutoAssignProps {
  office: OfficeSpace;
  job: CorpEmployeeJob;
  desc: string;
  rerender: () => void;
}

function EmployeeCount(props: { num: number; next: number }): React.ReactElement {
  return (
    <Typography display="flex" alignItems="center" justifyContent="flex-end">
      {props.num === props.next ? null : props.num}
      {props.num === props.next ? null : <ArrowForwardIcon fontSize="inherit" />}
      {props.next}
    </Typography>
  );
}

function AutoAssignJob(props: IAutoAssignProps): React.ReactElement {
  const currJob = props.office.employeeJobs[props.job];
  const nextJob = props.office.employeeNextJobs[props.job];
  const nextUna = props.office.employeeNextJobs[CorpEmployeeJob.Unassigned];

  function assignEmployee(): void {
    if (nextUna <= 0) return console.warn("Cannot assign employee. No unassigned employees available");

    props.office.autoAssignJob(props.job, nextJob + 1);
    props.rerender();
  }

  function unassignEmployee(): void {
    props.office.autoAssignJob(props.job, nextJob - 1);
    props.rerender();
  }

  return (
    <TableRow>
      <TableCell>
        <Tooltip title={props.desc}>
          <Typography>{props.job}</Typography>
        </Tooltip>
      </TableCell>
      <TableCell>
        <EmployeeCount num={currJob} next={nextJob} />
      </TableCell>
      <TableCell width="1px">
        <IconButton disabled={nextUna === 0} onClick={assignEmployee}>
          <ArrowDropUpIcon />
        </IconButton>
      </TableCell>
      <TableCell width="1px">
        <IconButton disabled={nextJob === 0} onClick={unassignEmployee}>
          <ArrowDropDownIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

function AutoManagement(props: OfficeProps): React.ReactElement {
  const corp = useCorporation();
  const division = useDivision();

  const currUna = props.office.employeeJobs[CorpEmployeeJob.Unassigned];
  const nextUna = props.office.employeeNextJobs[CorpEmployeeJob.Unassigned];

  const totalMaterialProduction =
    division.getOfficeProductivity(props.office) *
    corp.getProductionMultiplier() *
    division.productionMult *
    division.getProductionMultiplier();
  const materialBreakdown = (
    <StatsTable
      rows={[
        ["Employee Production:", formatBigNumber(division.getOfficeProductivity(props.office, { forProduct: false }))],
        ["Boosting Materials:", formatCorpMultiplier(division.productionMult)],
        ["Research:", formatCorpMultiplier(division.getProductionMultiplier())],
        [`${CorpUpgradeName.SmartFactories}:`, formatCorpMultiplier(corp.getProductionMultiplier())],
        [<b key={1}>Total Material Production:</b>, <b key={2}>{formatCorpStat(totalMaterialProduction)}</b>],
      ]}
    />
  );

  const totalProductProduction =
    division.getOfficeProductivity(props.office, { forProduct: true }) *
    corp.getProductionMultiplier() *
    division.productionMult *
    division.getProductionMultiplier() *
    division.getProductProductionMultiplier();
  const productBreakdown = (
    <StatsTable
      rows={[
        ["Employee Production:", formatBigNumber(division.getOfficeProductivity(props.office, { forProduct: true }))],
        ["Boosting Materials:", formatCorpMultiplier(division.productionMult)],
        ["Research:", formatCorpMultiplier(division.getProductionMultiplier())],
        [`${CorpProductResearchName.Fulcrum}:`, formatCorpMultiplier(division.getProductProductionMultiplier())],
        [`${CorpUpgradeName.SmartFactories}:`, formatCorpMultiplier(corp.getProductionMultiplier())],
        [<b key={1}>Total Product Production:</b>, <b key={2}>{formatCorpStat(totalProductProduction)}</b>],
      ]}
    />
  );

  // Sale multipliers
  const businessFactor = division.getBusinessFactor(props.office); //Business employee productivity
  const [adsTotal] = division.getAdvertisingFactors(); //Awareness + popularity
  const researchMult = division.getSalesMultiplier();
  const upgradeMult = corp.getSalesMult();
  const totalSaleMultiplier = businessFactor * adsTotal * researchMult * upgradeMult;
  const salesBreakdown = (
    <StatsTable
      rows={[
        ["Business Employees:", formatCorpMultiplier(businessFactor)],
        ["Advertising:", formatCorpMultiplier(adsTotal)],
        researchMult !== 1 ? ["Research:", formatCorpMultiplier(researchMult)] : [],
        [`${CorpUpgradeName.ABCSalesBots}:`, formatCorpMultiplier(upgradeMult)],
        [<b key={1}>Total Sales Multiplier:</b>, <b key={2}>{formatCorpMultiplier(totalSaleMultiplier)}</b>],
      ]}
    />
  );

  return (
    <Table padding="none">
      <TableBody>
        <TableRow>
          <TableCell>
            <Typography>Unassigned Employees:</Typography>
          </TableCell>
          <TableCell>
            <EmployeeCount num={currUna} next={nextUna} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Typography>Avg Employee Morale:</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography>{formatCorpStat(props.office.avgMorale)}</Typography>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Typography>Avg Employee Energy:</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography>{formatCorpStat(props.office.avgEnergy)}</Typography>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Typography>Avg Employee Experience:</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography>{formatCorpStat(props.office.totalExperience / props.office.numEmployees || 0)}</Typography>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Typography>Total Employee Salary:</Typography>
          </TableCell>
          <TableCell>
            <Typography align="right">
              <Money money={props.office.totalSalary} />
            </Typography>
          </TableCell>
        </TableRow>
        {corp.unlocks.has(CorpUnlockName.VeChain) && (
          <>
            <TableRow>
              <TableCell>
                <Tooltip
                  title={
                    <Typography component="div">
                      The amount of material this office can produce.
                      <br />
                      This value is based off the productivity of your
                      <br />
                      Operations, Engineering, and Management employees.
                    </Typography>
                  }
                >
                  <Typography>Material Production:</Typography>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Tooltip title={materialBreakdown}>
                  <Typography align="right">{formatCorpStat(totalMaterialProduction)}</Typography>
                </Tooltip>
              </TableCell>
            </TableRow>
            {division.makesProducts ? (
              <TableRow>
                <TableCell>
                  <Tooltip
                    title={
                      <Typography component="div">
                        The amount of any given Product this office can produce.
                        <br />
                        This value is based off the productivity of your
                        <br />
                        Operations, Engineering, and Management employees.
                      </Typography>
                    }
                  >
                    <Typography>Product Production:</Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={productBreakdown}>
                    <Typography align="right">{formatCorpStat(totalProductProduction)}</Typography>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ) : null}
            <TableRow>
              <TableCell>
                <Tooltip
                  title={
                    <Typography>
                      This office's sales effectivity for all materials and products.
                      <br />
                      It is based on your Business employees and your advertising.
                      <br />
                      This will be further modified by demand and competition for each item.
                    </Typography>
                  }
                >
                  <Typography>Sales Multiplier:</Typography>
                </Tooltip>
              </TableCell>
              <TableCell align="right">
                <Tooltip title={salesBreakdown}>
                  <Typography>{formatCorpMultiplier(totalSaleMultiplier)}</Typography>
                </Tooltip>
              </TableCell>
            </TableRow>
          </>
        )}
        <AutoAssignJob
          rerender={props.rerender}
          office={props.office}
          job={CorpEmployeeJob.Operations}
          desc={"Manages supply chain operations. Improves the amount of Materials and Products you produce."}
        />

        <AutoAssignJob
          rerender={props.rerender}
          office={props.office}
          job={CorpEmployeeJob.Engineer}
          desc={
            "Develops and maintains products and production systems. Increases the quality of everything you produce. Also increases the amount you produce (not as much as Operations, however)."
          }
        />

        <AutoAssignJob
          rerender={props.rerender}
          office={props.office}
          job={CorpEmployeeJob.Business}
          desc={"Handles sales and finances. Improves the amount of Materials and Products you can sell."}
        />

        <AutoAssignJob
          rerender={props.rerender}
          office={props.office}
          job={CorpEmployeeJob.Management}
          desc={
            "Leads and oversees employees and office operations. Improves the effectiveness of Engineer and Operations employees."
          }
        />

        <AutoAssignJob
          rerender={props.rerender}
          office={props.office}
          job={CorpEmployeeJob.RandD}
          desc={
            "Research new innovative ways to improve the company. Generates Scientific Research. Also increases the quality of everything you produce (not as much as Engineer, however)."
          }
        />

        <AutoAssignJob
          rerender={props.rerender}
          office={props.office}
          job={CorpEmployeeJob.Intern}
          desc={
            "Set employee to intern, which will increase some of their stats. Employees in intern do not affect any company operations, but gain increased exp and improve morale and energy."
          }
        />
      </TableBody>
    </Table>
  );
}

export function DivisionOffice(props: OfficeProps): React.ReactElement {
  const corp = useCorporation();
  const division = useDivision();
  const [upgradeOfficeSizeOpen, setUpgradeOfficeSizeOpen] = useState(false);
  const [throwPartyOpen, setThrowPartyOpen] = useState(false);

  function autohireEmployeeButtonOnClick(): void {
    if (props.office.atCapacity()) return;
    props.office.hireRandomEmployee(CorpEmployeeJob.Unassigned);
    props.rerender();
  }

  const hireEmployeeDisabledText = props.office.atCapacity() ? "Insufficient office space" : "";
  const teaDisabledText =
    corp.funds < props.office.getTeaCost()
      ? "Insufficient corporation funds"
      : props.office.teaPending
      ? "Tea is already pending for this cycle"
      : "";
  const partyPending = props.office.partyMult > 1;
  const partyDisabledText =
    corp.funds < 0 ? "Insufficient corporation funds" : partyPending ? "A party is already pending for this cycle" : "";

  return (
    <Paper>
      <Typography>Office Space</Typography>
      <Typography>
        Size: {props.office.numEmployees} / {props.office.size} employees
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr", width: "fit-content" }}>
        <Box sx={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <ButtonWithTooltip disabledTooltip={hireEmployeeDisabledText} onClick={autohireEmployeeButtonOnClick}>
            Hire Employee
          </ButtonWithTooltip>
          <ButtonWithTooltip
            normalTooltip={"Upgrade the office's size so that it can hold more employees!"}
            onClick={() => setUpgradeOfficeSizeOpen(true)}
          >
            Upgrade size
          </ButtonWithTooltip>
          <UpgradeOfficeSizeModal
            rerender={props.rerender}
            office={props.office}
            open={upgradeOfficeSizeOpen}
            onClose={() => setUpgradeOfficeSizeOpen(false)}
          />

          {!division.hasResearch("AutoBrew") && (
            <ButtonWithTooltip
              normalTooltip={"Provide your employees with tea to increase their energy"}
              disabledTooltip={teaDisabledText}
              onClick={() => buyTea(corp, props.office)}
            >
              {props.office.teaPending ? (
                "Buying Tea"
              ) : (
                <>
                  Buy Tea - <MoneyCost money={props.office.getTeaCost()} corp={corp} />
                </>
              )}
            </ButtonWithTooltip>
          )}

          {!division.hasResearch("AutoPartyManager") && (
            <>
              <ButtonWithTooltip
                normalTooltip={"Throw an office party to increase your employees' morale"}
                disabledTooltip={partyDisabledText}
                onClick={() => setThrowPartyOpen(true)}
              >
                {props.office.partyMult > 1 ? "Throwing Party..." : "Throw Party"}
              </ButtonWithTooltip>
              <ThrowPartyModal
                rerender={props.rerender}
                office={props.office}
                open={throwPartyOpen}
                onClose={() => setThrowPartyOpen(false)}
              />
            </>
          )}
        </Box>
      </Box>
      <AutoManagement rerender={props.rerender} office={props.office} />
    </Paper>
  );
}
