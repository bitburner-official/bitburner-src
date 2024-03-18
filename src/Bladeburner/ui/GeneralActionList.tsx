import React from "react";
import { GeneralActionElem } from "./GeneralActionElem";
import { GeneralActions } from "../GeneralActions";
import { Bladeburner } from "../Bladeburner";

interface GeneralActionListProps {
  bladeburner: Bladeburner;
}

export function GeneralActionList({ bladeburner }: GeneralActionListProps): React.ReactElement {
  const actions = Object.values(GeneralActions);
  return (
    <>
      {actions.map((action) => (
        <GeneralActionElem key={action.name} bladeburner={bladeburner} action={action} />
      ))}
    </>
  );
}
