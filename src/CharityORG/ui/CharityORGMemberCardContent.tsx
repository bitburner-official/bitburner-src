/**
 * React Component for the content of the accordion of gang members on the
 * management subpage.
 */
import React from "react";
import { CharityORGMemberStats } from "./CharityORGMemberStats";
import { TaskSelector } from "./TaskSelector";
import { AscensionModal } from "./AscensionModal";

import { Box } from "@mui/system";
import { Button, Typography } from "@mui/material";
import HelpIcon from "@mui/icons-material/Help";

import { CharityVolunteer } from "../CharityVolunteer";
import { StaticModal } from "../../ui/React/StaticModal";
import { useBoolean, useRerender } from "../../ui/React/hooks";

interface IProps {
  member: CharityVolunteer;
}

export function CharityORGMemberCardContent(props: IProps): React.ReactElement {
  const rerender = useRerender();
  const [helpOpen, { on: openHelpModal, off: closeHelpModal }] = useBoolean(false);
  const [ascendOpen, { on: openAscensionModal, off: closeAscensionModal }] = useBoolean(false);

  return (
    <>
      {props.member.canAscend() && (
        <Box sx={{ display: "flex", justifyContent: "space-between", my: 1 }}>
          <Button onClick={openAscensionModal} style={{ flexGrow: 1, borderRightWidth: 0 }}>
            Ascend
          </Button>
          <AscensionModal open={ascendOpen} onClose={closeAscensionModal} member={props.member} onAscend={rerender} />
          <Button onClick={openHelpModal} style={{ width: "fit-content", borderLeftWidth: 0 }}>
            <HelpIcon />
          </Button>
          <StaticModal open={helpOpen} onClose={closeHelpModal}>
            <Typography>
              Ascending a Charity Volunteer resets that volunteer's progress and stats in exchange for a permanent boost
              to their stat multipliers and costs 1 ascension token.
              <br />
              <br />
              The stat boost a Charity Volunteer gains upon ascension is based on the amount of exp they have, and will
              be shown before you choose to ascend them.
              <br />
              <br />
              Upon ascension, your Charity will lose prestige equal to the total prestige earned by that volunteer.
            </Typography>
          </StaticModal>
        </Box>
      )}
      <Box display="grid" sx={{ gridTemplateColumns: "1fr 1fr", width: "100%", gap: 1 }}>
        <CharityORGMemberStats member={props.member} />
        <TaskSelector onTaskChange={rerender} member={props.member} />
      </Box>
    </>
  );
}
