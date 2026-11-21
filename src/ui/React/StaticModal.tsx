import React from "react";
import { Modal } from "./Modal";

interface IProps {
  open: boolean;
  onClose: () => void;
  children: React.JSX.Element[] | React.JSX.Element | React.ReactElement[] | React.ReactElement;
}

export function StaticModal(props: IProps): React.ReactElement {
  return (
    <Modal open={props.open} onClose={props.onClose}>
      {props.children}
    </Modal>
  );
}
