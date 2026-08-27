import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { monokaiSublime as theme } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Theme } from "@mui/material/styles";
import { CodeProps } from "react-markdown/lib/ast-to-react";
import { Typography } from "@mui/material";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme: Theme) => ({
  pre: {
    borderRadius: "6px",
  },
  code: {
    paddingBottom: "2.72px",
    paddingLeft: "5.44px",
    paddingRight: "5.44px",
    paddingTop: "2.72px",
    borderRadius: "6px",
    display: "inline",
    backgroundColor: theme.palette.background.paper,
  },
}));

export const Pre = (props: React.PropsWithChildren<object>): React.ReactElement => {
  const { classes } = useStyles();
  return (
    <Typography component="span" classes={{ root: classes.pre }}>
      {props.children}
    </Typography>
  );
};

const InlineCode = (props: React.PropsWithChildren<CodeProps>): React.ReactElement => (
  <Typography component="span" classes={{ root: useStyles().classes.code }}>
    {props.children}
  </Typography>
);

const BigCode = (props: React.PropsWithChildren<CodeProps>): React.ReactElement => (
  <SyntaxHighlighter
    language="javascript"
    style={theme}
    customStyle={{
      padding: "16px",
      borderRadius: "6px",
    }}
  >
    {String(props.children)}
  </SyntaxHighlighter>
);

export const code = (props: React.PropsWithChildren<CodeProps>): React.ReactElement =>
  props.inline ? <InlineCode {...props} /> : <BigCode {...props} />;
