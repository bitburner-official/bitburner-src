import type { Bladeburner } from "../Bladeburner";
import type { Action } from "../Types";

import React from "react";
import { ButtonWithTooltip } from "../../ui/Components/ButtonWithTooltip";

interface StartButtonProps {
  bladeburner: Bladeburner;
  action: Action;
  rerender: () => void;
}
export function StartButton({ bladeburner, action, rerender }: StartButtonProps): React.ReactElement {
  const availability = action.getAvailability(bladeburner);
  const disabledReason = availability.available ? "" : availability.error;

  function onStart(): void {
    if (disabledReason) return;
    bladeburner.startAction(action.id);
    rerender();
  }

  return (
    <ButtonWithTooltip disabledTooltip={disabledReason} onClick={onStart}>
      Start
    </ButtonWithTooltip>
  );
}
