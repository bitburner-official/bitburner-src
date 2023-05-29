import React from "react";

import Box from "@mui/material/Box";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";

import { GangMember } from "../GangMember";
import { GangMemberCardContent } from "./GangMemberCardContent";

interface IProps {
  member: GangMember;
}

/** React Component for a gang member on the management subpage. */
export function GangMemberCard(props: IProps): React.ReactElement {
  return (
    <Box component={Paper} sx={{ width: "auto" }}>
      <Box sx={{ m: 1 }}>
        <ListItemText primary={<b>{props.member.name}</b>} />
        <GangMemberCardContent member={props.member} />
      </Box>
    </Box>
  );
}
