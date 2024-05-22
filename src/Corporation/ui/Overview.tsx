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
import { formatCorpMultiplier, formatPercent, formatShares } from "../../ui/formatNumber";
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
          ["Total Funds:", <Money key="funds" money={corp.funds} />],
          ["Total Assets:", <Money key="assets" money={corp.totalAssets} />],
          ["Total Revenue:", <MoneyRate key="revenue" money={corp.revenue} />],
          ["Total Expenses:", <MoneyRate key="expenses" money={corp.expenses} />],
          ["Total Profit:", <MoneyRate key="profit" money={corp.revenue - corp.expenses} />],
          ["Publicly Traded:", corp.public ? "Yes" : "No"],
          ["Owned Stock Shares:", formatShares(corp.numShares)],
          ["Stock Price:", corp.public ? <Money key="price" money={corp.sharePrice} /> : "N/A"],
        ]}
      />
      <br />
      <Box display="flex">
        <Tooltip
          title={
            <StatsTable
              rows={[
                [
                  "Owned Stock Shares:",
                  formatShares(corp.numShares),
                  `(${formatPercent(corp.numShares / corp.totalShares)})`,
                ],
                [
                  "Outstanding Shares:",
                  formatShares(corp.issuedShares),
                  `(${formatPercent(corp.issuedShares / corp.totalShares)})`,
                ],
                [
                  "Private Shares:",
                  formatShares(corp.investorShares),
                  `(${formatPercent(corp.investorShares / corp.totalShares)})`,
                ],
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
      <div>
        <ButtonWithTooltip
          normalTooltip={
            <>
              Get a copy of and read <i>The Complete Handbook for Creating a Successful Corporation</i>. This is a .lit
              file that guides you through the beginning of setting up a Corporation and provides some tips/pointers for
              helping you get started with managing it.
            </>
          }
          onClick={() => corp.getStarterGuide()}
        >
          Getting Started Guide
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
    ? "Search for private investors who will give you startup funding in exchange for equity (stock shares) in your company"
    : "";

  return (
    <>
      <ButtonWithTooltip
        normalTooltip={findInvestorsTooltip}
        disabledTooltip={fundingAvailable ? "" : "Max funding rounds already reached"}
        onClick={() => setFindInvestorsopen(true)}
      >
        Find Investors
      </ButtonWithTooltip>
      <ButtonWithTooltip
        normalTooltip={
          <>
            Become a publicly traded and owned entity. Going public involves issuing shares for an IPO. Once you are a
            public company, your shares will be traded on the stock market.
          </>
        }
        onClick={() => setGoPublicopen(true)}
      >
        Go Public
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
    return <Typography variant="h4">Upgrades are unlocked once you create an industry.</Typography>;
  }

  const unlocksNotOwned = Object.values(CorpUnlocks)
    .filter((unlock) => !corp.unlocks.has(unlock.name))
    .map(({ name }) => <Unlock rerender={rerender} name={name} key={name} />);

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
    "Sell your shares in the company. The money earned from selling your " +
    "shares goes into your personal account, not the Corporation's. " +
    "This is one of the only ways to profit from your business venture.";

  const issueNewSharesOnCd = corp.issueNewSharesCooldown > 0;

  return (
    <>
      <ButtonWithTooltip
        normalTooltip={sellSharesTooltip}
        disabledTooltip={
          sellSharesOnCd ? "Cannot sell shares for " + corp.convertCooldownToString(corp.shareSaleCooldown) : ""
        }
        onClick={() => setSellSharesOpen(true)}
      >
        Sell Shares
      </ButtonWithTooltip>
      <SellSharesModal open={sellSharesOpen} onClose={() => setSellSharesOpen(false)} rerender={rerender} />
      <ButtonWithTooltip
        normalTooltip={"Buy back outstanding shares that you previously issued or sold on the market"}
        disabledTooltip={corp.issuedShares < 1 ? "No shares available to buy back" : ""}
        onClick={() => setBuybackSharesOpen(true)}
      >
        Buyback shares
      </ButtonWithTooltip>
      <BuybackSharesModal open={buybackSharesOpen} onClose={() => setBuybackSharesOpen(false)} rerender={rerender} />
      <ButtonWithTooltip
        normalTooltip={"Issue new equity shares to raise capital"}
        disabledTooltip={
          issueNewSharesOnCd ? `On cooldown for ${corp.convertCooldownToString(corp.issueNewSharesCooldown)}` : ""
        }
        onClick={() => setIssueNewSharesOpen(true)}
      >
        Issue New Shares
      </ButtonWithTooltip>
      <IssueNewSharesModal open={issueNewSharesOpen} onClose={() => setIssueNewSharesOpen(false)} rerender={rerender} />
      <ButtonWithTooltip
        normalTooltip={"Manage the dividends that are paid out to shareholders (including yourself)"}
        onClick={() => setIssueDividendsOpen(true)}
      >
        Issue Dividends
      </ButtonWithTooltip>
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
      <ButtonWithTooltip
        normalTooltip={"Use your Corporations power and influence to bribe Faction leaders in exchange for reputation"}
        disabledTooltip={canBribe ? "" : "Your Corporation is not powerful enough to bribe Faction leaders"}
        onClick={openBribe}
      >
        Bribe Factions
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
      <ButtonWithTooltip normalTooltip={"Sell a division to make room for other divisions"} onClick={sellDiv}>
        Sell division
      </ButtonWithTooltip>
      <SellDivisionModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function RestartButton(): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ButtonWithTooltip normalTooltip={"Sell corporation and start over"} onClick={() => setOpen(true)}>
        Sell CEO position
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
        ["Retained Profits (after dividends):", <MoneyRate key="profits" money={retainedEarnings} />],
        ["Dividend Percentage:", formatPercent(corp.dividendRate, 0)],
        ["Dividends per share:", <MoneyRate key="dividends" money={dividendsPerShare} />],
        ["Your earnings as a shareholder:", <MoneyRate key="earnings" money={playerEarnings} />],
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
