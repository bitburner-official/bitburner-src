import React from "react";
import { Settings } from "../../Settings/Settings";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { GameOptionsPage } from "./GameOptionsPage";

export const MiscPage = (): React.ReactElement => {
  return (
    <GameOptionsPage title="杂项">
      <OptionSwitch
        checked={Settings.DisableHotkeys}
        onChange={(newValue) => (Settings.DisableHotkeys = newValue)}
        text="禁用快捷键"
        tooltip={
          <>
            设置后，游戏中的大部分快捷键将被禁用。这包括终端命令、在游戏不同界面之间导航的快捷键，以及
            文本编辑器中的“保存并关闭（Ctrl + b）”快捷键。
          </>
        }
      />
      <OptionSwitch
        checked={Settings.EnableBashHotkeys}
        onChange={(newValue) => (Settings.EnableBashHotkeys = newValue)}
        text="启用 bash 快捷键"
        tooltip={
          <>
            改进的 Bash 模拟模式。开启后将启用多个新的终端快捷键和功能，使其更接近真实的 Bash 风格 Shell。
            注意：此模式启用后，浏览器默认快捷键会被新的 Bash 快捷键覆盖。
          </>
        }
      />
      <OptionSwitch
        checked={Settings.EnableHistorySearch}
        onChange={(newValue) => (Settings.EnableHistorySearch = newValue)}
        text="使用方向键搜索终端历史记录"
        tooltip={
          <>
            当终端中有用户输入的文字时，按上方向键将在终端历史中搜索以当前文字开头的既往命令，而不是跳转到最近的历史记录。
            搜索结果可通过“enter”立即执行，或通过“tab”自动填入终端。
          </>
        }
      />
      <OptionSwitch
        checked={Settings.MonacoDefaultToVim}
        onChange={(newValue) => (Settings.MonacoDefaultToVim = newValue)}
        text="默认使用 Vim 编辑器"
        tooltip={
          <>
            此设置仅在以无法确定编辑器模式的方式打开文件时使用。使用“nano”或“vim”会为指定文件设定编辑器模式，
            而“ls”则会按照此设置的值打开文件。
          </>
        }
      />
      <OptionSwitch
        checked={Settings.SyncSteamAchievements}
        onChange={(newValue) => (Settings.SyncSteamAchievements = newValue)}
        text="同步 Steam 成就"
        tooltip={
          <>
            此设置仅用于 Steam 版本。启用后，游戏会自动将你已解锁的 Steam 成就同步到 Steam 云端。
          </>
        }
      />
    </GameOptionsPage>
  );
};
