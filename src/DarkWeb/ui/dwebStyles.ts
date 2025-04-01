import { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";

export const dwColors = ["hack", "hp", "money", "int", "cha", "rep", "success"] as const;
export type dwColors = (typeof dwColors)[number];

export const DW_SERVER_WIDTH = 240;
export const DW_SERVER_HEIGHT = 130;
export const DW_SERVER_GAP_TOP = 120;
export const DW_SERVER_GAP_LEFT = 60;
export const MAP_BORDER_WIDTH = 300;

export const dwebStyles = makeStyles<unknown, dwColors>({ uniqId: "dwebStyles" })((theme: Theme, __, __classes) => ({
  DWServer: {
    width: `${DW_SERVER_WIDTH}px`,
    height: `${DW_SERVER_HEIGHT}px`,
    borderWidth: "1px",
    borderStyle: "solid",
    position: "absolute",
    padding: "8px",
    borderRadius: "4px",
    zIndex: 10,
    backgroundColor: theme.colors.backgroundsecondary,
  },
  ServerName: {
    padding: 0,
    width: "86%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  inlineFlexBox: {
    display: "inline-flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  eighty: {
    width: "80%",
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
}));
