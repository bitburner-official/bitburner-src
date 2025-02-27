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
import { canAccessBitNodeFeature } from "../BitNodeUtils";

interface IProps {
  n: number;
  level?: number;
}

export function BitnodeMultiplierDescription({ n, level }: IProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  if (n === 1) return <></>;

  return (
    <Box component={Paper} sx={{ mt: 1, p: 1 }}>
      <ListItemButton disableGutters onClick={() => setOpen((old) => !old)} sx={{ padding: "4px 8px" }}>
        <ListItemText primary={<Typography variant="h6">Bitnode Multipliers</Typography>} />
        {open ? <ExpandLess color="primary" /> : <ExpandMore color="primary" />}
      </ListItemButton>
      <Collapse in={open}>
        <BitNodeMultipliersDisplay n={n} level={level} />
      </Collapse>
    </Box>
  );
}

export const BitNodeMultipliersDisplay = ({ n, level }: IProps): React.ReactElement => {
  // If a level argument has been provided, use that as the multiplier level
  // If not, then we have to assume that we want the next level up from the
  // current node's source file, so we get the min of that, the SF's max level,
  // or if it's BN12, ∞
  const maxSfLevel = n === 12 ? Number.MAX_VALUE : 3;
  const mults = getBitNodeMultipliers(n, level ?? Math.min(Player.activeSourceFileLvl(n) + 1, maxSfLevel));

  return (
    <Box sx={{ columnCount: 2, columnGap: 1, mb: n === 1 ? 0 : -2 }}>
      <GeneralMults n={n} mults={mults} />
      <SkillMults n={n} mults={mults} />
      <FactionMults n={n} mults={mults} />
      <AugmentationMults n={n} mults={mults} />
      <HackingMults n={n} mults={mults} />
      <PurchasedServersMults n={n} mults={mults} />
      <StockMults n={n} mults={mults} />
      <CrimeMults n={n} mults={mults} />
      <InfiltrationMults n={n} mults={mults} />
      <CompanyMults n={n} mults={mults} />
      <GangMults n={n} mults={mults} />
      <CorporationMults n={n} mults={mults} />
      <BladeburnerMults n={n} mults={mults} />
      <StanekMults n={n} mults={mults} />
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

function GeneralMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    WorldDaemonDifficulty: { name: `${SpecialServers.WorldDaemon} Difficulty` },
    DaedalusAugsRequirement: {
      name: "Daedalus Augs Requirement",
      content: String(mults.DaedalusAugsRequirement),
    },
    HacknetNodeMoney: { name: "Hacknet Production" },
    CodingContractMoney: { name: "Coding Contract Reward" },
    ClassGymExpGain: { name: "Class/Gym Exp" },
  };

  return <BNMultTable sectionName="General" rowData={rows} mults={mults} />;
}

function AugmentationMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    AugmentationMoneyCost: { name: "Money Cost" },
    AugmentationRepCost: {
      name: "Reputation Cost",
      color: Settings.theme.rep,
    },
  };

  return <BNMultTable sectionName="Augmentations" rowData={rows} mults={mults} />;
}

function CompanyMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    CompanyWorkMoney: {
      name: "Work Money",
      color: Settings.theme.money,
    },
    CompanyWorkRepGain: {
      name: "Work Reputation",
      color: Settings.theme.rep,
    },
    CompanyWorkExpGain: { name: "Work Exp" },
  };

  return <BNMultTable sectionName="Company" rowData={rows} mults={mults} />;
}

function StockMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    FourSigmaMarketDataCost: { name: "Market Data Cost" },
    FourSigmaMarketDataApiCost: { name: "Market Data API Cost" },
  };

  return <BNMultTable sectionName="Stock Market" rowData={rows} mults={mults} />;
}

function FactionMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    RepToDonateToFaction: { name: "Favor to Donate" },
    FactionWorkRepGain: {
      name: "Work Reputation",
      color: Settings.theme.rep,
    },
    FactionWorkExpGain: { name: "Work Exp" },
    FactionPassiveRepGain: {
      name: "Passive Rep",
      color: Settings.theme.rep,
    },
  };

  return <BNMultTable sectionName="Faction" rowData={rows} mults={mults} />;
}

function CrimeMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    CrimeExpGain: {
      name: "Crime Exp",
    },
    CrimeMoney: {
      name: "Crime Money",
      color: Settings.theme.money,
    },
    CrimeSuccessRate: {
      name: "Crime Success Rate",
    },
  };

  return <BNMultTable sectionName="Crime" rowData={rows} mults={mults} />;
}

function SkillMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    HackingLevelMultiplier: {
      name: "Hacking Level",
      color: Settings.theme.hack,
    },
    StrengthLevelMultiplier: {
      name: "Strength Level",
      color: Settings.theme.combat,
    },
    DefenseLevelMultiplier: {
      name: "Defense Level",
      color: Settings.theme.combat,
    },
    DexterityLevelMultiplier: {
      name: "Dexterity Level",
      color: Settings.theme.combat,
    },
    AgilityLevelMultiplier: {
      name: "Agility Level",
      color: Settings.theme.combat,
    },
    CharismaLevelMultiplier: {
      name: "Charisma Level",
      color: Settings.theme.cha,
    },
  };

  return <BNMultTable sectionName="Skills" rowData={rows} mults={mults} />;
}

function HackingMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    HackExpGain: {
      name: "Hacking Exp",
      color: Settings.theme.hack,
    },
    HackingSpeedMultiplier: {
      name: "Hacking Speed",
      color: Settings.theme.hack,
    },
    ServerGrowthRate: { name: "Server Growth Rate" },
    ServerMaxMoney: { name: "Server Max Money", color: Settings.theme.money },
    ServerStartingMoney: { name: "Server Starting Money", color: Settings.theme.money },
    ServerStartingSecurity: { name: "Server Starting Security" },
    ServerWeakenRate: { name: "Server Weaken Rate" },
    ManualHackMoney: {
      name: "Money Gained From Manual Hack",
      color: Settings.theme.money,
      tooltipText: `Influences how much money the player actually gains when they hack a server via the terminal. This is different from "Stolen Money From Hack". When the player hack a server via the terminal, the amount of money in that server is reduced, but they do not gain that same amount.`,
    },
    ScriptHackMoney: {
      name: "Stolen Money From Hack",
      color: Settings.theme.money,
      tooltipText: "Influences how much money is stolen from a server when the player performs a hack against it.",
    },
    ScriptHackMoneyGain: {
      name: "Money Gained From Script Hack",
      color: Settings.theme.money,
      tooltipText: `Influences how much money the player actually gains when a script hacks a server. This is different from "Stolen Money From Hack". When a script hacks a server, the amount of money in that server is reduced, but the player does not gain that same amount.`,
    },
  };

  return <BNMultTable sectionName="Hacking" rowData={rows} mults={mults} />;
}

function PurchasedServersMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    PurchasedServerCost: {
      name: "Base Cost",
      content: mults.PurchasedServerCost.toFixed(3),
    },
    PurchasedServerSoftcap: {
      name: "Softcap Cost",
      content: mults.PurchasedServerSoftcap.toFixed(3),
    },
    PurchasedServerLimit: { name: "Server Limit" },
    PurchasedServerMaxRam: { name: "Max RAM" },
    HomeComputerRamCost: { name: "Home RAM Cost" },
  };

  return <BNMultTable sectionName="Purchased Servers" rowData={rows} mults={mults} />;
}

function InfiltrationMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    InfiltrationMoney: {
      name: "Infiltration Money",
      color: Settings.theme.money,
    },
    InfiltrationRep: {
      name: "Infiltration Reputation",
      color: Settings.theme.rep,
    },
  };

  return <BNMultTable sectionName="Infiltration" rowData={rows} mults={mults} />;
}

function BladeburnerMults({ mults }: IMultsProps): React.ReactElement {
  if (!Player.canAccessBladeburner()) return <></>;

  if (mults.BladeburnerRank === 0) {
    const rows: IBNMultRows = {
      BladeburnerRank: { name: "Disabled", content: "" },
    };

    return <BNMultTable sectionName="Bladeburner" rowData={rows} mults={mults} />;
  }

  const rows: IBNMultRows = {
    BladeburnerRank: { name: "Rank Gain" },
    BladeburnerSkillCost: { name: "Skill Cost" },
  };

  return <BNMultTable sectionName="Bladeburner" rowData={rows} mults={mults} />;
}

function StanekMults({ mults }: IMultsProps): React.ReactElement {
  if (!Player.canAccessCotMG()) return <></>;

  const extraSize = mults.StaneksGiftExtraSize.toFixed(5);
  const rows: IBNMultRows = {
    StaneksGiftPowerMultiplier: { name: "Gift Power" },
    StaneksGiftExtraSize: {
      name: "Base Size Modifier",
      content: `${mults.StaneksGiftExtraSize > defaultMultipliers.StaneksGiftExtraSize ? `+${extraSize}` : extraSize}`,
    },
  };

  return <BNMultTable sectionName="Stanek's Gift" rowData={rows} mults={mults} />;
}

function GangMults({ mults }: IMultsProps): React.ReactElement {
  if (!canAccessBitNodeFeature(2)) return <></>;

  const rows: IBNMultRows = {
    GangSoftcap: {
      name: "Gang Softcap",
      content: mults.GangSoftcap.toFixed(3),
    },
    GangUniqueAugs: { name: "Unique Augmentations" },
  };

  return <BNMultTable sectionName="Gang" rowData={rows} mults={mults} />;
}

function CorporationMults({ mults }: IMultsProps): React.ReactElement {
  if (!Player.canAccessCorporation()) return <></>;

  if (mults.CorporationSoftcap < 0.15) {
    const rows: IBNMultRows = {
      CorporationSoftcap: {
        name: "Disabled",
        content: "",
      },
    };

    return <BNMultTable sectionName="Corporation" rowData={rows} mults={mults} />;
  }

  const rows: IBNMultRows = {
    CorporationSoftcap: {
      name: "Corporation Softcap",
      content: mults.CorporationSoftcap.toFixed(3),
    },
    CorporationValuation: { name: "Valuation" },
    CorporationDivisions: { name: "Division limit" },
  };

  return <BNMultTable sectionName="Corporation" rowData={rows} mults={mults} />;
}

function GoMults({ mults }: IMultsProps): React.ReactElement {
  const rows: IBNMultRows = {
    GoPower: { name: "IPvGO Node Power bonus" },
  };

  return <BNMultTable sectionName="IPvGO Subnet Takeover" rowData={rows} mults={mults} />;
}
