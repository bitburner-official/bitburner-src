import React, { useState, useEffect } from "react";
import { EventEmitter } from "../../utils/EventEmitter";
import { Modal } from "./Modal";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { cyrb53 } from "../../utils/HashUtils";
import Button from "@mui/material/Button";

export const AlertEvents = new EventEmitter<[string | JSX.Element, boolean?]>();

interface Alert {
  text: string | JSX.Element;
  hash: string;
  cancellable: boolean;
}

export function AlertManager({ hidden }: { hidden: boolean }): React.ReactElement {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  useEffect(
    () =>
      AlertEvents.subscribe((text: string | JSX.Element, cancellable = true) => {
        const hash = getMessageHash(text);
        setAlerts((old) => {
          if (old.some((a) => a.hash === hash)) {
            return old;
          }
          return [...old, { text, hash, cancellable }];
        });
      }),
    [],
  );

  useEffect(() => {
    function handle(this: Document, event: KeyboardEvent): void {
      if (event.code !== "Escape" || alerts.length === 0 || !alerts[0].cancellable) {
        return;
      }
      close();
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [alerts]);

  const alertMessage = alerts[0]?.text || "No alert to show";
  const cancellable = alerts[0]?.cancellable;

  function getMessageHash(text: string | JSX.Element): string {
    if (typeof text === "string") {
      return cyrb53(text);
    }
    /**
     * JSON.stringify may throw an error in edge cases. One possible error is "TypeError: Converting circular structure
     * to JSON". It may happen in very special cases. This is the flow of one of them:
     * - An error occurred in GameRoot.tsx and we show a warning popup by calling "exceptionAlert" without delaying.
     * - "exceptionAlert" constructs a React element and passes it via "dialogBoxCreate" -> "AlertEvents.emit".
     * - When we receive the final React element here, the element's "props" property may contain a circular structure.
     */
    let textPropsAsString;
    try {
      textPropsAsString = JSON.stringify(text.props);
    } catch (e) {
      console.error(e);
      // Use the current timestamp as the fallback value.
      textPropsAsString = Date.now().toString();
    }
    return cyrb53(textPropsAsString);
  }

  function close(): void {
    setAlerts((old) => {
      return old.slice(1);
    });
  }

  return (
    <Modal open={!hidden && alerts.length > 0} onClose={close} cancellable={cancellable}>
      <Box overflow="scroll" sx={{ overflowWrap: "break-word", whiteSpace: "pre-line" }}>
        <Typography component={"span"}>{alertMessage}</Typography>
      </Box>
      {!cancellable && (
        <Button onClick={close} sx={{ marginTop: "10px" }}>
          OK
        </Button>
      )}
    </Modal>
  );
}
