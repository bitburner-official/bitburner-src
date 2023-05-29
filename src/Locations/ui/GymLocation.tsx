/**
 * React Subcomponent for displaying a location's UI, when that location is a gym
 *
 * This subcomponent renders all of the buttons for training at the gym
 */
import * as React from "react";

import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import { Player } from "@player";

import { GymType } from "../../Enums";
import { ClassWork, Classes } from "../../Work/ClassWork";
import { calculateCost } from "../../Work/Formulas";
import { Router } from "../../ui/GameRoot";
import { Money } from "../../ui/React/Money";
import { Page } from "../../ui/Router";
import { Location } from "../Location";

interface IProps {
  loc: Location;
}

export function GymLocation(props: IProps): React.ReactElement {
  function train(stat: GymType): void {
    Player.startWork(
      new ClassWork({
        classType: stat,
        location: props.loc.name,
        singularity: false,
      }),
    );
    Player.startFocusing();
    Router.toPage(Page.Work);
  }

  const cost = calculateCost(Classes[GymType.strength], props.loc);

  return (
    <Box sx={{ display: "grid", width: "fit-content" }}>
      <Button onClick={() => train(GymType.strength)}>
        Train Strength (<Money money={cost} forPurchase={true} /> / sec)
      </Button>
      <Button onClick={() => train(GymType.defense)}>
        Train Defense (<Money money={cost} forPurchase={true} /> / sec)
      </Button>
      <Button onClick={() => train(GymType.dexterity)}>
        Train Dexterity (<Money money={cost} forPurchase={true} /> / sec)
      </Button>
      <Button onClick={() => train(GymType.agility)}>
        Train Agility (<Money money={cost} forPurchase={true} /> / sec)
      </Button>
    </Box>
  );
}
