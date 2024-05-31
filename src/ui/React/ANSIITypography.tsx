import { Typography } from "@mui/material";
import React from "react";
import { makeStyles } from "tss-react/mui";
import { Theme } from "@mui/material/styles";
import { Settings } from "../../Settings/Settings";

// This particular eslint-disable is correct.
// In this super specific weird case we in fact do want a regex on an ANSII character.
// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE = new RegExp("\u{001b}\\[(?<code>.*?)m", "ug");

const useStyles = makeStyles()((theme: Theme) => ({
  success: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    margin: theme.spacing(0),
    color: theme.colors.success,
    "--padForFlushBg": (Settings.styles.lineHeight - 1) / 2 + "em",
  },
  error: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    margin: theme.spacing(0),
    color: theme.palette.error.main,
    "--padForFlushBg": (Settings.styles.lineHeight - 1) / 2 + "em",
  },
  primary: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    margin: theme.spacing(0),
    color: theme.palette.primary.main,
    "--padForFlushBg": (Settings.styles.lineHeight - 1) / 2 + "em",
  },
  info: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    margin: theme.spacing(0),
    color: theme.palette.info.main,
    "--padForFlushBg": (Settings.styles.lineHeight - 1) / 2 + "em",
  },
  warning: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    margin: theme.spacing(0),
    color: theme.palette.warning.main,
    "--padForFlushBg": (Settings.styles.lineHeight - 1) / 2 + "em",
  },
}));

const lineClass = (classes: Record<string, string>, s: string): string => {
  const lineClassMap: Record<string, string> = {
    error: classes.error,
    success: classes.success,
    info: classes.info,
    warn: classes.warning,
  };
  return lineClassMap[s] || classes.primary;
};

type ANSIITypographyProps = {
  text: unknown;
  color: "primary" | "error" | "success" | "info" | "warn";
};

export const ANSIITypography = React.memo(function ANSIITypography(props: ANSIITypographyProps): React.ReactElement {
  const text = String(props.text);
  const { classes } = useStyles();
  const parts = [];

  // Build a look-alike regex match to place at the front of the matches list
  const INITIAL = {
    0: "",
    index: 0,
    groups: { code: null },
  };
  const matches = [INITIAL, ...text.matchAll(ANSI_ESCAPE), null];
  if (matches.length > 2) {
    matches.slice(0, -1).forEach((m, i) => {
      const n = matches[i + 1];
      if (!m || m.index === undefined || m.groups === undefined) {
        return;
      }
      const startIndex = m.index + m[0].length;
      const stopIndex = n ? n.index : text.length;
      const partText = text.slice(startIndex, stopIndex);
      if (startIndex !== stopIndex) {
        // Don't generate "empty" spans
        parts.push({ code: m.groups.code, text: partText });
      }
    });
  }
  if (parts.length === 0) {
    // For example, if the string was empty or there were no escape sequence matches
    parts.push({ code: null, text: text });
  }
  return (
    <Typography component={"div"} classes={{ root: lineClass(classes, props.color) }} paragraph={false}>
      {parts.map((part, i) => (
        <span key={i} style={ansiCodeStyle(part.code)}>
          {part.text}
        </span>
      ))}
    </Typography>
  );
});

function ansiCodeStyle(code: string | null): Record<string, any> {
  // The ANSI colors actually have the dark color set as default and require extra work to get
  //  bright colors.  But these are rarely used or, if they are, are often re-mapped by the
  //  terminal emulator to brighter colors.  So for foreground colors we use the bright color set
  //  and for background colors we use the dark color set.  Of course, all colors are available
  //  via the longer ESC[n8;5;c] sequence (n={3,4}, c=color).  Ideally, these 8-bit maps could
  //  be managed in the user preferences/theme.
  // Later note: The above justification is a bit suspect, and I doubt that the compatibility break
  //  vs standard ANSI codes is worth it. But, it's the system that's been baked in to BB for years
  //  now, so too late to change.
  const COLOR_MAP_BRIGHT: string[] = [
    "#404040",
    "#ff0000",
    "#00ff00",
    "#ffff00",
    "#0000ff",
    "#ff00ff",
    "#00ffff",
    "#ffffff",
  ];
  const COLOR_MAP_DARK: string[] = [
    "#000000",
    "#800000",
    "#008000",
    "#808000",
    "#000080",
    "#800080",
    "#008080",
    "#c0c0c0",
  ];

  // Returns [parts_consumed, style_string].
  // [-1, _] signals an error in parsing.
  const ansi2rgb = (codeParts: number[], startIdx: number): [number, string] => {
    if (codeParts[startIdx] === 5) {
      if (codeParts.length <= startIdx + 1) {
        // Don't have enough data, but we have to consume what we've seen so far
        return [codeParts.length - startIdx, "inherit"];
      }
      const code = codeParts[startIdx + 1];
      if (0 <= code && code < 8) {
        // x8 RGB
        return [2, COLOR_MAP_DARK[code]];
      }
      if (8 <= code && code < 16) {
        // x8 RGB - "High Intensity"
        return [2, COLOR_MAP_BRIGHT[code - 8]];
      }
      if (16 <= code && code < 232) {
        // x216 RGB
        const base = code - 16;
        const ir = Math.floor(base / 36);
        const ig = Math.floor((base % 36) / 6);
        const ib = Math.floor((base % 6) / 1);
        const r = ir <= 0 ? 0 : 55 + ir * 40;
        const g = ig <= 0 ? 0 : 55 + ig * 40;
        const b = ib <= 0 ? 0 : 55 + ib * 40;
        return [2, `rgb(${r}, ${g}, ${b})`];
      }
      if (232 <= code && code < 256) {
        // x32 greyscale
        const base = code - 232;
        const grey = base * 10 + 8;
        return [2, `rgb(${grey}, ${grey}, ${grey})`];
      }
      // Value out of range, but the escape sequence is still well-formed
      return [2, "inherit"];
    } else if (codeParts[startIdx] === 2) {
      if (codeParts.length <= startIdx + 3) {
        // Don't have enough data, but we have to consume what we've seen so far
        return [codeParts.length - startIdx, "inherit"];
      }
      return [4, `rgb(${codeParts[startIdx + 1]}, ${codeParts[startIdx + 2]}, ${codeParts[startIdx + 3]})`];
    }
    return [-1, ""];
  };

  const style: {
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    color?: string;
    backgroundColor?: string;
    padding?: string;
  } = {};

  if (code === null || code === "0") {
    return style;
  }

  const codeParts = code.split(";").map((p) => (p === "" ? 0 : parseInt(p)));

  for (let i = 0; i < codeParts.length; ++i) {
    const codePart = codeParts[i];
    // Decorations
    if (codePart === 1) {
      style.fontWeight = "bold";
    } else if (codePart === 3) {
      style.fontStyle = "italic";
    } else if (codePart === 4) {
      style.textDecoration = "underline";
    }
    // Foreground Color (x8)
    else if (30 <= codePart && codePart < 38) {
      style.color = COLOR_MAP_BRIGHT[codePart - 30];
    }
    // Background Color (x8)
    else if (40 <= codePart && codePart < 48) {
      style.backgroundColor = COLOR_MAP_DARK[codePart - 40];
    }
    // Foreground Color (x256)
    else if (codePart === 38 || codePart === 48) {
      const [extra, colorString] = ansi2rgb(codeParts, i + 1);
      // If it was an invalid code, we consume no extra parts
      if (extra > 0) {
        i += extra;
        style[codePart === 38 ? "color" : "backgroundColor"] = colorString;
      }
    }
  }
  // If a background color is set, add slight padding to increase the background fill area.
  // This was previously display:inline-block, but that has display errors when line breaks are used.
  if (style.backgroundColor) {
    style.padding = "var(--padForFlushBg) 0px";
  }
  return style;
}
