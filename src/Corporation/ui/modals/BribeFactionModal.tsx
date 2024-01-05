import type { FactionName } from "@enums";

import React, { useState } from "react";
import { Box, Button, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";

import { Player } from "@player";
import { Factions } from "../../../Faction/Factions";
import * as corpConstants from "../../data/Constants";
import { formatReputation } from "../../../ui/formatNumber";
import { dialogBoxCreate } from "../../../ui/React/DialogBox";
import { Modal } from "../../../ui/React/Modal";
import { useCorporation } from "../Context";
import { NumberInput } from "../../../ui/React/NumberInput";
import { getEnumHelper } from "../../../utils/EnumHelper";

interface IProps {
  open: boolean;
  onClose: () => void;
}

export function BribeFactionModal(props: IProps): React.ReactElement {
  const factions = Player.factions.filter((name) => {
    const info = Factions[name].getInfo();
    if (!info.offersWork()) return false;
    if (Player.hasGangWith(name)) return false;
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

  function repGain(money: number): number {
    return money / corpConstants.bribeAmountPerReputation;
  }

  function getRepText(money: number): string {
    if (money === 0) return "";
    if (isNaN(money) || money < 0) {
      return "ERROR: Invalid value(s) entered";
    } else if (corp.funds < money) {
      return "ERROR: You do not have this much money to bribe with";
    } else {
      return (
        "You will gain " + formatReputation(repGain(money)) + " reputation with " + selectedFaction + " with this bribe"
      );
    }
  }

  function bribe(money: number): void {
    if (!selectedFaction) return;
    const fac = Factions[selectedFaction];
    if (disabled) return;
    const rep = repGain(money);
    dialogBoxCreate(`You gained ${formatReputation(rep)} reputation with ${fac.name} by bribing them.`);
    fac.playerReputation += rep;
    corp.loseFunds(money, "bribery");
    props.onClose();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>
        You can use Corporation funds or stock shares to bribe Faction Leaders in exchange for faction reputation.
      </Typography>
      <Box display="flex" alignItems="center">
        <Typography>Faction:</Typography>
        <Select value={selectedFaction} onChange={changeFaction}>
          {factions.map((name) => {
            const info = Factions[name].getInfo();
            if (!info.offersWork()) return;
            if (Player.hasGangWith(name)) return;
            return (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            );
          })}
        </Select>
      </Box>
      <Typography>{getRepText(money ? money : 0)}</Typography>
      <NumberInput onChange={setMoney} placeholder="Corporation funds" />
      <Button disabled={disabled} sx={{ mx: 1 }} onClick={() => bribe(money ? money : 0)}>
        Bribe
      </Button>
    </Modal>
  );
}
