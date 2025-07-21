import React from "react";
import { Link } from "@mui/material";
import { defaultNsApiPage, externalUrlOfNsApiPage, useNavigator } from "../React/Documentation";
import { CorruptibleText } from "../React/CorruptibleText";
import { Player } from "@player";
import { Settings } from "../../Settings/Settings";

export const isSpoiler = (title: string): boolean => title.includes("advanced/") && Player.sourceFileLvl(1) === 0;

export const A = (props: React.PropsWithChildren<{ href?: string }>): React.ReactElement => {
  const navigator = useNavigator();
  const href = props.href ?? "";

  const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    navigator.navigate(href, event.ctrlKey);
  };
  if (href === externalUrlOfNsApiPage) {
    return (
      <Link
        onClick={(event) => {
          navigator.navigate(defaultNsApiPage, event.ctrlKey);
        }}
        color={Settings.theme.info}
        sx={{
          textDecorationThickness: "3px",
          textUnderlineOffset: "5px",
        }}
      >
        {props.children}
      </Link>
    );
  }

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
  return (
    <Link onClick={onClick} component="button" variant="body1" fontSize="inherit">
      {props.children}
    </Link>
  );
};
