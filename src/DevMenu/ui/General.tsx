import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Player } from "@player";
import { FactionName } from "@enums";
import { useRerender } from "../../ui/React/hooks";
import { Money } from "../../ui/React/Money";
import { NumberInput } from "../../ui/React/NumberInput";
import { Hashes } from "../../ui/React/Hashes";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { GangConstants } from "../../Gang/data/Constants";
import { checkForMessagesToSend } from "../../Message/MessageHelpers";
import { getEnumHelper } from "../../utils/EnumHelper";
import { formatRam } from "../../ui/formatNumber";

export function General({ parentRerender }: { parentRerender: () => void }): React.ReactElement {
  const rerender = useRerender(400);
  const [error, setError] = useState(false);
  const [corporationName, setCorporationName] = useState("");
  const [gangFaction, setGangFaction] = useState(FactionName.SlumSnakes);
  const [devMoney, setDevMoney] = useState(0);
  const [hash, setHash] = useState(Player.hashManager.hashes);

  // Money functions
  const addCustomMoney = () => !Number.isNaN(devMoney) && Player.gainMoney(devMoney, "other");
  const addMoney = (n: number) => () => n && Player.gainMoney(n, "other");
  const setMoney = (n: number) => () => {
    if (!isNaN(n)) Player.money = n;
  };
  const addHashes = () => hash && Player.hashManager.storeHashes(hash);

  const homeComputer = Player.getHomeComputer();

  // Ram functions
  const doubleRam = () => {
    homeComputer.maxRam *= 2;
    rerender();
  };
  const ramSetter = (gb: number) => () => {
    homeComputer.maxRam = gb;
    rerender();
  };

  // Node-clearing functions
  const quickB1tFlum3 = () => Router.toPage(Page.BitVerse, { flume: true, quick: true });
  const b1tflum3 = () => Router.toPage(Page.BitVerse, { flume: true, quick: false });
  const quickHackW0r1dD43m0n = () => Router.toPage(Page.BitVerse, { flume: false, quick: true });
  const hackW0r1dD43m0n = () => Router.toPage(Page.BitVerse, { flume: false, quick: false });

  // Corp functions
  const createCorporation = () => {
    Player.startCorporation(corporationName, false);
    parentRerender();
  };
  const destroyCorporation = () => {
    Player.corporation = null;
    parentRerender();
  };

  // Blade functions
  const joinBladeburner = () => {
    Player.startBladeburner();
    parentRerender();
  };
  const leaveBladeburner = () => {
    Player.bladeburner = null;
    parentRerender();
  };

  // Gang functions
  const startGang = () => {
    Player.startGang(gangFaction);
    parentRerender();
  };
  const stopGang = () => {
    Player.gang = null;
    parentRerender();
  };
  const setGangFactionDropdown = (event: SelectChangeEvent) => {
    // Todo: Make this a more specific check when a GangName enumlike is added
    if (!getEnumHelper("FactionName").isMember(event.target.value)) return;
    setGangFaction(event.target.value);
  };

  // Misc functions
  const checkMessages = () => checkForMessagesToSend();
  useEffect(() => {
    if (error) throw new ReferenceError("Manually thrown error");
  }, [error]);

  const moneyValues = [1e6, 1e9, 1e12, 1e15, Infinity];
  const ramValues = [8, 64, 1024, 1048576, 1073741824];

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>General</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          Money (current: <Money money={Player.money} />)
        </Typography>
        {moneyValues.map((value) => (
          <Button key={`add money ${value}`} onClick={addMoney(value)}>
            +&nbsp;
            <Money money={value} />
          </Button>
        ))}
        <br />
        <NumberInput placeholder={"$$$"} onChange={setDevMoney} />
        <Button onClick={addCustomMoney}>Give Money</Button>
        <Button onClick={setMoney(0)}>Clear Money</Button>
        {Player.hashManager.capacity > 0 && (
          <>
            <br />
            <br />
            <Typography>
              Hashes (current: <Hashes hashes={Player.hashManager.hashes} /> /&nbsp;
              <Hashes hashes={Player.hashManager.capacity} />)
            </Typography>
            <NumberInput disabled={!Player.hashManager} placeholder={"hashes"} onChange={setHash} />
            <Button disabled={!Player.hashManager} onClick={addHashes}>
              Give Hashes
            </Button>
            <Button disabled={!Player.hashManager} onClick={() => (Player.hashManager.hashes = 0)}>
              Clear Hashes
            </Button>
          </>
        )}
        <br />
        <br />
        <Typography>Max Home RAM (current: {formatRam(homeComputer.maxRam)})</Typography>
        {ramValues.map((gb) => (
          <Button key={gb} onClick={ramSetter(gb)}>
            {formatRam(gb)}
          </Button>
        ))}
        <Button onClick={doubleRam}>RAM *= 2</Button>
        <br />
        <br />
        <Typography>Corporation:</Typography>
        {Player.corporation ? (
          <Button onClick={destroyCorporation}>Destroy Corporation</Button>
        ) : (
          <>
            <TextField
              placeholder="Enter Corp Name"
              value={corporationName}
              onChange={(x) => setCorporationName(x.target.value)}
            />
            <Button onClick={createCorporation}>Create Corporation</Button>
          </>
        )}
        <br />
        <br />
        <Typography>Gang:</Typography>
        {Player.gang ? (
          <Button onClick={stopGang}>Leave Gang</Button>
        ) : (
          <>
            <Select value={gangFaction} onChange={setGangFactionDropdown}>
              {GangConstants.Names.map((factionName) => (
                <MenuItem key={factionName} value={factionName}>
                  {factionName}
                </MenuItem>
              ))}
            </Select>
            <Button onClick={startGang}>Create Gang</Button>
          </>
        )}
        <br />
        <br />
        <Typography>Bladeburner:</Typography>
        {Player.bladeburner ? (
          <Button onClick={leaveBladeburner}>Leave BladeBurner</Button>
        ) : (
          <Button onClick={joinBladeburner}>Join BladeBurner</Button>
        )}
        <br />
        <br />
        <Typography>Misc:</Typography>
        <Button onClick={quickB1tFlum3}>Quick b1t_flum3.exe</Button>
        <Button onClick={b1tflum3}>Run b1t_flum3.exe</Button>
        <br />
        <Button onClick={quickHackW0r1dD43m0n}>Quick w0rld_d34m0n</Button>
        <Button onClick={hackW0r1dD43m0n}>Hack w0rld_d34m0n</Button>
        <br />
        <Button onClick={() => setError(true)}>Throw Error</Button>
        <Button onClick={checkMessages}>Check Messages</Button>
      </AccordionDetails>
    </Accordion>
  );
}
