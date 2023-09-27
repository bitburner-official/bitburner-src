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
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Player } from "@player";
import { FactionName } from "@enums";
import { Money } from "../../ui/React/Money";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { Bladeburner } from "../../Bladeburner/Bladeburner";
import { GangConstants } from "../../Gang/data/Constants";
import { checkForMessagesToSend } from "../../Message/MessageHelpers";
import { ThemeEvents } from "../../Themes/ui/Theme";
import { getEnumHelper } from "../../utils/EnumHelper";

export function General(): React.ReactElement {
  const [error, setError] = useState(false);
  const [corporationName, setCorporationName] = useState("");
  const [gangFaction, setGangFaction] = useState(FactionName.SlumSnakes);
  const [devMoney, setDevMoney] = useState(0);
  const [hash, setHash] = useState(Player.hashManager.hashes);
  const [, setHomeRam] = useState(Player.getHomeComputer().maxRam); //no state variable.

  // Money functions
  const moneyValues = [1e6, 1e9, 1e12, 1e15, Infinity];
  const addCustomMoney = () => !Number.isNaN(devMoney) && Player.gainMoney(devMoney, "other");
  const addMoney = (n: number) => () => Player.gainMoney(n, "other");
  const setMoney = (n: number) => () => (Player.money = Number(n));
  const addHashes = () => (Player.hashManager.hashes += hash);

  // Ram functions
  const doubleRam = () => {
    Player.getHomeComputer().maxRam *= 2;
    setHomeRam((prevState) => prevState * 2); //prevState avoids stale data
  };
  const setRam = (gb: number) => () => {
    Player.getHomeComputer().maxRam = gb;
    setHomeRam(gb);
  };

  // Node-clearing functions
  const quickB1tFlum3 = () => Router.toPage(Page.BitVerse, { flume: true, quick: true });
  const b1tflum3 = () => Router.toPage(Page.BitVerse, { flume: true, quick: false });
  const quickHackW0r1dD43m0n = () => Router.toPage(Page.BitVerse, { flume: false, quick: true });
  const hackW0r1dD43m0n = () => Router.toPage(Page.BitVerse, { flume: false, quick: false });

  // Corp functions
  const createCorporation = () => {
    Player.startCorporation(corporationName, false);
    // Rerender so the corp menu option will show up immediately on the devmenu page selection
    ThemeEvents.emit();
  };
  const destroyCorporation = () => {
    Player.corporation = null;
    // Rerender so the corp menu option will be removed immediately on the devmenu page selection
    ThemeEvents.emit();
  };

  // Blade functions
  const joinBladeburner = () => {
    Player.bladeburner = new Bladeburner();
    // Rerender so the blade menu option will show up immediately on the devmenu page selection
    ThemeEvents.emit();
  };
  const leaveBladeburner = () => {
    Player.bladeburner = null;
    // Rerender so the blade menu option will be removed immediately on the devmenu page selection
    ThemeEvents.emit();
  };

  // Gang functions
  const startGang = () => {
    const isHacking = gangFaction === FactionName.NiteSec || gangFaction === FactionName.TheBlackHand;
    Player.startGang(gangFaction, isHacking);
    // Rerender so the gang menu option will show up immediately on the devmenu page selection
    ThemeEvents.emit();
  };
  const stopGang = () => {
    Player.gang = null;
    // Rerender so the gang menu option will be removed immediately on the devmenu page selection
    ThemeEvents.emit();
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

  // Component css
  const smallButtonStyle = { width: "12rem" };
  const largeButtonStyle = { width: "20rem" };
  const noArrowsNumberField = {
    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
      display: "none",
    },
    "& input[type=number]": {
      MozAppearance: "textfield",
    },
  };

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>General</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {moneyValues.map((value) => (
          <Button onClick={addMoney(value)}>
            <pre>
              + <Money money={value} />
            </pre>
          </Button>
        ))}
        <br />
        <Typography>Add Money</Typography>
        <TextField
          placeholder={"$$$"}
          onChange={(x) => setDevMoney(parseFloat(x.target.value))}
          sx={noArrowsNumberField}
        />
        <Button style={smallButtonStyle} onClick={addCustomMoney}>
          Give Money
        </Button>
        <Button
          style={smallButtonStyle}
          onClick={setMoney(0)}
          title="This sets your money to $0, this means the money you had will just vanish without being accounted for where it went and may offset some metrics."
        >
          Clear Money
        </Button>
        <br />
        <TextField
          disabled={!Player.hashManager}
          type="number"
          placeholder={"add Hacknet hashes"}
          onChange={(x) => setHash(parseFloat(x.target.value))}
          sx={noArrowsNumberField}
        />
        <Button disabled={!Player.hashManager} style={smallButtonStyle} onClick={addHashes}>
          Give Hashes
        </Button>
        <Button disabled={!Player.hashManager} style={smallButtonStyle} onClick={() => (Player.hashManager.hashes = 0)}>
          Clear Hashes
        </Button>
        <br />
        <Tooltip placement="top-start" title={`Current RAM: ${Player.getHomeComputer().maxRam} GB`}>
          <Typography>Set Home Server RAM</Typography>
        </Tooltip>
        <Tooltip placement="top" title="Starting RAM">
          <Button onClick={setRam(8)}>8 GB</Button>
        </Tooltip>
        <Button onClick={setRam(64)}>64 GB</Button>
        <Button onClick={setRam(1024)}>1 TB</Button>
        <Button onClick={setRam(1048576)}>1.05 PB</Button>
        <Tooltip placement="top" title="Max RAM sold by Alpha Ent.">
          <Button onClick={setRam(1073741824)}>1.07 EB</Button>
        </Tooltip>
        <Tooltip placement="top" title="Double Home server's current RAM">
          <Button onClick={doubleRam}>RAM *= 2</Button>
        </Tooltip>
        <br />
        <Typography>Corporation:</Typography>
        {Player.corporation ? (
          <Button style={smallButtonStyle} onClick={destroyCorporation}>
            Destroy Corporation
          </Button>
        ) : (
          <>
            <TextField
              placeholder="Enter Corp Name"
              value={corporationName}
              onChange={(x) => setCorporationName(x.target.value)}
            />
            <br />
            <Button style={smallButtonStyle} onClick={createCorporation}>
              Create Corporation
            </Button>
          </>
        )}
        <br />
        <Typography>Gang Faction:</Typography>
        {Player.gang ? (
          <Button style={smallButtonStyle} onClick={stopGang}>
            Leave Gang
          </Button>
        ) : (
          <>
            <Select value={gangFaction} onChange={setGangFactionDropdown}>
              {GangConstants.Names.map((factionName) => (
                <MenuItem key={factionName} value={factionName}>
                  {factionName}
                </MenuItem>
              ))}
            </Select>
            <br />
            <Button style={smallButtonStyle} onClick={startGang}>
              Create Gang
            </Button>
          </>
        )}
        <br />
        <Typography>Bladeburner:</Typography>
        {Player.bladeburner ? (
          <Button style={smallButtonStyle} onClick={leaveBladeburner}>
            Leave BladeBurner
          </Button>
        ) : (
          <Button style={smallButtonStyle} onClick={joinBladeburner}>
            Join BladeBurner
          </Button>
        )}
        <br />
        <Typography>General:</Typography>
        <Button style={largeButtonStyle} onClick={quickB1tFlum3}>
          Quick b1t_flum3.exe
        </Button>
        <Button style={largeButtonStyle} onClick={b1tflum3}>
          Run b1t_flum3.exe
        </Button>
        <br />
        <Button style={largeButtonStyle} onClick={quickHackW0r1dD43m0n}>
          Quick w0rld_d34m0n
        </Button>
        <Button style={largeButtonStyle} onClick={hackW0r1dD43m0n}>
          Hack w0rld_d34m0n
        </Button>
        <br />
        <Button style={largeButtonStyle} onClick={() => setError(true)}>
          Throw Error
        </Button>
        <Button style={largeButtonStyle} onClick={checkMessages}>
          Check Messages
        </Button>
      </AccordionDetails>
    </Accordion>
  );
}
