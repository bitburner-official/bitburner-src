/**
 * React Component for the content of the accordion of gang members on the
 * management subpage.
 */
import React from "react";
import { GangMemberStats } from "./GangMemberStats";
import { TaskSelector } from "./TaskSelector";
import { AscensionModal } from "./AscensionModal";

import { Box } from "@mui/system";
import { Button, Typography } from "@mui/material";
import HelpIcon from "@mui/icons-material/Help";

import { GangMember } from "../GangMember";
import { StaticModal } from "../../ui/React/StaticModal";
import { useBoolean, useRerender } from "../../ui/React/hooks";

interface IProps {
  member: GangMember;
}

export function GangMemberCardContent(props: IProps): React.ReactElement {
  const rerender = useRerender();
  const [helpOpen, { on: openHelpModal, off: closeHelpModal }] = useBoolean(false);
  const [ascendOpen, { on: openAscensionModal, off: closeAscensionModal }] = useBoolean(false);

  return (
    <>
      {props.member.canAscend() && (
        <Box sx={{ display: "flex", justifyContent: "space-between", my: 1 }}>
          <Button onClick={openAscensionModal} style={{ flexGrow: 1, borderRightWidth: 0 }}>
            飞升
          </Button>
          <AscensionModal open={ascendOpen} onClose={closeAscensionModal} member={props.member} onAscend={rerender} />
          <Button onClick={openHelpModal} style={{ width: "fit-content", borderLeftWidth: 0 }}>
            <HelpIcon />
          </Button>
          <StaticModal open={helpOpen} onClose={closeHelpModal}>
            <Typography>
              飞升一名帮派成员会重置该成员的进度和属性，以换取其属性倍率的永久提升。
              <br />
              <br />
              帮派成员在飞升时获得的属性提升取决于其拥有的经验值数量，并会在你选择飞升之前展示。
              <br />
              <br />
              飞升后，该成员将失去所有非强化类装备，且你的帮派会失去与该成员所赚取尊重总量相等的尊重。
            </Typography>
          </StaticModal>
        </Box>
      )}
      <Box display="grid" sx={{ gridTemplateColumns: "1fr 1fr", width: "100%", gap: 1 }}>
        <GangMemberStats member={props.member} />
        <TaskSelector onTaskChange={rerender} member={props.member} />
      </Box>
    </>
  );
}
