import { Link } from "@mui/material";
import React from "react";
import { useNavigator } from "../React/Documentation";
import { CorruptableText } from "../React/CorruptableText";
import { Player } from "@player";

export const isSpoiler = (title: string): boolean => title.startsWith("advanced/") && Player.sourceFileLvl(1) === 0;

export const A = (props: React.PropsWithChildren<{ href?: string }>): React.ReactElement => {
  const navigator = useNavigator();
  const ref = props.href ?? "";
  if (ref.startsWith("http"))
    return (
      <Link rel="noopener noreferrer" href={props.href} target="_blank">
        {props.children}
      </Link>
    );

  if (isSpoiler(ref)) return <CorruptableText content="UNKNOWN" />;
  return <Link onClick={() => navigator.navigate(ref)}>{props.children}</Link>;
};
