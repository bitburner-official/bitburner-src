import type { FactionName } from "@enums";

import React, { useState } from "react";
import { Box, Button, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";

import { Player } from "@player";
import { Factions } from "../../../Faction/Factions";
import { formatReputation } from "../../../ui/formatNumber";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { useCorporation } from "../Context";
import { NumberInput } from "../../../ui/React/NumberInput";
import { getEnumHelper } from "../../../utils/EnumHelper";
import { bribeAmountPerReputation } from "../../data/Constants";
import * as actions from "../../Actions";
import { Settings } from "../../../Settings/Settings";

interface IProps {
  open: boolean;
  onClose: () => void;
}

export function BribeFactionModal(props: IProps): React.ReactElement {
  const factions = Player.factions.filter((name) => {
    if (!Factions[name].getInfo().offersWork()) {
      return false;
    }
    return true;
  });
  const corp = useCorporation();
  const [money, setMoney] = useState<number>(NaN);
  const [selectedFaction, setSelectedFaction] = useState<FactionName | "">(factions.length > 0 ? factions[0] : "");
  const disabled = money === 0 || isNaN(money) || money < 0 || corp.funds < money;

  function changeFaction(event: SelectChangeEvent): void {
    if (!getEnumHelper("FactionName").isMember(event.target.value)) return;
    setSelectedFaction(event.target.value);
  }

  function getRepText(money: number): string {
    if (money === 0) return "";
    if (isNaN(money) || money < 0) {
      return "Invalid value.";
    } else if (corp.funds < money) {
      return "Your corporation does not have enough funds.";
    } else {
      return `You will gain ${formatReputation(
        money / bribeAmountPerReputation,
      )} reputation with ${selectedFaction} with this bribe.`;
    }
  }

  function bribe(money: number): void {
    if (!selectedFaction || disabled) {
      return;
    }
    const faction = Factions[selectedFaction];
    const reputationGain = actions.bribe(corp, money, faction.name);
    if (reputationGain > 0) {
      dialogBoxCreate(
        `You gained ${formatReputation(reputationGain)} reputation with ${faction.name} by bribing them.`,
      );
    }
    props.onClose();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        You can use corporation funds to bribe faction leaders in exchange for faction reputation.
      </Typography>
      <Box display="flex" alignItems="center">
        <Typography style={{ whiteSpace: "pre" }}>Faction: </Typography>
        <Select value={selectedFaction} onChange={changeFaction}>
          {factions.map((name) => {
            if (!Factions[name].getInfo().offersWork()) {
              return;
            }
            return (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            );
          })}
        </Select>
      </Box>
      <Typography color={!disabled ? Settings.theme.primary : Settings.theme.error}>
        {getRepText(money ? money : 0)}
      </Typography>
      <NumberInput
        onChange={setMoney}
        placeholder="Corporation funds"
        defaultValue={!disabled ? money.toExponential() : ""}
      />
      <Button disabled={disabled} sx={{ mx: 1 }} onClick={() => bribe(money ? money : 0)}>
        Bribe
      </Button>
    </Modal>
  );
}
