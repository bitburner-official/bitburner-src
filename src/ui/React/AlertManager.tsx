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
  /**
   * If it's true, the player can dismiss the modal by pressing the Esc button or clicking on the backdrop.
   *
   * Note that there are 2 different behaviors when pressing the Esc button, depending on whether the player focused on
   * the modal. If they focused on the modal and canBeDismissedEasily is false, the modal would not be dismissed. If
   * they did not, pressing the Esc button would always dismiss **all** popups in the queue maintained by this manager.
   */
  canBeDismissedEasily: boolean;
}

export function AlertManager({ hidden }: { hidden: boolean }): React.ReactElement {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  useEffect(
    () =>
      AlertEvents.subscribe((text: string | JSX.Element, canBeDismissedEasily = true) => {
        const hash = getMessageHash(text);
        setAlerts((old) => {
          if (old.some((a) => a.hash === hash)) {
            return old;
          }
          return [...old, { text, hash, canBeDismissedEasily }];
        });
      }),
    [],
  );

  useEffect(() => {
    function handle(this: Document, event: KeyboardEvent): void {
      if (event.code !== "Escape") {
        return;
      }
      setAlerts([]);
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [alerts]);

  const alertMessage = alerts[0]?.text || "No alert to show";
  const canBeDismissedEasily = alerts[0]?.canBeDismissedEasily;

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
    <Modal open={!hidden && alerts.length > 0} onClose={close} canBeDismissedEasily={canBeDismissedEasily}>
      <Box overflow="scroll" sx={{ overflowWrap: "break-word", whiteSpace: "pre-line" }}>
        <Typography component={"span"}>{alertMessage}</Typography>
      </Box>
      {!canBeDismissedEasily && (
        <Button onClick={close} sx={{ marginTop: "10px" }}>
          OK
        </Button>
      )}
    </Modal>
  );
}
