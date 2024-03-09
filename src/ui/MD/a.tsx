import React from "react";
import { Link } from "@mui/material";
import { useNavigator } from "../React/Documentation";
import { CorruptableText } from "../React/CorruptableText";
import { Player } from "@player";

export const isSpoiler = (title: string): boolean => title.includes("advanced/") && Player.sourceFileLvl(1) === 0;

export const A = (props: React.PropsWithChildren<{ href?: string }>): React.ReactElement => {
  const navigator = useNavigator();
  const ref = props.href ?? "";

  const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    navigator.navigate(ref, event.ctrlKey);
  };
  if (ref.startsWith("http"))
    return (
      <Link rel="noopener noreferrer" href={props.href} target="_blank">
        {props.children}
      </Link>
    );

  if (isSpoiler(ref))
    return (
      <span
        style={{
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        <CorruptableText content={props.children + ""} spoiler={true} />
      </span>
    );
  return (
    <Link onClick={onClick} component="button" variant="body1" fontSize="inherit">
      {props.children}
    </Link>
  );
};
