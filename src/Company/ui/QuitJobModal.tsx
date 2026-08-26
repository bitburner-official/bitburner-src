import React from "react";
import { Company } from "../Company";
import { Player } from "@player";
import { Modal } from "../../ui/React/Modal";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { CompanyName } from "../Enums";

interface IProps {
  open: boolean;
  onClose: () => void;
  companyName: CompanyName;
  company: Company;
  onQuit: () => void;
}

export function QuitJobModal(props: IProps): React.ReactElement {
  function quit(): void {
    Player.quitJob(props.companyName);
    props.onQuit();
    props.onClose();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography> 你想辞去在 {props.company.name} 的工作吗？</Typography>
      <br />
      <br />
      <Button onClick={quit}>辞职</Button>
    </Modal>
  );
}
