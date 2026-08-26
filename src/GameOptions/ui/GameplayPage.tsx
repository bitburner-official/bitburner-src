import React from "react";
import { OptionSwitch } from "../../ui/React/OptionSwitch";
import { Settings } from "../../Settings/Settings";
import { GameOptionsPage } from "./GameOptionsPage";
import { Player } from "@player";
import { toggleSuppressErrorModals } from "../../ErrorHandling/ErrorState";

export const GameplayPage = (): React.ReactElement => {
  const toggleSuppressErrorModalsSetting = (newValue: boolean): void => {
    Settings.SuppressErrorModals = newValue;
    toggleSuppressErrorModals(newValue, true);
  };
  return (
    <GameOptionsPage title="游戏玩法">
      <OptionSwitch
        checked={Settings.SuppressMessages}
        onChange={(newValue) => (Settings.SuppressMessages = newValue)}
        text="屏蔽剧情消息"
        tooltip={
          <>
            设置后，你收到的任何消息都不会以弹窗形式出现在屏幕上。它们仍会以“.msg”文件的形式发送到你的家用电脑，
            可通过终端的“cat”命令查看。
          </>
        }
      />
      <OptionSwitch
        checked={Settings.SuppressFactionInvites}
        onChange={(newValue) => (Settings.SuppressFactionInvites = newValue)}
        text="屏蔽派系邀请"
        tooltip={
          <>
            设置后，你收到的派系邀请不会以弹窗形式显示。待处理的派系邀请可在“派系”页面中查看。
          </>
        }
      />
      <OptionSwitch
        checked={Settings.SuppressTravelConfirmation}
        onChange={(newValue) => (Settings.SuppressTravelConfirmation = newValue)}
        text="屏蔽旅行确认"
        tooltip={
          <>
            设置后，旅行前的确认消息将不再显示。一旦点击，将自动扣除旅行费用。
          </>
        }
      />
      <OptionSwitch
        checked={Settings.SuppressBuyAugmentationConfirmation}
        onChange={(newValue) => (Settings.SuppressBuyAugmentationConfirmation = newValue)}
        text="屏蔽强化购买确认"
        tooltip={<>设置后，购买强化前的确认消息将不再显示。</>}
      />
      <OptionSwitch
        checked={Settings.SuppressTIXPopup}
        onChange={(newValue) => (Settings.SuppressTIXPopup = newValue)}
        text="屏蔽 TIX 消息"
        tooltip={<>设置后，股票市场将不会创建任何弹窗。</>}
      />
      <OptionSwitch
        checked={Settings.SuppressErrorModals}
        onChange={toggleSuppressErrorModalsSetting}
        text="屏蔽错误弹窗"
        tooltip={
          <>
            设置后，脚本错误将不会创建任何弹窗。错误仍可在“运行中的脚本”页面的“最近错误”标签中查看。
          </>
        }
      />
      {Player.bladeburner && (
        <OptionSwitch
          checked={Settings.SuppressBladeburnerPopup}
          onChange={(newValue) => (Settings.SuppressBladeburnerPopup = newValue)}
          text="屏蔽 Bladeburner 弹窗"
          tooltip={
            <>
              设置后，当你的 Bladeburner 行动因忙于其他事务而被中断时，将不会显示弹窗消息。
            </>
          }
        />
      )}
    </GameOptionsPage>
  );
};
