import React, { useState } from "react";
import { Settings } from "../../Settings/Settings";
import { GameOptionsPage } from "./GameOptionsPage";
import { OptionsSlider } from "./OptionsSlider";
import { AutoexecInput } from "./AutoexecInput";
import { OptionSwitch } from "../../ui/React/OptionSwitch";

export const SystemPage = (): React.ReactElement => {
  const [recentScriptsSize, setRecentScriptsSize] = useState(Settings.MaxRecentScriptsCapacity);
  const [logSize, setLogSize] = useState(Settings.MaxLogCapacity);
  const [portSize, setPortSize] = useState(Settings.MaxPortCapacity);
  const [terminalSize, setTerminalSize] = useState(Settings.MaxTerminalCapacity);
  const [autosaveInterval, setAutosaveInterval] = useState(Settings.AutosaveInterval);
  const [tailRenderInterval, setTailRenderInterval] = useState(Settings.TailRenderInterval);

  function handlePortSizeChange(_event: Event | React.SyntheticEvent, newValue: number | number[]): void {
    setPortSize(newValue as number);
    Settings.MaxPortCapacity = newValue as number;
  }

  function handleTerminalSizeChange(_event: Event | React.SyntheticEvent, newValue: number | number[]): void {
    setTerminalSize(newValue as number);
    Settings.MaxTerminalCapacity = newValue as number;
  }

  function handleTailIntervalChange(_event: Event | React.SyntheticEvent, newValue: number | number[]): void {
    setTailRenderInterval(newValue as number);
    Settings.TailRenderInterval = newValue as number;
  }

  function handleRecentScriptsSizeChange(_event: Event | React.SyntheticEvent, newValue: number | number[]): void {
    setRecentScriptsSize(newValue as number);
    Settings.MaxRecentScriptsCapacity = newValue as number;
  }

  function handleLogSizeChange(_event: Event | React.SyntheticEvent, newValue: number | number[]): void {
    setLogSize(newValue as number);
    Settings.MaxLogCapacity = newValue as number;
  }

  function handleAutosaveIntervalChange(_event: Event | React.SyntheticEvent, newValue: number | number[]): void {
    setAutosaveInterval(newValue as number);
    Settings.AutosaveInterval = newValue as number;
  }
  return (
    <GameOptionsPage title="系统">
      {/* Wrap in a React fragment to prevent the sliders from breaking as list items */}
      <>
        <AutoexecInput
          label="自动执行脚本 + 参数"
          tooltip={
            <>
              游戏加载时运行的脚本路径（可附带参数）。该脚本将在家用电脑上运行，并先于所有已存档的运行中脚本启动。
              它会带有“临时”属性，因此如果它持续运行，将不会被保存进存档。
            </>
          }
        />
        <br />
        <OptionsSlider
          label="最近被杀死的脚本数量"
          initialValue={recentScriptsSize}
          callback={handleRecentScriptsSizeChange}
          step={25}
          min={0}
          max={500}
          tooltip={<>游戏保留的最近被杀死脚本的 最大数量。</>}
        />
        <OptionsSlider
          label="Netscript 日志大小"
          initialValue={logSize}
          callback={handleLogSizeChange}
          step={20}
          min={20}
          max={500}
          tooltip={
            <>
              单个脚本日志可容纳的最大行数。设置过高时，若同时运行大量脚本，游戏可能占用大量内存。
            </>
          }
        />
        <OptionsSlider
          label="Netscript 端口大小"
          initialValue={portSize}
          callback={handlePortSizeChange}
          step={1}
          min={20}
          max={100}
          tooltip={
            <>
              使用 Netscript 的 write() 函数可写入端口的最大条目数。设置过高可能导致游戏占用大量内存。
            </>
          }
        />
        <OptionsSlider
          label="终端容量"
          initialValue={terminalSize}
          callback={handleTerminalSizeChange}
          step={50}
          min={50}
          max={500}
          tooltip={
            <>
              可写入终端的最大条目数。设置过高可能导致游戏占用大量内存。
            </>
          }
          marks
        />
        <OptionsSlider
          label="自动存档间隔（秒）"
          initialValue={autosaveInterval}
          callback={handleAutosaveIntervalChange}
          step={30}
          min={0}
          max={600}
          tooltip={<>两次自动存档之间的时间间隔（秒）。设为 0 可禁用自动存档。</>}
          marks
        />
        <OptionsSlider
          label="Tail 窗口渲染间隔（毫秒）"
          initialValue={tailRenderInterval}
          callback={handleTailIntervalChange}
          step={100}
          min={100}
          max={5000}
          tooltip={
            <>
              两次 Tail 窗口重新渲染之间的最小毫秒数。若打开了许多 Tail 窗口，设置过低可能导致性能下降。
            </>
          }
        />
      </>

      <OptionSwitch
        checked={Settings.SuppressSavedGameToast}
        onChange={(newValue) => (Settings.SuppressSavedGameToast = newValue)}
        text="隐藏自动存档提示"
        tooltip={<>设置后，自动存档完成后将不会显示“游戏已存档！”提示。</>}
      />
      <OptionSwitch
        checked={Settings.SuppressAutosaveDisabledWarnings}
        onChange={(newValue) => (Settings.SuppressAutosaveDisabledWarnings = newValue)}
        text="隐藏自动存档已禁用警告"
        tooltip={<>设置后，自动存档被禁用（设为 0）时将不会触发警告。</>}
      />
      <OptionSwitch
        checked={Settings.EnableSaveDataBackupReminder}
        onChange={(newValue) => {
          Settings.EnableSaveDataBackupReminder = newValue;
        }}
        promptOptions={{
          // Only require confirmation if the player is disabling the reminder.
          shouldShowPrompt: (switchNewValue) => !switchNewValue,
          text: "确定要禁用该提醒吗？",
        }}
        text="启用存档数据备份提醒"
        tooltip={<>若禁用，我们将不再提醒你备份存档数据。</>}
      />
      <OptionSwitch
        checked={Settings.SaveGameOnFileSave}
        onChange={(newValue) => (Settings.SaveGameOnFileSave = newValue)}
        text="保存文件时自动存档"
        tooltip={<>在脚本编辑器中每次保存文件时都会保存游戏进度。</>}
      />
      <OptionSwitch
        checked={Settings.ExcludeRunningScriptsFromSave}
        onChange={(newValue) => (Settings.ExcludeRunningScriptsFromSave = newValue)}
        text="存档时排除运行中的脚本"
        tooltip={
          <>
            设置后，存档文件将不包含所有运行中的脚本。这仅在存档严重卡顿时有用。每次启动游戏后你都需要重新启动脚本，
            可以借助“autoexec”选项来实现。
          </>
        }
      />
    </GameOptionsPage>
  );
};
