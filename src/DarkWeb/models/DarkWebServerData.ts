import { getName, getPasswordType, getRandomIcon, Minigames } from "../controllers/DarkWebServerGenerator";
import { Icon } from "../controllers/ServerIcon";
import { IConstructorParams, Server } from "../../Server/Server";
import { AddToAllServers, createUniqueRandomIp } from "../../Server/AllServers";
import { BaseServer } from "../../Server/BaseServer";

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

export type DarkWebServerData = {
  icon: Icon;
  password: string;
  minigameType: Minigames;
  passwordHint: string;
  passwordHintData?: string;
  difficulty: number;
  x: number;
  y: number;
};

export const DWebServerBuilder = (options: DarkWebServerData, name: string = getName(1)): Server => {
  const darkWebData = {
    icon: options.icon ?? getRandomIcon(),
    password: options.password,
    minigameType: options.minigameType,
    passwordHint: options.passwordHint,
    passwordHintData: options.passwordHintData ?? "",
    difficulty: options.difficulty ?? 1,
    x: options.x ?? -1,
    y: options.y ?? -1,
  };

  const params: IConstructorParams = {
    hostname: name,
    ip: createUniqueRandomIp(),
    organizationName: "darkweb",
    maxRam: 16,
    requiredHackingSkill: Math.floor(((darkWebData.difficulty +1) * Math.random() * 10) ** 1.5),
    hackDifficulty: 5,
    moneyAvailable: 0,
    numOpenPortsRequired: 69,
    adminRights: false,
    darkWebData: darkWebData,
  };
  const standardServer = new Server(params);
  standardServer.backdoorInstalled = true; // TODO: remove once testing is done
  AddToAllServers(standardServer);

  return standardServer;
};

export const checkPassword = (attemptedPassword: string, server: BaseServer): PasswordResponse => {
  const darkWebData = server.darkWebData;
  if (!darkWebData) {
    throw new Error("Dark web server missing dark web data");
  }
  if (darkWebData.password === attemptedPassword) {
    server.hasAdminRights = true;
    return getGenericSuccess();
  } else if (darkWebData.minigameType === Minigames.MastermindHint) {
    const { exactCharacters, misplacedCharacters } = getMastermindResponse(darkWebData.password, attemptedPassword);
    const message = `Hint: ${exactCharacters} symbols match, ${misplacedCharacters} ${
          misplacedCharacters == 1 ? "is" : "are"
        } close.`;
    return getFailureResponse(message, `${exactCharacters},${misplacedCharacters}`, darkWebData);
  } else if (darkWebData.minigameType === Minigames.GuessNumber) {
    const hintData = +attemptedPassword > +darkWebData.password ? "Lower" : "Higher";
    return getFailureResponse(darkWebData.passwordHint, hintData, darkWebData);
  } else if (darkWebData.minigameType === Minigames.Yesn_t) {
    const response = attemptedPassword.split("").map((char, i) => char === darkWebData.password[i] ? "yes" : "yesn't").join(",");
    return getFailureResponse("that wasn't right", response, darkWebData);
  } else if (darkWebData.minigameType === Minigames.Synchronize) {
    const exactChars = getExactCorrectCharsCount(darkWebData.password, attemptedPassword);
    const closeChars = getMisplacedCorrectCharsCount(darkWebData.password, attemptedPassword);
    const syncDecimal = ((exactChars + closeChars * 0.5) / darkWebData.password.length) * 100
    const responseData = `${Math.round(syncDecimal * 10) / 10}`;
    return getFailureResponse(`Synchronization status: ${responseData}%`, responseData, darkWebData);
  }else if (darkWebData.minigameType === Minigames.BinaryEncodedFeedback) {
    const exactChars = getExactCorrectChars(darkWebData.password, attemptedPassword);
    const binaryRepresentation = exactChars.reduce((acc, val, i) => acc + (val ? 2 ** (attemptedPassword.length - i): 0), 0);
    return getFailureResponse("Beep Boop", `${binaryRepresentation}`, darkWebData);
  }else if (darkWebData.minigameType === Minigames.SpiceLevel) {
    const exactChars = getExactCorrectChars(darkWebData.password, attemptedPassword);
    const pepperRepresentation = exactChars.map((val) => val ? "🌶️" : "").join("");
    return getFailureResponse("Not spicy enough", `${pepperRepresentation}/${darkWebData.password.length}`, darkWebData);
  } else {
    const sharedChars =
      darkWebData.minigameType === Minigames.TimingAttack ? getSharedChars(darkWebData.password, attemptedPassword) : 0;
    return getFailureResponse(darkWebData.passwordHint, darkWebData.passwordHintData ?? "", darkWebData, sharedChars);
  }
};

const getFailureResponse = (msg: string, data: string, darkWebData: DarkWebServerData, extraDelay = 0) => ({
  status: AUTH_FAILURE_STATUS,
  msg,
  data,
  passwordLength: darkWebData.password.length,
  passwordFormat: getPasswordType(darkWebData.password),
  responseTime: getResponseTime(extraDelay),
  modelId: darkWebData.minigameType
});

const getMastermindResponse = (password: string, attemptedPassword: string) => {
  return {
    exactCharacters: getExactCorrectCharsCount(password, attemptedPassword),
    misplacedCharacters: getMisplacedCorrectCharsCount(password, attemptedPassword),
  };
};

const getExactCorrectChars = (password: string, attemptedPassword: string) =>
  password.split("").map((digit, i: number) => digit === attemptedPassword[i]);

const getExactCorrectCharsCount = (password: string, attemptedPassword: string) => getExactCorrectChars(password, attemptedPassword).filter((isCorrect) => isCorrect).length;

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
}


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
