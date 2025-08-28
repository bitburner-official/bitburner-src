import React from "react";

import { PlayerObject } from "../../../PersonObjects/Player/PlayerObject";
import { Money } from "../../../ui/React/Money";
import { usePlayerSelector } from "../../../utils/PlayerExternalStore";

const selectHacknetExpenses = (p: PlayerObject) => -p.moneySourceA.hacknet_expenses || 0;

export function HacknetExpenses(): React.ReactElement {
  const spent = usePlayerSelector(selectHacknetExpenses);
  return <Money key="money" money={spent} />;
}
