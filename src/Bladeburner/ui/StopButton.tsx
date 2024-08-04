import type { Bladeburner } from "../Bladeburner";

import React from "react";
import { Button } from "@mui/material";

interface StopButtonProps {
  bladeburner: Bladeburner;
  rerender: () => void;
}
export function StopButton({ bladeburner, rerender }: StopButtonProps): React.ReactElement {
  function onClick(): void {
    bladeburner.resetAction();
    rerender();
  }

  return (
    <Button style={{ marginLeft: "1rem" }} onClick={onClick}>
      Stop
    </Button>
  );
}
