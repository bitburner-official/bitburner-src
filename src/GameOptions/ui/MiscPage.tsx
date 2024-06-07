import React from "react";
import { Settings } from "../../Settings/Settings";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { GameOptionsPage } from "./GameOptionsPage";

export const MiscPage = (): React.ReactElement => {
  return (
    <GameOptionsPage title="Misc">
      <OptionSwitch
        checked={Settings.DisableHotkeys}
        onChange={(newValue) => (Settings.DisableHotkeys = newValue)}
        text="Disable hotkeys"
        tooltip={
          <>
            If this is set, then most hotkeys (keyboard shortcuts) in the game are disabled. This includes Terminal
            commands, hotkeys to navigate between different parts of the game, and the "Save and Close (Ctrl + b)"
            hotkey in the Text Editor.
          </>
        }
      />
      <OptionSwitch
        checked={Settings.EnableBashHotkeys}
        onChange={(newValue) => (Settings.EnableBashHotkeys = newValue)}
        text="Enable bash hotkeys"
        tooltip={
          <>
            Improved Bash emulation mode. Setting this to 1 enables several new Terminal shortcuts and features that
            more closely resemble a real Bash-style shell. Note that when this mode is enabled, the default browser
            shortcuts are overridden by the new Bash shortcuts.
          </>
        }
      />
      <OptionSwitch
        checked={Settings.EnableHistorySearch}
        onChange={(newValue) => (Settings.EnableHistorySearch = newValue)}
        text="Enable terminal history search with arrow keys"
        tooltip={
          <>
            If there is user-entered text in the terminal, using the up arrow will search through the terminal history
            for previous commands that start with the current text, instead of navigating to the most recent history
            item. Search results can be executed immediately via 'enter', or autofilled into the terminal with 'tab'.
          </>
        }
      />
      <OptionSwitch
        checked={Settings.MonacoDefaultToVim}
        onChange={(newValue) => (Settings.MonacoDefaultToVim = newValue)}
        text="Enable Vim as default editor"
        tooltip={
          <>
            This setting is only used when opening a file through ways that do not determine the editor mode. Using
            'nano' or 'vim' will set the editor mode for the specified files, while 'ls' will open the file using the
            the value from this setting.
          </>
        }
      />
    </GameOptionsPage>
  );
};
