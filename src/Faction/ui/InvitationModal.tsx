import React, { useState, useEffect } from "react";
import { joinFaction } from "../FactionHelpers";
import { Faction } from "../Faction";
import { Modal } from "../../ui/React/Modal";
import { EventEmitter } from "../../utils/EventEmitter";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Report } from "@mui/icons-material";
import { Settings } from "../../Settings/Settings";

export const InvitationEvent = new EventEmitter<[Faction | null]>();

export function InvitationModal({ hidden }: { hidden: boolean }): React.ReactElement {
  const [faction, setFaction] = useState<Faction | null>(null);

  const enemies = faction?.getInfo().enemies ?? [];

  function join(): void {
    if (faction === null) return;
    if (!faction.alreadyInvited) return;
    joinFaction(faction);
    setFaction(null);
  }

  useEffect(() => InvitationEvent.subscribe((faction) => setFaction(faction)), []);

  return (
    <Modal open={!hidden && faction !== null} onClose={() => setFaction(null)}>
      <Typography variant="h4">You have received a faction invitation.</Typography>
      <Typography>
        Would you like to join <b>{faction?.name}</b>?
      </Typography>
      {enemies.length > 0 && (
        <Typography component="div">
          <br />
          Joining this Faction will prevent you from joining its enemies until your next augmentation.
          <br />
          {faction?.name} is enemies with:
          {enemies.map((enemy) => (
            <Typography key={enemy} sx={{ display: "flex", alignItems: "center" }}>
              <Report sx={{ ml: 2, mr: 1, color: Settings.theme.error }} />
              {enemy}
            </Typography>
          ))}
        </Typography>
      )}
      <br />
      <Button onClick={join}>Join!</Button>
      <Button onClick={() => setFaction(null)}>Decide later</Button>
    </Modal>
  );
}
