import React, { useState, useEffect } from "react";
import { Modal } from "../../ui/React/Modal";
import { Router } from "../../ui/GameRoot";
import { Page } from "../../ui/Router";
import { EventEmitter } from "../../utils/EventEmitter";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { CompletedProgramName } from "../../Enums";

export const BitFlumeEvent = new EventEmitter<[]>();

export function BitFlumeModal(): React.ReactElement {
  const [open, setOpen] = useState(false);
  function flume(): void {
    Router.toPage(Page.BitVerse, { flume: true, quick: false });
    setOpen(false);
  }

  useEffect(() => BitFlumeEvent.subscribe(() => setOpen(true)), []);

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Typography>
        警告：使用该程序将使你失去当前 BitNode 中的所有进度。
        <br />
        <br />
        是否要前往 BitNode 枢纽？这将允许你重置当前的 BitNode 并选择一个新的。
        <br />
        <br />
        你可以在运行 {CompletedProgramName.bitFlume} 时使用 "-q" 选项来跳过此确认对话框。
      </Typography>
      <br />
      <br />
      <Button onClick={flume}>前往 BitVerse</Button>
    </Modal>
  );
}
