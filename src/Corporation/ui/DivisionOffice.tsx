// React Component for displaying an Industry's OfficeSpace information
// (bottom-left panel in the Industry UI)
import React, { useState } from "react";

import { OfficeSpace } from "../OfficeSpace";
import { CorpEmployeeJob, CorpUpgradeName, CorpProductResearchName } from "@enums";
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
import InfoIcon from "@mui/icons-material/Info";
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
  desc: React.ReactElement;
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
          <Typography sx={{ display: "flex", alignItems: "center" }}>
            {props.job}
            {props.job === CorpEmployeeJob.Intern && <InfoIcon sx={{ fontSize: "1.1em", marginLeft: "10px" }} />}
          </Typography>
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
        ["员工产出：", formatBigNumber(division.getOfficeProductivity(props.office, { forProduct: false }))],
        ["增产材料：", formatCorpMultiplier(division.productionMult)],
        ["研究：", formatCorpMultiplier(division.getProductionMultiplier())],
        [`${CorpUpgradeName.SmartFactories}：`, formatCorpMultiplier(corp.getProductionMultiplier())],
        [<b key={1}>材料总产量：</b>, <b key={2}>{formatCorpStat(totalMaterialProduction)}</b>],
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
        ["员工产出：", formatBigNumber(division.getOfficeProductivity(props.office, { forProduct: true }))],
        ["增产材料：", formatCorpMultiplier(division.productionMult)],
        ["研究：", formatCorpMultiplier(division.getProductionMultiplier())],
        [`${CorpProductResearchName.Fulcrum}：`, formatCorpMultiplier(division.getProductProductionMultiplier())],
        [`${CorpUpgradeName.SmartFactories}：`, formatCorpMultiplier(corp.getProductionMultiplier())],
        [<b key={1}>产品总产量：</b>, <b key={2}>{formatCorpStat(totalProductProduction)}</b>],
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
        ["商务员工：", formatCorpMultiplier(businessFactor)],
        ["广告：", formatCorpMultiplier(adsTotal)],
        researchMult !== 1 ? ["研究：", formatCorpMultiplier(researchMult)] : [],
        [`${CorpUpgradeName.ABCSalesBots}：`, formatCorpMultiplier(upgradeMult)],
        [<b key={1}>总销售倍率：</b>, <b key={2}>{formatCorpMultiplier(totalSaleMultiplier)}</b>],
      ]}
    />
  );

  return (
    <Table padding="none">
      <TableBody>
        <TableRow>
          <TableCell>
            <Typography>未分配员工：</Typography>
          </TableCell>
          <TableCell>
            <EmployeeCount num={currUna} next={nextUna} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Typography>员工平均士气：</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography>{formatCorpStat(props.office.avgMorale)}</Typography>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Typography>员工平均精力：</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography>{formatCorpStat(props.office.avgEnergy)}</Typography>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Typography>员工平均经验：</Typography>
          </TableCell>
          <TableCell align="right">
            <Typography>{formatCorpStat(props.office.totalExperience / props.office.numEmployees || 0)}</Typography>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Typography>员工总薪资：</Typography>
          </TableCell>
          <TableCell>
            <Typography align="right">
              <Money money={props.office.totalSalary} />
            </Typography>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Tooltip
              title={
                <Typography component="div">
                  该办事处能生产的材料数量。
                  <br />
                  该值取决于你的运营、工程
                  <br />
                  和管理员工的生产力。
                </Typography>
              }
            >
              <Typography>材料产量：</Typography>
            </Tooltip>
          </TableCell>
          <TableCell>
            <Tooltip title={materialBreakdown}>
              <Typography align="right">{formatCorpStat(totalMaterialProduction)}</Typography>
            </Tooltip>
          </TableCell>
        </TableRow>
        {division.makesProducts && (
          <TableRow>
            <TableCell>
              <Tooltip
                title={
                  <Typography component="div">
                    该办事处能生产的任一产品的数量。
                    <br />
                    该值取决于你的运营、工程
                    <br />
                    和管理员工的生产力。
                  </Typography>
                }
              >
                <Typography>产品产量：</Typography>
              </Tooltip>
            </TableCell>
            <TableCell>
              <Tooltip title={productBreakdown}>
                <Typography align="right">{formatCorpStat(totalProductProduction)}</Typography>
              </Tooltip>
            </TableCell>
          </TableRow>
        )}
        <TableRow>
          <TableCell>
            <Tooltip
              title={
                <Typography>
                  该办事处对所有材料和产品的销售效率。
                  <br />
                  它取决于你的商务员工和广告。
                  <br />
                  还会进一步受到每种物品的需求与竞争的影响。
                </Typography>
              }
            >
              <Typography>销售倍率：</Typography>
            </Tooltip>
          </TableCell>
          <TableCell align="right">
            <Tooltip title={salesBreakdown}>
              <Typography>{formatCorpMultiplier(totalSaleMultiplier)}</Typography>
            </Tooltip>
          </TableCell>
        </TableRow>
        <AutoAssignJob
          rerender={props.rerender}
          office={props.office}
          job={CorpEmployeeJob.Operations}
          desc={<>管理供应链运营。提高你生产的材料和产品数量。</>}
        />

        <AutoAssignJob
          rerender={props.rerender}
          office={props.office}
          job={CorpEmployeeJob.Engineer}
          desc={
            <>
              开发和维护产品与生产系统。提升你所生产一切的质量。
              也会增加产量（不过不如运营岗位多）。
            </>
          }
        />

        <AutoAssignJob
          rerender={props.rerender}
          office={props.office}
          job={CorpEmployeeJob.Business}
          desc={<>负责销售和财务。提高你可售出的材料和产品数量。</>}
        />

        <AutoAssignJob
          rerender={props.rerender}
          office={props.office}
          job={CorpEmployeeJob.Management}
          desc={
            <>
              领导并监督员工和办事处的运作。提升工程师和业务员工的工作效率。
            </>
          }
        />

        <AutoAssignJob
          rerender={props.rerender}
          office={props.office}
          job={CorpEmployeeJob.RandD}
          desc={
            <>
              研究改进公司的新颖方法。产生科研点数。也会提升你所生产一切的质量（不过不如工程岗位多）。
            </>
          }
        />

        <AutoAssignJob
          rerender={props.rerender}
          office={props.office}
          job={CorpEmployeeJob.Intern}
          desc={
            <>
              将员工设为实习生，这会提升他们的部分属性。实习中的员工不影响任何公司运营，但会获得更多经验，并改善士气和精力。
              <br />
              <br />
              使用实习生可以在不写脚本、不花钱搞研究的情况下维持士气和精力，不过写个脚本买茶和开派对也很简单。你应该那么做，别再让员工浪费在这个岗位上。
            </>
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

  const hireEmployeeDisabledText = props.office.atCapacity() ? "办公室空间不足" : "";
  const teaDisabledText =
    corp.funds < props.office.getTeaCost()
      ? "企业资金不足"
      : props.office.teaPending
      ? "本周期已在购买茶水中"
      : "";
  const partyPending = props.office.partyMult > 1;
  const partyDisabledText =
    corp.funds < 0 ? "企业资金不足" : partyPending ? "本周期已在举办派对" : "";

  return (
    <Paper>
      <Typography>办公空间</Typography>
      <Typography>
        规模：{props.office.numEmployees} / {props.office.size} 名员工
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr", width: "fit-content" }}>
        <Box sx={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <ButtonWithTooltip disabledTooltip={hireEmployeeDisabledText} onClick={autohireEmployeeButtonOnClick}>
            雇用员工
          </ButtonWithTooltip>
          <ButtonWithTooltip
            normalTooltip={"扩大办公室规模，以便容纳更多员工！"}
            onClick={() => setUpgradeOfficeSizeOpen(true)}
          >
            升级规模
          </ButtonWithTooltip>
          <UpgradeOfficeSizeModal
            rerender={props.rerender}
            office={props.office}
            open={upgradeOfficeSizeOpen}
            onClose={() => setUpgradeOfficeSizeOpen(false)}
          />

          {!division.hasResearch("AutoBrew") && (
            <ButtonWithTooltip
              normalTooltip={"为员工提供茶水以提升他们的精力"}
              disabledTooltip={teaDisabledText}
              onClick={() => buyTea(corp, props.office)}
            >
              {props.office.teaPending ? (
                "正在购买茶水"
              ) : (
                <>
                  购买茶水 - <MoneyCost money={props.office.getTeaCost()} corp={corp} />
                </>
              )}
            </ButtonWithTooltip>
          )}

          {!division.hasResearch("AutoPartyManager") && (
            <>
              <ButtonWithTooltip
                normalTooltip={"举办办公室派对以提升员工的士气"}
                disabledTooltip={partyDisabledText}
                onClick={() => setThrowPartyOpen(true)}
              >
                {props.office.partyMult > 1 ? "派对进行中……" : "举办派对"}
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
