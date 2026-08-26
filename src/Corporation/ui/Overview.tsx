// React Component for displaying Corporation Overview info
import React, { useState } from "react";
import { LevelableUpgrade } from "./LevelableUpgrade";
import { Unlock } from "./Unlock";
import { BribeFactionModal } from "./modals/BribeFactionModal";
import { SellSharesModal } from "./modals/SellSharesModal";
import { BuybackSharesModal } from "./modals/BuybackSharesModal";
import { IssueDividendsModal } from "./modals/IssueDividendsModal";
import { IssueNewSharesModal } from "./modals/IssueNewSharesModal";
import { FindInvestorsModal } from "./modals/FindInvestorsModal";
import { GoPublicModal } from "./modals/GoPublicModal";
import { Factions } from "../../Faction/Factions";

import * as corpConstants from "../data/Constants";
import { CorpUnlocks } from "../data/CorporationUnlocks";

import { CONSTANTS } from "../../Constants";
import { formatCorpMultiplier, formatNumber, formatPercent, formatShares } from "../../ui/formatNumber";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { Money } from "../../ui/React/Money";
import { MoneyRate } from "../../ui/React/MoneyRate";
import { StatsTable } from "../../ui/React/StatsTable";
import { Player } from "@player";
import { useCorporation } from "./Context";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { MultiplierButtons } from "./MultiplierButtons";
import { SellDivisionModal } from "./modals/SellDivisionModal";
import { getRecordKeys } from "../../Types/Record";
import { PositiveInteger } from "../../types";
import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";
import { CreateCorporationModal } from "./modals/CreateCorporationModal";
import InfoIcon from "@mui/icons-material/Info";
import { CorruptibleText } from "../../ui/React/CorruptibleText";
import MathNotation from "../../Documentation/data/MathNotation.json";
import { MathNotationOutput } from "../../Documentation/ui/MathNotationOutput";

interface IProps {
  rerender: () => void;
}

export function Overview({ rerender }: IProps): React.ReactElement {
  const corp = useCorporation();
  const profit: number = corp.revenue - corp.expenses;

  const multRows: string[][] = [];
  function appendMult(name: string, value: number): void {
    if (value === 1) return;
    multRows.push([name, formatCorpMultiplier(value)]);
  }
  appendMult("生产倍率： ", corp.getProductionMultiplier());
  appendMult("仓储倍率： ", corp.getStorageMultiplier());
  appendMult("广告倍率： ", corp.getAdvertisingMultiplier());
  appendMult("员工创造力倍率： ", corp.getEmployeeCreMultiplier());
  appendMult("员工魅力倍率： ", corp.getEmployeeChaMult());
  appendMult("员工智力倍率： ", corp.getEmployeeIntMult());
  appendMult("员工效率倍率： ", corp.getEmployeeEffMult());
  appendMult("销售倍率： ", corp.getSalesMult());
  appendMult("科研倍率： ", corp.getScientificResearchMult());

  return (
    <>
      <StatsTable
        rows={[
          ["总资金：", <Money key="funds" money={corp.funds} />],
          ["总资产：", <Money key="assets" money={corp.totalAssets} />],
          ["总收入：", <MoneyRate key="revenue" money={corp.revenue} />],
          ["总支出：", <MoneyRate key="expenses" money={corp.expenses} />],
          ["总利润：", <MoneyRate key="profit" money={corp.revenue - corp.expenses} />],
          ["是否上市：", corp.public ? "是" : "否"],
          ["持有股份数：", formatShares(corp.numShares)],
          ["股价：", corp.public ? <Money key="price" money={corp.sharePrice} /> : "N/A"],
        ]}
      />
      <br />
      <Box display="flex">
        <Tooltip
          title={
            <StatsTable
              rows={[
                [
                  "持有股份数：",
                  formatShares(corp.numShares),
                  `(${formatPercent(corp.numShares / corp.totalShares)})`,
                ],
                [
                  "已发行股份：",
                  formatShares(corp.issuedShares),
                  `(${formatPercent(corp.issuedShares / corp.totalShares)})`,
                ],
                [
                  "私人股份：",
                  formatShares(corp.investorShares),
                  `(${formatPercent(corp.investorShares / corp.totalShares)})`,
                ],
              ]}
            />
          }
        >
          <Typography>股份总数：{formatShares(corp.totalShares)}</Typography>
        </Tooltip>
      </Box>
      <br />
      <DividendsStats profit={profit} />
      <br />
      <StatsTable rows={multRows} />
      <br />
      <BonusTime />
      <div>
        <ButtonWithTooltip
          normalTooltip={
            <>
              获取并阅读<i>《创建成功企业完全手册》</i>。这是一份 .lit 文件，会引导你完成企业创立的起步阶段，并提供一些帮助你上手经营管理的提示与建议。
            </>
          }
          onClick={() => corp.getStarterGuide()}
        >
          新手指南
        </ButtonWithTooltip>
        <BribeButton />
        {corp.divisions.size > 0 && <SellDivisionButton />}
        <RestartButton />
      </div>
      <div>{corp.public ? <PublicButtons rerender={rerender} /> : <PrivateButtons rerender={rerender} />}</div>
      <br />
      <Upgrades rerender={rerender} />
    </>
  );
}

interface IPrivateButtonsProps {
  rerender: () => void;
}
// Render the buttons for when your Corporation is still private
function PrivateButtons({ rerender }: IPrivateButtonsProps): React.ReactElement {
  const corp = useCorporation();
  const [findInvestorsopen, setFindInvestorsopen] = useState(false);
  const [goPublicopen, setGoPublicopen] = useState(false);

  const fundingAvailable = corp.fundingRound < corpConstants.fundingRoundShares.length;
  const findInvestorsTooltip = fundingAvailable
    ? "寻找愿意为你提供启动资金以换取公司股权（股票份额）的私人投资者"
    : "";

  return (
    <>
      <ButtonWithTooltip
        normalTooltip={findInvestorsTooltip}
        disabledTooltip={fundingAvailable ? "" : "已达到最大融资轮数"}
        onClick={() => setFindInvestorsopen(true)}
      >
        寻找投资者
      </ButtonWithTooltip>
      <ButtonWithTooltip
        normalTooltip={
          <>
            成为公开交易的实体。上市需要通过首次公开发行（IPO）发行股份。一旦成为上市公司，你的股份将在股票市场上交易。
          </>
        }
        onClick={() => setGoPublicopen(true)}
      >
        上市
      </ButtonWithTooltip>
      <FindInvestorsModal open={findInvestorsopen} onClose={() => setFindInvestorsopen(false)} rerender={rerender} />
      <GoPublicModal open={goPublicopen} onClose={() => setGoPublicopen(false)} rerender={rerender} />
    </>
  );
}

interface IUpgradeProps {
  rerender: () => void;
}
// Render the UI for Corporation upgrades
function Upgrades({ rerender }: IUpgradeProps): React.ReactElement {
  const [purchaseMultiplier, setPurchaseMultiplier] = useState<PositiveInteger | "MAX">(
    corpConstants.PurchaseMultipliers.x1,
  );

  const corp = useCorporation();
  // Don't show upgrades
  if (corp.divisions.size === 0) {
    return <Typography variant="h4">创建一个行业后即可解锁升级。</Typography>;
  }

  const unlocksNotOwned = Object.values(CorpUnlocks)
    .filter((unlock) => !corp.unlocks.has(unlock.name))
    .map(({ name }) => <Unlock rerender={rerender} name={name} key={name} />);

  return (
    <>
      <Paper sx={{ p: 1, my: 1 }}>
        <Typography variant="h4">解锁</Typography>
        <Grid container>
          {unlocksNotOwned.length ? unlocksNotOwned : <Typography>已拥有全部解锁项。</Typography>}
        </Grid>
      </Paper>
      <Paper sx={{ p: 1, my: 1 }}>
        <Typography variant="h4">升级</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <MultiplierButtons setMultiplier={setPurchaseMultiplier} selectedMultiplier={purchaseMultiplier} />
          </Grid>
        </Grid>
        <Grid container>
          {getRecordKeys(corp.upgrades).map((name) => (
            <LevelableUpgrade rerender={rerender} upgradeName={name} key={name} mult={purchaseMultiplier} />
          ))}
        </Grid>
      </Paper>
    </>
  );
}

interface IPublicButtonsProps {
  rerender: () => void;
}

// Render the buttons for when your Corporation has gone public
function PublicButtons({ rerender }: IPublicButtonsProps): React.ReactElement {
  const corp = useCorporation();
  const [sellSharesOpen, setSellSharesOpen] = useState(false);
  const [buybackSharesOpen, setBuybackSharesOpen] = useState(false);
  const [issueNewSharesOpen, setIssueNewSharesOpen] = useState(false);
  const [issueDividendsOpen, setIssueDividendsOpen] = useState(false);

  const sellSharesOnCd = corp.shareSaleCooldown > 0;
  const sellSharesTooltip =
    "出售你持有的公司股份。出售股份所得的资金会进入你的个人账户，" +
    "而不是企业的账户。" +
    "这是从你的商业冒险中获利的少数途径之一。";

  const issueNewSharesOnCd = corp.issueNewSharesCooldown > 0;

  return (
    <>
      <ButtonWithTooltip
        normalTooltip={sellSharesTooltip}
        disabledTooltip={
          sellSharesOnCd ? "无法出售股份，还需等待 " + corp.convertCooldownToString(corp.shareSaleCooldown) : ""
        }
        onClick={() => setSellSharesOpen(true)}
      >
        出售股份
      </ButtonWithTooltip>
      <SellSharesModal open={sellSharesOpen} onClose={() => setSellSharesOpen(false)} rerender={rerender} />
      <ButtonWithTooltip
        normalTooltip={"回购你先前发行或在市场上售出的股份"}
        disabledTooltip={corp.issuedShares < 1 ? "没有可供回购的股份" : ""}
        onClick={() => setBuybackSharesOpen(true)}
      >
        回购股份
      </ButtonWithTooltip>
      <BuybackSharesModal open={buybackSharesOpen} onClose={() => setBuybackSharesOpen(false)} rerender={rerender} />
      <ButtonWithTooltip
        normalTooltip={"发行新股以筹集资金"}
        disabledTooltip={
          issueNewSharesOnCd ? `冷却中，还需等待 ${corp.convertCooldownToString(corp.issueNewSharesCooldown)}` : ""
        }
        onClick={() => setIssueNewSharesOpen(true)}
      >
        发行新股
      </ButtonWithTooltip>
      <IssueNewSharesModal open={issueNewSharesOpen} onClose={() => setIssueNewSharesOpen(false)} rerender={rerender} />
      <ButtonWithTooltip
        normalTooltip={"管理向股东（包括你自己）派发的股息"}
        onClick={() => setIssueDividendsOpen(true)}
      >
        派发股息
      </ButtonWithTooltip>
      <IssueDividendsModal open={issueDividendsOpen} onClose={() => setIssueDividendsOpen(false)} />
    </>
  );
}

function BribeButton(): React.ReactElement {
  const corp = useCorporation();
  const [open, setOpen] = useState(false);
  const isValuationHighEnough = corp.valuation >= corpConstants.bribeThreshold;
  const isMemberOfBribableFaction = Player.factions.filter((f) => Factions[f].getInfo().offersWork()).length > 0;
  const canBribe = isValuationHighEnough && isMemberOfBribableFaction;
  const errorMessages = [];
  if (!isValuationHighEnough) {
    errorMessages.push(
      `你的企业还不够强大，无法贿赂派系领袖。企业估值低于门槛值。门槛：${formatNumber(
        corpConstants.bribeThreshold,
      )}。`,
    );
  }
  if (!isMemberOfBribableFaction) {
    errorMessages.push(`你不属于任何可贿赂的派系。只能贿赂至少提供一种工作类型的派系。`);
  }

  function openBribe(): void {
    if (!canBribe) {
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <ButtonWithTooltip
        normalTooltip={"利用你企业的权势与影响力贿赂派系领袖，以换取声望"}
        disabledTooltip={
          canBribe ? "" : errorMessages.map((error, index) => <Typography key={index}>{error}</Typography>)
        }
        onClick={openBribe}
      >
        贿赂派系
      </ButtonWithTooltip>
      <BribeFactionModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function SellDivisionButton(): React.ReactElement {
  const [open, setOpen] = useState(false);

  function sellDiv(): void {
    setOpen(true);
  }
  return (
    <>
      <ButtonWithTooltip normalTooltip={"出售一个部门，为其他部门腾出空间"} onClick={sellDiv}>
        出售部门
      </ButtonWithTooltip>
      <SellDivisionModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function RestartButton(): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ButtonWithTooltip normalTooltip={"出售企业并重新开始"} onClick={() => setOpen(true)}>
        出售CEO职位
      </ButtonWithTooltip>
      <CreateCorporationModal open={open} onClose={() => setOpen(false)} restart={true} />
    </>
  );
}

interface IDividendsStatsProps {
  profit: number;
}
function DividendsStats({ profit }: IDividendsStatsProps): React.ReactElement {
  const corp = useCorporation();
  if (corp.dividendRate <= 0 || profit <= 0) return <></>;
  const totalDividends = corp.dividendRate * profit;
  const retainedEarnings = profit - totalDividends;
  const dividendsPerShare = totalDividends / corp.totalShares;
  const playerEarnings = corp.getCycleDividends() / corpConstants.secondsPerMarketCycle;
  return (
    <StatsTable
      rows={[
        ["留存利润（扣除股息后）：", <MoneyRate key="profits" money={retainedEarnings} />],
        ["股息百分比：", formatPercent(corp.dividendRate, 0)],
        [
          "每股股息：",
          <MoneyRate key="dividends" money={dividendsPerShare} useExponentialFormForSmallValue={true} />,
        ],
        [
          <>
            <Tooltip
              title={
                <>
                  一切都有代价。
                  <br />
                  <br />
                  尽管你的企业给了你无尽的财富，却没人敢暗中破坏你的企业、夺走这些财富。为什么？所有（还活着的）CEO都心知肚明这条不成文的规矩：只要你向"他们"缴纳一点"贡金"，"他们"就会保护你。只要交一小笔费用，你就安全了。
                  保证如此。
                  <br />
                  <br />
                  "他们"是谁？没人确切知道。有传言说他们是{" "}
                  <CorruptibleText content={"||| BUFFER OVERFLOW DETECTED |||"} spoiler={true} />。
                  <br />
                  <br />
                  由于这笔贡金，你的股息会受到一个名为"TributeModifier"的惩罚系数的负面影响。公式：
                  <br />
                  <br />
                  <MathNotationOutput notation={MathNotation.CorpTotalDividends} />
                  <br />
                  <MathNotationOutput notation={MathNotation.CorpDividend} />
                </>
              }
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                你作为股东的收益：
                <InfoIcon sx={{ fontSize: "1.1em", marginLeft: "10px" }} />
              </div>
            </Tooltip>
          </>,
          <MoneyRate key="earnings" money={playerEarnings} />,
        ],
      ]}
    />
  );
}

// Returns a string with general information about Corporation
function BonusTime(): React.ReactElement {
  const corp = useCorporation();
  const storedTime = corp.storedCycles * CONSTANTS.MilliPerCycle;
  if (storedTime <= 15000) return <></>;
  return (
    <Box display="flex">
      <Tooltip
        title={
          <Typography>
            离线或游戏未处于活动状态时（例如标签页被浏览器节流），你可以获得奖励时间。奖励时间会让企业机制加速运转，最高可达正常速度的10倍。
          </Typography>
        }
      >
        <Typography>
          奖励时间：{convertTimeMsToTimeElapsedString(storedTime)}
          <br />
          <br />
        </Typography>
      </Tooltip>
    </Box>
  );
}
