import { LocationName } from "@enums";
import { Player } from "@player";
import React, { useEffect } from "react";
export function TheVoid(): React.ReactElement {
  useEffect(() => {
    Player.gotoLocation(LocationName.Void);
  });
  return <></>;
}
