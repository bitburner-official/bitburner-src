import React, { useEffect, useState } from "react";
import { Settings } from "../../Settings/Settings";

function replace(str: string, i: number, char: string): string {
  return str.substring(0, i) + char + str.substring(i + 1);
}

interface CorruptableTextProps {
  content: string;
  spoiler: boolean;
}

function randomize(char: string, obfuscate: boolean): string {
  const randFrom = (str: string): string => str[Math.floor(Math.random() * str.length)];
  const classes = ["abcdefghijklmnopqrstuvwxyz", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "1234567890", " _", "()[]{}<>"];
  const other = `!@#$%^&*()_+|\\';"/.,?\`~`;

  if (obfuscate && Math.random() < 0.75) {
    return randFrom(other);
  }

  for (const c of classes) {
    if (c.includes(char)) return randFrom(c);
  }

  return randFrom(other);
}

export function CorruptableText(props: CorruptableTextProps): JSX.Element {
  const [content, setContent] = useState(props.content);

  useEffect(() => {
    if (Settings.DisableTextEffects) {
      return;
    }

    setContent(props.content);

    let counter = 5;
    const timers: number[] = [];
    const intervalId = setInterval(() => {
      counter--;
      if (counter > 0) return;
      counter = Math.random() * 5;
      const index = Math.random() * props.content.length;
      const letter = props.content.charAt(index);
      setContent((content) => replace(content, index, randomize(letter, false)));
      timers.push(
        window.setTimeout(() => {
          setContent((content) => replace(content, index, letter));
        }, 500),
      );
    }, 20);

    return () => {
      clearInterval(intervalId);
      timers.forEach((timerId) => clearTimeout(timerId));
    };
  }, [props.content]);

  if (Settings.DisableTextEffects) {
    const spoileredContent = content.replaceAll(/./g, (c) => randomize(c, true));
    return <span>{props.spoiler ? spoileredContent : content}</span>;
  }

  return <span>{content}</span>;
}
