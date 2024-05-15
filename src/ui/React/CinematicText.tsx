import React, { useState } from "react";

import { CinematicLine } from "./CinematicLine";
import { DeadPixels, DeadPixelProps, BlackScreen, GlitchyTypography, HexColor } from "./VFX";
import { Settings } from "../../Settings/Settings";
import Button from "@mui/material/Button";
import { Player } from "@player";

interface IProps {
  lines: string[];
  auto?: boolean;
  onDone?: () => void;
  chromaticAberration?: boolean;
  fadeOutMs?: number;
  fadeInMs?: number;
  delayToDone?: number;
}

const FLICKER_CHANCE = 0.1;
const FULLY_OPAQUE_SF_LENGTH = 30;

async function waitForMs(millis: number) {
  return await new Promise((resolve) => setTimeout(() => resolve(true), millis));
}

export function CinematicText({
  lines,
  auto = false,
  onDone = undefined,
  chromaticAberration = false,
  fadeOutMs = undefined,
  fadeInMs = undefined,
  delayToDone = 0,
}: IProps): React.ReactElement {
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [deadPixels, __setDeadPixels] = useState<DeadPixelProps["pixels"]>(new Map());

  const DEAD_PIXELS_RES: DeadPixelProps["size"] = 300;
  const colors: HexColor[] = ["#FF0000", "#00FF00", "#0000FF"];

  function advance(): void {
    const newI = i + 1;
    setI(newI);
    onChange();

    if (newI < lines.length) {
      return;
    }

    setDone(true);

    if (!onDone || !auto || (fadeOutMs !== undefined && Settings.EnableVFX)) {
      return;
    }

    onDone();
  }

  let glitchLevel = 1;
  for (const sourceFile of Player.sourceFiles) {
    glitchLevel += Math.min(sourceFile[1], 32);
  }

  const opacity = Math.min(Math.round((glitchLevel / FULLY_OPAQUE_SF_LENGTH) * 0xff), 0xff);
  const style: React.CSSProperties = {
    color: Settings.theme.primary + opacity.toString(16).padStart(2, "0"),
  };

  const glitchAttenuator = i / lines.length;
  const glitchEffect = glitchAttenuator * glitchLevel * 0.5;

  function onChange() {
    if (!Settings.EnableVFX || !chromaticAberration || Math.random() > FLICKER_CHANCE) {
      return;
    }

    addDeadPixels();
  }

  function addDeadPixels() {
    const maxPixels = Math.round(Math.random() * glitchLevel * 4);
    // const pixelSize = {
    //   x: 10,
    //   y: 5,
    // };

    const interval = {
      offset: {
        x: Math.random() * 0.8 * DEAD_PIXELS_RES,
        y: Math.random() * 0.8 * DEAD_PIXELS_RES,
      },
      amplitude: {
        x: Math.random() * 0.2 * DEAD_PIXELS_RES,
        y: Math.random() * 0.2 * DEAD_PIXELS_RES,
      },
    };

    // const newDeadPixels: DeadPixel"pixels"] = [];
    for (let _ = 0; _ < maxPixels; _++) {
      const x = Math.round(Math.random() * interval.amplitude.x + interval.offset.x);
      const y = Math.round(Math.random() * interval.amplitude.y + interval.offset.y);
      const i = y * DEAD_PIXELS_RES + x;

      //This does not need to be a state because the animation is done
      //with requestAnimationFrame
      deadPixels.set(i, Math.random());
    }
  }

  const shouldFadeOut = fadeOutMs !== undefined && auto && onDone;
  const shouldFadeIn = fadeInMs !== undefined;

  return (
    <>
      {Settings.EnableVFX && (shouldFadeOut || shouldFadeIn) && (
        <BlackScreen
          fadeOutMs={fadeOutMs}
          fadeInMs={fadeInMs}
          isFadingIn={!done}
          onDone={async () => done && (await waitForMs(delayToDone ?? 0)) && onDone && onDone()}
        ></BlackScreen>
      )}

      {Settings.EnableVFX && chromaticAberration && <DeadPixels pixels={deadPixels} size={DEAD_PIXELS_RES} />}

      <GlitchyTypography
        maxOffset={glitchEffect * Number(Settings.EnableVFX && chromaticAberration)}
        colors={colors}
        intervalMs={10}
        probability={0.05}
        style={style}
      >
        <>
          {lines.slice(0, i).flatMap((element, i) => [element, <br key={"br_" + i} />])}
          {lines.length > i && <CinematicLine onChange={onChange} key={i} text={lines[i]} onDone={advance} />}
        </>
      </GlitchyTypography>

      {!auto && onDone && done && <Button onClick={onDone}>Continue ...</Button>}
    </>
  );
}
