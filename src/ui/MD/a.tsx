import { Link } from "@mui/material";
import React from "react";
import { useNavigator } from "../../Tutorial/ui/TutorialRoot";
import { isSpoiler } from "../../Tutorial/ui/spoilers";
import { CorruptableText } from "../React/CorruptableText";

export const a = (props: React.PropsWithChildren<{ href?: string }>): React.ReactElement => {
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
