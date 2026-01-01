import { Button, Typography } from "@mui/material";
import React, { useState } from "react";
import { Modal } from "../ui/React/Modal";
import { DocumentationLink } from "../ui/React/DocumentationLink";

let v2ModalOpen = false;

export const openV2Modal = (): void => {
  v2ModalOpen = true;
};

export const V2Modal = (): React.ReactElement => {
  const [open, setOpen] = useState(v2ModalOpen);
  return (
    <Modal open={open} onClose={() => undefined}>
      <Typography>NOTICE FOR BREAKING CHANGES IN V2</Typography>
      <Typography>
        A file was added to your home computer called V2_0_0_API_BREAK.txt and it is highly recommended you take a look
        at this file. It explains where most of the API break have occurred.
      </Typography>{" "}
      <Typography>
        You should also take a look at{" "}
        <DocumentationLink page="migrations/v2.md">the migration guide</DocumentationLink> as well as{" "}
        <DocumentationLink page="changelog.md">the changelog</DocumentationLink>.
      </Typography>
      <Button onClick={() => setOpen(false)}>I understand</Button>
    </Modal>
  );
};
