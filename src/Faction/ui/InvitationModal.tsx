import React, { useState, useEffect } from "react";
import { joinFaction } from "../FactionHelpers";
import { Faction } from "../Faction";
import { Modal } from "../../ui/React/Modal";
import { Player } from "@player";
import { EventEmitter } from "../../utils/EventEmitter";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export const InvitationEvent = new EventEmitter<[Faction]>();

export function InvitationModal({ hidden }: { hidden: boolean }): React.ReactElement {
  const [faction, setFaction] = useState<Faction | null>(null);
  function join(): void {
    if (faction === null) return;
    //Remove from invited factions
    const i = Player.factionInvitations.findIndex((facName) => facName === faction.name);
    if (i === -1) {
      console.error("Could not find faction in Player.factionInvitations");
    }
    joinFaction(faction);
    setFaction(null);
  }

  useEffect(() => InvitationEvent.subscribe((faction) => setFaction(faction)), []);

  return (
    <Modal open={!hidden && faction !== null} onClose={() => setFaction(null)}>
      <Typography variant="h4">You have received a faction invitation.</Typography>
      <Typography>
        Would you like to join {(faction || { name: "" }).name}? <br />
        <br />
        Warning: Joining this faction may prevent you from joining other factions during this run!
      </Typography>
      <Button onClick={join}>Join!</Button>
      <Button onClick={() => setFaction(null)}>Decide later</Button>
    </Modal>
  );
}
