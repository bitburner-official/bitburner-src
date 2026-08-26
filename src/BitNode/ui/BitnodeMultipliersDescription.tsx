import React from "react";
import {
  Box,
  Collapse,
  ListItemButton,
  ListItemText,
  Paper,
  Table,
  TableBody,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import { Player } from "@player";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { Settings } from "../../Settings/Settings";
import { StatsRow } from "../../ui/React/StatsRow";
import { defaultMultipliers, getBitNodeMultipliers } from "../BitNode";
import { BitNodeMultipliers } from "../BitNodeMultipliers";
import { PartialRecord, getRecordEntries } from "../../Types/Record";
import { canAccessBitNodeFeature, getBitNodeLevel } from "../BitNodeUtils";

interface IProps {
  n: number;
  level?: number;
  hideMultsIfCannotAccessFeature: boolean;
}

export function BitNodeMultiplierDescription({ n, level, hideMultsIfCannotAccessFeature }: IProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  if (n === 1) {
    return <></>;
  }

  return (
    <Box component={Paper} sx={{ mt: 1, p: 1 }}>
      <ListItemButton disableGutters onClick={() => setOpen((old) => !old)} sx={{ padding: "4px 8px" }}>
        <ListItemText primary={<Typography variant="h6">BitNode 倍率</Typography>} />
        {open ? <ExpandLess color="primary" /> : <ExpandMore color="primary" />}
      </ListItemButton>
      <Collapse in={open}>
        <BitNodeMultipliersDisplay
          n={n}
          level={level}
          hideMultsIfCannotAccessFeature={hideMultsIfCannotAccessFeature}
        />
      </Collapse>
    </Box>
  );
}

export const BitNodeMultipliersDisplay = ({ n, level, hideMultsIfCannotAccessFeature }: IProps): React.ReactElement => {
  // If a level argument has been provided, use that as the multiplier level
  // If not, then we have to assume that we want the next level up from the
  // current node's source file, so we get the min of that, the SF's max level,
  // or if it's BN12, ∞
  const mults = getBitNodeMultipliers(n, level ?? getBitNodeLevel(n));

  return (
    <Box sx={{ columnCount: 2, columnGap: 1, mb: n === 1 ? 0 : -2 }}>
      <GeneralMults n={n} mults={mults} />
      <SkillMults n={n} mults={mults} />
      <FactionMults n={n} mults={mults} />
      <AugmentationMults n={n} mults={mults} />
      <HackingMults n={n} mults={mults} />
      <CloudServersMults n={n} mults={mults} />
      <StockMults n={n} mults={mults} />
      <CrimeMults n={n} mults={mults} />
      <DarknetMults n={n} mults={mults} />
      <InfiltrationMults n={n} mults={mults} />
      <CompanyMults n={n} mults={mults} />
      <GangMults n={n} mults={mults} hideMultsIfCannotAccessFeature={hideMultsIfCannotAccessFeature} />
      <CorporationMults n={n} mults={mults} hideMultsIfCannotAccessFeature={hideMultsIfCannotAccessFeature} />
      <BladeburnerMults n={n} mults={mults} hideMultsIfCannotAccessFeature={hideMultsIfCannotAccessFeature} />
      <StanekMults n={n} mults={mults} hideMultsIfCannotAccessFeature={hideMultsIfCannotAccessFeature} />
      <GoMults n={n} mults={mults} />
    </Box>
  );
};

type IBNMultRows = PartialRecord<
  keyof BitNodeMultipliers,
  {
    name: string;
    content?: string;
    color?: string;
    tooltipText?: string;
  }
>;

interface IBNMultTableProps {
  sectionName: string;
  rowData: IBNMultRows;
  mults: BitNodeMultipliers;
}

const BNMultTable = (props: IBNMultTableProps): React.ReactElement => {
  const rowsArray = getRecordEntries(props.rowData)
    .filter(([key]) => props.mults[key] !== defaultMultipliers[key])
    .map(([key, value]) => {
      const name = value.tooltipText ? (
        <Tooltip title={<span>{value.tooltipText}</span>}>
          <span>
            {value.name}
            <sup>(*)</sup>
          </span>
        </Tooltip>
      ) : (
        value.name
      );
      return (
        <StatsRow
          key={`${props.sectionName}-${value.name}`}
          name={name}
          data={{ content: value.content ?? `${(props.mults[key] * 100).toFixed(3)}%` }}
          color={value.color ?? Settings.theme.primary}
        />
      );
    });

  return rowsArray.length > 0 ? (
    <span style={{ display: "inline-block", width: "100%", marginBottom: "16px" }}>
      <Typography variant="h6">{props.sectionName}</Typography>
      <Table>
        <TableBody>{rowsArray}</TableBody>
      </Table>
    </span>
  ) : (
    <></>
  );
};

interface IMultsProps {
  n: number;
  mults: BitNodeMultipliers;
}

interface IEndGameMultsProps extends IMultsProps {
  hideMultsIfCannotAccessFeature: boolean;
}

function GeneralMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    WorldDaemonDifficulty: { name: `${SpecialServers.WorldDaemon} 难度` },
    DaedalusAugsRequirement: {
      name: "Daedalus 强化需求",
      content: String(mults.DaedalusAugsRequirement),
    },
    HacknetNodeMoney: { name: "Hacknet 产出" },
    CodingContractMoney: { name: "编程合约奖励" },
    ClassGymExpGain: { name: "课程/健身房经验" },
  };

  return <BNMultTable sectionName="通用" rowData={rows} mults={mults} />;
}

function AugmentationMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    AugmentationMoneyCost: { name: "资金成本" },
    AugmentationRepCost: {
      name: "声望成本",
      color: Settings.theme.rep,
    },
  };

  return <BNMultTable sectionName="强化" rowData={rows} mults={mults} />;
}

function CompanyMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    CompanyWorkMoney: {
      name: "工作收入",
      color: Settings.theme.money,
    },
    CompanyWorkRepGain: {
      name: "工作声望",
      color: Settings.theme.rep,
    },
    CompanyWorkExpGain: { name: "工作经验" },
  };

  return <BNMultTable sectionName="公司" rowData={rows} mults={mults} />;
}

function StockMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    FourSigmaMarketDataCost: { name: "市场数据成本" },
    FourSigmaMarketDataApiCost: { name: "市场数据 API 成本" },
  };

  return <BNMultTable sectionName="股票市场" rowData={rows} mults={mults} />;
}

function FactionMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    FavorToDonateToFaction: { name: "捐赠所需好感" },
    FactionWorkRepGain: {
      name: "工作声望",
      color: Settings.theme.rep,
    },
    FactionWorkExpGain: { name: "工作经验" },
    FactionPassiveRepGain: {
      name: "被动声望",
      color: Settings.theme.rep,
    },
  };

  return <BNMultTable sectionName="派系" rowData={rows} mults={mults} />;
}

function CrimeMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    CrimeExpGain: {
      name: "犯罪经验",
    },
    CrimeMoney: {
      name: "犯罪收入",
      color: Settings.theme.money,
    },
    CrimeSuccessRate: {
      name: "犯罪成功率",
    },
  };

  return <BNMultTable sectionName="犯罪" rowData={rows} mults={mults} />;
}

function DarknetMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    DarknetMoneyMultiplier: {
      name: "暗网收入",
      color: Settings.theme.money,
    },
  };

  return <BNMultTable sectionName="暗网" rowData={rows} mults={mults} />;
}

function SkillMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    HackingLevelMultiplier: {
      name: "黑客等级",
      color: Settings.theme.hack,
    },
    StrengthLevelMultiplier: {
      name: "力量等级",
      color: Settings.theme.combat,
    },
    DefenseLevelMultiplier: {
      name: "防御等级",
      color: Settings.theme.combat,
    },
    DexterityLevelMultiplier: {
      name: "灵巧等级",
      color: Settings.theme.combat,
    },
    AgilityLevelMultiplier: {
      name: "敏捷等级",
      color: Settings.theme.combat,
    },
    CharismaLevelMultiplier: {
      name: "魅力等级",
      color: Settings.theme.cha,
    },
  };

  return <BNMultTable sectionName="技能" rowData={rows} mults={mults} />;
}

function HackingMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    HackExpGain: {
      name: "黑客经验",
      color: Settings.theme.hack,
    },
    HackingSpeedMultiplier: {
      name: "黑客速度",
      color: Settings.theme.hack,
    },
    ServerGrowthRate: { name: "服务器增长率" },
    ServerMaxMoney: { name: "服务器最大资金", color: Settings.theme.money },
    ServerStartingMoney: { name: "服务器初始资金", color: Settings.theme.money },
    ServerStartingSecurity: { name: "服务器初始安全等级" },
    ServerWeakenRate: { name: "服务器削弱率" },
    ManualHackMoney: {
      name: "手动入侵获得的资金",
      color: Settings.theme.money,
      tooltipText: `影响玩家通过终端入侵服务器时实际获得的资金量。这与"入侵窃取的资金"不同：当玩家通过终端入侵服务器时，该服务器中的资金会减少，但玩家并不会获得等额的资金。`,
    },
    ScriptHackMoney: {
      name: "入侵窃取的资金",
      color: Settings.theme.money,
      tooltipText: "影响玩家对服务器执行入侵时从该服务器窃取的资金量。",
    },
    ScriptHackMoneyGain: {
      name: "脚本入侵获得的资金",
      color: Settings.theme.money,
      tooltipText: `影响脚本入侵服务器时玩家实际获得的资金量。这与"入侵窃取的资金"不同：当脚本入侵服务器时，该服务器中的资金会减少，但玩家并不会获得等额的资金。`,
    },
  };

  return <BNMultTable sectionName="黑客" rowData={rows} mults={mults} />;
}

function CloudServersMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    CloudServerCost: {
      name: "基础成本",
      content: mults.CloudServerCost.toFixed(3),
    },
    CloudServerSoftcap: {
      name: "软上限成本",
      content: mults.CloudServerSoftcap.toFixed(3),
    },
    CloudServerLimit: { name: "服务器数量上限" },
    CloudServerMaxRam: { name: "最大 RAM" },
    HomeComputerRamCost: { name: "家用电脑 RAM 成本" },
  };

  return <BNMultTable sectionName="云服务器" rowData={rows} mults={mults} />;
}

function InfiltrationMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    InfiltrationMoney: {
      name: "潜入收入",
      color: Settings.theme.money,
    },
    InfiltrationRep: {
      name: "潜入声望",
      color: Settings.theme.rep,
    },
  };

  return <BNMultTable sectionName="潜入" rowData={rows} mults={mults} />;
}

function BladeburnerMults({ mults, hideMultsIfCannotAccessFeature }: IEndGameMultsProps): React.ReactElement {
  if (!Player.canAccessBladeburner() && hideMultsIfCannotAccessFeature) {
    return <></>;
  }

  if (mults.BladeburnerRank === 0) {
    const rows: IBNMultRows = {
      BladeburnerRank: { name: "已禁用", content: "" },
    };

    return <BNMultTable sectionName="Bladeburner" rowData={rows} mults={mults} />;
  }

  const rows: IBNMultRows = {
    BladeburnerRank: { name: "Rank 获取" },
    BladeburnerSkillCost: { name: "技能成本" },
  };

  return <BNMultTable sectionName="Bladeburner" rowData={rows} mults={mults} />;
}

function StanekMults({ mults, hideMultsIfCannotAccessFeature }: IEndGameMultsProps): React.ReactElement {
  if (!Player.canAccessCotMG() && hideMultsIfCannotAccessFeature) {
    return <></>;
  }

  const extraSize = mults.StaneksGiftExtraSize.toFixed(5);
  const rows: IBNMultRows = {
    StaneksGiftPowerMultiplier: { name: "礼物威力" },
    StaneksGiftExtraSize: {
      name: "基础尺寸修正",
      content: `${mults.StaneksGiftExtraSize > defaultMultipliers.StaneksGiftExtraSize ? `+${extraSize}` : extraSize}`,
    },
  };

  return <BNMultTable sectionName="Stanek 的礼物" rowData={rows} mults={mults} />;
}

function GangMults({ mults, hideMultsIfCannotAccessFeature }: IEndGameMultsProps): React.ReactElement {
  if (!canAccessBitNodeFeature(2) && hideMultsIfCannotAccessFeature) {
    return <></>;
  }

  const rows: IBNMultRows = {
    GangSoftcap: {
      name: "帮派软上限",
      content: mults.GangSoftcap.toFixed(3),
    },
    GangUniqueAugs: { name: "独有强化" },
  };

  return <BNMultTable sectionName="帮派" rowData={rows} mults={mults} />;
}

function CorporationMults({ mults, hideMultsIfCannotAccessFeature }: IEndGameMultsProps): React.ReactElement {
  if (!Player.canAccessCorporation() && hideMultsIfCannotAccessFeature) {
    return <></>;
  }

  if (mults.CorporationSoftcap < 0.15) {
    const rows: IBNMultRows = {
      CorporationSoftcap: {
        name: "已禁用",
        content: "",
      },
    };

    return <BNMultTable sectionName="企业" rowData={rows} mults={mults} />;
  }

  const rows: IBNMultRows = {
    CorporationSoftcap: {
      name: "企业软上限",
      content: mults.CorporationSoftcap.toFixed(3),
    },
    CorporationValuation: { name: "估值" },
    CorporationDivisions: { name: "部门上限" },
  };

  return <BNMultTable sectionName="企业" rowData={rows} mults={mults} />;
}

function GoMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    GoPower: { name: "IPvGO 节点威力加成" },
  };

  return <BNMultTable sectionName="IPvGO 子网接管" rowData={rows} mults={mults} />;
}
