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
      return "无效的数值。";
    } else if (corp.funds < money) {
      return "你的企业资金不足。";
    } else {
      return `这笔贿赂将使你在 ${selectedFaction} 的声望提升 ${formatReputation(
        money / bribeAmountPerReputation,
      )}。`;
    }
  }

  function bribe(money: number): void {
    if (!selectedFaction || disabled) {
      return;
    }
    const faction = Factions[selectedFaction];
    const result = actions.bribe(corp, money, faction.name);
    if (result.success) {
      dialogBoxCreate(
        `你通过贿赂 ${faction.name}，获得了 ${formatReputation(result.reputationGain)} 声望。`,
      );
    }
    props.onClose();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        你可以使用企业资金贿赂派系领袖，以换取派系声望。
      </Typography>
      <Box display="flex" alignItems="center">
        <Typography style={{ whiteSpace: "pre" }}>派系： </Typography>
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
        placeholder="企业资金"
        defaultValue={!disabled ? money.toExponential() : ""}
      />
      <Button disabled={disabled} sx={{ mx: 1 }} onClick={() => bribe(money ? money : 0)}>
        贿赂
      </Button>
    </Modal>
  );
}
