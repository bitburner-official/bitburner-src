import React, { useEffect, useState } from "react";
import {
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
import { resetGangs } from "../../Gang/AllGangs";
import { finishBitNode } from "../../BitNode/BitNodeUtils";
import { AutoExpandAccordion } from "../../ui/AutoExpand/AutoExpandAccordion";

export function GeneralDev({ parentRerender }: { parentRerender: () => void }): React.ReactElement {
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
  const quickHackW0r1dD43m0n = () => {
    finishBitNode();
    Router.toPage(Page.BitVerse, { flume: false, quick: true });
  };
  const hackW0r1dD43m0n = () => {
    finishBitNode();
    Router.toPage(Page.BitVerse, { flume: false, quick: false });
  };

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
    const isHacking = gangFaction === FactionName.NiteSec || gangFaction === FactionName.TheBlackHand;
    Player.startGang(gangFaction, isHacking);
    parentRerender();
  };
  const stopGang = () => {
    Player.gang = null;
    resetGangs();
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
    <AutoExpandAccordion cacheKey="DEVMENU_GeneralDev" unmountOnExit={true}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>常规</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography>
          资金（当前：<Money money={Player.money} />）
        </Typography>
        {moneyValues.map((value) => (
          <Button key={`add money ${value}`} onClick={addMoney(value)}>
            +&nbsp;
            <Money money={value} />
          </Button>
        ))}
        <br />
        <NumberInput placeholder={"$$$"} onChange={setDevMoney} />
        <Button onClick={addCustomMoney}>给予资金</Button>
        <Button onClick={setMoney(0)}>清空资金</Button>
        {Player.hashManager.capacity > 0 && (
          <>
            <br />
            <br />
            <Typography>
              哈希（当前：<Hashes hashes={Player.hashManager.hashes} /> /&nbsp;
              <Hashes hashes={Player.hashManager.capacity} />）
            </Typography>
            <NumberInput disabled={!Player.hashManager} placeholder={"哈希"} onChange={setHash} />
            <Button disabled={!Player.hashManager} onClick={addHashes}>
              给予哈希
            </Button>
            <Button disabled={!Player.hashManager} onClick={() => (Player.hashManager.hashes = 0)}>
              清空哈希
            </Button>
          </>
        )}
        <br />
        <br />
        <Typography>家用电脑最大 RAM（当前：{formatRam(homeComputer.maxRam)}）</Typography>
        {ramValues.map((gb) => (
          <Button key={gb} onClick={ramSetter(gb)}>
            {formatRam(gb)}
          </Button>
        ))}
        <Button onClick={doubleRam}>RAM *= 2</Button>
        <br />
        <br />
        <Typography>企业：</Typography>
        {Player.corporation ? (
          <Button onClick={destroyCorporation}>摧毁企业</Button>
        ) : (
          <>
            <TextField
              placeholder="输入企业名称"
              value={corporationName}
              onChange={(x) => setCorporationName(x.target.value)}
            />
            <Button onClick={createCorporation}>创建企业</Button>
          </>
        )}
        <br />
        <br />
        <Typography>帮派：</Typography>
        {Player.gang ? (
          <Button onClick={stopGang}>离开帮派</Button>
        ) : (
          <>
            <Select value={gangFaction} onChange={setGangFactionDropdown}>
              {GangConstants.Names.map((factionName) => (
                <MenuItem key={factionName} value={factionName}>
                  {factionName}
                </MenuItem>
              ))}
            </Select>
            <Button onClick={startGang}>创建帮派</Button>
          </>
        )}
        <br />
        <br />
        <Typography>Bladeburner：</Typography>
        {Player.bladeburner ? (
          <Button onClick={leaveBladeburner}>离开 Bladeburner</Button>
        ) : (
          <Button onClick={joinBladeburner}>加入 Bladeburner</Button>
        )}
        <br />
        <br />
        <Typography>杂项：</Typography>
        <Button onClick={quickB1tFlum3}>快速 b1t_flum3.exe</Button>
        <Button onClick={b1tflum3}>运行 b1t_flum3.exe</Button>
        <br />
        <Button onClick={quickHackW0r1dD43m0n}>快速入侵 w0r1d_d43m0n</Button>
        <Button onClick={hackW0r1dD43m0n}>入侵 w0r1d_d43m0n</Button>
        <br />
        <Button onClick={() => setError(true)}>抛出错误</Button>
        <Button onClick={checkMessages}>检查消息</Button>
      </AccordionDetails>
    </AutoExpandAccordion>
  );
}
