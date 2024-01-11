import React from "react";
import { CharityVolunteer } from "../CharityVolunteer";
import { CharityORGMemberCardContent } from "./CharityORGMemberCardContent";

import Box from "@mui/material/Box";

import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";

interface IProps {
  member: CharityVolunteer;
}

/** React Component for a gang member on the management subpage. */
export function CharityORGMemberCard(props: IProps): React.ReactElement {
  return (
    <Box component={Paper} sx={{ width: "fit-content(100%)" }}>
      <Box sx={{ m: 1 }}>
        <ListItemText primary={<b>{props.member.name}</b>} />
        <CharityORGMemberCardContent member={props.member} />
      </Box>
    </Box>
  );
}
