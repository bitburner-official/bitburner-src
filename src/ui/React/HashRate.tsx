import React from "react";
import { formatHashes } from "../formatNumber";
import { Hashes } from "./Hashes";

export function HashRate({ hashes }: { hashes: number }): React.ReactElement {
  return <Hashes hashes={`${formatHashes(hashes)} h / s`} />;
}
