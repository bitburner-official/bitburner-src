import { getRecordEntries } from "../Types/Record";
import { ComplexPage, SimplePage } from "../ui/Router";
import { EventEmitter } from "./EventEmitter";
import { KEYCODE } from "./helpers/keyCodes";

export enum ScriptEditorAction {
  Save = "ScriptEditor-Save",
  GoToTerminal = "ScriptEditor-GoToTerminal",
}

export const SpoilerKeyBindingTypes = [
  SimplePage.StaneksGift,
  SimplePage.Sleeves,
  SimplePage.Grafting,
  SimplePage.Bladeburner,
  SimplePage.Corporation,
  SimplePage.Gang,
] as const;

export const KeyBindingTypes = [
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
  ComplexPage.Job,
  SimplePage.StockMarket,
  SimplePage.Go,
  SimplePage.Milestones,
  ComplexPage.Documentation,
  SimplePage.Achievements,
  SimplePage.Options,
  ScriptEditorAction.Save,
  ScriptEditorAction.GoToTerminal,
  ...SpoilerKeyBindingTypes,
] as const;

export type KeyBindingType = (typeof KeyBindingTypes)[number];

export type KeyCombination = {
  control: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  code: string;
  key: string;
};

export const defaultKeyBinding: Record<KeyBindingType, [KeyCombination | null, KeyCombination | null]> = {
  [SimplePage.Terminal]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      code: "KeyT",
      key: "t",
    },
    null,
  ],
  [ComplexPage.ScriptEditor]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      code: "KeyE",
      key: "e",
    },
    null,
  ],
  [SimplePage.ActiveScripts]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      code: "KeyS",
      key: "s",
    },
    null,
  ],
  [SimplePage.CreateProgram]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      code: "KeyP",
      key: "p",
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
      code: "KeyC",
      key: "c",
    },
    null,
  ],
  [SimplePage.Factions]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      code: "KeyF",
      key: "f",
    },
    null,
  ],
  [SimplePage.Augmentations]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      code: "KeyA",
      key: "a",
    },
    null,
  ],
  [SimplePage.Hacknet]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      code: "KeyH",
      key: "h",
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
      code: "KeyW",
      key: "w",
    },
    null,
  ],
  [SimplePage.Travel]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      code: "KeyR",
      key: "r",
    },
    null,
  ],
  [ComplexPage.Job]: [
    {
      control: false,
      alt: true,
      shift: false,
      meta: false,
      code: "KeyJ",
      key: "j",
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
      code: "KeyB",
      key: "b",
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
      code: "KeyG",
      key: "g",
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
      code: "KeyU",
      key: "u",
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
      code: "KeyO",
      key: "o",
    },
    null,
  ],
  "ScriptEditor-Save": [
    {
      control: true,
      alt: false,
      shift: false,
      meta: false,
      code: "KeyS",
      key: "s",
    },
    {
      control: false,
      alt: false,
      shift: false,
      meta: true,
      code: "KeyS",
      key: "s",
    },
  ],
  "ScriptEditor-GoToTerminal": [
    {
      control: true,
      alt: false,
      shift: false,
      meta: false,
      code: "KeyB",
      key: "b",
    },
    {
      control: false,
      alt: false,
      shift: false,
      meta: true,
      code: "KeyB",
      key: "b",
    },
  ],
};

export function parseKeyCombinationToString(keyCombination: KeyCombination | null): string {
  if (!keyCombination) {
    return "";
  }
  let result = "";
  if (keyCombination.control) {
    result += "Ctrl + ";
  }
  if (keyCombination.alt) {
    result += "Alt + ";
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
  if (keyCombination.code === KEYCODE.SPACE) {
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
  keyBindings: typeof defaultKeyBinding,
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
    code: event.code,
    key: event.key,
  };
}

export function determineKeyBindingTypes(
  keyBindings: typeof defaultKeyBinding,
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
        combination.code !== keyCombination.code
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
    code: string;
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
    requiredCombination.code === keyCombination.code
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
