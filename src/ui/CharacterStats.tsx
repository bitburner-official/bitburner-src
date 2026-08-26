import { Paper, Table, TableBody, Box, IconButton, Typography, Container, Tooltip } from "@mui/material";
import { MoreHoriz, Info } from "@mui/icons-material";
import React, { useState } from "react";
import { BitNodes } from "../BitNode/BitNode";
import { currentNodeMults } from "../BitNode/BitNodeMultipliers";
import { BitNodeMultipliersDisplay } from "../BitNode/ui/BitnodeMultipliersDescription";
import { HacknetServerConstants } from "../Hacknet/data/Constants";
import { getCloudServerLimit } from "../Server/ServerPurchases";
import { Settings } from "../Settings/Settings";
import { MoneySourceTracker } from "../utils/MoneySourceTracker";
import { convertTimeMsToTimeElapsedString } from "../utils/StringHelperFunctions";
import { Player } from "@player";
import { formatPercent, formatNumber } from "./formatNumber";
import { Modal } from "./React/Modal";
import { Money } from "./React/Money";
import { StatsRow } from "./React/StatsRow";
import { StatsTable } from "./React/StatsTable";
import { useCycleRerender } from "./React/hooks";
import { getMaxRep } from "../Go/effects/effect";
import { canAccessBitNodeFeature, getBitNodeLevel, knowAboutBitverse } from "../BitNode/BitNodeUtils";

interface EmployersModalProps {
  open: boolean;
  onClose: () => void;
}

const EmployersModal = ({ open, onClose }: EmployersModalProps): React.ReactElement => {
  return (
    <Modal open={open} onClose={onClose}>
      <>
        <Typography variant="h5">所有雇主</Typography>
        <ul>
          {Object.keys(Player.jobs).map((j) => (
            <Typography key={j}>* {j}</Typography>
          ))}
        </ul>
      </>
    </Modal>
  );
};

interface IMultRow {
  // The name of the multiplier
  mult: string;

  // The player's raw multiplier value
  value: number;

  // The player's effective multiplier value, affected by BitNode mults
  effValue?: number;

  // The text color for the row
  color?: string;

  // Whether to format as percent or scalar
  isNumber?: boolean;
}

interface MultTableProps {
  rows: IMultRow[];
  color: string;
  noMargin?: boolean;
}

function MultiplierTable(props: MultTableProps): React.ReactElement {
  return (
    <Table sx={{ display: "table", width: "100%", mb: props.noMargin ? 0 : 2 }}>
      <TableBody>
        {props.rows.map((data) => {
          const { mult, value, effValue = null, color = props.color } = data;

          if (effValue !== null && effValue !== value && canAccessBitNodeFeature(5)) {
            return (
              <StatsRow key={mult} name={mult} color={color} data={{}}>
                <>
                  <Typography color={color}>
                    {data.isNumber ? (
                      formatNumber(value, 0)
                    ) : (
                      <>
                        <span style={{ opacity: 0.5 }}>{formatPercent(value)}</span> {formatPercent(effValue)}
                      </>
                    )}
                  </Typography>
                </>
              </StatsRow>
            );
          }
          return (
            <StatsRow
              key={mult}
              name={mult}
              color={color}
              data={{ content: data.isNumber ? formatNumber(value, 0) : formatPercent(value) }}
            />
          );
        })}
      </TableBody>
    </Table>
  );
}

function CurrentBitNode(): React.ReactElement {
  if (knowAboutBitverse()) {
    const index = "BitNode" + Player.bitNodeN;
    return (
      <Paper sx={{ mb: 1, p: 1 }}>
        <Typography variant="h5">
          BitNode {Player.bitNodeN}：{BitNodes[index].name}（等级 {getBitNodeLevel()}）
        </Typography>
        <Typography component="div" sx={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>
          {BitNodes[index].info}
        </Typography>
      </Paper>
    );
  }

  return <></>;
}

interface IMoneyModalProps {
  open: boolean;
  onClose: () => void;
}

function MoneyModal({ open, onClose }: IMoneyModalProps): React.ReactElement {
  function convertMoneySourceTrackerToString(src: MoneySourceTracker): React.ReactElement {
    const parts: [string, JSX.Element][] = [[`总计：`, <Money key="total" money={src.total} />]];
    if (src.augmentations) {
      parts.push([`强化：`, <Money key="aug" money={src.augmentations} />]);
    }
    if (src.bladeburner) {
      parts.push([`Bladeburner：`, <Money key="blade" money={src.bladeburner} />]);
    }
    if (src.casino) {
      parts.push([`赌场：`, <Money key="casino" money={src.casino} />]);
    }
    if (src.codingcontract) {
      parts.push([`编程合约：`, <Money key="coding-contract" money={src.codingcontract} />]);
    }
    if (src.work) {
      parts.push([`公司工作：`, <Money key="company-work" money={src.work} />]);
    }
    if (src.class) {
      parts.push([`课程：`, <Money key="class" money={src.class} />]);
    }
    if (src.corporation) {
      parts.push([`企业：`, <Money key="corp" money={src.corporation} />]);
    }
    if (src.crime) {
      parts.push([`犯罪：`, <Money key="crime" money={src.crime} />]);
    }
    if (src.darknet) {
      parts.push([`暗网：`, <Money key="darknet" money={src.darknet} />]);
    }
    if (src.gang) {
      parts.push([`帮派：`, <Money key="gang" money={src.gang} />]);
    }
    if (src.gang_expenses) {
      parts.push([`帮派开销：`, <Money key="gang-expenses" money={src.gang_expenses} />]);
    }
    if (src.hacking) {
      parts.push([`黑客：`, <Money key="hacking" money={src.hacking} />]);
    }
    if (src.hacknet) {
      parts.push([`Hacknet：`, <Money key="hacknet" money={src.hacknet} />]);
    }
    if (src.hacknet_expenses) {
      parts.push([`Hacknet 开销：`, <Money key="hacknet-expenses" money={src.hacknet_expenses} />]);
    }
    if (src.hospitalization) {
      parts.push([`住院：`, <Money key="hospital" money={src.hospitalization} />]);
    }
    if (src.infiltration) {
      parts.push([`潜入：`, <Money key="infiltration" money={src.infiltration} />]);
    }
    if (src.servers) {
      parts.push([`服务器：`, <Money key="servers" money={src.servers} />]);
    }
    if (src.stock) {
      parts.push([`股票市场：`, <Money key="market" money={src.stock} />]);
    }
    if (src.sleeves) {
      parts.push([`分身：`, <Money key="sleeves" money={src.sleeves} />]);
    }
    if (src.other) {
      parts.push([`其他：`, <Money key="other" money={src.other} />]);
    }

    return <StatsTable rows={parts} wide />;
  }

  let content = (
    <>
      <Typography variant="h6" color="primary">
        自上次安装强化以来赚取的资金
      </Typography>
      <br />
      {convertMoneySourceTrackerToString(Player.moneySourceA)}
    </>
  );
  if (knowAboutBitverse()) {
    content = (
      <>
        {content}
        <br />
        <br />
        <Typography variant="h6" color="primary">
          在此 BitNode 中赚取的资金
        </Typography>
        <br />
        {convertMoneySourceTrackerToString(Player.moneySourceB)}
      </>
    );
  }

  return (
    <Modal open={open} onClose={onClose}>
      {content}
    </Modal>
  );
}

export function CharacterStats(): React.ReactElement {
  const [moneyOpen, setMoneyOpen] = useState(false);
  const [employersOpen, setEmployersOpen] = useState(false);
  useCycleRerender();

  const timeRows = [
    ["自上次安装强化以来", convertTimeMsToTimeElapsedString(Player.playtimeSinceLastAug)],
  ];
  if (knowAboutBitverse()) {
    timeRows.push(["自上次摧毁 BitNode 以来", convertTimeMsToTimeElapsedString(Player.playtimeSinceLastBitnode)]);
  }
  timeRows.push(["总计", convertTimeMsToTimeElapsedString(Player.totalPlaytime)]);

  return (
    <Container maxWidth="lg" disableGutters sx={{ mx: 0 }}>
      <Typography variant="h4">属性</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", minWidth: "fit-content", mb: 1, gap: 1 }}>
        <Paper sx={{ p: 1 }}>
          <Typography variant="h5">常规</Typography>
          <Table>
            <TableBody>
              <StatsRow name="当前城市" color={Settings.theme.primary} data={{ content: Player.city }} />
              <StatsRow name="资金" color={Settings.theme.money} data={{}}>
                <>
                  <Money money={Player.money} />
                  <IconButton onClick={() => setMoneyOpen(true)} sx={{ p: 0 }}>
                    <MoreHoriz color="info" />
                  </IconButton>
                </>
              </StatsRow>

              {Player.jobs && Object.keys(Player.jobs).length !== 0 ? (
                <StatsRow name="所有雇主" color={Settings.theme.primary} data={{}}>
                  <>
                    <span style={{ color: Settings.theme.primary }}>共 {Object.keys(Player.jobs).length} 名</span>
                    <IconButton onClick={() => setEmployersOpen(true)} sx={{ p: 0 }}>
                      <MoreHoriz color="info" />
                    </IconButton>
                  </>
                </StatsRow>
              ) : (
                <></>
              )}
              <StatsRow
                name="云服务器"
                color={Settings.theme.primary}
                data={{ content: `${Player.purchasedServers.length} / ${getCloudServerLimit()}` }}
              />
              <StatsRow
                name={`Hacknet ${canAccessBitNodeFeature(9) ? "服务器" : "节点"}`}
                color={Settings.theme.primary}
                data={{
                  content: `${Player.hacknetNodes.length}${
                    canAccessBitNodeFeature(9) ? ` / ${HacknetServerConstants.MaxServers}` : ""
                  }`,
                }}
              />
              <StatsRow
                name="已安装强化"
                color={Settings.theme.primary}
                data={{ content: String(Player.augmentations.length) }}
              />
              <StatsRow name="Karma" color={Settings.theme.primary} data={{ content: formatNumber(Player.karma, 3) }} />
            </TableBody>
          </Table>
        </Paper>
        <Paper sx={{ p: 1 }}>
          <Typography variant="h5">技能</Typography>
          <Table>
            <TableBody>
              <StatsRow
                name="黑客"
                color={Settings.theme.hack}
                data={{ level: Player.skills.hacking, exp: Player.exp.hacking }}
              />
              <StatsRow
                name="力量"
                color={Settings.theme.combat}
                data={{ level: Player.skills.strength, exp: Player.exp.strength }}
              />
              <StatsRow
                name="防御"
                color={Settings.theme.combat}
                data={{ level: Player.skills.defense, exp: Player.exp.defense }}
              />
              <StatsRow
                name="灵巧"
                color={Settings.theme.combat}
                data={{ level: Player.skills.dexterity, exp: Player.exp.dexterity }}
              />
              <StatsRow
                name="敏捷"
                color={Settings.theme.combat}
                data={{ level: Player.skills.agility, exp: Player.exp.agility }}
              />
              <StatsRow
                name="魅力"
                color={Settings.theme.cha}
                data={{ level: Player.skills.charisma, exp: Player.exp.charisma }}
              />
              {Player.skills.intelligence > 0 && canAccessBitNodeFeature(5) && (
                <StatsRow
                  name="智力"
                  color={Settings.theme.int}
                  data={{ level: Player.skills.intelligence, exp: Player.exp.intelligence }}
                />
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      <Paper sx={{ p: 1, mb: 1 }}>
        <Typography variant="h5" color="primary" sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
          倍率
          {canAccessBitNodeFeature(5) && (
            <Tooltip
              title={
                <Typography>
                  显示你当前的倍率。
                  <br />
                  <br />
                  当倍率旁显示一个暗淡的数字时，表示该倍率正受 BitNode 倍率影响。
                  <br />
                  <br />
                  暗淡的数字是基础倍率，正常颜色的数字是由 BitNode 决定的有效倍率。
                </Typography>
              }
            >
              <Info sx={{ ml: 1, mb: 0.5 }} color="info" />
            </Tooltip>
          )}
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
          <Box>
            <MultiplierTable
              rows={[
                {
                  mult: "入侵成功率",
                  value: Player.mults.hacking_chance,
                },
                {
                  mult: "入侵速度",
                  value: Player.mults.hacking_speed,
                  effValue: Player.mults.hacking_speed * currentNodeMults.HackingSpeedMultiplier,
                },
                {
                  mult: "入侵收益",
                  value: Player.mults.hacking_money,
                  effValue: Player.mults.hacking_money * currentNodeMults.ScriptHackMoney,
                },
                {
                  mult: "入侵增长",
                  value: Player.mults.hacking_grow,
                  effValue: Player.mults.hacking_grow * currentNodeMults.ServerGrowthRate,
                },
              ]}
              color={Settings.theme.hack}
            />
            <MultiplierTable
              rows={[
                {
                  mult: "黑客等级",
                  value: Player.mults.hacking,
                  effValue: Player.mults.hacking * currentNodeMults.HackingLevelMultiplier,
                },
                {
                  mult: "黑客经验",
                  value: Player.mults.hacking_exp,
                  effValue: Player.mults.hacking_exp * currentNodeMults.HackExpGain,
                },
              ]}
              color={Settings.theme.hack}
            />
            <MultiplierTable
              rows={[
                {
                  mult: "力量等级",
                  value: Player.mults.strength,
                  effValue: Player.mults.strength * currentNodeMults.StrengthLevelMultiplier,
                },
                {
                  mult: "力量经验",
                  value: Player.mults.strength_exp,
                },
              ]}
              color={Settings.theme.combat}
            />
            <MultiplierTable
              rows={[
                {
                  mult: "防御等级",
                  value: Player.mults.defense,
                  effValue: Player.mults.defense * currentNodeMults.DefenseLevelMultiplier,
                },
                {
                  mult: "防御经验",
                  value: Player.mults.defense_exp,
                },
              ]}
              color={Settings.theme.combat}
            />
            <MultiplierTable
              rows={[
                {
                  mult: "灵巧等级",
                  value: Player.mults.dexterity,
                  effValue: Player.mults.dexterity * currentNodeMults.DexterityLevelMultiplier,
                },
                {
                  mult: "灵巧经验",
                  value: Player.mults.dexterity_exp,
                },
              ]}
              color={Settings.theme.combat}
            />
            <MultiplierTable
              rows={[
                {
                  mult: "敏捷等级",
                  value: Player.mults.agility,
                  effValue: Player.mults.agility * currentNodeMults.AgilityLevelMultiplier,
                },
                {
                  mult: "敏捷经验",
                  value: Player.mults.agility_exp,
                },
              ]}
              color={Settings.theme.combat}
            />
            <MultiplierTable
              rows={[
                {
                  mult: "魅力等级",
                  value: Player.mults.charisma,
                  effValue: Player.mults.charisma * currentNodeMults.CharismaLevelMultiplier,
                },
                {
                  mult: "魅力经验",
                  value: Player.mults.charisma_exp,
                },
              ]}
              color={Settings.theme.cha}
              noMargin
            />
          </Box>

          <Box>
            <MultiplierTable
              rows={[
                {
                  mult: "Hacknet 产出",
                  value: Player.mults.hacknet_node_money,
                  effValue: Player.mults.hacknet_node_money * currentNodeMults.HacknetNodeMoney,
                },
                {
                  mult: "Hacknet 购买费用",
                  value: Player.mults.hacknet_node_purchase_cost,
                },
                {
                  mult: "Hacknet RAM 升级费用",
                  value: Player.mults.hacknet_node_ram_cost,
                },
                {
                  mult: "Hacknet 核心购买费用",
                  value: Player.mults.hacknet_node_core_cost,
                },
                {
                  mult: "Hacknet 等级升级费用",
                  value: Player.mults.hacknet_node_level_cost,
                },
              ]}
              color={Settings.theme.primary}
            />
            <MultiplierTable
              rows={[
                {
                  mult: "公司声望获取",
                  value: Player.mults.company_rep,
                  effValue: Player.mults.company_rep * currentNodeMults.CompanyWorkRepGain,
                  color: Settings.theme.rep,
                },
                {
                  mult: "派系声望获取",
                  value: Player.mults.faction_rep,
                  effValue: Player.mults.faction_rep * currentNodeMults.FactionWorkRepGain,
                  color: Settings.theme.rep,
                },
                {
                  mult: "薪水",
                  value: Player.mults.work_money,
                  effValue: Player.mults.work_money * currentNodeMults.CompanyWorkMoney,
                  color: Settings.theme.money,
                },
              ]}
              color={Settings.theme.money}
            />
            <MultiplierTable
              rows={[
                {
                  mult: "犯罪成功率",
                  value: Player.mults.crime_success,
                  effValue: Player.mults.crime_success * currentNodeMults.CrimeSuccessRate,
                },
                {
                  mult: "犯罪收益",
                  value: Player.mults.crime_money,
                  effValue: Player.mults.crime_money * currentNodeMults.CrimeMoney,
                  color: Settings.theme.money,
                },
              ]}
              color={Settings.theme.combat}
            />
            <MultiplierTable
              rows={[
                {
                  mult: "暗网收益",
                  value: Player.mults.dnet_money,
                  effValue: Player.mults.dnet_money * currentNodeMults.DarknetMoneyMultiplier,
                },
              ]}
              color={Settings.theme.money}
            />
            {Player.canAccessBladeburner() && currentNodeMults.BladeburnerRank > 0 && (
              <MultiplierTable
                rows={[
                  {
                    mult: "Bladeburner 成功率",
                    value: Player.mults.bladeburner_success_chance,
                  },
                  {
                    mult: "Bladeburner 最大耐力",
                    value: Player.mults.bladeburner_max_stamina,
                  },
                  {
                    mult: "Bladeburner 耐力获取",
                    value: Player.mults.bladeburner_stamina_gain,
                  },
                  {
                    mult: "Bladeburner 实地分析",
                    value: Player.mults.bladeburner_analysis,
                  },
                ]}
                color={Settings.theme.primary}
                noMargin={!canAccessBitNodeFeature(14)}
              />
            )}
            {canAccessBitNodeFeature(14) && (
              <MultiplierTable
                rows={[
                  {
                    mult: "IPvGO 节点战力加成",
                    value: Player.activeSourceFileLvl(14) ? 2 * currentNodeMults.GoPower : currentNodeMults.GoPower,
                  },
                  {
                    mult: "IPvGO 可转化为好感的最大声望",
                    value: getMaxRep(),
                    isNumber: true,
                  },
                ]}
                color={Settings.theme.combat}
                noMargin
              />
            )}
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 1, mb: 1 }}>
          <Typography variant="h5">游玩时间</Typography>
        <Table>
          <TableBody>
            {timeRows.map(([name, content]) => (
              <StatsRow key={name} name={name} color={Settings.theme.primary} data={{ content: content }} />
            ))}
          </TableBody>
        </Table>
      </Paper>

      <CurrentBitNode />

      {canAccessBitNodeFeature(5) && (
        <Paper sx={{ p: 1, mb: 1 }}>
          <Typography variant="h5">BitNode 倍率</Typography>
          <BitNodeMultipliersDisplay n={Player.bitNodeN} hideMultsIfCannotAccessFeature={true} />
        </Paper>
      )}

      <MoneyModal open={moneyOpen} onClose={() => setMoneyOpen(false)} />
      <EmployersModal open={employersOpen} onClose={() => setEmployersOpen(false)} />
    </Container>
  );
}
