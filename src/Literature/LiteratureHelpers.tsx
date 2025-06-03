import { Literatures } from "./Literatures";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { LiteratureName } from "@enums";
import { Player } from "@player";
import React from "react";

export function showLiterature(fn: LiteratureName): void {
  const litObj = Literatures[fn];
  if (litObj == null) {
    return;
  }
  for (const factionName of litObj.factionRumors) {
    Player.receiveRumor(factionName);
  }
  const txt = (
    <>
      <i>{litObj.title}</i>
      <br />
      <br />
      {litObj.text}
    </>
  );
  dialogBoxCreate(txt);
}
