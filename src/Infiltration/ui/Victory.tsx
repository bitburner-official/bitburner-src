import React, { useState } from "react";
import { Box, Button, MenuItem, Paper, Select, SelectChangeEvent, Typography } from "@mui/material";

import { Player } from "@player";
import { FactionName } from "@enums";

import { inviteToFaction } from "../../Faction/FactionHelpers";
import { Factions } from "../../Faction/Factions";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
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

interface IProps {
  StartingDifficulty: number;
  Difficulty: number;
  Reward: number;
  MaxLevel: number;
}

// Use a module-scope variable to save the faction choice.
let defaultFactionChoice: FactionName | "none" = "none";

export function Victory(props: IProps): React.ReactElement {
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
    Router.toPage(Page.City);
  }

  const soa = Factions[FactionName.ShadowsOfAnarchy];
  const repGain = calculateTradeInformationRepReward(props.Reward, props.MaxLevel, props.StartingDifficulty);
  const moneyGain = calculateSellInformationCashReward(props.Reward, props.MaxLevel, props.StartingDifficulty);
  const infiltrationRepGain = calculateInfiltratorsRepReward(soa, props.StartingDifficulty);

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
      <Typography variant="h4">Infiltration successful!</Typography>
      <Typography variant="h5" color="primary" width="75%">
        You{" "}
        {isMemberOfInfiltrators ? (
          <>
            have gained {formatNumberNoSuffix(infiltrationRepGain, 2)} rep for {FactionName.ShadowsOfAnarchy} and{" "}
          </>
        ) : (
          <></>
        )}
        can trade the confidential information you found for money or reputation.
      </Typography>
      <Box sx={{ width: "fit-content" }}>
        <Box sx={{ width: "100%" }}>
          <Select value={factionName} onChange={changeDropdown} sx={{ mr: 1 }}>
            {defaultFactionChoice === "none" && (
              <MenuItem key={"none"} value={"none"}>
                {"none"}
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
            Trade for&nbsp;
            <Reputation reputation={repGain} />
            &nbsp;reputation
          </Button>
        </Box>
        <Button onClick={sell} sx={{ width: "100%" }}>
          Sell for&nbsp;
          <Money money={moneyGain} />
        </Button>
      </Box>
      <Button onClick={quitInfiltration} sx={{ width: "100%", mt: 1 }}>
        Quit
      </Button>
    </Paper>
  );
}
