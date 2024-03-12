import React, { useState } from "react";
import { RecruitModal } from "./RecruitModal";
import { formatRespect } from "../../ui/formatNumber";
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
  const recruitsAvailable = gang.getRecruitsAvailable();

  if (!gang.canRecruitMember()) {
    const respectNeeded = gang.respectForNextRecruit();
    return (
      <Box display="flex" alignItems="center" sx={{ mx: 1 }}>
        <Button disabled>Recruit Gang Member</Button>
        {respectNeeded === Infinity ? (
          <Typography sx={{ ml: 1 }}>Maximum gang members already recruited</Typography>
        ) : (
          <Typography sx={{ ml: 1 }}>{formatRespect(respectNeeded)} respect needed to recruit next member</Typography>
        )}
      </Box>
    );
  }

  return (
    <>
      <Box display="flex" alignItems="center" sx={{ mx: 1 }}>
        <Button onClick={() => setOpen(true)}>Recruit Gang Member</Button>
        <Typography sx={{ ml: 1 }}>
          Can recruit {recruitsAvailable} more gang member{recruitsAvailable === 1 ? "" : "s"}
        </Typography>
      </Box>
      <RecruitModal open={open} onClose={() => setOpen(false)} onRecruit={props.onRecruit} enforcerOK={gang.getRecruitTypeAvailable(true) > 0} hackerOK={gang.getRecruitTypeAvailable(false) > 0} />
    </>
  );
}
