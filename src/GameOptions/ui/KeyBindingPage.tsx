import { Button, Typography } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { Settings } from "../../Settings/Settings";
import { getRecordKeys } from "../../Types/Record";
import { Modal } from "../../ui/React/Modal";
import { ComplexPage } from "../../ui/Enums";
import { KEY } from "../../utils/KeyboardEventKey";
import {
  areDifferentKeyCombinations,
  convertKeyboardEventToKeyCombination,
  CurrentKeyBindings,
  DefaultKeyBindings,
  determineKeyBindingTypes,
  getKeyCombination,
  isKeyCombinationPressed,
  isSpoilerKeyBindingType,
  KeyBindingEvents,
  KeyBindingEventType,
  mergePlayerDefinedKeyBindings,
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
  const conflicts: Set<string> = determineKeyBindingTypes(CurrentKeyBindings, newCombination);
  // Check if the new combination is the same as the current key binding.
  if (conflicts.has(keyBindingType)) {
    const currentKeyBinding = getKeyCombination(CurrentKeyBindings, keyBindingType, isPrimary);
    if (
      currentKeyBinding &&
      currentKeyBinding.control === newCombination.control &&
      currentKeyBinding.alt === newCombination.alt &&
      currentKeyBinding.shift === newCombination.shift &&
      currentKeyBinding.meta === newCombination.meta &&
      currentKeyBinding.key === newCombination.key
    ) {
      conflicts.delete(keyBindingType);
    }
  }
  // Common single-key hotkeys.
  if (
    isKeyCombinationPressed(newCombination, { key: KEY.ESC }) ||
    isKeyCombinationPressed(newCombination, { key: KEY.ENTER }) ||
    isKeyCombinationPressed(newCombination, { key: KEY.TAB })
  ) {
    conflicts.add("常用快捷键");
  }
  // Copy - Paste - Cut
  if (window.navigator.userAgent.includes("Mac")) {
    if (
      isKeyCombinationPressed(newCombination, { meta: true, key: KEY.C }) ||
      isKeyCombinationPressed(newCombination, { meta: true, key: KEY.V }) ||
      isKeyCombinationPressed(newCombination, { meta: true, key: KEY.X })
    ) {
      conflicts.add("常用快捷键");
    }
  } else {
    if (
      isKeyCombinationPressed(newCombination, { control: true, key: KEY.C }) ||
      isKeyCombinationPressed(newCombination, { control: true, key: KEY.V }) ||
      isKeyCombinationPressed(newCombination, { control: true, key: KEY.X })
    ) {
      conflicts.add("常用快捷键");
    }
  }
  // Terminal-ClearScreen
  if (isKeyCombinationPressed(newCombination, { control: true, key: KEY.L })) {
    conflicts.add("Terminal-ClearScreen");
  }
  // Bash hotkeys
  if (
    Settings.EnableBashHotkeys &&
    (isKeyCombinationPressed(newCombination, { control: true, key: KEY.M }) ||
      isKeyCombinationPressed(newCombination, { control: true, key: KEY.P }) ||
      isKeyCombinationPressed(newCombination, { control: true, key: KEY.C }) ||
      isKeyCombinationPressed(newCombination, { control: true, key: KEY.A }) ||
      isKeyCombinationPressed(newCombination, { control: true, key: KEY.E }) ||
      isKeyCombinationPressed(newCombination, { control: true, key: KEY.B }) ||
      isKeyCombinationPressed(newCombination, { alt: true, key: KEY.B }) ||
      isKeyCombinationPressed(newCombination, { control: true, key: KEY.F }) ||
      isKeyCombinationPressed(newCombination, { alt: true, key: KEY.F }) ||
      isKeyCombinationPressed(newCombination, { control: true, key: KEY.H }) ||
      isKeyCombinationPressed(newCombination, { control: true, key: KEY.D }) ||
      isKeyCombinationPressed(newCombination, { control: true, key: KEY.W }) ||
      isKeyCombinationPressed(newCombination, { alt: true, key: KEY.D }) ||
      isKeyCombinationPressed(newCombination, { control: true, key: KEY.U }) ||
      isKeyCombinationPressed(newCombination, { control: true, key: KEY.K }))
  ) {
    conflicts.add("Bash 快捷键");
  }
  // Remove spoilers in the list
  if (!knowAboutBitverse()) {
    for (const conflict of conflicts) {
      if (!isSpoilerKeyBindingType(conflict)) {
        continue;
      }
      conflicts.delete(conflict);
      conflicts.add("终局内容");
    }
  }
  return conflicts;
}

export function isCustomKeyCombination(keyBindingType: KeyBindingType, isPrimary: boolean): boolean {
  const slot = isPrimary ? 0 : 1;
  // Check if the player sets a binding.
  if (!Settings.KeyBindings[keyBindingType] || !Settings.KeyBindings[keyBindingType][slot]) {
    return false;
  }
  // If there is not a default binding, this binding is a custom one.
  if (!DefaultKeyBindings[keyBindingType][slot]) {
    return true;
  }
  return areDifferentKeyCombinations(
    DefaultKeyBindings[keyBindingType][slot],
    Settings.KeyBindings[keyBindingType][slot],
  );
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
  const [combination, setCombination] = useState(getKeyCombination(CurrentKeyBindings, keyBindingType, isPrimary));
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
    const currentKeyCombination = getKeyCombination(CurrentKeyBindings, keyBindingType, isPrimary);
    setCombination(currentKeyCombination);
    setConflicts(
      currentKeyCombination
        ? determineConflictKeys(keyBindingType, isPrimary, currentKeyCombination)
        : new Set<string>(),
    );
    /**
     * Add/remove handlers and emit an event that notifies subscribers if the player is setting up key bindings. When
     * they are doing that, we need to stop processing key events. For example, if they are setting key bindings and
     * they press Alt+T, we need to save that setting instead of going to the terminal.
     *
     * The action of going to a different page is handled in src\Sidebar\ui\SidebarRoot.tsx. When checking simple cases
     * (focusing on working, being in BitVerse, etc.), we can use the Player object and Router.page(). However, checking
     * if the player is setting key bindings is not easy for code in SidebarRoot, especially if we want to decouple
     * their logic and keep the dependency chain simple. It's best to do that by using the event system.
     */
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
    const defaultKeyCombination = getKeyCombination(DefaultKeyBindings, keyBindingType, isPrimary);
    setCombination(defaultKeyCombination);
    setConflicts(
      defaultKeyCombination
        ? determineConflictKeys(keyBindingType, isPrimary, defaultKeyCombination)
        : new Set<string>(),
    );
  };
  const onClickOK = () => {
    if (!Settings.KeyBindings[keyBindingType]) {
      Settings.KeyBindings[keyBindingType] = structuredClone(DefaultKeyBindings[keyBindingType]);
    }
    Settings.KeyBindings[keyBindingType][isPrimary ? 0 : 1] = combination;
    // Merge Settings.KeyBindings with DefaultKeyBindings.
    mergePlayerDefinedKeyBindings(Settings.KeyBindings);
    onClose();
  };
  const onClickCancel = () => {
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        <Typography style={{ padding: "10px 20px" }}>请按下你想使用的按键</Typography>
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
          {conflicts.size === 0 ? "未检测到冲突" : `冲突：${[...conflicts]}`}
        </Typography>
        <div style={{ margin: "10px 0" }}>
          <Button style={{ minWidth: "100px" }} onClick={onClickClear}>
            清除
          </Button>
          <Button style={{ marginLeft: "10px", minWidth: "100px" }} onClick={onClickDefault}>
            默认
          </Button>
        </div>
        <div>
          <Button style={{ minWidth: "100px" }} onClick={onClickOK}>
            确定
          </Button>
          <Button style={{ marginLeft: "10px", minWidth: "100px" }} onClick={onClickCancel}>
            取消
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function KeyBindingPage(): React.ReactElement {
  const [popupOpen, setPopupOpen] = useState(false);
  const [keyBindingType, setKeyBindingType] = useState<KeyBindingType>(ComplexPage.Options);
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
          每个“操作”最多可分配 2 个按键组合。如果同一按键组合被分配给多个操作，按下该组合将执行所有这些操作。
        </Typography>
        <br />
        <Typography>
          某些按键组合无法使用。操作系统和浏览器通常内置了一些无法覆盖的按键绑定。例如在 Windows 上，Windows+R
          始终会打开“运行”对话框。
        </Typography>
        <br />
        <Typography>
          设置按键绑定时，冲突列表中可能出现“终局内容”。这表示该按键组合当前正被你尚未解锁的功能使用。
        </Typography>
        <br />
        <Typography>
          在非 Apple 键盘上，“Windows”键（其他名称：win、start、super、meta 等）显示为 ⊞。在 Apple 键盘上，
          command 键显示为 ⌘。
        </Typography>
      </>,
    );
  };

  const keyBindingRows = getRecordKeys(CurrentKeyBindings)
    .filter(
      (keyBindingType) =>
        knowAboutBitverse() || !(SpoilerKeyBindingTypes as unknown as string[]).includes(keyBindingType),
    )
    .map((keyBindingType) => {
      return (
        <tr key={keyBindingType}>
          <td>
            <Typography minWidth="250px">{keyBindingType}</Typography>
          </td>
          {[0, 1].map((value) => {
            const isPrimary = value === 0;
            return (
              <td key={`${keyBindingType}-${value}`}>
                <Button
                  sx={{
                    minWidth: "250px",
                    color: `${
                      isCustomKeyCombination(keyBindingType, isPrimary)
                        ? Settings.theme.warning
                        : Settings.theme.primary
                    }`,
                  }}
                  onClick={() => showModal(keyBindingType, isPrimary)}
                >
                  {CurrentKeyBindings[keyBindingType][value] ? (
                    parseKeyCombinationToString(CurrentKeyBindings[keyBindingType][value])
                  ) : (
                    // Use a non-breaking space to make the button fit to the parent td element.
                    <>&nbsp;</>
                  )}
                </Button>
              </td>
            );
          })}
        </tr>
      );
    });

  return (
    <GameOptionsPage title="按键绑定">
      <Button onClick={onClickHowToUse}>使用说明</Button>
      <br />
      <table>
        <tbody>{keyBindingRows}</tbody>
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
