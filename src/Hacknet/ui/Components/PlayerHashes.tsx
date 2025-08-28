import React from "react";
import { PlayerObject } from "../../../PersonObjects/Player/PlayerObject";
import { Hashes } from "../../../ui/React/Hashes";
import { usePlayerSelector } from "../../../utils/PlayerExternalStore";

const selectHashes = (p: PlayerObject) => p.hashManager.hashes;

export function PlayerHashes(): React.ReactElement {
  const hashes = usePlayerSelector(selectHashes);
  return <Hashes hashes={hashes} />;
}
