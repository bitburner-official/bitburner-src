import { Button, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { Settings } from "../../Settings/Settings";
import { getRecordKeys } from "../../Types/Record";
import { Modal } from "../../ui/React/Modal";
import { SimplePage } from "../../ui/Router";
import { KEYCODE } from "../../utils/helpers/keyCodes";
import {
  convertKeyboardEventToKeyCombination,
  defaultKeyBinding,
  determineKeyBindingTypes,
  getKeyCombination,
  isKeyCombinationPressed,
  isSpoilerKeyBindingType,
  KeyBindingEvents,
  KeyBindingEventType,
  parseKeyCombinationToString,
  SpoilerKeyBindingTypes,
  type KeyBindingType,
  type KeyCombination,
} from "../../utils/KeyBindingUtils";
import { GameOptionsPage } from "./GameOptionsPage";
import { dialogBoxCreate } from "../../ui/React/DialogBox";
import { knowAboutBitverse } from "../../BitNode/BitNodeUtils";

function determineConflictKeys(
  keyBindingType: KeyBindingType,
  isPrimary: boolean,
  newCombination: KeyCombination,
): Set<string> {
  const conflicts: Set<string> = determineKeyBindingTypes(Settings.KeyBindings, newCombination);
  // Check if the new combination is the same as the current key binding.
  if (conflicts.has(keyBindingType)) {
    const currentKeyBinding = getKeyCombination(Settings.KeyBindings, keyBindingType, isPrimary);
    if (
      currentKeyBinding &&
      currentKeyBinding.control === newCombination.control &&
      currentKeyBinding.alt === newCombination.alt &&
      currentKeyBinding.shift === newCombination.shift &&
      currentKeyBinding.meta === newCombination.meta &&
      currentKeyBinding.code === newCombination.code
    ) {
      conflicts.delete(keyBindingType);
    }
  }
  // Common single-key hotkeys.
  if (
    isKeyCombinationPressed(newCombination, { code: KEYCODE.ESC }) ||
    isKeyCombinationPressed(newCombination, { code: KEYCODE.ENTER }) ||
    isKeyCombinationPressed(newCombination, { code: KEYCODE.NUMPAD_ENTER }) ||
    isKeyCombinationPressed(newCombination, { code: KEYCODE.TAB })
  ) {
    conflicts.add("Common hotkeys");
  }
  // Copy - Paste - Cut
  if (window.navigator.userAgent.includes("Mac")) {
    if (
      isKeyCombinationPressed(newCombination, { meta: true, code: KEYCODE.C }) ||
      isKeyCombinationPressed(newCombination, { meta: true, code: KEYCODE.V }) ||
      isKeyCombinationPressed(newCombination, { meta: true, code: KEYCODE.X })
    ) {
      conflicts.add("Common hotkeys");
    }
  } else {
    if (
      isKeyCombinationPressed(newCombination, { control: true, code: KEYCODE.C }) ||
      isKeyCombinationPressed(newCombination, { control: true, code: KEYCODE.V }) ||
      isKeyCombinationPressed(newCombination, { control: true, code: KEYCODE.X })
    ) {
      conflicts.add("Common hotkeys");
    }
  }
  // Terminal-ClearScreen
  if (isKeyCombinationPressed(newCombination, { control: true, code: KEYCODE.L })) {
    conflicts.add("Terminal-ClearScreen");
  }
  // Bash hotkeys
  if (
    Settings.EnableBashHotkeys &&
    (isKeyCombinationPressed(newCombination, { control: true, code: KEYCODE.M }) ||
      isKeyCombinationPressed(newCombination, { control: true, code: KEYCODE.P }) ||
      isKeyCombinationPressed(newCombination, { control: true, code: KEYCODE.C }) ||
      isKeyCombinationPressed(newCombination, { control: true, code: KEYCODE.A }) ||
      isKeyCombinationPressed(newCombination, { control: true, code: KEYCODE.E }) ||
      isKeyCombinationPressed(newCombination, { control: true, code: KEYCODE.B }) ||
      isKeyCombinationPressed(newCombination, { alt: true, code: KEYCODE.B }) ||
      isKeyCombinationPressed(newCombination, { control: true, code: KEYCODE.F }) ||
      isKeyCombinationPressed(newCombination, { alt: true, code: KEYCODE.F }) ||
      isKeyCombinationPressed(newCombination, { control: true, code: KEYCODE.H }) ||
      isKeyCombinationPressed(newCombination, { control: true, code: KEYCODE.D }) ||
      isKeyCombinationPressed(newCombination, { control: true, code: KEYCODE.W }) ||
      isKeyCombinationPressed(newCombination, { alt: true, code: KEYCODE.D }) ||
      isKeyCombinationPressed(newCombination, { control: true, code: KEYCODE.U }) ||
      isKeyCombinationPressed(newCombination, { control: true, code: KEYCODE.K }))
  ) {
    conflicts.add("Bash hotkeys");
  }
  // Remove spoilers in the list
  if (!knowAboutBitverse()) {
    for (const conflict of conflicts) {
      if (!isSpoilerKeyBindingType(conflict)) {
        continue;
      }
      conflicts.delete(conflict);
      conflicts.add("Endgame content");
    }
  }
  return conflicts;
}

function SettingUpKeyBindingModal({
  open,
  onClose,
  keyBindingType,
  isPrimary,
}: {
  open: boolean;
  onClose: () => void;
  keyBindingType: KeyBindingType;
  isPrimary: boolean;
}): React.ReactElement {
  const [combination, setCombination] = useState(getKeyCombination(Settings.KeyBindings, keyBindingType, isPrimary));
  const [conflicts, setConflicts] = useState(
    combination ? determineConflictKeys(keyBindingType, isPrimary, combination) : new Set<string>(),
  );
  const handler = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      if (event.getModifierState(event.key)) {
        return;
      }

      const newCombination = convertKeyboardEventToKeyCombination(event);
      setCombination(newCombination);
      setConflicts(determineConflictKeys(keyBindingType, isPrimary, newCombination));
    },
    [keyBindingType, isPrimary],
  );

  useEffect(() => {
    const currentKeyCombination = getKeyCombination(Settings.KeyBindings, keyBindingType, isPrimary);
    setCombination(currentKeyCombination);
    setConflicts(
      currentKeyCombination
        ? determineConflictKeys(keyBindingType, isPrimary, currentKeyCombination)
        : new Set<string>(),
    );
    // Add/remove handler and emit an event that notifies subscribers if the player is setting up key bindings.
    if (open) {
      document.addEventListener("keydown", handler);
      KeyBindingEvents.emit(KeyBindingEventType.StartSettingUp);
    } else {
      document.removeEventListener("keydown", handler);
      KeyBindingEvents.emit(KeyBindingEventType.StopSettingUp);
    }
  }, [open, keyBindingType, isPrimary, handler]);

  const onClickClear = () => {
    setCombination(null);
    setConflicts(new Set());
  };
  const onClickDefault = () => {
    const defaultKeyCombination = getKeyCombination(defaultKeyBinding, keyBindingType, true);
    setCombination(defaultKeyCombination);
    setConflicts(
      defaultKeyCombination
        ? determineConflictKeys(keyBindingType, isPrimary, defaultKeyCombination)
        : new Set<string>(),
    );
  };
  const onClickOK = () => {
    Settings.KeyBindings[keyBindingType][isPrimary ? 0 : 1] = combination;
    onClose();
  };
  const onClickCancel = () => {
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        <Typography style={{ padding: "10px 20px" }}>Press the key you would like to use</Typography>
        <Typography
          minHeight="100px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          margin="10px 0"
          border="1px solid"
        >
          {parseKeyCombinationToString(combination)}
        </Typography>
        <Typography style={{ margin: "15px 0" }}>
          {conflicts.size === 0 ? "No conflicts detected" : `Conflicts: ${[...conflicts]}`}
        </Typography>
        <div style={{ margin: "10px 0" }}>
          <Button style={{ minWidth: "100px" }} onClick={onClickClear}>
            Clear
          </Button>
          <Button style={{ marginLeft: "10px", minWidth: "100px" }} onClick={onClickDefault}>
            Default
          </Button>
        </div>
        <div>
          <Button style={{ minWidth: "100px" }} onClick={onClickOK}>
            OK
          </Button>
          <Button style={{ marginLeft: "10px", minWidth: "100px" }} onClick={onClickCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function KeyBindingPage(): React.ReactElement {
  const [popupOpen, setPopupOpen] = useState(false);
  const [keyBindingType, setKeyBindingType] = useState<KeyBindingType>(SimplePage.Options);
  const [isPrimary, setIsPrimary] = useState(true);

  const showModal = (keyBindingType: KeyBindingType, isPrimary: boolean) => {
    setPopupOpen(true);
    setKeyBindingType(keyBindingType);
    setIsPrimary(isPrimary);
  };

  const onClickHowToUse = () => {
    dialogBoxCreate(
      <>
        <Typography>
          You can assign up to 2 key combinations per "action". If a key combination is assigned to many actions,
          pressing that key combination will perform all those actions.
        </Typography>
        <br />
        <Typography>
          Some key combinations cannot be used. Your OS and browsers usually have some built-in key bindings that cannot
          be overridden. For example, on Windows, Windows+R always opens the "Run" dialog.
        </Typography>
        <br />
        <Typography>
          When you set up key bindings, the list of conflicts may contain "Endgame content". It means that the key
          combination is currently used for features that you have not unlocked.
        </Typography>
        <br />
        <Typography>
          On non-Apple keyboards, the "Windows" key (other names: win, start, super, meta, etc.) is shown as ⊞. On Apple
          keyboards, the command key is shown as ⌘.
        </Typography>
        <br />
        <Typography>
          Do NOT use the right Alt key and the AltGr key, especially if you don't use the US keyboard layout. On many
          keyboard layouts, those keys cause problems with key bindings.
        </Typography>
      </>,
    );
  };
  knowAboutBitverse();

  return (
    <GameOptionsPage title="Key Binding">
      <Button onClick={onClickHowToUse}>How to use</Button>
      <br />
      <table>
        <tbody>
          {getRecordKeys(Settings.KeyBindings)
            .filter(
              (keyBindingType) =>
                knowAboutBitverse() || !(SpoilerKeyBindingTypes as unknown as string[]).includes(keyBindingType),
            )
            .map((keyBindingType) => (
              <tr key={keyBindingType}>
                <td>
                  <Typography minWidth="250px">{keyBindingType}</Typography>
                </td>
                <td>
                  <Button sx={{ minWidth: "250px" }} onClick={() => showModal(keyBindingType, true)}>
                    {Settings.KeyBindings[keyBindingType][0] ? (
                      parseKeyCombinationToString(Settings.KeyBindings[keyBindingType][0])
                    ) : (
                      // Use a non-breaking space to make the button fit to the parent td element.
                      <>&nbsp;</>
                    )}
                  </Button>
                </td>
                <td>
                  <Button sx={{ minWidth: "250px" }} onClick={() => showModal(keyBindingType, false)}>
                    {Settings.KeyBindings[keyBindingType][1] ? (
                      parseKeyCombinationToString(Settings.KeyBindings[keyBindingType][1])
                    ) : (
                      // Use a non-breaking space to make the button fit to the parent td element.
                      <>&nbsp;</>
                    )}
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <SettingUpKeyBindingModal
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        keyBindingType={keyBindingType}
        isPrimary={isPrimary}
      />
    </GameOptionsPage>
  );
}
