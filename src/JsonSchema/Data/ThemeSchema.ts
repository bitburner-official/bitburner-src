import { validEditorThemeBases } from "../../ScriptEditor/ui/themes";
import type { ITheme } from "../../Themes/Themes";
import { getRecordKeys } from "../../Types/Record";

/**
 * VS code has a regex for checking hex colors at: https://github.com/microsoft/vscode/blob/1dd8c77ac79508a047235ceee0cba7ba7f049425/src/vs/editor/common/languages/supports/tokenization.ts#L153.
 *
 * We have to tweak it:
 * - "#" must be the first character.
 * - Allow 3-character hex colors (e.g., #fff).
 *
 * Explanation:
^ asserts position at start of the string
# matches the character # with index 35 (base 10) literally (case sensitive)
1st Capturing Group ((([0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?)|([0-9A-Fa-f]{3}))
  1st Alternative (([0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?)
    2nd Capturing Group (([0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?)
      3rd Capturing Group ([0-9A-Fa-f]{6})
        Match a single character present in the list below [0-9A-Fa-f]
          {6} matches the previous token exactly 6 times
          0-9 matches a single character in the range between 0 (index 48) and 9 (index 57) (case sensitive)
          A-F matches a single character in the range between A (index 65) and F (index 70) (case sensitive)
          a-f matches a single character in the range between a (index 97) and f (index 102) (case sensitive)
      4th Capturing Group ([0-9A-Fa-f]{2})?
        ? matches the previous token between zero and one times, as many times as possible, giving back as needed (greedy)
        Match a single character present in the list below [0-9A-Fa-f]
          {2} matches the previous token exactly 2 times
          0-9 matches a single character in the range between 0 (index 48) and 9 (index 57) (case sensitive)
          A-F matches a single character in the range between A (index 65) and F (index 70) (case sensitive)
          a-f matches a single character in the range between a (index 97) and f (index 102) (case sensitive)
  2nd Alternative ([0-9A-Fa-f]{3})
    5th Capturing Group ([0-9A-Fa-f]{3})
      Match a single character present in the list below [0-9A-Fa-f]
        {3} matches the previous token exactly 3 times
        0-9 matches a single character in the range between 0 (index 48) and 9 (index 57) (case sensitive)
        A-F matches a single character in the range between A (index 65) and F (index 70) (case sensitive)
        a-f matches a single character in the range between a (index 97) and f (index 102) (case sensitive)
$ asserts position at the end of the string
 */
export const themeHexColorRegex = /^#((([0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?)|([0-9A-Fa-f]{3}))$/;

/**
 * This regex is based on themeHexColorRegex. It removes the part of "#". When processing data of editor themes, we
 * always add "#" to the hex value, so valid hex values cannot include "#" character.
 */
export const editorThemeHexColorRegex = /^((([0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?)|([0-9A-Fa-f]{3}))$/;

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
    result[key].pattern = themeHexColorRegex.source;
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
          pattern: editorThemeHexColorRegex.source,
        },
        bg: {
          type: "string",
          pattern: editorThemeHexColorRegex.source,
        },
        fg: {
          type: "string",
          pattern: editorThemeHexColorRegex.source,
        },
      },
    },
    syntax: {
      type: "object",
      properties: {
        tag: {
          type: "string",
          pattern: editorThemeHexColorRegex.source,
        },
        entity: {
          type: "string",
          pattern: editorThemeHexColorRegex.source,
        },
        string: {
          type: "string",
          pattern: editorThemeHexColorRegex.source,
        },
        regexp: {
          type: "string",
          pattern: editorThemeHexColorRegex.source,
        },
        markup: {
          type: "string",
          pattern: editorThemeHexColorRegex.source,
        },
        keyword: {
          type: "string",
          pattern: editorThemeHexColorRegex.source,
        },
        comment: {
          type: "string",
          pattern: editorThemeHexColorRegex.source,
        },
        constant: {
          type: "string",
          pattern: editorThemeHexColorRegex.source,
        },
        error: {
          type: "string",
          pattern: editorThemeHexColorRegex.source,
        },
      },
    },
    ui: {
      type: "object",
      properties: {
        line: {
          type: "string",
          pattern: editorThemeHexColorRegex.source,
        },
        panel: {
          type: "object",
          properties: {
            bg: {
              type: "string",
              pattern: editorThemeHexColorRegex.source,
            },
            selected: {
              type: "string",
              pattern: editorThemeHexColorRegex.source,
            },
            border: {
              type: "string",
              pattern: editorThemeHexColorRegex.source,
            },
          },
        },
        selection: {
          type: "object",
          properties: {
            bg: {
              type: "string",
              pattern: editorThemeHexColorRegex.source,
            },
          },
        },
      },
    },
    base: {
      type: "string",
      /**
       * Monaco checks the base theme at runtime. If the value is invalid, monaco will throw an error ("Error: Illegal
       * theme base!") and crash the game.
       */
      enum: validEditorThemeBases,
    },
    inherit: {
      type: "boolean",
    },
  },
};
