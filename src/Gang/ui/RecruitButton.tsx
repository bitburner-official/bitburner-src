import React, { useState } from "react";
import { RecruitModal } from "./RecruitModal";
import { GangConstants } from "../data/Constants";
import { formatRespect } from "../../ui/nFormat";
import { useGang } from "./Context";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

interface IProps {
  onRecruit: () => void;
}

/** React Component for the recruitment button and text on the gang main page. */
export function RecruitButton(props: IProps): React.ReactElement {
  const gang = useGang();
  const [open, setOpen] = useState(false);
  if (gang.members.length >= GangConstants.MaximumGangMembers) {
    return <></>;
  }

  if (!gang.canRecruitMember()) {
    const respect = gang.getRespectNeededToRecruitMember();
    return (
      <Box display="flex" alignItems="center" sx={{ mx: 1 }}>
        <Button disabled>Recruit Gang Member</Button>
        <Typography sx={{ ml: 1 }}>{formatRespect(respect)} respect needed to recruit next member</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mx: 1 }}>
        <Button onClick={() => setOpen(true)}>Recruit Gang Member</Button>
      </Box>
      <RecruitModal open={open} onClose={() => setOpen(false)} onRecruit={props.onRecruit} />
    </>
  );
}
