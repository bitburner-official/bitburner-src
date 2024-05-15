import React, { useState, useEffect } from "react";

interface IProps {
  text: string;
  onChange?: () => void;
  onDone?: () => void;
  style?: React.CSSProperties;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function CinematicLine(props: IProps): React.ReactElement {
  const [length, setLength] = useState(0);
  const [done, setDone] = useState(false);

  function advance(): void {
    const newLength = length + 1;
    setLength(newLength);
    setDone(newLength >= props.text.length);
    if (props.onChange) {
      props.onChange();
    }
  }

  useEffect(() => {
    if (done && props.onDone) {
      props.onDone();
      return;
    }
    let cancel = false;
    (async () => {
      await sleep(10).then(() => !cancel && advance());
    })();
    return () => {
      cancel = true;
    };
  });
  return (
    <>
      {props.text.slice(0, length)}
      {!done && <span>&#9608;</span>}
    </>
  );
}
