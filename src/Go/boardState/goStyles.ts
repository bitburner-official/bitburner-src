import { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import { keyframes } from "tss-react";

type Size = "fiveByFive" | "sevenBySeven" | "nineByNine" | "thirteenByThirteen" | "nineteenByNineteen";
type Point =
  | "blackPoint"
  | "whitePoint"
  | "innerPoint"
  | "filledPoint"
  | "emptyPoint"
  | "broken"
  | "tradStone"
  | "priorStoneTrad";
type Structure = "coordinates" | "liberty" | "northLiberty" | "eastLiberty" | "westLiberty" | "southLiberty";
type Highlight = "hover" | "valid" | "priorPoint";

const fadeLoop = keyframes`
    0% {
        opacity: 0.4;
    }
    100% {
        opacity: 1;
    }
`;

export const pointStyle = makeStyles<void, Size | Point | Structure | Highlight>({ uniqId: "pointStyle" })(
  (theme: Theme, _, classes) => ({
    hover: {},
    valid: {},
    priorPoint: {},
    point: {
      position: "relative",
      height: "100%",
      width: "100%",

      [`&.${classes.hover}.${classes.valid}:hover .${classes.innerPoint}`]: {
        outlineColor: theme.colors.white,
      },
      [`&.${classes.hover}.${classes.priorPoint} .${classes.innerPoint}`]: {
        outlineColor: theme.colors.white,
      },
      [`&.${classes.hover}.${classes.priorPoint} .${classes.priorStoneTrad}.${classes.blackPoint}`]: {
        outlineColor: theme.colors.white,
        display: "block",
      },
      [`&.${classes.hover}.${classes.priorPoint} .${classes.priorStoneTrad}.${classes.whitePoint}`]: {
        outlineColor: theme.colors.black,
        display: "block",
      },
      [`&.${classes.hover}:hover .${classes.coordinates}`]: {
        display: "block",
      },
      [`&:hover .${classes.broken}`]: {
        opacity: "0.4",
      },
    },
    broken: {
      backgroundImage: `repeating-radial-gradient(circle at 17% 32%, ${theme.colors.white}, black 0.00085px)`,
      backgroundPosition: "center",
      animation: `$static 5s linear infinite`,
      opacity: "0",
      margin: "8px",
      borderRadius: "4px",
      width: "83%",
      height: "83%",
      transition: "all 0.3s",
      [`& .${classes.coordinates}`]: {
        fontSize: "10px",
      },
    },
    "@keyframes static": {
      from: {
        backgroundSize: "100% 100%",
      },
      to: {
        backgroundSize: "200% 200%",
      },
    },
    hideOverflow: {
      overflow: "hidden",
    },
    traditional: {
      [`& .${classes.innerPoint}`]: {
        display: "none",
      },
      [`& .${classes.broken}`]: {
        backgroundImage: "none",
        backgroundColor: theme.colors.black,
      },
      [`& .${classes.tradStone}`]: {
        display: "block",
      },
      [`& .${classes.liberty}`]: {
        backgroundColor: theme.colors.black,
        transition: "none",
        [`&:not(.${classes.northLiberty}):not(.${classes.southLiberty}):not(.${classes.eastLiberty}):not(.${classes.westLiberty})`]:
          {
            width: 0,
            height: 0,
          },
      },
      [`& .${classes.northLiberty}, & .${classes.southLiberty}`]: {
        width: "0.9px",
      },
      [`& .${classes.eastLiberty}, & .${classes.westLiberty}`]: {
        height: "0.9px",
      },
      [`&.${classes.nineteenByNineteen}`]: {
        [`& .${classes.blackPoint}`]: {
          "&:before": {
            backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.black} 65%), radial-gradient(calc(min(30px, 5vw)) at 42% 38%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.25) 35%, transparent 36%)`,
          },
        },
        [`& .${classes.whitePoint}`]: {
          "&:before": {
            backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.white} 65%), radial-gradient(calc(min(30px, 5vw)) at 42% 38%, white 0%, white 35%, transparent 36%)`,
          },
        },
        [`& .${classes.coordinates}`]: {
          fontSize: "0.9vw",
        },
      },
      [`&.${classes.thirteenByThirteen}`]: {
        [`& .${classes.blackPoint}`]: {
          "&:before": {
            backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.black} 65%), radial-gradient(calc(min(40px, 6vw)) at 42% 38%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.25) 35%, transparent 36%)`,
          },
        },
        [`& .${classes.whitePoint}`]: {
          "&:before": {
            backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.white} 65%), radial-gradient(calc(min(40px, 6vw)) at 42% 38%, white 0%, white 35%, transparent 36%)`,
          },
        },
        [`& .${classes.coordinates}`]: {
          fontSize: "0.9vw",
        },
      },
      [`&.${classes.nineByNine}`]: {
        [`& .${classes.blackPoint}`]: {
          "&:before": {
            backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.black} 65%), radial-gradient(calc(min(60px, 7vw)) at 42% 38%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.25) 35%, transparent 36%)`,
          },
        },
        [`& .${classes.whitePoint}`]: {
          "&:before": {
            backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.white} 65%), radial-gradient(calc(min(60px, 7vw)) at 42% 38%, white 0%, white 35%, transparent 36%)`,
          },
        },
      },
      [`&.${classes.sevenBySeven}`]: {
        [`& .${classes.blackPoint}`]: {
          "&:before": {
            backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.black} 65%), radial-gradient(calc(min(80px, 8vw)) at 42% 38%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.25) 35%, transparent 36%)`,
          },
        },
        [`& .${classes.whitePoint}`]: {
          "&:before": {
            backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.white} 65%), radial-gradient(calc(min(80px, 8vw)) at 42% 38%, white 0%, white 35%, transparent 36%)`,
          },
        },
      },
      [`& .${classes.coordinates}`]: {
        color: "black",
        left: "15%",
      },
      [`& .${classes.blackPoint} ~ .${classes.coordinates}`]: {
        color: theme.colors.white,
      },
    },
    fiveByFive: {
      [`& .${classes.blackPoint}`]: {
        backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.black} 65%), radial-gradient(calc(min(35px, 4vw)) at 42% 38%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.25) 35%, transparent 36%)`,
      },
      [`& .${classes.whitePoint}`]: {
        backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.white} 65%), radial-gradient(calc(min(35px, 4vw)) at 42% 38%, white 0%, white 35%, transparent 36%)`,
      },
    },
    sevenBySeven: {
      [`& .${classes.blackPoint}`]: {
        backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.black} 65%), radial-gradient(calc(min(23px, 3vw)) at 42% 38%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.25) 35%, transparent 36%)`,
      },
      [`& .${classes.whitePoint}`]: {
        backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.white} 65%), radial-gradient(calc(min(25px, 3vw)) at 42% 38%, white 0%, white 35%, transparent 36%)`,
      },
    },
    nineByNine: {
      [`& .${classes.filledPoint}`]: {
        boxShadow: "0px 0px 30px hsla(0, 100%, 100%, 0.48)",
      },
      [`& .${classes.blackPoint}`]: {
        backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.black} 65%), radial-gradient(calc(min(15px, 2vw)) at 42% 38%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.25) 35%, transparent 36%)`,
      },
      [`& .${classes.whitePoint}`]: {
        backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.white} 65%), radial-gradient(calc(min(15px, 2vw)) at 42% 38%, white 0%, white 35%, transparent 36%)`,
      },
    },
    thirteenByThirteen: {
      [`& .${classes.filledPoint}`]: {
        boxShadow: "0px 0px 18px hsla(0, 100%, 100%, 0.48)",
      },
      [`& .${classes.blackPoint}`]: {
        backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.black} 65%), radial-gradient(calc(min(10px, 1.5vw)) at 42% 38%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.25) 35%, transparent 36%)`,
      },
      [`& .${classes.whitePoint}`]: {
        backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.white} 65%), radial-gradient(calc(min(10px, 1.5vw)) at 42% 38%, white 0%, white 35%, transparent 36%)`,
      },
    },
    nineteenByNineteen: {
      [`& .${classes.filledPoint}`]: {
        boxShadow: "0px 0px 18px hsla(0, 100%, 100%, 0.48)",
      },
      [`& .${classes.blackPoint}`]: {
        backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.black} 65%), radial-gradient(calc(min(10px, 1.5vw)) at 42% 38%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.25) 35%, transparent 36%)`,
      },
      [`& .${classes.whitePoint}`]: {
        backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.white} 65%), radial-gradient(calc(min(10px, 1.5vw)) at 42% 38%, white 0%, white 35%, transparent 36%)`,
      },

      [`& .${classes.innerPoint}`]: {
        width: "70%",
        height: "70%",
        margin: "15%",
      },
    },
    tradStone: {
      display: "none",
      borderRadius: "50%",
      margin: 0,

      "&:before": {
        zIndex: 2,
        borderRadius: "50%",
        bottom: 0,
        content: '" "',
        display: "block",
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
      },
      "&:after": {
        boxShadow: "2.5px 4px 0.5em hsla(0, 0%, 0%, 0.5)",
        zIndex: 1,
        borderRadius: "50%",
        bottom: 0,
        content: '" "',
        display: "block",
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
      },

      [`&.${classes.blackPoint}`]: {
        position: "static",
        outlineWidth: 0,
        width: 0,
        height: 0,
        margin: 0,

        "&:before": {
          backgroundColor: theme.colors.black,
          backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.black} 65%), radial-gradient(calc(min(150px, 11vw)) at 42% 38%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.25) 35%, transparent 36%)`,
        },
      },
      [`&.${classes.whitePoint}`]: {
        backgroundColor: "transparent",
        width: 0,
        height: 0,
        margin: 0,

        "&:before": {
          backgroundColor: "hsla(0, 0%, 90%, 1)",
          backgroundImage: `linear-gradient(145deg, transparent, ${theme.colors.white} 65%), radial-gradient(calc(min(150px, 11vw)) at 42% 38%, white 0%, white 35%, transparent 36%)`,
        },
      },
      [`&.${classes.emptyPoint}`]: {
        width: 0,
        height: 0,
        margin: 0,
        backgroundColor: "transparent",

        "&:before": {
          display: "none",
        },
        "&:after": {
          display: "none",
        },
      },
    },
    innerPoint: {
      outlineStyle: "solid",
      outlineWidth: "1px",
      outlineColor: "transparent",
      borderRadius: "50%",
      width: "50%",
      height: "50%",
      margin: "25%",
      position: "absolute",
    },
    emptyPoint: {
      width: "10%",
      height: "10%",
      margin: "45%",
      backgroundColor: theme.colors.white,
      position: "relative",
    },
    filledPoint: {
      outlineStyle: "solid",
      outlineWidth: "1px",
      borderRadius: "50%",
      position: "relative",
      boxShadow: "0px 0px 40px hsla(0, 100%, 100%, 0.48)",
    },
    whitePoint: {
      width: "70%",
      height: "70%",
      margin: "15%",
      backgroundColor: "hsla(0, 0%, 85%, 1)",
      outlineStyle: "none",
    },
    blackPoint: {
      width: "70%",
      height: "70%",
      margin: "15%",
      backgroundColor: theme.colors.black,
      outlineColor: theme.colors.white,
    },
    fadeLoopAnimation: {
      animation: `${fadeLoop} 800ms ${theme.transitions.easing.easeInOut} infinite alternate`,
    },
    liberty: {
      position: "absolute",
      transition: "all 0.5s ease-out",
      backgroundColor: "transparent",
      width: "2%",
      height: "2%",
      top: "50%",
      left: "50%",
    },
    libertyWhite: {
      backgroundColor: theme.colors.cha,
    },
    libertyBlack: {
      backgroundColor: theme.colors.success,
    },
    northLiberty: {
      width: "2%",
      height: "54%",
      top: "-3%",
      left: "50%",
    },
    southLiberty: {
      width: "2%",
      height: "50%",
      top: "50%",
      left: "50%",
    },
    eastLiberty: {
      width: "50%",
      height: "2%",
      top: "50%",
      left: "50%",
    },
    westLiberty: {
      width: "50%",
      height: "2%",
      top: "50%",
      left: "0",
    },
    coordinates: {
      color: theme.colors.white,
      fontFamily: `JetBrainsMono, "Courier New", monospace`,
      fontSize: "calc(min(1.3vw, 12px))",
      display: "none",
      position: "relative",
      top: "15%",
      left: "8%",
      zIndex: "10",
      userSelect: "none",
    },
    priorStoneTrad: {
      display: "none",
      outlineStyle: "solid",
      outlineWidth: "4px",
      outlineColor: "transparent",
      borderRadius: "50%",
      width: "50%",
      height: "50%",
      margin: "25%",
      background: "none",
      position: "absolute",
      zIndex: "10",
    },
  }),
);

export const boardStyles = makeStyles<void, Size | "background">({ uniqId: "boardStyles" })(
  (theme: Theme, _, classes) => ({
    tab: {
      paddingTop: 0,
      paddingBottom: 0,
      whiteSpace: "pre",
      height: "50px",
      minHeight: "unset",
      width: "210px",
    },
    gameboardWrapper: {
      position: "relative",
      width: "calc(min(100vw - 250px, 90vh - 150px, 800px))",
      height: "calc(min(100vw - 250px, 90vh - 150px, 800px))",
      padding: "5px",
    },
    boardFrame: {
      position: "relative",
      width: "752px",
    },
    statusPageGameboard: {
      position: "relative",
      width: "calc(min(400px, max(60vw - 250px, 300px)))",
      height: "calc(min(400px, max(60vw - 250px, 300px)))",
    },
    historyPageGameboard: {
      position: "relative",
      width: "calc(min(300px, max(60vw - 250px, 250px)))",
      height: "calc(min(300px, max(60vw - 250px, 250px)))",
    },
    statusPageScore: {
      width: "400px",
      paddingLeft: "20px",
    },
    factionStatus: {
      padding: "10px",
      margin: "10px",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: theme.colors.success,
      width: "320px",
    },
    board: {
      width: "100%",
      height: "100%",
      position: "relative",
    },
    traditional: {
      backgroundColor: "#ca973e",
    },
    opponentName: {
      paddingTop: "3px",
      paddingBottom: "5px",
      paddingRight: "10px",
    },
    opponentLabel: {
      padding: "3px 10px 5px 10px",
    },
    opponentTitle: {
      padding: "10px 0 0 0",
    },
    flavorText: {
      minHeight: "120px",
      padding: "0px 12px",
    },
    link: {
      textDecoration: "underline",
      opacity: 0.7,
      cursor: "pointer",
      "&:hover": {
        opacity: 1,
      },
    },
    inlineFlexBox: {
      display: "inline-flex",
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-between",
    },
    resetBoard: {
      width: "200px",
    },
    buttonHighlight: {
      borderStyle: "solid",
      borderWidth: "8px",
      borderColor: theme.colors.success,
      padding: "0 12px",
      width: "200px",
      animation: `${fadeLoop} 600ms ${theme.transitions.easing.easeInOut} infinite alternate`,
    },
    scoreBox: {
      display: "inline-flex",
      flexDirection: "row",
      whiteSpace: "pre",
      padding: "10px 30px",
    },
    searchBox: {
      maxWidth: "550px",
      minHeight: "460px",
    },
    fiveByFive: {
      height: "20%",
      [`& .${classes.fiveByFive}`]: {
        width: "20%",
        height: "100%",
      },
    },
    sevenBySeven: {
      height: "14%",
      [`& .${classes.sevenBySeven}`]: {
        width: "14%",
        height: "100%",
      },
    },
    nineByNine: {
      height: "11%",
      [`& .${classes.nineByNine}`]: {
        width: "11%",
        height: "100%",
      },
    },
    thirteenByThirteen: {
      height: "7.5%",
      [`& .${classes.thirteenByThirteen}`]: {
        width: "7.5%",
        height: "100%",
      },
    },
    nineteenByNineteen: {
      height: "5.2%",
      [`& .${classes.nineteenByNineteen}`]: {
        width: "5.2%",
        height: "100%",
      },
    },
    background: {
      position: "absolute",
      opacity: 0.09,
      color: theme.colors.white,
      fontFamily: "monospace",
      fontSize: "calc(min(.65vh - 2px, 0.65vw - 2px))",
      whiteSpace: "pre",
      pointerEvents: "none",
      paddingTop: "15px",
    },
    bitverseBackground: {
      [`&.${classes.background}`]: {
        fontSize: "calc(min(.83vh - 1px, 0.72vw, 7.856px))",
        opacity: 0.11,
      },
    },
    instructionScroller: {
      height: "calc(100vh - 80px)",
      overflowY: "scroll",
      marginTop: "10px",
    },
    instructionBoard: {
      width: "350px",
      height: "350px",
    },
    instructionBoardWrapper: {
      maxWidth: "400px",
      minHeight: "485px",
      marginRight: "20px",
    },
    instructionsBlurb: {
      width: "60%",
      minWidth: "300px",
      marginRight: "15px",
    },
    translucent: {
      opacity: 0.6,
    },
    cellNone: {
      borderBottom: "none",
      padding: 0,
      margin: 0,
      color: theme.colors.success,
    },
    cellBottomPadding: {
      paddingBottom: "20px",
    },
    keyText: {
      paddingTop: "10px",
      color: theme.colors.int,
    },
    scoreModal: {
      width: "400px",
    },
    centeredText: {
      textAlign: "center",
    },
  }),
);
