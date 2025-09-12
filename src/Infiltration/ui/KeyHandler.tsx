import React, { useEffect } from "react";
import { InfiltrationKeyEvents } from "../State";

interface IProps {
  onKeyDown: (this: IProps, event: KeyboardEvent) => void;
  onFailure: (options?: { automated: boolean }) => void;
}

export function KeyHandler(props: IProps): React.ReactElement {
  useEffect(() => {
    function press(event: KeyboardEvent): void {
      if (!event.isTrusted || !(event instanceof KeyboardEvent)) {
        props.onFailure({ automated: true });
        return;
      }
      props.onKeyDown(event);
    }
    document.addEventListener("keydown", press);
    return () => document.removeEventListener("keydown", press);
  });
  // This creates untrusted events, but that's fine because the trusted
  // filtering only happens above, for events that come in via event listener.
  useEffect(
    () =>
      InfiltrationKeyEvents.subscribe((key: string) => {
        props.onKeyDown(new KeyboardEvent("keydown", { key }));
      }),
    [props],
  );

  // invisible autofocused element that eats all the keypress for the minigames.
  return <></>;
}
