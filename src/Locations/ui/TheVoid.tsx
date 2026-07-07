import { LocationName } from "@enums";
import { gotoLocation } from "src/PersonObjects/Player/PlayerObjectGeneralMethods";
import { Player } from "@player";
import React, { useEffect } from "react";
export function TheVoid(): React.ReactElement {
  useEffect(() => {
    Player.gotoLocation(LocationName.Void);
  });
  return <></>;
}
