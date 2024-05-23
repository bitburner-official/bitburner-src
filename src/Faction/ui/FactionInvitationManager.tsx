import React, { useState, useEffect } from "react";
import { joinFaction } from "../FactionHelpers";
import { Modal } from "../../ui/React/Modal";
import { EventEmitter } from "../../utils/EventEmitter";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Report } from "@mui/icons-material";
import { Settings } from "../../Settings/Settings";
import { FactionName } from "../Enums";
import { Factions } from "../Factions";

type NewInvitation = {
  type: "New";
  factionName: FactionName;
};

type ClearAllInvitations = {
  type: "ClearAll";
};

type FactionInvitationEvent = NewInvitation | ClearAllInvitations;

export const FactionInvitationEvents = new EventEmitter<[FactionInvitationEvent]>();

export function FactionInvitationManager({ hidden }: { hidden: boolean }): React.ReactElement {
  const [factions, setFactions] = useState<FactionName[]>([]);

  useEffect(
    () =>
      FactionInvitationEvents.subscribe((event) => {
        if (event.type === "ClearAll") {
          setFactions([]);
          return;
        }
        setFactions((currentFactions) => {
          if (currentFactions.includes(event.factionName)) {
            return currentFactions;
          }
          return [...currentFactions, event.factionName];
        });
      }),
    [],
  );

  function close(): void {
    setFactions((currentFactions) => {
      return currentFactions.slice(1);
    });
  }

  const faction = factions.length > 0 ? Factions[factions[0]] : null;
  const enemies = faction?.getInfo().enemies ?? [];

  function join(): void {
    if (faction === null || !faction.alreadyInvited) {
      return;
    }
    joinFaction(faction);
    close();
  }

  return (
    <Modal open={!hidden && faction !== null} onClose={close}>
      <Typography variant="h4">You received a faction invitation.</Typography>
      <Typography>
        Would you like to join <b>{faction?.name}</b>?
      </Typography>
      {enemies.length > 0 && (
        <Typography component="div">
          <br />
          Joining this faction will prevent you from joining its enemies until your next augmentation.
          <br />
          {faction?.name} is enemies with:
          {enemies.map((enemy) => (
            <Typography key={enemy} sx={{ display: "flex", alignItems: "center" }}>
              <Report sx={{ marginLeft: 2, marginRight: 1, color: Settings.theme.error }} />
              {enemy}
            </Typography>
          ))}
        </Typography>
      )}
      <br />
      <Button onClick={join} sx={{ marginRight: 1 }}>
        Join
      </Button>
      <Button onClick={close}>Decide later</Button>
    </Modal>
  );
}
