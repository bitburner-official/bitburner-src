import React from "react";
import { formatReputation } from "../nFormat";
import { Reputation } from "./Reputation";

export function ReputationRate({ reputation }: { reputation: number }): React.ReactElement {
  return <Reputation reputation={`${formatReputation(reputation)} / sec`} />;
}
