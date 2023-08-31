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

  if (!gang.canRecruitMember()) {
    const respect = gang.getRespectNeededToRecruitMember();
    return (
      <Box display="flex" alignItems="center" sx={{ mx: 1 }}>
        <Button disabled>Recruit Gang Member</Button>
        {gang.getRecruitsAvailable() === -1 && (
          <Typography sx={{ ml: 1 }}>Maximum gang members already recruited</Typography>
        )}
        {gang.getRecruitsAvailable() !== -1 && (
          <Typography sx={{ ml: 1 }}>{formatRespect(respect)} respect needed to recruit next member</Typography>
        )}
      </Box>
    );
  }

  return (
    <>
      <Box display="flex" alignItems="center" sx={{ mx: 1 }}>
        <Button onClick={() => setOpen(true)}>Recruit Gang Member</Button>
        <Typography sx={{ ml: 1 }}>
          Can recruit {gang.getRecruitsAvailable()} more gang member{gang.getRecruitsAvailable() === 1 ? "" : "s"}
        </Typography>
      </Box>
      <RecruitModal open={open} onClose={() => setOpen(false)} onRecruit={props.onRecruit} />
    </>
  );
}
