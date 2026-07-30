import { IPredefinedTheme } from "../../Themes";
import img1 from "./screenshot.png";

export const Theme: IPredefinedTheme = {
  name: "Catppuccin Mocha",
  description: "Dark pastel theme based on the Catppuccin Mocha palette.",
  credit: "Suniltwo",
  reference: "https://catppuccin.com/palette",
  screenshot: img1,
  colors: {
    primarylight: "#B4BEFE",
    primary: "#89B4FA",
    primarydark: "#74C7EC",

    successlight: "#A6E3A1",
    success: "#A6E3A1",
    successdark: "#94E2D5",

    errorlight: "#F38BA8",
    error: "#F38BA8",
    errordark: "#EBA0AC",

    secondarylight: "#BAC2DE",
    secondary: "#A6ADC8",
    secondarydark: "#6C7086",

    warninglight: "#F9E2AF",
    warning: "#FAB387",
    warningdark: "#EBA0AC",

    infolight: "#89DCEB",
    info: "#74C7EC",
    infodark: "#89B4FA",

    welllight: "#313244",
    well: "#1E1E2E",

    white: "#CDD6F4",
    black: "#11111B",

    hp: "#F38BA8",
    money: "#F9E2AF",
    hack: "#A6E3A1",
    combat: "#CDD6F4",
    cha: "#CBA6F7",
    int: "#89B4FA",
    rep: "#94E2D5",
    disabled: "#6C7086",

    backgroundprimary: "#11111B",
    backgroundsecondary: "#181825",

    button: "#313244",

    maplocation: "#CDD6F4",

    bnlvl0: "#F9E2AF",
    bnlvl1: "#F38BA8",
    bnlvl2: "#94E2D5",
    bnlvl3: "#89B4FA",
  },
};
