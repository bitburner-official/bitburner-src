import React from "react";
import { Link } from "@mui/material";
import { relativeUrlOfNsApiPage, useNavigator } from "../React/Documentation";
import { CorruptibleText } from "../React/CorruptibleText";
import { Player } from "@player";
import { Settings } from "../../Settings/Settings";

export const isSpoiler = (title: string): boolean => title.includes("advanced/") && Player.sourceFileLvl(1) === 0;

export const A = (props: React.PropsWithChildren<{ href?: string }>): React.ReactElement => {
  const navigator = useNavigator();
  const href = props.href ?? "";

  if (isSpoiler(href)) {
    return (
      <span
        style={{
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        <CorruptibleText content={String(props.children)} spoiler={true} />
      </span>
    );
  }

  const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    navigator.navigate(href, event.ctrlKey);
  };
  const sx = href.includes(relativeUrlOfNsApiPage)
    ? {
        textDecorationThickness: "3px",
        textUnderlineOffset: "5px",
        color: Settings.theme.info,
      }
    : {};
  return (
    <Link onClick={onClick} component="button" variant="body1" fontSize="inherit" sx={sx}>
      {props.children}
    </Link>
  );
};
