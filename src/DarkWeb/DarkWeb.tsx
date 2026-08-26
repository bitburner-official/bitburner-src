import React from "react";
import { DarkWebItems } from "./DarkWebItems";
import { formatMoney } from "../ui/formatNumber";
import { Player } from "@player";
import { Terminal } from "../Terminal";
import { SpecialServers } from "../Server/data/SpecialServers";
import { Money } from "../ui/React/Money";
import { DarkWebItem } from "./DarkWebItem";
import { isCreateProgramWork } from "../Work/CreateProgramWork";
import { CompletedProgramName } from "@enums";
import { getDarkscapeNavigator } from "../DarkNet/effects/effects";

//Posts a "help" message if connected to DarkWeb
export function checkIfConnectedToDarkweb(): void {
  const server = Player.getCurrentServer();
  if (server !== null && SpecialServers.DarkWeb == server.hostname) {
    Terminal.print(
      "你已连接到暗网。在暗网上你可以购买非法物品。" +
        "使用 'buy -l' 命令显示所有可购买物品的列表。使用 'buy [物品名]' " +
        "购买物品。使用 'buy -a' 购买所有尚未拥有的物品。你可以在任何地方使用 'buy' 命令，" +
        "而不仅是在连接到 'darkweb' 服务器时。",
    );
  }
}

export function listAllDarkwebItems(): void {
  for (const key of Object.keys(DarkWebItems) as (keyof typeof DarkWebItems)[]) {
    const item = DarkWebItems[key];

    const cost = Player.getHomeComputer().programs.includes(item.program) ? (
      <span style={{ color: `green` }}>[OWNED]</span>
    ) : (
      <Money money={item.price} />
    );

    Terminal.printRaw(
      <>
        <span>{item.program}</span> - <span>{cost}</span> - <span>{item.description}</span>
      </>,
    );
  }
}

export function buyDarkwebItem(itemName: string): void {
  itemName = itemName.toLowerCase();

  // find the program that matches, if any
  let item: DarkWebItem | null = null;

  for (const key of Object.keys(DarkWebItems) as (keyof typeof DarkWebItems)[]) {
    const i = DarkWebItems[key];
    if (i.program.toLowerCase() == itemName) {
      item = i;
    }
  }

  // return if invalid
  if (item === null) {
    Terminal.error("无法识别的物品：" + itemName);
    return;
  }

  // return if the player already has it.
  if (Player.hasProgram(item.program)) {
    Terminal.print("你已经拥有 " + item.program + " 程序");
    return;
  }

  // return if the player doesn't have enough money
  if (Player.money < item.price) {
    Terminal.error("资金不足，无法购买 " + item.program);
    return;
  }

  // buy and push
  Player.loseMoney(item.price, "other");

  Player.getHomeComputer().pushProgram(item.program);
  // Cancel if the program is in progress of writing
  if (isCreateProgramWork(Player.currentWork) && Player.currentWork.programName === item.program) {
    Player.finishWork(true);
  }

  Terminal.print(
    "你已购买 " + item.program + " 程序。新程序可以在你的家用电脑上找到。",
  );

  if (item.program === CompletedProgramName.darkscape) {
    getDarkscapeNavigator();
  }
}

export function buyAllDarkwebItems(): void {
  const itemsToBuy: DarkWebItem[] = [];

  for (const key of Object.keys(DarkWebItems) as (keyof typeof DarkWebItems)[]) {
    const item = DarkWebItems[key];
    if (!Player.hasProgram(item.program)) {
      itemsToBuy.push(item);
      if (item.price > Player.money) {
        Terminal.error("购买 " + item.program + " 还需要 " + formatMoney(item.price - Player.money));
        return;
      } else {
        buyDarkwebItem(item.program);
      }
    }
  }

  if (itemsToBuy.length === 0) {
    Terminal.print("所有可购买的程序都已经购买过了。");
    return;
  }

  if (itemsToBuy.length > 0) {
    Terminal.print("所有程序均已购买。");
    return;
  }
}
