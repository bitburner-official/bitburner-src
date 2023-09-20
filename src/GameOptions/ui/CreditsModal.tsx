import React from "react";
import { Modal } from "../../ui/React/Modal";
import { Typography, Link, Button } from "@mui/material";

import { CONSTANTS } from "../../Constants";

interface IProps {
  open: boolean;
  onClose: () => void;
}

const enclosed = /(\([^)]*\))/gm; //grab everything between () pairs
const recentPatchData = Array.from(new Set(CONSTANTS.LatestUpdate.match(enclosed)));

const isDate = (data: string) => {
  const regex = /^\(last update/gm; //(this) isn't @name, but may be useful
  return regex.test(data);
};
const updateMessage = []; //store most recent update message, eg (last updated 9/12/23)
if (isDate(recentPatchData[0])) updateMessage.push(recentPatchData[0]);

const handle: string[] = [];
for (let i = 0; i < recentPatchData.length; i++) {
  const atName = /(?:\(?(@[^\s),]*)[),]?)/gm; //make an array of only unique @handles
  const whatWeWant = recentPatchData[i].replace(atName, "$1");
  if (isDate(recentPatchData[i]) || !recentPatchData[i].includes(whatWeWant)) continue;
  if (recentPatchData[i].includes(", ")) {
    recentPatchData.push(...recentPatchData[i].split(", "));
    continue;
  }
  if (!handle.includes(whatWeWant)) handle.push(whatWeWant);
}

export function CreditsModal(props: IProps): React.ReactElement {
  const leadDevs = `danielyxie
  Olivier Gagnon
  @Snarling
  `;

  const currentMaintainer = `@Snarling`;

  const handles = handle.sort((a, b) => a.localeCompare(b)).join(", ");
  const contributorsURL = `https://github.com/bitburner-official/bitburner-src/graphs/contributors`;
  const contributorsMessage = `Visit GitHub to see all contributors
or to participate yourself`;
  const maxEM = Math.floor(contributorsMessage.length / 2);

  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      sx={{
        textAlign: "center",
      }}
    >
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
      <Typography style={{ whiteSpace: "pre-wrap", maxWidth: maxEM + "em", textOverflow: "clip" }}>
        {/*em unit = character px based, dynamic with font. balance contributor overflow vs longest other message*/}
        {/*textoverflow "clip" forces very long @names to stretch a single line, it's silly*/}
        {handles}
      </Typography>
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
