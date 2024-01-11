import React from "react";
import { Context } from "./Context";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Player } from "@player";
import { useRerender } from "../../ui/React/hooks";
import { AddToAllServers } from "../../Server/AllServers";
import { safelyCreateUniqueServer } from "../../Server/ServerHelpers";
import Box from "@mui/material/Box";
import { formatRam, formatNumber } from "../../ui/formatNumber";
import { CharityORGConstants } from "../../CharityORG/data/Constants";
/** React Component for the popup that manages Karma spending */
export function KarmaSpecialBuySubpage(): React.ReactElement {
  const charityORG = (function () {
    if (Player.charityORG === null) throw new Error("Charity should not be null");
    return Player.charityORG;
  })();
  const rerender = useRerender();
  const costForUpgrade =
    Player.charityNodes.length >= CharityORGConstants.CharityNodeNumberMax
      ? Number.POSITIVE_INFINITY
      : Math.pow(CharityORGConstants.CharityNodeRamUpgradePower, CharityORGConstants.CharityNodeRamUpgradePower) *
        (Player.charityNodes?.length + 1);
  function purchaseCharityServer(): void {
    if (Player.karma < 0) return;

    const cServer = safelyCreateUniqueServer({
      //ip: createUniqueRandomIp(),
      hostname: "",
      organizationName: "",
      isConnectedTo: false,
      adminRights: true,
      purchasedByPlayer: true,
      maxRam: 4,
    });
    cServer.hostname = "charity-" + Player.charityNodes.length;

    AddToAllServers(cServer);
    Player.charityNodes.push(cServer);
    const homeComputer = Player.getHomeComputer();
    homeComputer.serversOnNetwork.push(cServer.hostname);
    cServer.serversOnNetwork.push(homeComputer.hostname);
    /*
    import { DeleteServer } from "../../Server/AllServers";
      while (Player.charityNodes.length > 0) {
      const node = Player.charityNodes.pop();
      if (node !== null && node !== undefined) DeleteServer(node.hostname);
    }*/
    //Player.karma -= costForUpgrade;
    rerender();
  }

  return (
    <Context.CharityORG.Provider value={charityORG}>
      <span>
        <Typography>Existing Charity Servers:</Typography>
        <Box display="grid" width="50%" sx={{ gridTemplateColumns: "1fr 1fr" }}>
          {Player.charityNodes.length === 0 && <Typography> None </Typography>}
          {Player.charityNodes.map((k, i) => (
            <Typography key={i}>
              {" "}
              {k.hostname}: RAM: {formatRam(k.maxRam)} Cores: {k.cpuCores}{" "}
            </Typography>
          ))}
        </Box>
      </span>

      <Button onClick={() => purchaseCharityServer()}>Purchase Charity Server ({formatNumber(costForUpgrade)})</Button>
    </Context.CharityORG.Provider>
  );
}
