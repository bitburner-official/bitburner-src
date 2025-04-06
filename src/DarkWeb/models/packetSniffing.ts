import { BaseServer } from "../../Server/BaseServer";
import { commonPasswordDictionary, letters, packetSniffPhrases } from "./dictionaryData";
import {
  generateSimpleArithmeticExpression,
  getPassword,
  romanNumeralEncoder,
} from "../controllers/DarknetServerGenerator";
import { getName } from "./DnetServerData";
import { LocationName } from "@enums";


export const capturePackets = (server: BaseServer) => {
  if (!server.darknetData) {
    return "A great silence stretches across the network. No unsecured packets are here to capture.";
  }
  const difficulty = server.darknetData.difficulty;
  const passwordInclusionChance = 0.25 * 0.90 ** difficulty;

  if (Math.random() < passwordInclusionChance) {
    const intro = Math.floor(Math.random() * 124);
    return `${getRandomData(intro, server.darknetData.password)}${server.darknetData.password}${getRandomData(124 - intro - server.darknetData.password.length, server.darknetData.password)}`;
  }

  return `${getRandomData(124, server.darknetData.password)}`;
}

const getRandomData = (length: number, password: string) => {
  let result = "";
  while (result.length < length) {
    if (Math.random() < 0.1) {
      result += " " + packetSniffPhrases[Math.floor(Math.random() * packetSniffPhrases.length)] + " ";
    } else if (Math.random() < 0.25) {
      result += commonPasswordDictionary[Math.floor(Math.random() * commonPasswordDictionary.length)];
    } else if (Math.random() < 0.8) {
      result += getPassword(password.length, true, !!password.split("").find(c => letters.includes(c)));
    } else if (Math.random() < 0.3) {
      result += generateSimpleArithmeticExpression(Math.floor(Math.random() * 5 + 2));
    } else if (Math.random() < 0.6) {
      result += " " +getName() + " ";
    } else if (Math.random() < 0.15) {
      result += "/" + Object.keys(LocationName)[Math.floor(Math.random() * Object.keys(LocationName).length)]+"/";
    } else {
      result += romanNumeralEncoder(Math.floor(Math.random() * 5000));
    }
  }
  return result;
}