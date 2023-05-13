// React Component for displaying Corporation Overview info
import React, { useState } from "react";
import { LevelableUpgrade } from "./LevelableUpgrade";
import { UnlockUpgrade } from "./UnlockUpgrade";
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
import { formatCorpStat, formatPercent, formatShares } from "../../ui/formatNumber";
import { convertTimeMsToTimeElapsedString } from "../../utils/StringHelperFunctions";
import { Money } from "../../ui/React/Money";
import { MoneyRate } from "../../ui/React/MoneyRate";
import { StatsTable } from "../../ui/React/StatsTable";
import { Player } from "@player";
import { useCorporation } from "./Context";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { MultiplierButtons } from "./MultiplierButtons";
import { SellCorporationModal } from "./modals/SellCorporationModal";
import { SellDivisionModal } from "./modals/SellDivisionModal";
import { getRecordKeys } from "../../Types/Record";
import { PositiveInteger } from "../../types";

interface IProps {
  rerender: () => void;
}

export function Overview({ rerender }: IProps): React.ReactElement {
  const corp = useCorporation();
  const profit: number = corp.revenue - corp.expenses;

  const multRows: string[][] = [];
  function appendMult(name: string, value: number): void {
    if (value === 1) return;
    multRows.push([name, formatCorpStat(value)]);
  }
  appendMult("Production Multiplier: ", corp.getProductionMultiplier());
  appendMult("Storage Multiplier: ", corp.getStorageMultiplier());
  appendMult("Advertising Multiplier: ", corp.getAdvertisingMultiplier());
  appendMult("Empl. Creativity Multiplier: ", corp.getEmployeeCreMultiplier());
  appendMult("Empl. Charisma Multiplier: ", corp.getEmployeeChaMult());
  appendMult("Empl. Intelligence Multiplier: ", corp.getEmployeeIntMult());
  appendMult("Empl. Efficiency Multiplier: ", corp.getEmployeeEffMult());
  appendMult("Sales Multiplier: ", corp.getSalesMult());
  appendMult("Scientific Research Multiplier: ", corp.getScientificResearchMult());

  return (
    <>
      <StatsTable
        rows={[
          ["Total Funds:", <Money money={corp.funds} />],
          ["Total Revenue:", <MoneyRate money={corp.revenue} />],
          ["Total Expenses:", <MoneyRate money={corp.expenses} />],
          ["Total Profit:", <MoneyRate money={corp.revenue - corp.expenses} />],
          ["Publicly Traded:", corp.public ? "Yes" : "No"],
          ["Owned Stock Shares:", formatShares(corp.numShares)],
          ["Stock Price:", corp.public ? <Money money={corp.sharePrice} /> : "N/A"],
        ]}
      />
      <br />
      <Box display="flex">
        <Tooltip
          title={
            <StatsTable
              rows={[
                ["Outstanding Shares:", formatShares(corp.issuedShares)],
                ["Private Shares:", formatShares(corp.totalShares - corp.issuedShares - corp.numShares)],
              ]}
            />
          }
        >
          <Typography>Total Stock Shares: {formatShares(corp.totalShares)}</Typography>
        </Tooltip>
      </Box>
      <br />
      <DividendsStats profit={profit} />
      <br />
      <StatsTable rows={multRows} />
      <br />
      <BonusTime />
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", width: "fit-content" }}>
        <Tooltip
          title={
            <Typography>
              Get a copy of and read 'The Complete Handbook for Creating a Successful Corporation.' This is a .lit file
              that guides you through the beginning of setting up a Corporation and provides some tips/pointers for
              helping you get started with managing it.
            </Typography>
          }
        >
          <Button onClick={() => corp.getStarterGuide()}>Getting Started Guide</Button>
        </Tooltip>
        {corp.public ? <PublicButtons rerender={rerender} /> : <PrivateButtons rerender={rerender} />}
        <BribeButton />
        {corp.divisions.size > 0 && <SellDivisionButton />}
        <RestartButton />
      </Box>
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

  const fundingAvailable = corp.fundingRound < 4;
  const findInvestorsTooltip = fundingAvailable
    ? "Search for private investors who will give you startup funding in exchange for equity (stock shares) in your company"
    : "";

  return (
    <>
      <Tooltip title={<Typography>{findInvestorsTooltip}</Typography>}>
        <Button disabled={!fundingAvailable} onClick={() => setFindInvestorsopen(true)}>
          Find Investors
        </Button>
      </Tooltip>
      <Tooltip
        title={
          <Typography>
            Become a publicly traded and owned entity. Going public involves issuing shares for an IPO. Once you are a
            public company, your shares will be traded on the stock market.
          </Typography>
        }
      >
        <Button onClick={() => setGoPublicopen(true)}>Go Public</Button>
      </Tooltip>
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
  const corp = useCorporation();
  // Don't show upgrades
  if (corp.divisions.size === 0) {
    return <Typography variant="h4">Upgrades are unlocked once you create an industry.</Typography>;
  }

  const [purchaseMultiplier, setPurchaseMultiplier] = useState<PositiveInteger | "MAX">(
    corpConstants.PurchaseMultipliers.x1,
  );

  // onClick event handlers for purchase multiplier buttons
  const purchaseMultiplierOnClicks = [
    () => setPurchaseMultiplier(corpConstants.PurchaseMultipliers.x1),
    () => setPurchaseMultiplier(corpConstants.PurchaseMultipliers.x5),
    () => setPurchaseMultiplier(corpConstants.PurchaseMultipliers.x10),
    () => setPurchaseMultiplier(corpConstants.PurchaseMultipliers.x50),
    () => setPurchaseMultiplier(corpConstants.PurchaseMultipliers.x100),
    () => setPurchaseMultiplier(corpConstants.PurchaseMultipliers.MAX),
  ];

  const unlocksNotOwned = Object.values(CorpUnlocks)
    .filter((unlock) => !corp.unlocks.has(unlock.name))
    .map(({ name }) => <UnlockUpgrade rerender={rerender} name={name} key={name} />);

  return (
    <>
      <Paper sx={{ p: 1, my: 1 }}>
        <Typography variant="h4">Unlocks</Typography>
        <Grid container>
          {unlocksNotOwned.length ? unlocksNotOwned : <Typography>All unlocks are owned.</Typography>}
        </Grid>
      </Paper>
      <Paper sx={{ p: 1, my: 1 }}>
        <Typography variant="h4">Upgrades</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <MultiplierButtons onClicks={purchaseMultiplierOnClicks} purchaseMultiplier={purchaseMultiplier} />
          </Grid>
        </Grid>
        <Grid container>
          {getRecordKeys(corp.upgrades).map((name) => (
            <LevelableUpgrade rerender={rerender} upgradeName={name} key={name} amount={purchaseMultiplier} />
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
  const sellSharesTooltip = sellSharesOnCd
    ? "Cannot sell shares for " + corp.convertCooldownToString(corp.shareSaleCooldown)
    : "Sell your shares in the company. The money earned from selling your " +
      "shares goes into your personal account, not the Corporation's. " +
      "This is one of the only ways to profit from your business venture.";

  const issueNewSharesOnCd = corp.issueNewSharesCooldown > 0;
  const issueNewSharesTooltip = issueNewSharesOnCd
    ? "Cannot issue new shares for " + corp.convertCooldownToString(corp.issueNewSharesCooldown)
    : "Issue new equity shares to raise capital.";

  return (
    <>
      <Tooltip title={<Typography>{sellSharesTooltip}</Typography>}>
        <Button disabled={sellSharesOnCd} onClick={() => setSellSharesOpen(true)}>
          Sell Shares
        </Button>
      </Tooltip>
      <SellSharesModal open={sellSharesOpen} onClose={() => setSellSharesOpen(false)} rerender={rerender} />
      <Tooltip title={<Typography>Buy back shares you that previously issued or sold at market price.</Typography>}>
        <Button disabled={corp.issuedShares < 1} onClick={() => setBuybackSharesOpen(true)}>
          Buyback shares
        </Button>
      </Tooltip>
      <BuybackSharesModal open={buybackSharesOpen} onClose={() => setBuybackSharesOpen(false)} rerender={rerender} />
      <Tooltip title={<Typography>{issueNewSharesTooltip}</Typography>}>
        <Button disabled={issueNewSharesOnCd} onClick={() => setIssueNewSharesOpen(true)}>
          Issue New Shares
        </Button>
      </Tooltip>
      <IssueNewSharesModal open={issueNewSharesOpen} onClose={() => setIssueNewSharesOpen(false)} />
      <Tooltip
        title={<Typography>Manage the dividends that are paid out to shareholders (including yourself)</Typography>}
      >
        <Button onClick={() => setIssueDividendsOpen(true)}>Issue Dividends</Button>
      </Tooltip>
      <IssueDividendsModal open={issueDividendsOpen} onClose={() => setIssueDividendsOpen(false)} />
    </>
  );
}

function BribeButton(): React.ReactElement {
  const corp = useCorporation();
  const [open, setOpen] = useState(false);
  const canBribe =
    corp.valuation >= corpConstants.bribeThreshold &&
    Player.factions.filter((f) => Factions[f].getInfo().offersWork()).length > 0;

  function openBribe(): void {
    if (!canBribe) return;
    setOpen(true);
  }

  return (
    <>
      <Tooltip
        title={
          canBribe
            ? "Use your Corporations power and influence to bribe Faction leaders in exchange for reputation"
            : "Your Corporation is not powerful enough to bribe Faction leaders"
        }
      >
        <Button disabled={!canBribe} onClick={openBribe}>
          Bribe Factions
        </Button>
      </Tooltip>
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
      <Tooltip title={"Sell a division to make room for other divisions"}>
        <Button onClick={sellDiv}>Sell division</Button>
      </Tooltip>
      <SellDivisionModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function RestartButton(): React.ReactElement {
  const [open, setOpen] = useState(false);

  function restart(): void {
    setOpen(true);
  }

  return (
    <>
      <Tooltip title={"Sell corporation and start over"}>
        <Button onClick={restart}>Sell CEO position</Button>
      </Tooltip>
      <SellCorporationModal open={open} onClose={() => setOpen(false)} />
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
        ["Retained Profits (after dividends):", <MoneyRate money={retainedEarnings} />],
        ["Dividend Percentage:", formatPercent(corp.dividendRate, 0)],
        ["Dividends per share:", <MoneyRate money={dividendsPerShare} />],
        ["Your earnings as a shareholder:", <MoneyRate money={playerEarnings} />],
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
            You gain bonus time while offline or when the game is inactive (e.g. when the tab is throttled by the
            browser). Bonus time makes the Corporation mechanic progress faster, up to 10x the normal speed.
          </Typography>
        }
      >
        <Typography>
          Bonus time: {convertTimeMsToTimeElapsedString(storedTime)}
          <br />
          <br />
        </Typography>
      </Tooltip>
    </Box>
  );
}
