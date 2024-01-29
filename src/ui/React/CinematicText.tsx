import React, { Dispatch, SetStateAction, useState } from "react";

import { CinematicLine } from "./CinematicLine";
import { DeadPixels, DeadPixelProps, BlackScreen } from "./VFX";
import { Settings } from "../../Settings/Settings";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Player } from "@player";


interface IProps {
  lines: string[];
  auto?: boolean;
  onDone?: () => void;
  chromaticAberration?: boolean;
  fadeOutMs?: number
  fadeInMs?: number
  delayToDone?: number
}

const FLICKER_CHANCE = 0.25;
const FULLY_OPAQUE_SF_LENGTH = 30;

function rand(offset: number) {
  return Math.random() * 2 * offset - offset;
}

async function waitForMs(millis: number) {
  return await new Promise(
    (resolve) => setTimeout(() => resolve(true), millis)
  );
}

function getRandomFlicker(hex: string, offset: number = 20) {
  const x = rand(offset);
  const y = rand(offset);
  const distance = Math.sqrt(x * x + y * y);
  const opacity = Math.round(distance / offset * 0xFF);
  return `${x}px ${y}px 0px ${hex}${opacity.toString(16).padStart(2, "0")}`;
}

export function CinematicText(props: IProps): React.ReactElement {
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [style, setStyle]: [React.CSSProperties, Dispatch<SetStateAction<React.CSSProperties>>] = useState({});
  const [deadPixels, setDeadPixels] = useState<DeadPixelProps["pixels"]>(new Map())

  const DEAD_PIXELS_RES: DeadPixelProps['size'] = 300;
  const colors = ["#FF0000", "#00FF00", "#0000FF"];

  let glitchAttenuator = 0;
  function advance(): void {
    const newI = i + 1;
    setI(newI);
    onChange();

    if (newI < props.lines.length) {
      return;
    }

    setDone(true);

    if (!props.onDone || !props.auto || props.fadeOutMs !== undefined && Settings.EnableVFX) {
      return;
    }

    props.onDone();
  }

  let glitchLevel = 1;
  for (const sourceFile of Player.sourceFiles) {
    glitchLevel += Math.min(sourceFile[1], 32);
  }


  function onChange() {
    if (!Settings.EnableVFX || !props.chromaticAberration || Math.random() > FLICKER_CHANCE) {
      return;
    }

    const opacity = Math.min(Math.round(glitchLevel / FULLY_OPAQUE_SF_LENGTH * 0xFF), 0xFF);
    glitchAttenuator = i / props.lines.length;
    const glitchEffect = glitchAttenuator * glitchLevel * 0.5;

    setStyle({
      color: Settings.theme.primary + opacity.toString(16).padStart(2, "0"),
      textShadow: colors.map(color => getRandomFlicker(color, glitchEffect)).join(", "),
    });

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
      }
    };

    // const newDeadPixels: DeadPixelProps["pixels"] = [];
    for (let _ = 0; _ < maxPixels; _++) {
      const x = Math.round(Math.random() * interval.amplitude.x + interval.offset.x);
      const y = Math.round(Math.random() * interval.amplitude.y + interval.offset.y);
      const i = y * DEAD_PIXELS_RES + x;

      //This does not need to be a state because the animation is done 
      //with requestAnimationFrame
      deadPixels.set(i, Math.random());
    }
  }

  const shouldFadeOut = props.fadeOutMs !== undefined && props.auto && props.onDone;
  const shouldFadeIn = props.fadeInMs !== undefined;
  return (
    <>
      {
        Settings.EnableVFX && (shouldFadeOut || shouldFadeIn) &&
        <BlackScreen 
          fadeOutMs={props.fadeOutMs} 
          fadeInMs={props.fadeInMs} 
          isFadingIn={!done} 
          onDone={
            async() => done && (await waitForMs(props.delayToDone ?? 0)) && props.onDone && props.onDone()
          }
        ></BlackScreen>
      }

      {Settings.EnableVFX && props.chromaticAberration && <DeadPixels pixels={deadPixels} size={DEAD_PIXELS_RES} />}
      {props.lines.slice(0, i).map((line, i) => (
        <Typography style={style} key={i}>{line}</Typography>
      ))}
      {props.lines.length > i &&
        <CinematicLine
          style={style}
          onChange={onChange}
          key={i}
          text={props.lines[i]}
          onDone={advance}
        />}
      {!props.auto && props.onDone && done && <Button onClick={props.onDone}>Continue ...</Button>}
    </>
  );
}
