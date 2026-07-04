import { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import { Settings } from "../../Settings/Settings";

export const dwColors = ["hack", "hp", "money", "int", "cha", "rep", "success"] as const;
export type dwColors = (typeof dwColors)[number];

export const DW_SERVER_WIDTH = 240;
export const DW_SERVER_HEIGHT = 130;
export const DW_SERVER_GAP_TOP = 120;
export const DW_SERVER_GAP_LEFT = 60;
export const MAP_BORDER_WIDTH = 300;

export const dnetStyles = makeStyles<unknown, dwColors>({ uniqId: "dnetStyles" })((theme: Theme, __, __classes) => ({
  DWServer: {
    "&:hover": {
      backgroundColor: theme.colors.well + " !important",
    },
  },
  NetWrapper: {
    width: "100%",
    height: "calc(100vh - 80px)",
    overflow: "scroll",
    position: "relative",
    border: "solid 1px " + theme.colors.secondary,
  },
  button: {
    color: theme.colors.white,
  },
  maze: {
    color: theme.colors.white,
    lineHeight: 0.55,
  },
  hiddenInput: {
    width: 0,
    height: 0,
    padding: 0,
    margin: 0,
    opacity: 0,
  },
  zoomContainer: {
    position: "absolute",
    top: "calc(90vh - 38px)",
    marginLeft: "1px",
    display: "grid",
    zIndex: 20,
    ["& > button"]: {
      width: "40px",
      minWidth: "40px !important",
    },
  },
  inlineFlexBox: {
    display: "inline-flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  noPadding: {
    padding: 0,
  },
  paddingRight: {
    paddingRight: "3px",
  },
  serverStatusIcon: {
    paddingRight: "3px",
    position: "relative",
    bottom: "-4px",
  },
  gold: {
    color: theme.colors.money,
  },
  blue: {
    color: theme.colors.int,
  },
  red: {
    color: theme.colors.hp,
  },
  white: {
    color: theme.colors.white,
  },
  authButton: {
    ["&:disabled"]: {
      opacity: 0.5,
    },
  },
  hack: {
    borderColor: theme.colors.hack,
  },
  hp: {
    borderColor: theme.colors.hp,
  },
  money: {
    borderColor: theme.colors.money,
  },
  int: {
    borderColor: theme.colors.int,
  },
  cha: {
    borderColor: theme.colors.cha,
  },
  rep: {
    borderColor: theme.colors.rep,
  },
  success: {
    borderColor: theme.colors.success,
  },
  green: {
    borderColor: theme.colors.primary,
  },
  grey: {
    borderColor: theme.colors.secondary,
  },
  goldBorder: {
    borderColor: theme.colors.money,
  },
  serverDetailsText: {
    marginLeft: "-2em",
    textIndent: "2em",
    color: theme.colors.secondary,
  },
}));

/*
   React by default creates a new <style> element with duplicate css for each copy of each component that uses makeStyles.
   To reduce the performance impact of that option, these styles are defined as an object literal and applied directly to
   the element's style attribute. Also included is the relevant styles for Mui Button, for the same reason.

   This is done instead of adding hundreds of <style> tags into the DOM, which in some cases took multiple seconds
   waiting for insertBefore calls and reflowing the page when loading the darknet UI view.
 */
export const DWServerStyles = () => ({
  width: `${DW_SERVER_WIDTH}px`,
  height: `${DW_SERVER_HEIGHT}px`,
  borderWidth: "1px",
  borderStyle: "solid",
  padding: "8px",
  borderRadius: "4px",
  zIndex: 10,
  cursor: "auto",
  backgroundColor: Settings.theme.backgroundprimary,

  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  outline: 0,
  margin: 0,
  verticalAlign: "middle",
  textDecoration: "none",
  fontFamily: 'JetBrainsMono, "Courier New", monospace',
  fontWeight: 500,
  fontSize: "0.875rem",
  lineHeight: 1.75,
  transition:
    "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
  color: Settings.theme.primary,
});
export const DWServerLogStyles = { fontFamily: 'JetBrainsMono, "Courier New", monospace', fontSize: "12px" };

export const ServerName = {
  padding: 0,
  width: "86%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
