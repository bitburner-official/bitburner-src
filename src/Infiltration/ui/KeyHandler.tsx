import React, { useEffect } from "react";

interface IProps {
  onKeyDown: (event: KeyboardEvent) => void;
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

  // invisible autofocused element that eats all the keypress for the minigames.
  return <></>;
}
