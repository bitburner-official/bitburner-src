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
import { UniversityClassType, UniversityClassTypes } from "../../Enums";

type IProps = {
  loc: Location;
};

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

  const dataStructuresCost = calculateCost(Classes[UniversityClassTypes.dataStructures], props.loc);
  const networksCost = calculateCost(Classes[UniversityClassTypes.networks], props.loc);
  const algorithmsCost = calculateCost(Classes[UniversityClassTypes.algorithms], props.loc);
  const managementCost = calculateCost(Classes[UniversityClassTypes.management], props.loc);
  const leadershipCost = calculateCost(Classes[UniversityClassTypes.leadership], props.loc);

  const earnHackingExpTooltip = `Gain hacking experience!`;
  const earnCharismaExpTooltip = `Gain charisma experience!`;

  return (
    <Box sx={{ display: "grid", width: "fit-content" }}>
      <Tooltip title={earnHackingExpTooltip}>
        <Button onClick={() => take(UniversityClassTypes.computerScience)}>Study Computer Science (free)</Button>
      </Tooltip>
      <Tooltip title={earnHackingExpTooltip}>
        <Button onClick={() => take(UniversityClassTypes.dataStructures)}>
          Take Data Structures course (
          <Money money={dataStructuresCost} forPurchase={true} /> / sec)
        </Button>
      </Tooltip>
      <Tooltip title={earnHackingExpTooltip}>
        <Button onClick={() => take(UniversityClassTypes.networks)}>
          Take Networks course (
          <Money money={networksCost} forPurchase={true} /> / sec)
        </Button>
      </Tooltip>
      <Tooltip title={earnHackingExpTooltip}>
        <Button onClick={() => take(UniversityClassTypes.algorithms)}>
          Take Algorithms course (
          <Money money={algorithmsCost} forPurchase={true} /> / sec)
        </Button>
      </Tooltip>
      <Tooltip title={earnCharismaExpTooltip}>
        <Button onClick={() => take(UniversityClassTypes.management)}>
          Take Management course (
          <Money money={managementCost} forPurchase={true} /> / sec)
        </Button>
      </Tooltip>
      <Tooltip title={earnCharismaExpTooltip}>
        <Button onClick={() => take(UniversityClassTypes.leadership)}>
          Take Leadership course (
          <Money money={leadershipCost} forPurchase={true} /> / sec)
        </Button>
      </Tooltip>
    </Box>
  );
}
