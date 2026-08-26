/**
 * React Subcomponent for displaying a location's UI, when that location is a university
 *
 * This subcomponent renders all of the buttons for studying/taking courses
 */
import * as React from "react";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";

import { Location } from "../Location";

import { Money } from "../../ui/React/Money";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { Player } from "@player";
import { Box } from "@mui/material";

import { ClassWork, Classes } from "../../Work/ClassWork";
import { calculateCost } from "../../Work/Formulas";
import { UniversityClassType } from "@enums";

interface IProps {
  loc: Location;
}

export function UniversityLocation(props: IProps): React.ReactElement {
  function take(classType: UniversityClassType): void {
    Player.startWork(
      new ClassWork({
        classType: classType,
        location: props.loc.name,
        singularity: false,
      }),
    );
    Player.startFocusing();
    Router.toPage(Page.Work);
  }

  const dataStructuresCost = calculateCost(Classes[UniversityClassType.dataStructures], props.loc);
  const networksCost = calculateCost(Classes[UniversityClassType.networks], props.loc);
  const algorithmsCost = calculateCost(Classes[UniversityClassType.algorithms], props.loc);
  const managementCost = calculateCost(Classes[UniversityClassType.management], props.loc);
  const leadershipCost = calculateCost(Classes[UniversityClassType.leadership], props.loc);

  const earnHackingExpTooltip = `获得黑客经验！`;
  const earnCharismaExpTooltip = `获得魅力经验！`;

  return (
    <Box sx={{ display: "grid", width: "fit-content" }}>
      <Tooltip title={earnHackingExpTooltip}>
        <Button onClick={() => take(UniversityClassType.computerScience)}>学习计算机科学（免费）</Button>
      </Tooltip>
      <Tooltip title={earnHackingExpTooltip}>
        <Button onClick={() => take(UniversityClassType.dataStructures)}>
          上数据结构课程（
          <Money money={dataStructuresCost} forPurchase={true} /> / 秒）
        </Button>
      </Tooltip>
      <Tooltip title={earnHackingExpTooltip}>
        <Button onClick={() => take(UniversityClassType.networks)}>
          上网络课程（
          <Money money={networksCost} forPurchase={true} /> / 秒）
        </Button>
      </Tooltip>
      <Tooltip title={earnHackingExpTooltip}>
        <Button onClick={() => take(UniversityClassType.algorithms)}>
          上算法课程（
          <Money money={algorithmsCost} forPurchase={true} /> / 秒）
        </Button>
      </Tooltip>
      <Tooltip title={earnCharismaExpTooltip}>
        <Button onClick={() => take(UniversityClassType.management)}>
          上管理课程（
          <Money money={managementCost} forPurchase={true} /> / 秒）
        </Button>
      </Tooltip>
      <Tooltip title={earnCharismaExpTooltip}>
        <Button onClick={() => take(UniversityClassType.leadership)}>
          上领导力课程（
          <Money money={leadershipCost} forPurchase={true} /> / 秒）
        </Button>
      </Tooltip>
    </Box>
  );
}
