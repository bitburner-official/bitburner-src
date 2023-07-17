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
      <Typography> Would you like to quit your job at {props.company.name}?</Typography>
      <br />
      <br />
      <Button onClick={quit}>Quit</Button>
    </Modal>
  );
}
