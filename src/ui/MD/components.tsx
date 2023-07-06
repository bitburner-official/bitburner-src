import React from "react";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import createStyles from "@mui/styles/createStyles";
import {
  List,
  ListItemText,
  Table,
  TableCell,
  TableCellBaseProps,
  TableCellProps,
  TableRow,
  Typography,
} from "@mui/material";
import { LiProps, TableDataCellProps, TableHeaderCellProps } from "react-markdown/lib/ast-to-react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    th: { whiteSpace: "pre", fontWeight: "bold" },
    td: { whiteSpace: "pre" },
    blockquote: {
      borderLeftColor: theme.palette.background.paper,
      borderLeftStyle: "solid",
      borderLeftWidth: "4px",
      paddingLeft: "16px",
      paddingRight: "16px",
    },
  }),
);

export const h1 = (props: React.PropsWithChildren<{}>): React.ReactElement => (
  <Typography variant="h1">{props.children}</Typography>
);

export const h2 = (props: React.PropsWithChildren<{}>): React.ReactElement => (
  <Typography variant="h2">{props.children}</Typography>
);

export const h3 = (props: React.PropsWithChildren<{}>): React.ReactElement => (
  <Typography variant="h3">{props.children}</Typography>
);

export const h4 = (props: React.PropsWithChildren<{}>): React.ReactElement => (
  <Typography variant="h4">{props.children}</Typography>
);

export const h5 = (props: React.PropsWithChildren<{}>): React.ReactElement => (
  <Typography variant="h5">{props.children}</Typography>
);

export const h6 = (props: React.PropsWithChildren<{}>): React.ReactElement => (
  <Typography variant="h6">{props.children}</Typography>
);

export const li = (props: React.PropsWithChildren<LiProps>): React.ReactElement => {
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

export const td = (props: React.PropsWithChildren<TableDataCellProps>): React.ReactElement => {
  const classes = useStyles();
  const align = fixAlign(props.style?.textAlign);
  return (
    <TableCell align={align}>
      <Typography align={align} classes={{ root: classes.td }}>
        {props.children}
      </Typography>
    </TableCell>
  );
};

export const th = (props: React.PropsWithChildren<TableHeaderCellProps>): React.ReactElement => {
  const classes = useStyles();
  const align = fixAlign(props.style?.textAlign);
  return (
    <TableCell align={align}>
      <Typography align={align} classes={{ root: classes.th }}>
        {props.children}
      </Typography>
    </TableCell>
  );
};

export const table = (props: React.PropsWithChildren<{}>): React.ReactElement => {
  return <Table sx={{ width: "inherit" }}>{props.children}</Table>;
};

export const tr = (props: React.PropsWithChildren<{}>): React.ReactElement => {
  return <TableRow>{props.children}</TableRow>;
};

export const blockquote = (props: React.PropsWithChildren<{}>): React.ReactElement => {
  const classes = useStyles();
  return <blockquote className={classes.blockquote}>{props.children}</blockquote>;
};
