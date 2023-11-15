import React, { useState } from "react";
import { RecruitModal } from "./RecruitModal";
import { formatRespect } from "../../ui/formatNumber";
import { useCharityORG } from "./Context";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

interface IProps {
  onRecruit: () => void;
}

/** React Component for the recruitment button and text on the gang main page. */
export function RecruitButton(props: IProps): React.ReactElement {
  const charityORG = useCharityORG();
  const [open, setOpen] = useState(false);

  if (!charityORG.canRecruitMember()) {
    const prestigeNeeded = charityORG.prestigeForNextRecruit();
    return (
      <Box display="flex" alignItems="center" sx={{ mx: 1 }}>
        <Button disabled>Recruit Charity Volunteer</Button>
        {prestigeNeeded === Infinity ? (
          <Typography sx={{ ml: 1 }}>Maximum charity volunteers already recruited</Typography>
        ) : (
          <Typography sx={{ ml: 1 }}>{formatRespect(prestigeNeeded)} prestige needed to recruit next member</Typography>
        )}
      </Box>
    );
  }

  return (
    <>
      <Box display="flex" alignItems="center" sx={{ mx: 1 }}>
        <Button onClick={() => setOpen(true)}>Recruit Charity Volunteer</Button>
        <Typography sx={{ ml: 1 }}>Can recruit a charity volunteer</Typography>
      </Box>
      <RecruitModal open={open} onClose={() => setOpen(false)} onRecruit={props.onRecruit} />
    </>
  );
}
