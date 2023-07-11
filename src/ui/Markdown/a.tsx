import React from "react";
import { Link } from "@mui/material";
import { useNavigator } from "../React/Documentation";
import { CorruptableText } from "../React/CorruptableText";
import { Player } from "@player";
import makeStyles from "@mui/styles/makeStyles";
import createStyles from "@mui/styles/createStyles";

const useStyles = makeStyles(() =>
  createStyles({
    link: {
      fontSize: "inherit",
    },
  }),
);

export const isSpoiler = (title: string): boolean => title.startsWith("advanced/") && Player.sourceFileLvl(1) === 0;

export const A = (props: React.PropsWithChildren<{ href?: string }>): React.ReactElement => {
  const classes = useStyles();
  const navigator = useNavigator();
  const ref = props.href ?? "";

  const onClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    navigator.navigate(ref, event.ctrlKey);
  };
  if (ref.startsWith("http"))
    return (
      <Link rel="noopener noreferrer" href={props.href} target="_blank">
        {props.children}
      </Link>
    );

  if (isSpoiler(ref)) return <CorruptableText content="UNKNOWN" />;
  return (
    <Link classes={{ root: classes.link }} onClick={onClick} component="button" variant="body1" fontSize="inherit">
      {props.children}
    </Link>
  );
};
