import type { ITheme } from "../../Themes/Themes";
import { getRecordKeys } from "../../Types/Record";

// https://github.com/microsoft/vscode/blob/1dd8c77ac79508a047235ceee0cba7ba7f049425/src/vs/editor/common/languages/supports/tokenization.ts#L153
const hexColorRegex = /^#?([0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?$/;

function getThemeSchemaProperties() {
  const result: Record<keyof ITheme, { type: string; pattern?: string }> = {
    primarylight: {
      type: "string",
    },
    primary: {
      type: "string",
    },
    primarydark: {
      type: "string",
    },
    successlight: {
      type: "string",
    },
    success: {
      type: "string",
    },
    successdark: {
      type: "string",
    },
    errorlight: {
      type: "string",
    },
    error: {
      type: "string",
    },
    errordark: {
      type: "string",
    },
    secondarylight: {
      type: "string",
    },
    secondary: {
      type: "string",
    },
    secondarydark: {
      type: "string",
    },
    warninglight: {
      type: "string",
    },
    warning: {
      type: "string",
    },
    warningdark: {
      type: "string",
    },
    infolight: {
      type: "string",
    },
    info: {
      type: "string",
    },
    infodark: {
      type: "string",
    },
    welllight: {
      type: "string",
    },
    well: {
      type: "string",
    },
    white: {
      type: "string",
    },
    black: {
      type: "string",
    },
    hp: {
      type: "string",
    },
    money: {
      type: "string",
    },
    hack: {
      type: "string",
    },
    combat: {
      type: "string",
    },
    cha: {
      type: "string",
    },
    int: {
      type: "string",
    },
    rep: {
      type: "string",
    },
    disabled: {
      type: "string",
    },
    backgroundprimary: {
      type: "string",
    },
    backgroundsecondary: {
      type: "string",
    },
    button: {
      type: "string",
    },
    maplocation: {
      type: "string",
    },
    bnlvl0: {
      type: "string",
    },
    bnlvl1: {
      type: "string",
    },
    bnlvl2: {
      type: "string",
    },
    bnlvl3: {
      type: "string",
    },
  };
  for (const key of getRecordKeys(result)) {
    result[key].pattern = hexColorRegex.source;
  }
  return result;
}

export const MainThemeSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: getThemeSchemaProperties(),
};

export const EditorThemeSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    common: {
      type: "object",
      properties: {
        accent: {
          type: "string",
          pattern: hexColorRegex.source,
        },
        bg: {
          type: "string",
          pattern: hexColorRegex.source,
        },
        fg: {
          type: "string",
          pattern: hexColorRegex.source,
        },
      },
      // required: ["accent", "bg", "fg"],
    },
    syntax: {
      type: "object",
      properties: {
        tag: {
          type: "string",
          pattern: hexColorRegex.source,
        },
        entity: {
          type: "string",
          pattern: hexColorRegex.source,
        },
        string: {
          type: "string",
          pattern: hexColorRegex.source,
        },
        regexp: {
          type: "string",
          pattern: hexColorRegex.source,
        },
        markup: {
          type: "string",
          pattern: hexColorRegex.source,
        },
        keyword: {
          type: "string",
          pattern: hexColorRegex.source,
        },
        comment: {
          type: "string",
          pattern: hexColorRegex.source,
        },
        constant: {
          type: "string",
          pattern: hexColorRegex.source,
        },
        error: {
          type: "string",
          pattern: hexColorRegex.source,
        },
      },
      // required: ["tag", "entity", "string", "regexp", "markup", "keyword", "comment", "constant", "error"],
    },
    ui: {
      type: "object",
      properties: {
        line: {
          type: "string",
          pattern: hexColorRegex.source,
        },
        panel: {
          type: "object",
          properties: {
            bg: {
              type: "string",
              pattern: hexColorRegex.source,
            },
            selected: {
              type: "string",
              pattern: hexColorRegex.source,
            },
            border: {
              type: "string",
              pattern: hexColorRegex.source,
            },
          },
          // required: ["bg", "selected", "border"],
        },
        selection: {
          type: "object",
          properties: {
            bg: {
              type: "string",
              pattern: hexColorRegex.source,
            },
          },
          // required: ["bg"],
        },
      },
      // required: ["line", "panel", "selection"],
    },
    base: {
      type: "string",
    },
    inherit: {
      type: "boolean",
    },
  },
};
