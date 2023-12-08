import React from "react";
import { Message } from "./Message";
import { AugmentationName, CompletedProgramName, FactionName, MessageFilename } from "@enums";
import { Router } from "../ui/GameRoot";
import { Player } from "@player";
import { Page } from "../ui/Router";
import { GetServer } from "../Server/AllServers";
import { SpecialServers } from "../Server/data/SpecialServers";
import { Settings } from "../Settings/Settings";
import { dialogBoxCreate } from "../ui/React/DialogBox";
import { Server } from "../Server/Server";

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
      Message received from unknown sender:
      <br />
      <br />
      <i>{msg.msg}</i>
      <br />
      <br />
      This message was saved as {msg.filename} onto your home computer.
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
  if (Router.page() === Page.BitVerse) return;

  if (Player.hasAugmentation(AugmentationName.TheRedPill, true)) {
    //Get the world daemon required hacking level
    const worldDaemon = GetServer(SpecialServers.WorldDaemon);
    if (!(worldDaemon instanceof Server)) {
      throw new Error("The world daemon is not a server???? Please un-break reality");
    }
    //If the daemon can be hacked, send the player icarus.msg
    if (
      Player.skills.hacking >= worldDaemon.requiredHackingSkill &&
      (Player.sourceFiles.size === 0 || !recvd(MessageFilename.RedPill))
    ) {
      sendMessage(MessageFilename.RedPill, Player.sourceFiles.size === 0);
    }
    //If the daemon cannot be hacked, send the player truthgazer.msg a single time.
    else if (!recvd(MessageFilename.TruthGazer)) {
      sendMessage(MessageFilename.TruthGazer);
    }
  } else if (!recvd(MessageFilename.Jumper0) && Player.skills.hacking >= 25) {
    sendMessage(MessageFilename.Jumper0);
    const homeComp = Player.getHomeComputer();
    if (!homeComp.programs.includes(CompletedProgramName.flight)) {
      homeComp.programs.push(CompletedProgramName.flight);
    }
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
    "I know you can sense it. I know you're searching for it. " +
      "It's why you spend night after " +
      "night at your computer. \n\nIt's real, I've seen it. And I can " +
      "help you find it. But not right now. You're not ready yet.\n\n" +
      "Use this program to track your progress\n\n" +
      "The fl1ght.exe program was added to your home computer\n\n" +
      "-jump3R",
  ),

  [MessageFilename.Jumper1]: new Message(
    MessageFilename.Jumper1,
    `Soon you will be contacted by a hacking group known as ${FactionName.CyberSec}. ` +
      "They can help you with your search. \n\n" +
      "You should join them, garner their favor, and " +
      "exploit them for their Augmentations. But do not trust them. " +
      "They are not what they seem. No one is.\n\n" +
      "-jump3R",
    FactionName.CyberSec,
  ),

  [MessageFilename.Jumper2]: new Message(
    MessageFilename.Jumper2,
    "Do not try to save the world. There is no world to save. If " +
      "you want to find the truth, worry only about yourself. Ethics and " +
      `morals will get you killed. \n\nKeep an eye out for a hacking group known as ${FactionName.NiteSec}.` +
      "\n\n-jump3R",
    FactionName.NiteSec,
  ),

  [MessageFilename.Jumper3]: new Message(
    MessageFilename.Jumper3,
    "You must learn to walk before you can run. And you must " +
      `run before you can fly. Look for ${FactionName.TheBlackHand}. \n\n` +
      "I.I.I.I \n\n-jump3R",
    FactionName.TheBlackHand,
  ),

  [MessageFilename.Jumper4]: new Message(
    MessageFilename.Jumper4,
    "To find what you are searching for, you must understand the bits. " +
      "The bits are all around us. The runners will help you.\n\n" +
      "-jump3R",
    FactionName.BitRunners,
  ),

  //Messages from hacking factions
  [MessageFilename.CyberSecTest]: new Message(
    MessageFilename.CyberSecTest,
    "We've been watching you. Your skills are very impressive. But you're wasting " +
      "your talents. If you join us, you can put your skills to good use and change " +
      "the world for the better. If you join us, we can unlock your full potential. \n\n" +
      "But first, you must pass our test. Find and install the backdoor on our server. \n\n" +
      `-${FactionName.CyberSec}`,
    FactionName.CyberSec,
  ),

  [MessageFilename.NiteSecTest]: new Message(
    MessageFilename.NiteSecTest,
    "People say that the corrupted governments and corporations rule the world. " +
      "Yes, maybe they do. But do you know who everyone really fears? People " +
      "like us. Because they can't hide from us. Because they can't fight shadows " +
      "and ideas with bullets. \n\n" +
      "Join us, and people will fear you, too. \n\n" +
      "Find and install the backdoor on our server, avmnite-02h. Then, we will contact you again." +
      `\n\n-${FactionName.NiteSec}`,
    FactionName.NiteSec,
  ),

  [MessageFilename.BitRunnersTest]: new Message(
    MessageFilename.BitRunnersTest,
    "We know what you are doing. We know what drives you. We know " +
      "what you are looking for. \n\n " +
      "We can help you find the answers.\n\n" +
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
