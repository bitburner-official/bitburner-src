import { BaseServer } from "../../Server/BaseServer";
import { commonPasswordDictionary, letters, packetSniffPhrases } from "./dictionaryData";
import {
  generateSimpleArithmeticExpression,
  getPassword,
  Minigames,
  romanNumeralEncoder,
} from "../controllers/DarknetServerGenerator";
import { getName, PasswordResponse } from "./DnetServerData";
import { LocationName } from "@enums";
import { getTwoCharsInPassword } from "./effects";
import { getDarknetServers, getServerSafely } from "../controllers/DarknetNetworkMovement";
import { getExactCorrectChars, getMastermindResponse } from "./authentication";
import { getServerState } from "./DarknetState";

const MAX_LOG_LINES = 32;

export const capturePackets = (server: BaseServer) => {
  if (!server.darknetData) {
    return "A great silence stretches across the network. No unsecured packets are here to capture.";
  }
  const BASE_PASSWORD_INCLUSION_RATE = 0.18;
  const DIFFICULTY_MODIFIER = 0.88;
  const difficulty = server.darknetData.difficulty * 1.3;
  const vulnerability = server.darknetData.minigameType === Minigames.packetSniffer ? 8 : 1;
  const passwordInclusionChance = BASE_PASSWORD_INCLUSION_RATE * vulnerability * DIFFICULTY_MODIFIER ** difficulty;

  if (Math.random() < passwordInclusionChance) {
    const intro = Math.floor(Math.random() * 124);
    return `${getRandomData(intro, server)}${server.darknetData.password}${getRandomData(
      124 - intro - server.darknetData.password.length,
      server,
    )}`;
  }
  if (Math.random() < passwordInclusionChance) {
    const connectedServerName = server.serversOnNetwork[Math.floor(Math.random() * server.serversOnNetwork.length)];
    const connectedServer = getServerSafely(connectedServerName);
    if (connectedServer && connectedServer.darknetData) {
      const intro = Math.floor(Math.random() * 124);
      return `${getRandomData(intro, server)} ${connectedServerName}:${
        connectedServer.darknetData.password
      } ${getRandomData(
        124 - intro - connectedServer.darknetData.password.length - connectedServerName.length,
        server,
      )}`;
    }
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
    } else if (Math.random() < 0.2) {
      result += " " + getRandomCharsInPassword(password);
    } else if (Math.random() < 0.8) {
      result += getPassword(password.length, true, !!password.split("").find((c) => letters.includes(c)));
    } else if (Math.random() < 0.3) {
      result += generateSimpleArithmeticExpression(Math.floor(Math.random() * 5 + 2));
    } else if (Math.random() < 0.33) {
      result += " " + getExactCharactersHint(getServerLogs(server, 1, true, true)[0] || "", password);
    } else if (Math.random() < 0.6) {
      result += " " + getName() + " ";
    } else if (Math.random() < 0.15) {
      result += "/" + Object.keys(LocationName)[Math.floor(Math.random() * Object.keys(LocationName).length)] + "/";
    } else if (Math.random() < 0.05) {
      const servers = getDarknetServers();
      const randomServer = servers[Math.floor(Math.random() * servers.length)];
      return `--${randomServer.darknetData?.password ?? ""}--`;
    } else {
      result += romanNumeralEncoder(Math.floor(Math.random() * 5000));
    }
  }
  return result;
};

const getRandomCharsInPassword = (password: string) => {
  if (!password) {
    return "There's definitely nothing in that password...";
  }
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
};

const getExactCharactersHint = (lastPassword: string, realPassword: string) => {
  const correctCharPlacement = getExactCorrectChars(realPassword, lastPassword);
  const rightChars = realPassword
    .split("")
    .filter((c, i) => correctCharPlacement[i])
    .slice(0, 2);
  if (rightChars.length === 0) {
    return "No characters are in the right place.";
  }
  return `The characters ${rightChars.join(", ")} are in the right place. `;
};

export const logPasswordAttempt = (server: BaseServer, passwordResponse: PasswordResponse) => {
  if (!server.darknetData) {
    return;
  }

  const darknetData = server.darknetData;
  const serverState = getServerState(server.hostname);
  const serverLogs = serverState.serverLogs;
  populateServerLogsWithNoise(server);

  if (passwordResponse.message === server.darknetData.staticPasswordHint) {
    if (Math.random() < 0.1) {
      passwordResponse.message = getExactCharactersHint(passwordResponse.passwordAttempted, darknetData.password);
      passwordResponse.data = "";
    }

    if (Math.random() < 0.1) {
      const { exactCharacters, misplacedCharacters } = getMastermindResponse(
        darknetData.password,
        passwordResponse.passwordAttempted,
      );
      passwordResponse.message = `Hint: ${exactCharacters} symbols match, ${misplacedCharacters} ${
        misplacedCharacters == 1 ? "is" : "are"
      } close.`;
      passwordResponse.data = "";
    }
  }

  const logMessage = JSON.stringify(passwordResponse, null, 2);
  serverState.serverLogs = [logMessage, ...serverLogs].slice(0, MAX_LOG_LINES); // Keep only the last 50 logs
};

export const populateServerLogsWithNoise = (server: BaseServer) => {
  if (!server.darknetData) {
    return;
  }
  const serverState = getServerState(server.hostname);
  const interval = server.darknetData.logTrafficInterval;
  if (!serverState.lastLogTime) {
    serverState.serverLogs = [
      getLogNoise(server, new Date(new Date().getTime() - interval * 1000)),
      getLogNoise(server, new Date(new Date().getTime() - interval * 2000)),
    ];
    serverState.lastLogTime = new Date();
    return;
  }

  const lastLogTime = new Date(serverState.lastLogTime ?? new Date()).getTime();
  const millisecondsSinceLastLog = new Date().getTime() - lastLogTime;
  const missingLogs = Math.floor(millisecondsSinceLastLog / (interval * 1000));
  if (missingLogs > 0) {
    const noiseArray = Array(missingLogs)
      .fill("")
      .map((__: unknown, i: number) => getLogNoise(server, new Date(lastLogTime + interval * 1000 * (i + 1))));
    serverState.serverLogs = [...noiseArray, ...serverState.serverLogs].slice(0, MAX_LOG_LINES);
    // set the last log date at when the prior log would have been generated, as if they are added live
    serverState.lastLogTime = new Date(lastLogTime + missingLogs * interval * 1000);
  }
};

const getLogNoise = (server: BaseServer, logDate: Date) => {
  if (!server.darknetData) {
    return "";
  }

  if (Math.random() < 0.2) {
    return packetSniffPhrases[Math.floor(Math.random() * packetSniffPhrases.length)];
  }
  if (Math.random() < 0.05 * (1 / (server.darknetData.difficulty + 1))) {
    const connectedServerName = server.serversOnNetwork[Math.floor(Math.random() * server.serversOnNetwork.length)];
    const connectedServer = getServerSafely(connectedServerName);
    if (connectedServer && connectedServer.darknetData) {
      return `Connecting to ${connectedServerName}:${connectedServer.darknetData.password} ...`;
    }
  }
  if (Math.random() < 0.05) {
    const connectedServerName = server.serversOnNetwork[Math.floor(Math.random() * server.serversOnNetwork.length)];
    return `[sending transaction details to ${connectedServerName}.]`;
  }
  if (Math.random() < 0.1) {
    const serverState = getServerState(server.hostname);
    const lastPasswordAttempt = serverState.serverLogs.find((log) => log.includes("passwordAttempted"));
    if (lastPasswordAttempt) {
      const authLog = JSON.parse(lastPasswordAttempt) as PasswordResponse;
      const password = authLog.passwordAttempted;
      return getExactCharactersHint(getServerLogs(server, 1, true, true)[0] || "", password);
    }
  }

  if (Math.random() < 0.1) {
    return getRandomCharsInPassword(server.darknetData.password);
  }

  if (Math.random() < 0.05) {
    const servers = getDarknetServers();
    const randomServer = servers[Math.floor(Math.random() * servers.length)];
    return `--${randomServer.darknetData?.password ?? ""}--`;
  }

  return `${logDate.toLocaleTimeString()}: ${server.hostname} - heartbeat check (alive)`;
};

export const getServerLogs = (server: BaseServer, logLines: number, peek = false, requireAuthLog = false) => {
  if (!server.darknetData) {
    return [];
  }
  const serverState = getServerState(server.hostname);

  if (requireAuthLog) {
    const authLog = serverState.serverLogs.find((log) => log.includes("passwordAttempted"));
    if (authLog) {
      return [authLog];
    } else {
      return [];
    }
  }

  populateServerLogsWithNoise(server);

  if (peek) {
    return serverState.serverLogs.slice(0, logLines);
  }
  const logs = serverState.serverLogs.slice(0, logLines);
  serverState.serverLogs = serverState.serverLogs.slice(logLines);
  return logs;
};
