import { Paper, Table, TableBody, Box, IconButton, Typography, Container } from "@mui/material";
import { MoreHoriz } from "@mui/icons-material";
import React, { useState } from "react";
import { BitNodes } from "../BitNode/BitNode";
import { BitNodeMultipliersDisplay } from "../BitNode/ui/BitnodeMultipliersDescription";
import { HacknetServerConstants } from "../Hacknet/data/Constants";
import { getCloudServerLimit } from "../Server/ServerPurchases";
import { Settings } from "../Settings/Settings";
import { MoneySourceTracker } from "../utils/MoneySourceTracker";
import { convertTimeMsToTimeElapsedString } from "../utils/StringHelperFunctions";
import { Player } from "@player";
import { formatNumber } from "./formatNumber";
import { MultiplierArea } from "./React/MultiplierArea";
import { Modal } from "./React/Modal";
import { Money } from "./React/Money";
import { StatsRow } from "./React/StatsRow";
import { StatsTable } from "./React/StatsTable";
import { useCycleRerender } from "./React/hooks";
import { canAccessBitNodeFeature, getBitNodeLevel, knowAboutBitverse } from "../BitNode/BitNodeUtils";

interface EmployersModalProps {
  open: boolean;
  onClose: () => void;
}

const EmployersModal = ({ open, onClose }: EmployersModalProps): React.ReactElement => {
  return (
    <Modal open={open} onClose={onClose}>
      <>
        <Typography variant="h5">All Employers</Typography>
        <ul>
          {Object.keys(Player.jobs).map((j) => (
            <Typography key={j}>* {j}</Typography>
          ))}
        </ul>
      </>
    </Modal>
  );
};

function CurrentBitNode(): React.ReactElement {
  if (knowAboutBitverse()) {
    const index = "BitNode" + Player.bitNodeN;
    return (
      <Paper sx={{ mb: 1, p: 1 }}>
        <Typography variant="h5">
          BitNode {Player.bitNodeN}: {BitNodes[index].name} (Level {getBitNodeLevel()})
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
    const parts: [string, JSX.Element][] = [[`Total:`, <Money key="total" money={src.total} />]];
    if (src.augmentations) {
      parts.push([`Augmentations:`, <Money key="aug" money={src.augmentations} />]);
    }
    if (src.bladeburner) {
      parts.push([`Bladeburner:`, <Money key="blade" money={src.bladeburner} />]);
    }
    if (src.casino) {
      parts.push([`Casino:`, <Money key="casino" money={src.casino} />]);
    }
    if (src.codingcontract) {
      parts.push([`Coding Contracts:`, <Money key="coding-contract" money={src.codingcontract} />]);
    }
    if (src.work) {
      parts.push([`Company Work:`, <Money key="company-work" money={src.work} />]);
    }
    if (src.class) {
      parts.push([`Class:`, <Money key="class" money={src.class} />]);
    }
    if (src.corporation) {
      parts.push([`Corporation:`, <Money key="corp" money={src.corporation} />]);
    }
    if (src.crime) {
      parts.push([`Crimes:`, <Money key="crime" money={src.crime} />]);
    }
    if (src.darknet) {
      parts.push([`Darknet:`, <Money key="darknet" money={src.darknet} />]);
    }
    if (src.gang) {
      parts.push([`Gang:`, <Money key="gang" money={src.gang} />]);
    }
    if (src.gang_expenses) {
      parts.push([`Gang Expenses:`, <Money key="gang-expenses" money={src.gang_expenses} />]);
    }
    if (src.hacking) {
      parts.push([`Hacking:`, <Money key="hacking" money={src.hacking} />]);
    }
    if (src.hacknet) {
      parts.push([`Hacknet:`, <Money key="hacknet" money={src.hacknet} />]);
    }
    if (src.hacknet_expenses) {
      parts.push([`Hacknet Expenses:`, <Money key="hacknet-expenses" money={src.hacknet_expenses} />]);
    }
    if (src.hospitalization) {
      parts.push([`Hospitalization:`, <Money key="hospital" money={src.hospitalization} />]);
    }
    if (src.infiltration) {
      parts.push([`Infiltration:`, <Money key="infiltration" money={src.infiltration} />]);
    }
    if (src.servers) {
      parts.push([`Servers:`, <Money key="servers" money={src.servers} />]);
    }
    if (src.stock) {
      parts.push([`Stock Market:`, <Money key="market" money={src.stock} />]);
    }
    if (src.sleeves) {
      parts.push([`Sleeves:`, <Money key="sleeves" money={src.sleeves} />]);
    }
    if (src.other) {
      parts.push([`Other:`, <Money key="other" money={src.other} />]);
    }

    return <StatsTable rows={parts} wide />;
  }

  let content = (
    <>
      <Typography variant="h6" color="primary">
        Money earned since you last installed Augmentations
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
          Money earned in this BitNode
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
    ["Since last Augmentation installation", convertTimeMsToTimeElapsedString(Player.playtimeSinceLastAug)],
  ];
  if (knowAboutBitverse()) {
    timeRows.push(["Since last Bitnode destroyed", convertTimeMsToTimeElapsedString(Player.playtimeSinceLastBitnode)]);
  }
  timeRows.push(["Total", convertTimeMsToTimeElapsedString(Player.totalPlaytime)]);

  return (
    <Container maxWidth="lg" disableGutters sx={{ mx: 0 }}>
      <Typography variant="h4">Stats</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", minWidth: "fit-content", mb: 1, gap: 1 }}>
        <Paper sx={{ p: 1 }}>
          <Typography variant="h5">General</Typography>
          <Table>
            <TableBody>
              <StatsRow name="Current City" color={Settings.theme.primary} data={{ content: Player.city }} />
              <StatsRow name="Money" color={Settings.theme.money} data={{}}>
                <>
                  <Money money={Player.money} />
                  <IconButton onClick={() => setMoneyOpen(true)} sx={{ p: 0 }}>
                    <MoreHoriz color="info" />
                  </IconButton>
                </>
              </StatsRow>

              {Player.jobs && Object.keys(Player.jobs).length !== 0 ? (
                <StatsRow name="All Employers" color={Settings.theme.primary} data={{}}>
                  <>
                    <span style={{ color: Settings.theme.primary }}>{Object.keys(Player.jobs).length} total</span>
                    <IconButton onClick={() => setEmployersOpen(true)} sx={{ p: 0 }}>
                      <MoreHoriz color="info" />
                    </IconButton>
                  </>
                </StatsRow>
              ) : (
                <></>
              )}
              <StatsRow
                name="Cloud Servers"
                color={Settings.theme.primary}
                data={{ content: `${Player.purchasedServers.length} / ${getCloudServerLimit()}` }}
              />
              <StatsRow
                name={`Hacknet ${canAccessBitNodeFeature(9) ? "Servers" : "Nodes"}`}
                color={Settings.theme.primary}
                data={{
                  content: `${Player.hacknetNodes.length}${
                    canAccessBitNodeFeature(9) ? ` / ${HacknetServerConstants.MaxServers}` : ""
                  }`,
                }}
              />
              <StatsRow
                name="Augmentations Installed"
                color={Settings.theme.primary}
                data={{ content: String(Player.augmentations.length) }}
              />
              <StatsRow name="Karma" color={Settings.theme.primary} data={{ content: formatNumber(Player.karma, 3) }} />
            </TableBody>
          </Table>
        </Paper>
        <Paper sx={{ p: 1 }}>
          <Typography variant="h5">Skills</Typography>
          <Table>
            <TableBody>
              <StatsRow
                name="Hacking"
                color={Settings.theme.hack}
                data={{ level: Player.skills.hacking, exp: Player.exp.hacking }}
              />
              <StatsRow
                name="Strength"
                color={Settings.theme.combat}
                data={{ level: Player.skills.strength, exp: Player.exp.strength }}
              />
              <StatsRow
                name="Defense"
                color={Settings.theme.combat}
                data={{ level: Player.skills.defense, exp: Player.exp.defense }}
              />
              <StatsRow
                name="Dexterity"
                color={Settings.theme.combat}
                data={{ level: Player.skills.dexterity, exp: Player.exp.dexterity }}
              />
              <StatsRow
                name="Agility"
                color={Settings.theme.combat}
                data={{ level: Player.skills.agility, exp: Player.exp.agility }}
              />
              <StatsRow
                name="Charisma"
                color={Settings.theme.cha}
                data={{ level: Player.skills.charisma, exp: Player.exp.charisma }}
              />
              {Player.skills.intelligence > 0 && canAccessBitNodeFeature(5) && (
                <StatsRow
                  name="Intelligence"
                  color={Settings.theme.int}
                  data={{ level: Player.skills.intelligence, exp: Player.exp.intelligence }}
                />
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      <Paper sx={{ p: 1, mb: 1 }}>{MultiplierArea(Player)}</Paper>

      <Paper sx={{ p: 1, mb: 1 }}>
        <Typography variant="h5">Time Played</Typography>
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
          <Typography variant="h5">BitNode Multipliers</Typography>
          <BitNodeMultipliersDisplay n={Player.bitNodeN} hideMultsIfCannotAccessFeature={true} />
        </Paper>
      )}

      <MoneyModal open={moneyOpen} onClose={() => setMoneyOpen(false)} />
      <EmployersModal open={employersOpen} onClose={() => setEmployersOpen(false)} />
    </Container>
  );
}
