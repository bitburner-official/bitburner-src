import React, { useState } from "react";
import { Box, Button, MenuItem, Paper, Select, SelectChangeEvent, Typography } from "@mui/material";

import { Player } from "@player";
import { FactionName } from "@enums";

import type { Infiltration } from "../Infiltration";
import type { VictoryModel } from "../model/VictoryModel";
import { inviteToFaction } from "../../Faction/FactionHelpers";
import { Factions } from "../../Faction/Factions";
import { Money } from "../../ui/React/Money";
import { Reputation } from "../../ui/React/Reputation";
import { formatNumberNoSuffix } from "../../ui/formatNumber";
import {
  calculateInfiltratorsRepReward,
  calculateSellInformationCashReward,
  calculateTradeInformationRepReward,
} from "../formulas/victory";
import { getEnumHelper } from "../../utils/EnumHelper";
import { isFactionWork } from "../../Work/FactionWork";
import { calculateReward, decreaseMarketDemandMultiplier } from "../formulas/game";

interface IProps {
  state: Infiltration;
  stage: VictoryModel;
}

// Use a module-scope variable to save the faction choice.
let defaultFactionChoice: FactionName | "none" = "none";

export function Victory({ state }: IProps): React.ReactElement {
  /**
   * Use the working faction as the default choice in 2 cases:
   * - The player has not chosen a faction.
   * - The current default choice is not in the faction list. It may happen after the player "prestiges".
   */
  if (defaultFactionChoice === "none" || !Player.factions.includes(defaultFactionChoice)) {
    defaultFactionChoice = isFactionWork(Player.currentWork) ? Player.currentWork.factionName : "none";
  }
  const [factionName, setFactionName] = useState<string>(defaultFactionChoice);

  function quitInfiltration(): void {
    handleInfiltrators();
    decreaseMarketDemandMultiplier(state.gameStartTimestamp, state.maxLevel);
    state.cancel();
  }

  const soa = Factions[FactionName.ShadowsOfAnarchy];
  const reward = calculateReward(state.startingSecurityLevel);
  const repGain = calculateTradeInformationRepReward(
    reward,
    state.maxLevel,
    state.startingSecurityLevel,
    state.gameStartTimestamp,
  );
  const moneyGain = calculateSellInformationCashReward(
    reward,
    state.maxLevel,
    state.startingSecurityLevel,
    state.gameStartTimestamp,
  );
  const infiltrationRepGain = calculateInfiltratorsRepReward(
    soa,
    state.maxLevel,
    state.startingSecurityLevel,
    state.gameStartTimestamp,
  );

  const isMemberOfInfiltrators = Player.factions.includes(FactionName.ShadowsOfAnarchy);

  function sell(): void {
    Player.gainMoney(moneyGain, "infiltration");
    quitInfiltration();
  }

  function trade(): void {
    if (!getEnumHelper("FactionName").isMember(factionName)) {
      return;
    }
    Factions[factionName].playerReputation += repGain;
    defaultFactionChoice = factionName;
    quitInfiltration();
  }

  function changeDropdown(event: SelectChangeEvent): void {
    setFactionName(event.target.value);
  }

  function handleInfiltrators(): void {
    inviteToFaction(Factions[FactionName.ShadowsOfAnarchy]);
    if (isMemberOfInfiltrators) {
      soa.playerReputation += infiltrationRepGain;
    }
  }

  return (
    <Paper sx={{ p: 1, textAlign: "center", display: "flex", alignItems: "center", flexDirection: "column" }}>
      <Typography variant="h4">潜入成功！</Typography>
      <Typography variant="h5" color="primary" width="75%">
        你{" "}
        {isMemberOfInfiltrators ? (
          <>
            为 {FactionName.ShadowsOfAnarchy} 赢得了 {formatNumberNoSuffix(infiltrationRepGain, 2)} 声望，并且{" "}
          </>
        ) : (
          <></>
        )}
        可以用你找到的机密情报来换取资金或声望。
      </Typography>
      <Box sx={{ width: "fit-content" }}>
        <Box sx={{ width: "100%" }}>
          <Select value={factionName} onChange={changeDropdown} sx={{ mr: 1 }}>
            {defaultFactionChoice === "none" && (
              <MenuItem key={"none"} value={"none"}>
                无
              </MenuItem>
            )}
            {Player.factions
              .filter((f) => Factions[f].getInfo().offersWork())
              .map((f) => (
                <MenuItem key={f} value={f}>
                  {f}
                </MenuItem>
              ))}
          </Select>
          <Button disabled={factionName === "none"} onClick={trade}>
            兑换&nbsp;
            <Reputation reputation={repGain} />
            &nbsp;声望
          </Button>
        </Box>
        <Button onClick={sell} sx={{ width: "100%" }}>
          出售换得&nbsp;
          <Money money={moneyGain} />
        </Button>
      </Box>
      <Button onClick={quitInfiltration} sx={{ width: "100%", mt: 1 }}>
        退出
      </Button>
    </Paper>
  );
}
