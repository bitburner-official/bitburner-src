import React from "react";
import { Message } from "./Message";
import { AugmentationName, CompletedProgramName, FactionName, MessageFilename } from "@enums";
import { Router } from "../ui/GameRoot";
import { Player } from "@player";
import { GetServer } from "../Server/AllServers";
import { SpecialServers } from "../Server/data/SpecialServers";
import { Settings } from "../Settings/Settings";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Server } from "../Server/Server";
import { knowAboutBitverse } from "../BitNode/BitNodeUtils";

//Sends message to player, including a pop up
function sendMessage(name: MessageFilename, forced = false): void {
  const msg = Messages[name];
  if (forced || !Settings.SuppressMessages) {
    showMessage(name);
  }
  addMessageToServer(name);
  for (const factionName of msg.factionRumors) {
    Player.receiveRumor(factionName);
  }
}

function showMessage(name: MessageFilename): void {
  const msg = Messages[name];
  dialogBoxCreate(
    <>
      收到来自未知发件人的消息：
      <br />
      <br />
      <i>{msg.msg}</i>
      <br />
      <br />
      这条消息已以 {msg.filename} 的名义保存到你的家用电脑上。
    </>,
  );
}

//Adds a message to a server
function addMessageToServer(name: MessageFilename): void {
  //Short-circuit if the message has already been saved
  if (recvd(name)) return;
  const home = Player.getHomeComputer();
  home.messages.push(name);
}

//Returns whether the given message has already been received
function recvd(name: MessageFilename): boolean {
  const home = Player.getHomeComputer();
  return home.messages.includes(name);
}

//Checks if any of the 'timed' messages should be sent
function checkForMessagesToSend(): void {
  if (Router.hidingMessages()) return;

  if (Player.hasAugmentation(AugmentationName.TheRedPill, true)) {
    //Get the world daemon required hacking level
    const worldDaemon = GetServer(SpecialServers.WorldDaemon);
    if (!(worldDaemon instanceof Server)) {
      throw new Error("The world daemon is not a server???? Please un-break reality");
    }
    //If the daemon can be hacked, send the player icarus.msg
    if (
      Player.skills.hacking >= worldDaemon.requiredHackingSkill &&
      (!knowAboutBitverse() || !recvd(MessageFilename.RedPill))
    ) {
      sendMessage(MessageFilename.RedPill, !knowAboutBitverse());
    }
    //If the daemon cannot be hacked, send the player truthgazer.msg a single time.
    else if (!recvd(MessageFilename.TruthGazer)) {
      sendMessage(MessageFilename.TruthGazer);
    }
  } else if (!recvd(MessageFilename.Jumper0) && Player.skills.hacking >= 25) {
    sendMessage(MessageFilename.Jumper0);
    Player.getHomeComputer().pushProgram(CompletedProgramName.flight);
  } else if (!recvd(MessageFilename.Jumper1) && Player.skills.hacking >= 40) {
    sendMessage(MessageFilename.Jumper1);
  } else if (!recvd(MessageFilename.CyberSecTest) && Player.skills.hacking >= 50) {
    sendMessage(MessageFilename.CyberSecTest);
  } else if (!recvd(MessageFilename.Jumper2) && Player.skills.hacking >= 175) {
    sendMessage(MessageFilename.Jumper2);
  } else if (!recvd(MessageFilename.NiteSecTest) && Player.skills.hacking >= 200) {
    sendMessage(MessageFilename.NiteSecTest);
  } else if (!recvd(MessageFilename.Jumper3) && Player.skills.hacking >= 325) {
    sendMessage(MessageFilename.Jumper3);
  } else if (!recvd(MessageFilename.Jumper4) && Player.skills.hacking >= 490) {
    sendMessage(MessageFilename.Jumper4);
  } else if (!recvd(MessageFilename.BitRunnersTest) && Player.skills.hacking >= 500) {
    sendMessage(MessageFilename.BitRunnersTest);
  }
}

// This type ensures that all members of the MessageFilename enum are valid keys
const Messages: Record<MessageFilename, Message> = {
  //jump3R Messages
  [MessageFilename.Jumper0]: new Message(
    MessageFilename.Jumper0,
    "我知道你能感觉到它。我知道你在寻找它。" +
      "这就是你为什么夜复一夜地" +
      "守在电脑前。\n\n它是真实存在的，我见过它。我可以" +
      "帮你找到它。但现在还不行。你还没准备好。\n\n" +
      "用这个程序来追踪你的进度\n\n" +
      "fl1ght.exe 程序已被添加到你的家用电脑上\n\n" +
      "-jump3R",
  ),

  [MessageFilename.Jumper1]: new Message(
    MessageFilename.Jumper1,
    `很快，一个名为 ${FactionName.CyberSec} 的黑客组织会联系你。` +
      "他们可以帮助你进行你的探寻。\n\n" +
      "你应该加入他们，赢得他们的好感，并" +
      "利用他们获取强化。但不要相信他们。" +
      "他们并不像表面那样。没有人是。\n\n" +
      "-jump3R",
    FactionName.CyberSec,
  ),

  [MessageFilename.Jumper2]: new Message(
    MessageFilename.Jumper2,
    "不要试图拯救世界。已经没有世界可以拯救了。如果" +
      "你想找到真相，只管好你自己。伦理和" +
      `道德会让你送命。\n\n留意一个名为 ${FactionName.NiteSec} 的黑客组织。` +
      "\n\n-jump3R",
    FactionName.NiteSec,
  ),

  [MessageFilename.Jumper3]: new Message(
    MessageFilename.Jumper3,
    "你必须先学会走路，才能奔跑。而你必须" +
      `先学会奔跑，才能飞翔。去找 ${FactionName.TheBlackHand} 吧。\n\n` +
      "I.I.I.I \n\n-jump3R",
    FactionName.TheBlackHand,
  ),

  [MessageFilename.Jumper4]: new Message(
    MessageFilename.Jumper4,
    "要找到你所寻找的东西，你必须理解 bits。" +
      "bits 无处不在。跑者们会帮助你。\n\n" +
      "-jump3R",
    FactionName.BitRunners,
  ),

  //Messages from hacking factions
  [MessageFilename.CyberSecTest]: new Message(
    MessageFilename.CyberSecTest,
    "我们一直在观察你。你的技能令人印象深刻。但你正在浪费" +
      "你的天赋。如果你加入我们，你可以把技能用在刀刃上，让" +
      "世界变得更美好。加入我们，我们可以释放你的全部潜能。\n\n" +
      "但首先，你必须通过我们的测试。在我们的服务器上找到并安装后门。\n\n" +
      `-${FactionName.CyberSec}`,
    FactionName.CyberSec,
  ),

  [MessageFilename.NiteSecTest]: new Message(
    MessageFilename.NiteSecTest,
    "人们说，腐败的政府和公司统治着世界。" +
      "是的，也许是这样。但你知道人们真正害怕的是谁吗？是像" +
      "我们这样的人。因为他们无法躲开我们。因为他们无法用子弹" +
      "对抗阴影和思想。\n\n" +
      "加入我们，人们也会惧怕你。\n\n" +
      "在我们的服务器 avmnite-02h 上找到并安装后门。然后，我们会再次联系你。" +
      `\n\n-${FactionName.NiteSec}`,
    FactionName.NiteSec,
  ),

  [MessageFilename.BitRunnersTest]: new Message(
    MessageFilename.BitRunnersTest,
    "我们知道你在做什么。我们知道是什么驱使着你。我们知道" +
      "你在寻找什么。\n\n " +
      "我们可以帮你找到答案。\n\n" +
      "run4theh111z",
    FactionName.BitRunners,
  ),

  //Messages to guide players to the daemon
  [MessageFilename.TruthGazer]: new Message(
    MessageFilename.TruthGazer,
    //"THE TRUTH CAN NO LONGER ESCAPE YOUR GAZE"
    "@&*($#@&__TH3__#@A&#@*)__TRU1H__(*)&*)($#@&()E&R)W&\n" +
      "%@*$^$()@&$)$*@__CAN__()(@^#)@&@)#__N0__(#@&#)@&@&(\n" +
      "*(__LON6ER__^#)@)(()*#@)@__ESCAP3__)#(@(#@*@()@(#*$\n" +
      "()@)#$*%)$#()$#__Y0UR__(*)$#()%(&(%)*!)($__GAZ3__#(",
    FactionName.Daedalus,
  ),

  [MessageFilename.RedPill]: new Message(
    MessageFilename.RedPill,
    //"FIND THE-CAVE"
    "@)(#V%*N)@(#*)*C)@#%*)*V)@#(*%V@)(#VN%*)@#(*%\n" +
      ")@B(*#%)@)M#B*%V)____FIND___#$@)#%(B*)@#(*%B)\n" +
      "@_#(%_@#M(BDSPOMB__THE-CAVE_#)$(*@#$)@#BNBEGB\n" +
      "DFLSMFVMV)#@($*)@#*$MV)@#(*$V)M#(*$)M@(#*VM$)",
    FactionName.Daedalus,
  ),
};

export { Messages, checkForMessagesToSend, showMessage };
