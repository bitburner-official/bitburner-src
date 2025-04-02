import { getPasswordType, getRandomIcon, Minigames } from "../controllers/DarknetServerGenerator";
import { Icon } from "../controllers/ServerIcon";
import { IConstructorParams, Server } from "../../Server/Server";
import { AddToAllServers, createUniqueRandomIp, GetServer } from "../../Server/AllServers";
import { BaseServer } from "../../Server/BaseServer";
import { handleFailedAuth, handleSuccessfulAuth } from "./effects";
import {
  commonPasswordDictionary,
  connectors,
  l33t,
  loreNames,
  presetNames,
  ServerNamePrefixes,
  ServerNameSuffixes,
} from "./dictionaryData";

export const SUCCESS_STATUS = 200;
export const AUTH_FAILURE_STATUS = 401;

export type PasswordResponse = {
  status: number;
  msg: string;
  responseTime: number;
  passwordLength?: number;
  passwordFormat?: string;
  data?: string;
  modelId?: number;
};

export type DnetServerData = {
  icon: Icon;
  password: string;
  minigameType: Minigames;
  passwordHint: string;
  passwordHintData?: string;
  difficulty: number;
  x: number;
  y: number;
};

export const isDarknetServer = (server: BaseServer): boolean => {
  return server.darknetData !== undefined;
}

export const DnetServerBuilder = (options: DnetServerData, name: string = getName()): Server => {
  const darknetData = {
    icon: options.icon ?? getRandomIcon(),
    password: options.password,
    minigameType: options.minigameType,
    passwordHint: options.passwordHint,
    passwordHintData: options.passwordHintData ?? "",
    difficulty: options.difficulty ?? 1,
    x: options.x ?? -1,
    y: options.y ?? -1,
  };

  const scalar = 1 + darknetData.difficulty * 3;

  const params: IConstructorParams = {
    hostname: name,
    ip: createUniqueRandomIp(),
    organizationName: "darkweb",
    maxRam: 16,
    requiredHackingSkill: Math.ceil(scalar ** 2 + Math.random() * scalar * 3),
    hackDifficulty: 5,
    moneyAvailable: 0,
    numOpenPortsRequired: 69,
    adminRights: false,
    darknetData: darknetData,
  };
  const server = new Server(params);
  AddToAllServers(server);

  return server;
};

export const checkPassword = (attemptedPassword: string, server: BaseServer, threads: number): PasswordResponse => {
  const darknetData = server.darknetData;
  if (!darknetData) {
    return {
      responseTime: 0,
      status: AUTH_FAILURE_STATUS,
      msg: "This server is not a darknet server",
      modelId: 0
    };
  }
  if (darknetData.password === attemptedPassword) {
    handleSuccessfulAuth(server, threads);
    return getGenericSuccess();
  }
  handleFailedAuth(server, threads);

  if (darknetData.minigameType === Minigames.MastermindHint) {
    const { exactCharacters, misplacedCharacters } = getMastermindResponse(darknetData.password, attemptedPassword);
    const message = `Hint: ${exactCharacters} symbols match, ${misplacedCharacters} ${
      misplacedCharacters == 1 ? "is" : "are"
    } close.`;
    return getFailureResponse(message, `${exactCharacters},${misplacedCharacters}`, darknetData);
  } else if (darknetData.minigameType === Minigames.GuessNumber) {
    const hintData = +attemptedPassword > +darknetData.password ? "Lower" : "Higher";
    return getFailureResponse(darknetData.passwordHint, hintData, darknetData);
  } else if (darknetData.minigameType === Minigames.Yesn_t) {
    const response = attemptedPassword
      .split("")
      .map((char, i) => (char === darknetData.password[i] ? "yes" : "yesn't"))
      .join(",");
    return getFailureResponse("that wasn't right", response, darknetData);
  } else if (darknetData.minigameType === Minigames.Synchronize) {
    const exactChars = getExactCorrectCharsCount(darknetData.password, attemptedPassword);
    const closeChars = getMisplacedCorrectCharsCount(darknetData.password, attemptedPassword);
    const syncDecimal = ((exactChars + closeChars * 0.5) / darknetData.password.length) * 100;
    const responseData = `${Math.round(syncDecimal * 10) / 10}`;
    return getFailureResponse(`Synchronization status: ${responseData}%`, responseData, darknetData);
  } else if (darknetData.minigameType === Minigames.BinaryEncodedFeedback) {
    const exactChars = getExactCorrectChars(darknetData.password, attemptedPassword);
    const binaryRepresentation = exactChars.reduce(
      (acc, val, i) => acc + (val ? 2 ** (attemptedPassword.length - i) : 0),
      0,
    );
    return getFailureResponse("Beep Boop", `${binaryRepresentation}`, darknetData);
  } else if (darknetData.minigameType === Minigames.SpiceLevel) {
    const exactChars = getExactCorrectChars(darknetData.password, attemptedPassword);
    const pepperRepresentation = exactChars.map((val) => (val ? "🌶️" : "")).join("") || "0";
    return getFailureResponse(
      "Not spicy enough",
      `${pepperRepresentation}/${darknetData.password.length}`,
      darknetData,
    );
  } else if (
    darknetData.minigameType === Minigames.ConvertToBase10 ||
    darknetData.minigameType === Minigames.parsedExpression
  ) {
    const parsedAttemptedPassword = parseFloat(attemptedPassword);
    if (
      !isNaN(parsedAttemptedPassword) &&
      Math.abs((parsedAttemptedPassword - +darknetData.password) / +darknetData.password) < 0.001
    ) {
      // ignore small rounding errors during floating point operations
      handleSuccessfulAuth(server, threads);
      return getGenericSuccess();
    }
    return getFailureResponse(darknetData.passwordHint, darknetData.passwordHintData ?? "", darknetData);
  } else {
    const sharedChars =
      darknetData.minigameType === Minigames.TimingAttack ? getSharedChars(darknetData.password, attemptedPassword) : 0;
    return getFailureResponse(darknetData.passwordHint, darknetData.passwordHintData ?? "", darknetData, sharedChars);
  }
};

const getFailureResponse = (msg: string, data: string, darknetData: DnetServerData, extraDelay = 0) => ({
  status: AUTH_FAILURE_STATUS,
  msg,
  data,
  passwordLength: darknetData.password.length,
  passwordFormat: getPasswordType(darknetData.password),
  responseTime: getResponseTime(extraDelay),
  modelId: darknetData.minigameType,
});

const getMastermindResponse = (password: string, attemptedPassword: string) => {
  return {
    exactCharacters: getExactCorrectCharsCount(password, attemptedPassword),
    misplacedCharacters: getMisplacedCorrectCharsCount(password, attemptedPassword),
  };
};

const getExactCorrectChars = (password: string, attemptedPassword: string) =>
  password.split("").map((digit, i: number) => digit === attemptedPassword[i]);

const getExactCorrectCharsCount = (password: string, attemptedPassword: string) =>
  getExactCorrectChars(password, attemptedPassword).filter((isCorrect) => isCorrect).length;

const getMisplacedCorrectCharsCount = (password: string, attemptedPassword: string) => {
  // filter out exact correct chars from both the attempted and correct password, to simplify checking for duplicate counts
  const remainingPasswordChars = password.split("").filter((digit, i) => digit !== attemptedPassword[i]);
  const remainingAttemptedPasswordChars = attemptedPassword.split("").filter((digit, i) => digit !== password[i]);

  const misplacedCorrectChars = remainingAttemptedPasswordChars.filter((digit, i) => {
    const isNotExactlyCorrect = digit !== remainingPasswordChars[i];
    const isPresentInPassword = remainingPasswordChars.includes(digit);
    const countInAttemptedPasswordThusFar = remainingAttemptedPasswordChars
      .slice(0, i)
      .filter((prevDigit) => prevDigit === digit).length;
    const countInPassword = remainingPasswordChars.filter((prevDigit) => prevDigit === digit).length;
    return isNotExactlyCorrect && isPresentInPassword && countInAttemptedPasswordThusFar <= countInPassword;
  });

  return misplacedCorrectChars.length;
};

const getGenericSuccess = (responseTime = 0) => ({
  status: SUCCESS_STATUS,
  msg: "Success! Access granted.",
  responseTime: getResponseTime(responseTime),
});

const getResponseTime = (additionalPasses = 0) => Math.floor(95 + Math.random() * 12 + additionalPasses * 25);

const getSharedChars = (password: string, attemptedPassword: string): number => {
  for (let i = 0; i < password.length; i++) {
    if (password[i] !== attemptedPassword[i]) {
      return i;
    }
  }
  return password.length;
};

export const getName = (): string => {
  return decorateName(getBaseName());
};

const getBaseName = (): string => {
  if (Math.random() < 0.05) {
    return commonPasswordDictionary[Math.floor(Math.random() * commonPasswordDictionary.length)];
  }

  if (Math.random() < 0.2) {
    return loreNames[Math.floor(Math.random() * loreNames.length)];
  }

  if (Math.random() < 0.3) {
    return presetNames[Math.floor(Math.random() * presetNames.length)];
  }

  const prefix = ServerNamePrefixes[Math.floor(Math.random() * ServerNamePrefixes.length)];
  const suffix = ServerNameSuffixes[Math.floor(Math.random() * ServerNameSuffixes.length)];
  const connector = connectors[Math.floor(Math.random() * connectors.length)];
  return `${prefix}${connector}${suffix}`;
};

const decorateName = (name: string): string => {
  let updatedName = name;
  do {
    const connector = connectors[Math.floor(Math.random() * connectors.length)];

    if (Math.random() < 0.3) {
      updatedName = l33tifyName(name);
    }

    if (Math.random() < 0.05) {
      updatedName = updatedName.split("").reverse().join("");
    }

    if (Math.random() < 0.1) {
      const randomSuffix = ServerNameSuffixes[Math.floor(Math.random() * ServerNameSuffixes.length)];
      updatedName = `${updatedName}${connector}${randomSuffix}`;
    }

    if (Math.random() < 0.1) {
      const randomPrefix = ServerNamePrefixes[Math.floor(Math.random() * ServerNamePrefixes.length)];
      updatedName = `${randomPrefix}${connector}${updatedName}`;
    }

    if (Math.random() < 0.05) {
      updatedName = `${updatedName}:${Math.floor(Math.random() * 10000)}`;
    }
  } while (GetServer(updatedName) !== null);

  return updatedName;
};

const l33tifyName = (name: string): string => {
  let updatedName = name;
  const amount = Math.random() * 3 + 1;
  for (let i = 0; i < amount; i++) {
    const char = Object.keys(l33t)[Math.floor(Math.random() * Object.keys(l33t).length)];
    const replacement: string = l33t[char] ?? "";
    updatedName = updatedName.replaceAll(char, replacement);
  }
  return updatedName;
};
