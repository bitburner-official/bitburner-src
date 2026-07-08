/**
 * A Zork arcade cabinet: loads the bundled story file, runs a ZVM session,
 * and renders the terminal. ArcadeRoot supplies the Back button.
 */
import React, { useEffect, useRef, useState } from "react";
import Typography from "@mui/material/Typography";
import { AlertEvents } from "../../ui/React/AlertManager";
import { Settings } from "../../Settings/Settings";
import { GlkOteReact, TerminalState } from "./GlkOteReact";
import { ZorkTerminal } from "./ZorkTerminal";
import { createZorkSession, ZorkSession } from "./session";
import type { ZorkGame } from "./metadata";

export function ZorkRoot({ game }: { game: ZorkGame }): React.ReactElement {
  const [state, setState] = useState<TerminalState | null>(null);
  const sessionRef = useRef<ZorkSession | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(game.url)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load ${game.title}: ${response.status}`);
        return response.arrayBuffer();
      })
      .then((buffer) => {
        if (cancelled) return;
        sessionRef.current = createZorkSession(new Uint8Array(buffer), game.key, setState);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) AlertEvents.emit("This machine is broken.");
      });
    return () => {
      cancelled = true;
      sessionRef.current?.dispose();
      sessionRef.current = null;
    };
  }, [game]);

  if (!state) {
    return <Typography sx={{ color: Settings.theme.primary }}>The cabinet flickers to life...</Typography>;
  }
  const glkote = (): GlkOteReact | undefined => sessionRef.current?.glkote;
  return (
    <>
      <Typography variant="h5" sx={{ color: Settings.theme.primary, my: 1 }}>
        {game.title}
      </Typography>
      <ZorkTerminal
        state={state}
        onLine={(text) => glkote()?.sendLine(text)}
        onChar={(key) => glkote()?.sendChar(key)}
        onFileref={(value) => glkote()?.sendFileref(value)}
      />
      <Typography sx={{ color: Settings.theme.secondary, mt: 1 }}>
        Type &quot;save&quot; / &quot;restore&quot; to keep your progress. It is pitch black. You are likely to be eaten
        by a grue.
      </Typography>
    </>
  );
}
