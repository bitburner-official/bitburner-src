import { commonPasswordDictionary, letters, packetSniffPhrases } from "./dictionaryData";
import { generateSimpleArithmeticExpression, getPassword, romanNumeralEncoder } from "../controllers/ServerGenerator";
import { generateDarknetServerName, isPasswordResponse, type PasswordResponse } from "./DarknetServerOptions";
import { LocationName } from "@enums";
import { getServerState, LogEntry } from "./DarknetState";
import { ModelIds } from "../Enums";
import { getDarknetServer, getDarknetServerOrThrow } from "../utils/darknetServerUtils";
import { getAllMovableDarknetServers } from "../utils/darknetNetworkUtils";
import { getExactCorrectChars, getTwoCharsInPassword } from "../utils/darknetAuthUtils";
import type { DarknetServer } from "../../Server/DarknetServer";
import { isLabyrinthServer, isLocationStatus } from "../effects/labyrinth";
import { exceptionAlert } from "../../utils/helpers/exceptionAlert";

const MAX_LOG_LINES = 200;

export const capturePackets = (server: DarknetServer) => {
  const passwordData = server.difficulty > 16 ? server.password : ` ${server.hostname}:${server.password} `;
  const randomData =
    server.difficulty > 16
      ? getPassword(124 + Math.random() * 20, true)
      : getRandomData(server, 124 + Math.random() * 20);
  const insertIndex = Math.floor(Math.random() * (randomData.length - passwordData.length));
  return randomData.slice(0, insertIndex) + passwordData + randomData.slice(insertIndex);
};

const getRandomData = (server: DarknetServer, length: number) => {
  const password = server.password;
  let result = "";
  while (result.length < length) {
    if (Math.random() < 0.1) {
      result += " " + packetSniffPhrases[Math.floor(Math.random() * packetSniffPhrases.length)] + " ";
    } else if (Math.random() < 0.25) {
      result += commonPasswordDictionary[Math.floor(Math.random() * commonPasswordDictionary.length)];
    } else if (Math.random() < 0.2) {
      result += " " + getRandomCharsInPassword(password);
    } else if (Math.random() < 0.8) {
      result += getPassword(password.length, !!password.split("").find((c) => letters.includes(c)));
    } else if (Math.random() < 0.3) {
      result += generateSimpleArithmeticExpression(Math.floor(Math.random() * 5 + 2));
    } else if (Math.random() < 0.33) {
      const mostRecentAuthLog = getMostRecentAuthLog(server.hostname);
      if (mostRecentAuthLog) {
        result += " " + getExactCharactersHint(mostRecentAuthLog.passwordAttempted, password);
      }
    } else if (Math.random() < 0.6) {
      result += " " + generateDarknetServerName() + " ";
    } else if (Math.random() < 0.15) {
      result += "/" + Object.keys(LocationName)[Math.floor(Math.random() * Object.keys(LocationName).length)] + "/";
    } else if (Math.random() < 0.05) {
      const servers = getAllMovableDarknetServers();
      const randomServer = servers[Math.floor(Math.random() * servers.length)];
      return `--${randomServer.password}--`;
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

export const logPasswordAttempt = (server: DarknetServer, passwordResponse: PasswordResponse, pid: number) => {
  const serverState = getServerState(server.hostname);
  populateServerLogsWithNoise(server);

  let message = passwordResponse;

  // buffer overflow servers have special logging: any characters beyond the password length start to overwrite the
  // response code in the log, which can turn it into a 200
  if (server.modelId === ModelIds.BufferOverflow) {
    if (isLocationStatus(passwordResponse.data)) {
      exceptionAlert(
        new Error(
          `Invalid password response data of model: ${ModelIds.BufferOverflow}. Got a location status instead of a ` +
            `string or undefined. Server: ${server.hostname}. passwordAttempted: ${
              passwordResponse.passwordAttempted
            }. data: ${JSON.stringify(passwordResponse.data)}`,
        ),
        true,
      );
      return;
    }
    const [passwordInBuffer, overflow] = (passwordResponse.data ?? "").split(",");
    message = {
      code: passwordResponse.code,
      passwordAttempted: passwordInBuffer,
      passwordExpected: overflow,
      message: passwordResponse.message,
    } satisfies PasswordResponse;
  }

  const logMessage = {
    message,
    pid,
  };
  serverState.serverLogs.unshift(logMessage);
  serverState.serverLogs.splice(MAX_LOG_LINES);
};

export const populateServerLogsWithNoise = (server: DarknetServer) => {
  if (isLabyrinthServer(server.hostname) || server.logTrafficInterval === -1) return;

  const serverState = getServerState(server.hostname);
  const interval = server.logTrafficInterval;
  const now = Date.now();
  if (!serverState.lastLogTime) {
    serverState.serverLogs.length = 0;
    serverState.serverLogs.push(
      getLogNoise(server, new Date(now - interval * 1000)),
      getLogNoise(server, new Date(now - interval * 2000)),
    );
    serverState.lastLogTime = new Date(now);
    return;
  }

  const lastLogTime = serverState.lastLogTime.getTime();
  const totalMissingLogs = Math.floor((now - lastLogTime) / (interval * 1000));
  if (totalMissingLogs > 0) {
    const missingLogs = Math.min(totalMissingLogs, MAX_LOG_LINES);
    const latestLogTimeMs = lastLogTime + totalMissingLogs * interval * 1000;
    const noiseArray = Array.from({ length: missingLogs }, (_, i) =>
      getLogNoise(server, new Date(latestLogTimeMs - interval * 1000 * i)),
    );
    serverState.serverLogs.unshift(...noiseArray);
    serverState.serverLogs.splice(MAX_LOG_LINES);
    // Advance lastLogTime to the latest generated log, as if the logs were added live.
    serverState.lastLogTime = new Date(latestLogTimeMs);
  }
};

const getLogNoise = (server: DarknetServer, logDate: Date): LogEntry => {
  if (Math.random() < 0.2) {
    return log(packetSniffPhrases[Math.floor(Math.random() * packetSniffPhrases.length)]);
  }
  if (Math.random() < 0.05 * (1 / (server.difficulty + 1))) {
    const connectedServerName = server.serversOnNetwork[Math.floor(Math.random() * server.serversOnNetwork.length)];
    const connectedServer = getDarknetServer(connectedServerName);
    if (connectedServer) {
      return log(`Connecting to ${connectedServerName}:${connectedServer.password} ...`);
    }
  }
  if (Math.random() < 0.05) {
    const connectedServerName = server.serversOnNetwork[Math.floor(Math.random() * server.serversOnNetwork.length)];
    return log(`[sending transaction details to ${connectedServerName}.]`);
  }
  if (Math.random() < 0.1) {
    const mostRecentAuthLog = getMostRecentAuthLog(server.hostname);
    if (mostRecentAuthLog) {
      return log(getExactCharactersHint(mostRecentAuthLog.passwordAttempted, server.password));
    }
  }

  if (Math.random() < 0.1) {
    return log(getRandomCharsInPassword(server.password));
  }

  if (Math.random() < 0.05) {
    const servers = getAllMovableDarknetServers();
    const randomServer = servers[Math.floor(Math.random() * servers.length)];
    return log(`--${randomServer.password}--`);
  }

  if (server.modelId === ModelIds.packetSniffer && Math.random() < 0.7 - server.difficulty * 0.01) {
    return addPacketSnifferNoise(server);
  }

  return log(`${logDate.toLocaleTimeString()}: ${server.hostname} - heartbeat check (alive)`);
};

const log = (message: string, pid = -1) => ({
  message,
  pid,
});

const addPacketSnifferNoise = (server: DarknetServer) => {
  const connectedServers = server.serversOnNetwork;
  // If the server becomes disconnected while the UI is open and has no neighbors but still
  // has logs being populated, fall back to showing the current password
  if (Math.random() < 0.3 || connectedServers.length === 0) {
    return log(`Logging in with passcode: ${server.password} ...`);
  }
  const randomServerName = connectedServers[Math.floor(Math.random() * connectedServers.length)];
  const randomServer = getDarknetServerOrThrow(randomServerName);
  return log(`Connecting to ${randomServer.hostname}:${randomServer.password} ...`);
};

export const getMostRecentAuthLog = (hostname: string) => {
  for (const log of getServerState(hostname).serverLogs) {
    if (!isPasswordResponse(log.message)) {
      continue;
    }
    return log.message;
  }
  return null;
};

export const getServerLogs = (server: DarknetServer, logLines: number, peek = false) => {
  if (logLines < 0) {
    throw new Error("logLines must be non-negative");
  }
  populateServerLogsWithNoise(server);

  const serverState = getServerState(server.hostname);
  if (peek) {
    return serverState.serverLogs.slice(0, logLines);
  }
  return serverState.serverLogs.splice(0, logLines);
};
