import React from "react";
import { Modal } from "../../ui/React/Modal";
import { Typography, Link, Button } from "@mui/material";

interface IProps {
  open: boolean;
  onClose: () => void;
}

export function CreditsModal(props: IProps): React.ReactElement {
  const leadDevs = `danielyxie
Olivier Gagnon
@Snarling
`;

  const currentMaintainer = `@Snarling`;

  const contributorsURL = `https://github.com/bitburner-official/bitburner-src/graphs/contributors`;
  const contributorsMessage = `Visit GitHub to see all contributors
or to participate yourself`;

  return (
    <Modal open={props.open} onClose={props.onClose} sx={{ textAlign: "center" }}>
      <Typography alignContent={"start"} variant="h3">
        Bitburner
      </Typography>
      <Typography sx={{ textDecoration: "underline" }}>Original Code and Concept</Typography>
      <Typography>danielyxie</Typography>
      <br />
      <Typography sx={{ textDecoration: "underline" }}>Lead Developers:</Typography>
      <Typography style={{ whiteSpace: "pre-wrap" }}>{leadDevs}</Typography>
      <br />
      <Typography sx={{ textDecoration: "underline" }}>Current Maintainer</Typography>
      <Typography>{currentMaintainer}</Typography>
      <br />
      <Typography style={{ whiteSpace: "pre-wrap" }}>
        <Link href={contributorsURL} target="_blank">
          {contributorsMessage}
        </Link>
      </Typography>
      <br />
      <Typography fontSize={"large"}>
        <Button onClick={props.onClose} size="large">
          Thanks for Playing!
        </Button>
      </Typography>
    </Modal>
  );
}
