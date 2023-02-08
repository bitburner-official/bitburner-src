import React from "react";
import { formatNumberNoSuffix } from "../../ui/formatNumber";
import { StealthIcon } from "./StealthIcon";
import { KillIcon } from "./KillIcon";
import { Action } from "../Action";
import { Bladeburner } from "../Bladeburner";
import { Player } from "@player";

interface IProps {
  bladeburner: Bladeburner;
  action: Action;
}

export function SuccessChance(props: IProps): React.ReactElement {
  const estimatedSuccessChance = props.action.getEstSuccessChance(props.bladeburner, Player);

  let chance = <></>;
  if (estimatedSuccessChance[0] === estimatedSuccessChance[1]) {
    chance = <>{formatNumberNoSuffix(estimatedSuccessChance[0] * 100, 1)}%</>;
  } else {
    chance = (
      <>
        {formatNumberNoSuffix(estimatedSuccessChance[0] * 100, 1)}% ~{" "}
        {formatNumberNoSuffix(estimatedSuccessChance[1] * 100, 1)}%
      </>
    );
  }

  return (
    <>
      Estimated success chance: {chance} {props.action.isStealth ? <StealthIcon /> : <></>}
      {props.action.isKill ? <KillIcon /> : <></>}
    </>
  );
}
