import React, { useState } from "react";
import { Context } from "./Context";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Player } from "@player";
import { MenuItem } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useRerender } from "../../ui/React/hooks";
import { formatNumber, formatRam } from "../../ui/formatNumber";
import { forEach } from "lodash";
import { CharityORGConstants } from "../../CharityORG/data/Constants";
import { DeleteServer } from "../../Server/AllServers";

/** React Component for the popup that manages Karma spending */
export function KarmaSpecialManageSubpage(): React.ReactElement {
  const charityORG = (function () {
    if (Player.charityORG === null) throw new Error("Charity should not be null");
    return Player.charityORG;
  })();
  const rerender = useRerender();
  const [currentServer, setCurrentServer] = useState("");
  const [currentType, setCurrentType] = useState("");
  const onChangeServer = (event: SelectChangeEvent): void => {
    setCurrentServer(event.target.value);
    rerender();
  };
  const onChangeType = (event: SelectChangeEvent): void => {
    setCurrentType(event.target.value);
    rerender();
  };
  let workingIndex = -1;
  for (let node = 0; node < Player.charityNodes.length; node++) {
    if (Player.charityNodes[node].hostname === currentServer) {
      workingIndex = node;
      break;
    }
  }
  const workingServer = Player.charityNodes[workingIndex];
  const upgradeCostRam =
    workingServer?.maxRam * 2 > CharityORGConstants.CharityNodeRamMax
      ? Number.POSITIVE_INFINITY
      : Math.pow(CharityORGConstants.CharityNodeRamUpgradePower, CharityORGConstants.CharityNodeRamUpgradePower) *
        (1 * (workingIndex + 1) * Math.sqrt(workingServer?.maxRam)); //Number to raise up based on cost
  const upgradeCostCore =
    workingServer?.cpuCores + 1 > CharityORGConstants.CharityNodeCoresMax
      ? Number.POSITIVE_INFINITY
      : Math.pow(CharityORGConstants.CharityNodeCoreUpgradePower, CharityORGConstants.CharityNodeCoreUpgradePower) *
        (1 * (workingIndex + 1) * workingServer?.cpuCores); //Number to raise up based on cost

  const upgradeCost =
    currentServer.includes("charity") && currentType.includes("Ram")
      ? upgradeCostRam
      : currentServer.includes("charity") && currentType.includes("Cores")
      ? upgradeCostCore
      : 0;
  function purchaseUpgrade(): void {
    //if (upgradeCost === 0 || upgradeCost > Player.karma) return;

    /* charityServer delete code
    import { DeleteServer } from "../../Server/AllServers";
    while (Player.charityNodes.length > 0) {
      const node = Player.charityNodes.pop();
      if (node !== null && node !== undefined) DeleteServer(node.hostname);
    }
    return;
    */
    switch (currentType) {
      case "Ram":
        if (Player.charityNodes[workingIndex].maxRam * 2 > CharityORGConstants.CharityNodeRamMax) return;
        else Player.charityNodes[workingIndex].setMaxRam(Player.charityNodes[workingIndex].maxRam * 2);
        return;
      case "Cores":
        if (Player.charityNodes[workingIndex].cpuCores + 1 > CharityORGConstants.CharityNodeCoresMax) return;
        else Player.charityNodes[workingIndex].cpuCores += 1;
        return;
      default:
        return;
    }
  }
  function deleteNodes(): void {
    while (Player.charityNodes.length > 0) {
      const node = Player.charityNodes.pop();
      if (node !== null && node !== undefined) DeleteServer(node.hostname);
    }
    return;
  }

  return (
    <Context.CharityORG.Provider value={charityORG}>
      <Box display="grid" sx={{ gridTemplateColumns: "1fr 2fr" }}>
        <span>
          <Typography>
            <br></br>Choose your Server:
          </Typography>

          <span>
            <Select onChange={onChangeServer} value={currentServer} sx={{ width: "30%", mb: 1 }}>
              {forEach(Player.charityNodes).map((k, i) => (
                <MenuItem key={i + 1} value={k.hostname}>
                  <Typography variant="h6">{k.hostname}</Typography>
                </MenuItem>
              ))}
            </Select>
          </span>
          <span>
            <Select onChange={onChangeType} value={currentType} sx={{ width: "20%", mb: 1 }}>
              {forEach(["Ram", "Cores"]).map((k, i) => (
                <MenuItem key={i + 1} value={k}>
                  <Typography variant="h6">{k}</Typography>
                </MenuItem>
              ))}
            </Select>
          </span>
          <br></br>
          <Button onClick={() => purchaseUpgrade()}>{formatNumber(upgradeCost)}</Button>
          <Button onClick={() => deleteNodes()}>{"Delete all Nodes"}</Button>
          <Typography>Amount of Karma it will take to upgrade your selection.</Typography>
        </span>
        <span>
          {forEach(Player.charityNodes).map((n, i) => (
            <Typography key={i} variant="h6">
              {n.hostname} Ram:{formatRam(n.maxRam)} Cores:{n.cpuCores}
            </Typography>
          ))}
        </span>
      </Box>
    </Context.CharityORG.Provider>
  );

  //<>
  //  <Box display="flex">
  //    <Typography>Charties have the ability to spend their Karma on various things.  This is your entry point into that realm.  Purchases are not cheap, but they can be powerful.<br></br>
  //    Select what you would like to spend your Karma on:</Typography>
  // </Box>
  // {value === 0 && <ManagementSubpage />}
  // {value === 1 && <EquipmentsSubpage />}
  // {value === 2 && <KarmaSubpage />}
  //</>
  //);
}
