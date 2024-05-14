import React, { useState } from "react";
import { Location } from "../../Locations/Location";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { calculateDifficulty, calculateReward } from "../formulas/game";
import { Game } from "./Game";
import { Intro } from "./Intro";
import { dialogBoxCreate } from "../../ui/React/DialogBox";

interface IProps {
  location: Location;
}

export function InfiltrationRoot(props: IProps): React.ReactElement {
  const [start, setStart] = useState(false);

  if (!props.location.infiltrationData) {
    /**
     * Using setTimeout is unnecessary, because we can just call cancel() and dialogBoxCreate(). However, without
     * setTimeout, we will go to City page (in "cancel" function) and update GameRoot while still rendering
     * InfiltrationRoot. React will complain: "Warning: Cannot update a component (`GameRoot`) while rendering a
     * different component (`InfiltrationRoot`)".
     */
    setTimeout(() => {
      cancel();
      dialogBoxCreate(`You tried to infiltrate an invalid location: ${props.location.name}`);
    }, 100);
    return <></>;
  }

  const startingSecurityLevel = props.location.infiltrationData.startingSecurityLevel;
  const difficulty = calculateDifficulty(startingSecurityLevel);
  const reward = calculateReward(startingSecurityLevel);

  function cancel(): void {
    Router.toPage(Page.City);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", height: "calc(100vh - 16px)" }}>
      {start ? (
        <Game
          StartingDifficulty={startingSecurityLevel}
          Difficulty={difficulty}
          Reward={reward}
          MaxLevel={props.location.infiltrationData.maxClearanceLevel}
        />
      ) : (
        <Intro
          Location={props.location}
          StartingDifficulty={startingSecurityLevel}
          Difficulty={difficulty}
          MaxLevel={props.location.infiltrationData.maxClearanceLevel}
          start={() => setStart(true)}
          cancel={cancel}
        />
      )}
    </div>
  );
}
