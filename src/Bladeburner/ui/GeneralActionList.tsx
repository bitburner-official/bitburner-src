import React from "react";

import { Action } from "../Action";
import { Bladeburner } from "../Bladeburner";
import { GeneralActions } from "../GeneralActions";
import { GeneralActionElem } from "./GeneralActionElem";

interface IProps {
  bladeburner: Bladeburner;
}

export function GeneralActionList(props: IProps): React.ReactElement {
  const actions: Action[] = [];
  for (const name of Object.keys(GeneralActions)) {
    if (Object.hasOwn(GeneralActions, name)) {
      actions.push(GeneralActions[name]);
    }
  }
  return (
    <>
      {actions.map((action: Action) => (
        <GeneralActionElem key={action.name} bladeburner={props.bladeburner} action={action} />
      ))}
    </>
  );
}
