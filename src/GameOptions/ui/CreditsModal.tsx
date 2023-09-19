import React from "react";
import { Modal } from "../../ui/React/Modal";
import { Typography, Link, Button } from "@mui/material";

import { CONSTANTS } from "../../Constants";
import { update } from "lodash";

interface IProps {
  open: boolean;
  onClose: () => void;
}

const handle = /(\([^)]*\))/gm; //grab everything between () pairs
const recentPatchData = Array.from(new Set(CONSTANTS.LatestUpdate.match(handle)));

const isDate = (data: string) => {
  const regex = /^\(last update/gm; //(this) isn't @name, but useful
  return regex.test(data);
};
const upDate = []; //store most recent update date, eg (last updated 9/12/23)
if (isDate(recentPatchData[0])) upDate.push(recentPatchData[0]);

const handles = recentPatchData
  .filter((name) => !isDate(name))
  .sort((a, b) => a.localeCompare(b))
  .map((name) => name.slice(1, name.length - 1))
  .join(", ");

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
    <Modal open={props.open} onClose={props.onClose} sx={{ textAlign: "center", maxWidth: "40em" }}>
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
      <Typography sx={{ textDecoration: "underline" }}>Recent patch contributors:</Typography>
      <Typography style={{ whiteSpace: "pre-wrap" }}>{handles}</Typography>
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
