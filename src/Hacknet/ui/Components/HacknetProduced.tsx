import React from "react";
import { PlayerObject } from "../../../PersonObjects/Player/PlayerObject";
import { Money } from "../../../ui/React/Money";
import { usePlayerSelector } from "../../../utils/PlayerExternalStore";

const selectHacknetMoney = (p: PlayerObject) => p.moneySourceA.hacknet;

export function HacknetProduced(): React.ReactElement {
  const produced = usePlayerSelector(selectHacknetMoney);
  return <Money key="money" money={produced} />;
}
