import React from "react";
import { Theme } from "@mui/material/styles";
import { ListItemText, Table, TableCell, TableCellProps, TableRow, Typography } from "@mui/material";
import { makeStyles } from "tss-react/mui";
const useStyles = makeStyles()((theme: Theme) => ({
  th: { whiteSpace: "pre", fontWeight: "bold" },
  td: { whiteSpace: "pre" },
  blockquote: {
    borderLeftColor: theme.palette.background.paper,
    borderLeftStyle: "solid",
    borderLeftWidth: "4px",
    paddingLeft: "16px",
    paddingRight: "16px",
  },
}));

export const h1 = (props: JSX.IntrinsicElements["h1"]): React.ReactElement => (
  // We are just going to cheat and lower every h# by 1.
  <Typography variant="h2">{props.children}</Typography>
);

export const h2 = (props: JSX.IntrinsicElements["h2"]): React.ReactElement => (
  // We are just going to cheat and lower every h# by 1.
  <Typography variant="h3">{props.children}</Typography>
);

export const h3 = (props: JSX.IntrinsicElements["h3"]): React.ReactElement => (
  // We are just going to cheat and lower every h# by 1.
  <Typography variant="h4">{props.children}</Typography>
);

export const h4 = (props: JSX.IntrinsicElements["h4"]): React.ReactElement => (
  // We are just going to cheat and lower every h# by 1.
  <Typography variant="h5">{props.children}</Typography>
);

export const h5 = (props: JSX.IntrinsicElements["h5"]): React.ReactElement => (
  // We are just going to cheat and lower every h# by 1.
  <Typography variant="h6">{props.children}</Typography>
);

export const h6 = (props: JSX.IntrinsicElements["h6"]): React.ReactElement => (
  // Except for h6, that's going to stay h6. If there's complaints we'll figure it out.
  <Typography variant="h6">{props.children}</Typography>
);

export const p = (props: JSX.IntrinsicElements["p"]): React.ReactElement => (
  <Typography sx={{ mb: 1 }}>{props.children}</Typography>
);

export const li = (props: JSX.IntrinsicElements["li"]): React.ReactElement => {
  // FIXME: .ordered and .index are not defined automatically
  const prefix = props.ordered ? `${props.index + 1}. ` : "· ";
  return (
    <ListItemText>
      {prefix}
      {props.children}
    </ListItemText>
  );
};

// This function is needed because native td have different values for `align` than Mui TableCell.
// I really hate the implementation but I don't know how to get typescript to cooperate.
const fixAlign = (align: React.CSSProperties["textAlign"]): TableCellProps["align"] => {
  if (align === "-moz-initial") return "inherit";
  if (align === "initial") return "inherit";
  if (align === "revert") return "inherit";
  if (align === "revert-layer") return "inherit";
  if (align === "unset") return "inherit";
  if (align === "end") return "inherit";
  if (align === "start") return "inherit";
  if (align === "match-parent") return "inherit";
  return align;
};

export const Td = (props: JSX.IntrinsicElements["td"]): React.ReactElement => {
  const { classes } = useStyles();
  const align = fixAlign(props.style?.textAlign);
  // FIXME: children isn't nescesarily an array
  const content = Array.isArray(props.children)
    ? props.children?.map((child, i) => {
        if (child === "<br />") return <br key={i} />;
        return child;
      })
    : props.children;
  return (
    <TableCell align={align}>
      <Typography align={align} classes={{ root: classes.td }}>
        {content}
      </Typography>
    </TableCell>
  );
};

export const Th = (props: JSX.IntrinsicElements["td"]): React.ReactElement => {
  const { classes } = useStyles();
  const align = fixAlign(props.style?.textAlign);

  return (
    <TableCell align={align}>
      <Typography align={align} classes={{ root: classes.th }}>
        {props.children}
      </Typography>
    </TableCell>
  );
};

export const table = (props: JSX.IntrinsicElements["table"]): React.ReactElement => {
  return <Table sx={{ width: "inherit" }}>{props.children}</Table>;
};

export const tr = (props: JSX.IntrinsicElements["tr"]): React.ReactElement => {
  return <TableRow>{props.children}</TableRow>;
};

export const Blockquote = (props: JSX.IntrinsicElements["blockquote"]): React.ReactElement => {
  const { classes } = useStyles();
  return <blockquote className={classes.blockquote}>{props.children}</blockquote>;
};
