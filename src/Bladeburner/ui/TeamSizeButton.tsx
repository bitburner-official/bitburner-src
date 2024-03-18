import type { Bladeburner } from "../Bladeburner";
import type { BlackOperation } from "../Actions/BlackOperation";
import type { Operation } from "../Actions/Operation";

import React, { useState } from "react";
import { TeamSizeModal } from "./TeamSizeModal";
import { formatNumberNoSuffix } from "../../ui/formatNumber";
import Button from "@mui/material/Button";

interface TeamSizeButtonProps {
  action: Operation | BlackOperation;
  bladeburner: Bladeburner;
}
export function TeamSizeButton({ action, bladeburner }: TeamSizeButtonProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button disabled={bladeburner.teamSize === 0} onClick={() => setOpen(true)}>
        Set Team Size (Curr Size: {formatNumberNoSuffix(action.teamCount, 0)})
      </Button>
      <TeamSizeModal open={open} onClose={() => setOpen(false)} action={action} bladeburner={bladeburner} />
    </>
  );
}
