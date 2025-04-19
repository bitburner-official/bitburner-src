import { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";

export const dwColors = ["hack", "hp", "money", "int", "cha", "rep", "success"] as const;
export type dwColors = (typeof dwColors)[number];

export const DW_SERVER_WIDTH = 240;
export const DW_SERVER_HEIGHT = 130;
export const DW_SERVER_GAP_TOP = 120;
export const DW_SERVER_GAP_LEFT = 60;
export const MAP_BORDER_WIDTH = 300;

export const dnetStyles = makeStyles<unknown, dwColors>({ uniqId: "dnetStyles" })((theme: Theme, __, __classes) => ({
  DWServer: {
    width: `${DW_SERVER_WIDTH}px`,
    height: `${DW_SERVER_HEIGHT}px`,
    borderWidth: "1px",
    borderStyle: "solid",
    position: "absolute",
    padding: "8px",
    borderRadius: "4px",
    zIndex: 10,
    cursor: "auto",
    backgroundColor: "#000",
    ["&:hover"]: {
      backgroundColor: "#333",
    },
  },
  serverContainer: {
    mx: 1,
    padding: 0,
    margin: 0,
  },
  NetWrapper: {
    width: "100%",
    height: "90vh",
    overflow: "scroll",
    position: "relative",
    border: "solid 1px slategray",
  },
  ServerName: {
    padding: 0,
    width: "86%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
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
    right: "7px",
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
  gold: {
    color: theme.colors.money,
  },
  red: {
    color: theme.colors.hp,
  },
  paddingRight: {
    paddingRight: "3px",
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
    borderColor: "green",
  },
  grey: {
    borderColor: "grey",
  },
  goldBorder: {
    borderColor: "gold",
  },
}));
