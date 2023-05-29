import React from "react";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Player } from "@player";

import { Modal } from "../../ui/React/Modal";
import { Company } from "../Company";

interface IProps {
  open: boolean;
  onClose: () => void;
  locName: string;
  company: Company;
  onQuit: () => void;
}

export function QuitJobModal(props: IProps): React.ReactElement {
  function quit(): void {
    Player.quitJob(props.locName);
    props.onQuit();
    props.onClose();
  }

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Typography> Would you like to quit your job at {props.company.name}?</Typography>
      <br />
      <br />
      <Button onClick={quit}>Quit</Button>
    </Modal>
  );
}
