import React from "react";
import { useCallback } from "react";
import { PlayerObject } from "../../../PersonObjects/Player/PlayerObject";
import { usePlayerSelector } from "../../../utils/PlayerExternalStore";
import { safeGetHacknetServer } from "../utils";

interface IProps {
  index: number;
}

export function HacknetServerLevel({ index }: IProps): React.ReactElement {
  const level = usePlayerSelector(
    useCallback((p: PlayerObject) => safeGetHacknetServer(p, index)?.level ?? "???", [index]),
  );
  return <>{level}</>;
}
