import React from "react";
import { PlayerObject } from "../../../PersonObjects/Player/PlayerObject";
import { Hashes } from "../../../ui/React/Hashes";
import { usePlayerSelector } from "../../../utils/PlayerExternalStore";

const selectHashCapacity = (p: PlayerObject) => p.hashManager.capacity;

export function PlayerHashCapacity(): React.ReactElement {
  const capacity = usePlayerSelector(selectHashCapacity);
  return <Hashes hashes={capacity} />;
}
