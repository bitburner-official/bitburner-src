import React from "react";
import { Modal } from "./Modal";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

interface IProps {
  open: boolean;
  onClose: () => void;
  killScripts: () => void;
}

export function KillScriptsModal(props: IProps): React.ReactElement {
  function onClick(): void {
    props.killScripts();
    props.onClose();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography>确定要强制终止所有运行中的脚本吗？此操作还会保存并重新加载游戏。</Typography>
      <Button onClick={onClick}>终止</Button>
    </Modal>
  );
}
