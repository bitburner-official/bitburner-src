import React, { useState, useEffect, useMemo } from "react";
import { Player } from "@player";
import { Location } from "../../Locations/Location";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { calculateDifficulty } from "../formulas/game";
import { Game } from "./Game";
import { Intro } from "./Intro";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { clearState } from "../State";

interface IProps {
  location: Location;
  autoStart?: boolean;
}

export function InfiltrationRoot(props: IProps): React.ReactElement {
  const [start, setStart] = useState(false);

  // useMemo is the "wrong" hook, useEffect is what is supposed to be used
  // here. However, useEffect does not have guaranteed timing: In many/most
  // cases, it fires in a delayed fashion, after screen painting has occured.
  // This is unacceptable for side-effects that must be guaranteed to take
  // effect synchronously (for instance, we must observe that the player's
  // location is changed immediately after a startInfiltration call).
  useMemo(() => {
    // Ensure we are in the proper location. This isn't guaranteed otherwise.
    Player.gotoLocation(props.location.name);
  }, [props]);

  // This does nothing on start, it exists to clear the state (to prevent leaks) on unmount.
  useEffect(() => clearState, []);

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

  function cancel(): void {
    Router.toPage(Page.City);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", height: "calc(100vh - 16px)" }}>
      {start || props.autoStart ? (
        <Game
          startingSecurityLevel={startingSecurityLevel}
          difficulty={difficulty}
          maxLevel={props.location.infiltrationData.maxClearanceLevel}
        />
      ) : (
        <Intro
          location={props.location}
          startingSecurityLevel={startingSecurityLevel}
          difficulty={difficulty}
          maxLevel={props.location.infiltrationData.maxClearanceLevel}
          start={() => setStart(true)}
          cancel={cancel}
        />
      )}
    </div>
  );
}
