import { BaseServer } from "../../Server/BaseServer";
import { commonPasswordDictionary, letters, packetSniffPhrases } from "./dictionaryData";
import {
  generateSimpleArithmeticExpression,
  getPassword,
  Minigames,
  romanNumeralEncoder,
} from "../controllers/DarknetServerGenerator";
import { getExactCorrectChars, getName } from "./DnetServerData";
import { LocationName } from "@enums";
import { getTwoCharsInPassword } from "./effects";

export const capturePackets = (server: BaseServer) => {
  if (!server.darknetData) {
    return "A great silence stretches across the network. No unsecured packets are here to capture.";
  }
  const BASE_PASSWORD_INCLUSION_RATE = 0.2;
  const DIFFICULTY_MODIFIER = 0.9;
  const difficulty = server.darknetData.difficulty;
  const vulnerability = server.darknetData.minigameType === Minigames.packetSniffer ? 5 : 1;
  const passwordInclusionChance = BASE_PASSWORD_INCLUSION_RATE * vulnerability * DIFFICULTY_MODIFIER ** difficulty;

  if (Math.random() < passwordInclusionChance) {
    const intro = Math.floor(Math.random() * 124);
    return `${getRandomData(intro, server)}${server.darknetData.password}${getRandomData(
      124 - intro - server.darknetData.password.length,
      server,
    )}`;
  }

  return `${getRandomData(124, server)}`;
};

const getRandomData = (length: number, server: BaseServer) => {
  if (!server.darknetData) {
    return packetSniffPhrases[Math.floor(Math.random() * packetSniffPhrases.length)];
  }
  const password = server.darknetData.password;
  let result = "";
  while (result.length < length) {
    if (Math.random() < 0.1) {
      result += " " + packetSniffPhrases[Math.floor(Math.random() * packetSniffPhrases.length)] + " ";
    } else if (Math.random() < 0.25) {
      result += commonPasswordDictionary[Math.floor(Math.random() * commonPasswordDictionary.length)];
    }  else if (Math.random() < 0.2) {
      result += " " + getRandomCharsInPassword(password);
    } else if (Math.random() < 0.8) {
      result += getPassword(password.length, true, !!password.split("").find((c) => letters.includes(c)));
    } else if (Math.random() < 0.3) {
      result += generateSimpleArithmeticExpression(Math.floor(Math.random() * 5 + 2));
    } else if (Math.random() < 0.33) {
      result += " " + getMastermindHint(server.darknetData.lastPasswordAttempted ?? "", password);
    } else if (Math.random() < 0.6) {
      result += " " + getName() + " ";
    } else if (Math.random() < 0.15) {
      result += "/" + Object.keys(LocationName)[Math.floor(Math.random() * Object.keys(LocationName).length)] + "/";
    } else {
      result += romanNumeralEncoder(Math.floor(Math.random() * 5000));
    }
  }
  return result;
};

const getRandomCharsInPassword = (password: string) => {
  const [containedChar1, containedChar2] = getTwoCharsInPassword(password);
  const hints = [
    `There's definitely a ${containedChar1} and a ${containedChar2}...`,
    `I can see a ${containedChar1} and a ${containedChar2}.`,
    `I must use ${containedChar1} & ${containedChar2}!`,
    `Did it have a ${containedChar1} and a ${containedChar2}?`,
    `Note to self: ${containedChar1} and ${containedChar2} are important.`,
    `I think ${containedChar1} with ${containedChar2} is key.`,
    `I need to remember ${containedChar1} 'n ${containedChar2}.`,
    `Theres a ${containedChar1}, and maybe a ${containedChar2}...`,
  ];
  return hints[Math.floor(Math.random() * hints.length)];
}

const getMastermindHint = (lastPassword: string, realPassword: string) => {
  const correctCharPlacement = getExactCorrectChars(realPassword, lastPassword);
  const rightChars = realPassword.split("").filter((c, i) => correctCharPlacement[i]).slice(0,2);
  return `The characters ${rightChars.join(", ")} are in the right place. `;
}