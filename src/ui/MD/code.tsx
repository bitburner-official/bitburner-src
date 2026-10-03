import React from "react";
import { default as HljsHighlighter } from "react-syntax-highlighter";
import { monokaiSublime } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CodeProps } from "react-markdown/lib/ast-to-react";
import { Typography } from "@mui/material";

export const Pre = (props: React.PropsWithChildren<object>): React.ReactElement => {
  return (
    <Typography component="span" sx={{ borderRadius: "6px" }}>
      {props.children}
    </Typography>
  );
};

const InlineCode = (props: React.PropsWithChildren<CodeProps>): React.ReactElement => (
  <Typography
    component="span"
    sx={{
      paddingBottom: "2.72px",
      paddingLeft: "5.44px",
      paddingRight: "5.44px",
      paddingTop: "2.72px",
      borderRadius: "6px",
      display: "inline",
      backgroundColor: (theme) => theme.palette.background.paper,
    }}
  >
    {props.children}
  </Typography>
);

const BigCode = (props: React.PropsWithChildren<CodeProps>): React.ReactElement => {
  let language = props.className?.startsWith("language-") ? props.className.slice("language-".length) : "text";
  // In documentation, we usually use "js" after triple backticks, so the class name is usually "language-js".
  // The highlighter does not recognize "js" as an alias for "javascript", so we need to normalize the language name
  // here.
  switch (language) {
    case "js":
      language = "javascript";
      break;
    case "ts":
      language = "typescript";
      break;
  }
  return (
    <HljsHighlighter
      language={language}
      style={monokaiSublime}
      customStyle={{
        padding: "16px",
        borderRadius: "6px",
      }}
    >
      {String(props.children)}
    </HljsHighlighter>
  );
};

export const code = (props: React.PropsWithChildren<CodeProps>): React.ReactElement =>
  props.inline ? <InlineCode {...props} /> : <BigCode {...props} />;
