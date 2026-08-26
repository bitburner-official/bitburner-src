import React, { useState } from "react";
import { RecruitModal } from "./RecruitModal";
import { formatRespect } from "../../ui/formatNumber";
import { useGang } from "./Context";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { RecruitmentResult } from "../Gang";
import { pluralize } from "../../utils/I18nUtils";

interface IProps {
  onRecruit: () => void;
}

/** React Component for the recruitment button and text on the gang main page. */
export function RecruitButton(props: IProps): React.ReactElement {
  const gang = useGang();
  const [open, setOpen] = useState(false);
  const recruitsAvailable = gang.getRecruitsAvailable();

  if (gang.canRecruitMember() !== RecruitmentResult.Success) {
    const respectNeeded = gang.respectForNextRecruit();
    return (
      <Box display="flex" alignItems="center" sx={{ mx: 1 }}>
        <Button disabled>招募帮派成员</Button>
        {respectNeeded === Infinity ? (
          <Typography sx={{ ml: 1 }}>已招募的帮派成员数量已达上限</Typography>
        ) : (
          <Typography sx={{ ml: 1 }}>还需 {formatRespect(respectNeeded)} 尊重才能招募下一名成员</Typography>
        )}
      </Box>
    );
  }

  return (
    <>
      <Box display="flex" alignItems="center" sx={{ mx: 1 }}>
        <Button onClick={() => setOpen(true)}>招募帮派成员</Button>
        <Typography sx={{ ml: 1 }}>还可招募 {pluralize(recruitsAvailable, "名帮派成员", "名帮派成员")}</Typography>
      </Box>
      <RecruitModal open={open} onClose={() => setOpen(false)} onRecruit={props.onRecruit} />
    </>
  );
}
