import React, { useState } from "react";
import { Operation } from "../Operation";
import { Bladeburner } from "../Bladeburner";
import { TeamSizeModal } from "./TeamSizeModal";
import { formatNumberNoSuffix } from "../../ui/formatNumber";
import Button from "@mui/material/Button";
interface IProps {
  action: Operation;
  bladeburner: Bladeburner;
}
export function TeamSizeButton(props: IProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button disabled={props.bladeburner.teamSize === 0} onClick={() => setOpen(true)}>
        Set Team Size (Curr Size: {formatNumberNoSuffix(props.action.teamCount, 0)})
      </Button>
      <TeamSizeModal open={open} onClose={() => setOpen(false)} action={props.action} bladeburner={props.bladeburner} />
    </>
  );
}
