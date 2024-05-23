import React, { useState, useEffect } from "react";
import { EventEmitter } from "../../utils/EventEmitter";
import { Modal } from "./Modal";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { sha256 } from "js-sha256";

export const AlertEvents = new EventEmitter<[string | JSX.Element]>();

interface Alert {
  text: string | JSX.Element;
  hash: string;
}

export function AlertManager({ hidden }: { hidden: boolean }): React.ReactElement {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  useEffect(
    () =>
      AlertEvents.subscribe((text: string | JSX.Element) => {
        setAlerts((old) => {
          const hash = getMessageHash(text);
          if (old.some((a) => a.hash === hash)) {
            return old;
          }
          return [
            ...old,
            {
              text: text,
              hash: hash,
            },
          ];
        });
      }),
    [],
  );

  useEffect(() => {
    function handle(this: Document, event: KeyboardEvent): void {
      if (event.code === "Escape") {
        setAlerts([]);
      }
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);

  const alertMessage = alerts[0]?.text || "No alert to show";

  function getMessageHash(text: string | JSX.Element): string {
    if (typeof text === "string") return sha256(text);
    return sha256(JSON.stringify(text.props));
  }

  function close(): void {
    setAlerts((old) => {
      return old.slice(1);
    });
  }

  return (
    <Modal open={!hidden && alerts.length > 0} onClose={close}>
      <Box overflow="scroll" sx={{ overflowWrap: "break-word", whiteSpace: "pre-line" }}>
        <Typography component={"span"}>{alertMessage}</Typography>
      </Box>
    </Modal>
  );
}
