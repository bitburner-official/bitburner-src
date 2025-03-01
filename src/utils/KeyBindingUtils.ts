import { getRecordEntries, PartialRecord } from "../Types/Record";
import { ComplexPage, SimplePage } from "../ui/Enums";
import { EventEmitter } from "./EventEmitter";
import { KEY } from "./KeyboardEventKey";

export enum ScriptEditorAction {
  Save = "ScriptEditor-Save",
  GoToTerminal = "ScriptEditor-GoToTerminal",
  Run = "ScriptEditor-Run",
}

export const SpoilerKeyBindingTypes = [
  SimplePage.StaneksGift,
  SimplePage.Sleeves,
  SimplePage.Grafting,
  SimplePage.Bladeburner,
  SimplePage.Corporation,
  SimplePage.Gang,
] as const;

export const GoToPageKeyBindingTypes = [
  SimplePage.Terminal,
  ComplexPage.ScriptEditor,
  SimplePage.ActiveScripts,
  SimplePage.CreateProgram,
  SimplePage.Stats,
  SimplePage.Factions,
  SimplePage.Augmentations,
  SimplePage.Hacknet,
  SimplePage.City,
  SimplePage.Travel,
  SimplePage.Job,
  SimplePage.StockMarket,
  SimplePage.Go,
  SimplePage.Milestones,
  ComplexPage.Documentation,
  SimplePage.Achievements,
  SimplePage.Options,
  ...SpoilerKeyBindingTypes,
] as const;

export const ScriptEditorActionBindingTypes = [ScriptEditorAction.Save, ScriptEditorAction.GoToTerminal];

export const KeyBindingTypes = [...GoToPageKeyBindingTypes, ...ScriptEditorActionBindingTypes] as const;

export type GoToPageKeyBindingType = (typeof GoToPageKeyBindingTypes)[number];

export type ScriptEditorActionBindingType = (typeof ScriptEditorActionBindingTypes)[number];

export type KeyBindingType = (typeof KeyBindingTypes)[number];

export type KeyCombination = {
  control: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  key: string;
};

export type PlayerDefinedKeyBindingsType = PartialRecord<
  KeyBindingType,
  [KeyCombination | null, KeyCombination | null]
>;

export const DefaultKeyBindings: Record<KeyBindingType, [KeyCombination | null, KeyCombination | null]> = {
  [SimplePage.Terminal]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      key: "T",
    },
    null,
  ],
  [ComplexPage.ScriptEditor]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      key: "E",
    },
    null,
  ],
  [SimplePage.ActiveScripts]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      key: "S",
    },
    null,
  ],
  [SimplePage.CreateProgram]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      key: "P",
    },
    null,
  ],
  [SimplePage.StaneksGift]: [null, null],
  [SimplePage.Stats]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      key: "C",
    },
    null,
  ],
  [SimplePage.Factions]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      key: "F",
    },
    null,
  ],
  [SimplePage.Augmentations]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      key: "A",
    },
    null,
  ],
  [SimplePage.Hacknet]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      key: "H",
    },
    null,
  ],
  [SimplePage.Sleeves]: [null, null],
  [SimplePage.Grafting]: [null, null],
  [SimplePage.City]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      key: "W",
    },
    null,
  ],
  [SimplePage.Travel]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      key: "R",
    },
    null,
  ],
  [SimplePage.Job]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      key: "J",
    },
    null,
  ],
  [SimplePage.StockMarket]: [null, null],
  [SimplePage.Bladeburner]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      key: "B",
    },
    null,
  ],
  [SimplePage.Corporation]: [null, null],
  [SimplePage.Gang]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      key: "G",
    },
    null,
  ],
  [SimplePage.Go]: [null, null],
  [SimplePage.Milestones]: [null, null],
  [ComplexPage.Documentation]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      key: "U",
    },
    null,
  ],
  [SimplePage.Achievements]: [null, null],
  [SimplePage.Options]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      key: "O",
    },
    null,
  ],
  [ScriptEditorAction.Save]: [
    {
      control: true,
      alt: false,
      shift: false,
      meta: false,
      key: "S",
    },
    {
      control: false,
      alt: false,
      shift: false,
      meta: true,
      key: "S",
    },
  ],
  [ScriptEditorAction.GoToTerminal]: [
    {
      control: true,
      alt: false,
      shift: false,
      meta: false,
      key: "B",
    },
    {
      control: false,
      alt: false,
      shift: false,
      meta: true,
      key: "B",
    },
  ],
  [ScriptEditorAction.Run]: [
    {
      control: true,
      alt: false,
      shift: false,
      meta: false,
      key: "Q",
    },
    null,
  ],
};

// This is the set of key bindings merged from DefaultKeyBindings and Settings.KeyBindings.
export const CurrentKeyBindings = structuredClone(DefaultKeyBindings);

/**
 * In order to avoid a circular dependency, do not use Settings.KeyBindings directly in this function. We need to pass
 * it as a parameter.
 */
export function mergePlayerDefinedKeyBindings(bindings: PlayerDefinedKeyBindingsType): void {
  for (const [action, keyCombinations] of getRecordEntries(bindings)) {
    CurrentKeyBindings[action][0] = keyCombinations[0];
    CurrentKeyBindings[action][1] = keyCombinations[1];
  }
}

export function areDifferentKeyCombinations(combination1: KeyCombination, combination2: KeyCombination) {
  return (
    combination1.control !== combination2.control ||
    combination1.alt !== combination2.alt ||
    combination1.shift !== combination2.shift ||
    combination1.meta !== combination2.meta ||
    combination1.key !== combination2.key
  );
}

export function parseKeyCombinationToString(keyCombination: KeyCombination | null): string {
  if (!keyCombination) {
    return "";
  }
  let result = "";
  if (keyCombination.control) {
    result += "Ctrl + ";
  }
  if (keyCombination.alt) {
    if (window.navigator.userAgent.includes("Mac")) {
      result += "Option + ";
    } else {
      result += "Alt + ";
    }
  }
  if (keyCombination.shift) {
    result += "Shift + ";
  }
  if (keyCombination.meta) {
    if (window.navigator.userAgent.includes("Mac")) {
      result += "⌘ + ";
    } else {
      // Most non-Apple keyboards print a form of Windows icon on the key cap of the "meta" key.
      result += "⊞ + ";
    }
  }
  if (keyCombination.key === KEY.SPACE) {
    result += "Space";
  } else {
    result += keyCombination.key;
  }
  return result;
}

export function parseKeyCombinationsToString(keyCombinations: (KeyCombination | null)[]): string {
  let result = "";
  for (const keyCombination of keyCombinations) {
    if (!keyCombination) {
      continue;
    }
    result += ` or ${parseKeyCombinationToString(keyCombination)}`;
  }
  if (result.startsWith(" or ")) {
    return result.substring(4);
  }
  return result;
}

export function getKeyCombination(
  keyBindings: typeof DefaultKeyBindings,
  keyBindingType: KeyBindingType,
  isPrimary: boolean,
): KeyCombination | null {
  return keyBindings[keyBindingType][isPrimary ? 0 : 1];
}

export function convertKeyboardEventToKeyCombination(event: KeyboardEvent): KeyCombination {
  return {
    control: event.ctrlKey,
    alt: event.altKey,
    shift: event.shiftKey,
    meta: event.metaKey,
    /**
     * Use uppercase to avoid the problem of Caps Lock key. For example, if the player presses Alt+t when Caps Lock is
     * on, event.key will be "T", not "t".
     */
    key: event.key.toUpperCase(),
  };
}

export function determineKeyBindingTypes(
  keyBindings: typeof DefaultKeyBindings,
  keyCombination: KeyCombination,
): Set<KeyBindingType> {
  const result = new Set<KeyBindingType>();
  for (const [keyBindingType, combinations] of getRecordEntries(keyBindings)) {
    for (const combination of combinations) {
      if (
        !combination ||
        combination.control !== keyCombination.control ||
        combination.alt !== keyCombination.alt ||
        combination.shift !== keyCombination.shift ||
        combination.meta !== keyCombination.meta ||
        combination.key !== keyCombination.key
      ) {
        continue;
      }
      result.add(keyBindingType);
    }
  }
  return result;
}

export function isKeyCombinationPressed(
  keyCombination: KeyCombination,
  requiredCombination: {
    control?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
    key: string;
  },
): boolean {
  for (const key of ["control", "alt", "shift", "meta"] as const) {
    if (requiredCombination[key] === undefined) {
      requiredCombination[key] = false;
    }
  }
  return (
    requiredCombination.control === keyCombination.control &&
    requiredCombination.alt === keyCombination.alt &&
    requiredCombination.shift === keyCombination.shift &&
    requiredCombination.meta === keyCombination.meta &&
    requiredCombination.key === keyCombination.key
  );
}

/**
 * This function can be called in situations that the parameter is a string, not just KeyBindingType.
 */
export function isSpoilerKeyBindingType(keyBindingType: string): boolean {
  return SpoilerKeyBindingTypes.some((value) => value === keyBindingType);
}

export enum KeyBindingEventType {
  StartSettingUp,
  StopSettingUp,
}

export const KeyBindingEvents = new EventEmitter<[KeyBindingEventType]>();
