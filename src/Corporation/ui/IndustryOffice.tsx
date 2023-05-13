// React Component for displaying an Industry's OfficeSpace information
// (bottom-left panel in the Industry UI)
import React, { useState } from "react";

import { OfficeSpace } from "../OfficeSpace";
import { CorpUnlockName, CorpEmployeeJob } from "../data/Enums";
import { BuyTea } from "../Actions";

import { MoneyCost } from "./MoneyCost";
import { formatCorpStat } from "../../ui/formatNumber";

import { UpgradeOfficeSizeModal } from "./modals/UpgradeOfficeSizeModal";
import { ThrowPartyModal } from "./modals/ThrowPartyModal";
import { Money } from "../../ui/React/Money";
import { useCorporation, useDivision } from "./Context";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
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

interface IProps {
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

function AutoManagement(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const division = useDivision();

  const currUna = props.office.employeeJobs[CorpEmployeeJob.Unassigned];
  const nextUna = props.office.employeeNextJobs[CorpEmployeeJob.Unassigned];

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
            <Typography>{formatCorpStat(props.office.totalExperience / props.office.totalEmployees || 0)}</Typography>
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
                    <Typography>
                      The base amount of material this office can produce. Does not include production multipliers from
                      upgrades and materials. This value is based off the productivity of your Operations, Engineering,
                      and Management employees
                    </Typography>
                  }
                >
                  <Typography>Material Production:</Typography>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Typography align="right">{formatCorpStat(division.getOfficeProductivity(props.office))}</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Tooltip
                  title={
                    <Typography>
                      The base amount of any given Product this office can produce. Does not include production
                      multipliers from upgrades and materials. This value is based off the productivity of your
                      Operations, Engineering, and Management employees
                    </Typography>
                  }
                >
                  <Typography>Product Production:</Typography>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Typography align="right">
                  {formatCorpStat(division.getOfficeProductivity(props.office, { forProduct: true }))}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Tooltip
                  title={<Typography>The effect this office's 'Business' employees has on boosting sales</Typography>}
                >
                  <Typography> Business Multiplier:</Typography>
                </Tooltip>
              </TableCell>
              <TableCell align="right">
                <Typography>x{formatCorpStat(division.getBusinessFactor(props.office))}</Typography>
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

export function IndustryOffice(props: IProps): React.ReactElement {
  const corp = useCorporation();
  const division = useDivision();
  const [upgradeOfficeSizeOpen, setUpgradeOfficeSizeOpen] = useState(false);
  const [throwPartyOpen, setThrowPartyOpen] = useState(false);

  function autohireEmployeeButtonOnClick(): void {
    if (props.office.atCapacity()) return;
    props.office.hireRandomEmployee(CorpEmployeeJob.Unassigned);
    props.rerender();
  }

  return (
    <Paper>
      <Typography>Office Space</Typography>
      <Typography>
        Size: {props.office.totalEmployees} / {props.office.size} employees
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr", width: "fit-content" }}>
        <Box sx={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <Tooltip title={<Typography>Hires an employee</Typography>}>
            <span>
              <Button disabled={props.office.atCapacity()} onClick={autohireEmployeeButtonOnClick}>
                Hire Employee
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={<Typography>Upgrade the office's size so that it can hold more employees!</Typography>}>
            <span>
              <Button disabled={corp.funds < 0} onClick={() => setUpgradeOfficeSizeOpen(true)}>
                Upgrade size
              </Button>
            </span>
          </Tooltip>
          <UpgradeOfficeSizeModal
            rerender={props.rerender}
            office={props.office}
            open={upgradeOfficeSizeOpen}
            onClose={() => setUpgradeOfficeSizeOpen(false)}
          />

          {!division.hasResearch("AutoBrew") && (
            <>
              <Tooltip
                title={
                  <Typography>
                    Provide your employees with tea, increasing their energy by half the difference to 100%, plus 1.5%
                  </Typography>
                }
              >
                <span>
                  <Button
                    disabled={corp.funds < props.office.getTeaCost() || props.office.teaPending}
                    onClick={() => BuyTea(corp, props.office)}
                  >
                    {props.office.teaPending ? (
                      "Buying tea..."
                    ) : (
                      <span>
                        Buy Tea - <MoneyCost money={props.office.getTeaCost()} corp={corp} />
                      </span>
                    )}
                  </Button>
                </span>
              </Tooltip>
            </>
          )}

          {!division.hasResearch("AutoPartyManager") && (
            <>
              <Tooltip title={<Typography>Throw an office party to increase your employee's morale</Typography>}>
                <span>
                  <Button
                    disabled={corp.funds < 0 || props.office.partyMult > 1}
                    onClick={() => setThrowPartyOpen(true)}
                  >
                    {props.office.partyMult > 1 ? "Throwing Party..." : "Throw Party"}
                  </Button>
                </span>
              </Tooltip>
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
