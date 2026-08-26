import type { Bladeburner } from "../Bladeburner";
import type { BlackOperation } from "../Actions/BlackOperation";
import type { Operation } from "../Actions/Operation";

import React, { useState } from "react";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { Modal } from "../../ui/React/Modal";
import { Button, TextField, Typography } from "@mui/material";

interface TeamSizeModalProps {
  bladeburner: Bladeburner;
  action: Operation | BlackOperation;
  open: boolean;
  onClose: () => void;
}

export function TeamSizeModal({ bladeburner, action, open, onClose }: TeamSizeModalProps): React.ReactElement {
  const [teamSize, setTeamSize] = useState(0);

  function confirmTeamSize(event: React.FormEvent): void {
    // Prevent reloading page when submitting form
    event.preventDefault();
    if (!Number.isInteger(teamSize) || teamSize < 0) {
      dialogBoxCreate("输入的团队成员数量无效（必须为非负整数）");
      return;
    }
    action.teamCount = teamSize;
    onClose();
  }

  function onTeamSize(event: React.ChangeEvent<HTMLInputElement>): void {
    const newTeamSize = Number(event.target.value);
    if (newTeamSize > bladeburner.teamSize) {
      setTeamSize(bladeburner.teamSize);
    } else {
      setTeamSize(newTeamSize);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={confirmTeamSize}>
        <Typography>
          输入你想带上参加这次行动的团队成员数量。如果你的团队成员不足该数量，则所有团队成员都会参加。
          <br />
          <br />
          团队成员会提升你的成功几率，但带的人越多，提升幅度越小。
          <br />
          <br />
          注意：每次行动都可能损失部分团队成员，即使行动成功也是如此。
        </Typography>
        <TextField autoFocus type="number" placeholder="团队规模" value={teamSize} onChange={onTeamSize} />
        <Button sx={{ mx: 2 }} type={"submit"}>
          确认
        </Button>
      </form>
    </Modal>
  );
}
