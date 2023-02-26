import React, { useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Money } from "../../ui/React/Money";
import { Player } from "@player";
import { Router } from "../../ui/GameRoot";
import { MenuItem, SelectChangeEvent, TextField, Select } from "@mui/material";
import { Bladeburner } from "../../Bladeburner/Bladeburner";
import { GangConstants } from "../../Gang/data/Constants";
import { FactionNames } from "../../Faction/data/FactionNames";
import { checkForMessagesToSend } from "../../Message/MessageHelpers";
import { ThemeEvents } from "../../Themes/ui/Theme";

export function General(): React.ReactElement {
  const [error, setError] = useState(false);
  const [corporationName, setCorporationName] = useState("");
  const [gangFaction, setGangFaction] = useState("Slum Snakes");
  const [devMoney, setDevMoney] = useState(0);

  // Money functions
  const addCustomMoney = () => !Number.isNaN(devMoney) && Player.gainMoney(devMoney, "other");
  const addMoney = (n: number) => () => Player.gainMoney(n, "other");
  const setMoney = (n: number) => () => (Player.money = Number(n));

  // Ram functions
  const upgradeRam = () => (Player.getHomeComputer().maxRam *= 2);

  // Node-clearing functions
  const quickB1tFlum3 = () => Router.toBitVerse(true, true);
  const b1tflum3 = () => Router.toBitVerse(true, false);
  const quickHackW0r1dD43m0n = () => Router.toBitVerse(false, true);
  const hackW0r1dD43m0n = () => Router.toBitVerse(false, false);

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
    const isHacking = gangFaction === FactionNames.NiteSec || gangFaction === FactionNames.TheBlackHand;
    Player.startGang(gangFaction, isHacking);
    // Rerender so the gang menu option will show up immediately on the devmenu page selection
    ThemeEvents.emit();
  };
  const stopGang = () => {
    Player.gang = null;
    // Rerender so the gang menu option will be removed immediately on the devmenu page selection
    ThemeEvents.emit();
  };
  const setGangFactionDropdown = (event: SelectChangeEvent<string>) => setGangFaction(event.target.value);

  // Misc functions
  const checkMessages = () => checkForMessagesToSend();
  useEffect(() => {
    if (error) throw new ReferenceError("Manually thrown error");
  }, [error]);

  return (
    <Accordion TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>General</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Button
          onClick={setMoney(0)}
          title="This sets your money to $0, this means the money you had will just vanish without being accounted for where it went and may offset some metrics."
        >
          <pre>
            = <Money money={0} />
          </pre>
        </Button>
        <Button onClick={addMoney(1e6)}>
          <pre>
            + <Money money={1e6} />
          </pre>
        </Button>
        <Button onClick={addMoney(1e9)}>
          <pre>
            + <Money money={1e9} />
          </pre>
        </Button>
        <Button onClick={addMoney(1e12)}>
          <pre>
            + <Money money={1e12} />
          </pre>
        </Button>
        <Button onClick={addMoney(1e15)}>
          <pre>
            + <Money money={1000e12} />
          </pre>
        </Button>
        <Button onClick={addMoney(Infinity)}>
          <pre>
            + <Money money={Infinity} />
          </pre>
        </Button>
        <Button onClick={upgradeRam}>+ RAM</Button>
        <br />
        <Typography>Add Custom Money</Typography>
        <TextField onChange={(x) => setDevMoney(parseFloat(x.target.value))} />
        <Button onClick={addCustomMoney}>Give Money</Button>
        <br />
        {Player.corporation ? (
          <Button onClick={destroyCorporation}>Destroy Corporation</Button>
        ) : (
          <>
            <Typography>Corporation Name:</Typography>
            <TextField value={corporationName} onChange={(x) => setCorporationName(x.target.value)} />
            <Button onClick={createCorporation}>Create Corporation</Button>
          </>
        )}
        <br />
        {Player.gang ? (
          <Button onClick={stopGang}>Stop Gang</Button>
        ) : (
          <>
            <Typography>Gang Faction:</Typography>
            <Select value={gangFaction} onChange={setGangFactionDropdown}>
              {GangConstants.Names.map((factionName) => (
                <MenuItem key={factionName} value={factionName}>
                  {factionName}
                </MenuItem>
              ))}
            </Select>
            <Button onClick={startGang}>Start Gang</Button>
          </>
        )}
        <br />
        {Player.bladeburner ? (
          <Button onClick={leaveBladeburner}>Leave BladeBurner</Button>
        ) : (
          <Button onClick={joinBladeburner}>Join BladeBurner</Button>
        )}
        <br />
        <Button onClick={quickB1tFlum3}>Quick b1t_flum3.exe</Button>
        <Button onClick={b1tflum3}>Run b1t_flum3.exe</Button>
        <Button onClick={quickHackW0r1dD43m0n}>Quick w0rld_d34m0n</Button>
        <Button onClick={hackW0r1dD43m0n}>Hack w0rld_d34m0n</Button>
        <Button onClick={() => setError(true)}>Throw Error</Button>
        <Button onClick={checkMessages}>Check Messages</Button>
      </AccordionDetails>
    </Accordion>
  );
}
