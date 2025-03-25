import { getName, getPasswordType, Minigames } from "../controllers/DarkWebServerGenerator";
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
  x: number;
  y: number;
};

export const DWebServerBuilder = (options: DarkWebServerData, name: string = getName(1), difficulty: number = 1): Server => {
  const darkWebData = {
    icon: options.icon ?? Icon.ConnectedTv,
    password: options.password,
    minigameType: options.minigameType,
    passwordHint: options.passwordHint,
    passwordHintData: options.passwordHintData ?? "",
    x: options.x ?? -1,
    y: options.y ?? -1,
  };

  const params: IConstructorParams = {
    hostname: name,
    ip: createUniqueRandomIp(),
    organizationName: "darkweb",
    requiredHackingSkill: difficulty, // TODO
    hackDifficulty: difficulty, // TODO
    moneyAvailable: 0,
    numOpenPortsRequired: 5, // TODO
    serverGrowth: 1,
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
    // TODO: admin access
    return getGenericSuccess();
  } else if (darkWebData.minigameType === Minigames.MastermindHint) {
    const { exactCharacters, misplacedCharacters } = getMastermindResponse(darkWebData.password, attemptedPassword);
    return {
      status: AUTH_FAILURE_STATUS,
      msg: `Hint: ${exactCharacters} symbols match, ${misplacedCharacters} ${
        misplacedCharacters == 1 ? "is" : "are"
      } close.`,
      data: `${exactCharacters},${misplacedCharacters}`,
      responseTime: getResponseTime(),
      passwordLength: darkWebData.password.length,
      passwordFormat: getPasswordType(darkWebData.password),
      modelId: darkWebData.minigameType,
    };
  } else if (darkWebData.minigameType === Minigames.GuessNumber) {
    const hintData = +attemptedPassword > +darkWebData.password ? "Lower" : "Higher";
    return {
      status: AUTH_FAILURE_STATUS,
      msg: darkWebData.passwordHint,
      data: hintData,
      responseTime: getResponseTime(),
      passwordLength: darkWebData.password.length,
      passwordFormat: getPasswordType(darkWebData.password),
      modelId: darkWebData.minigameType,
    }
  } else {
    const sharedChars =
      darkWebData.minigameType === Minigames.TimingAttack ? getSharedChars(darkWebData.password, attemptedPassword) : 0;
    const responseTime = getResponseTime(sharedChars);
    return {
      status: AUTH_FAILURE_STATUS,
      msg: darkWebData.passwordHint,
      data: darkWebData.passwordHintData,
      passwordLength: darkWebData.password.length,
      passwordFormat: getPasswordType(darkWebData.password),
      responseTime: responseTime,
    };
  }
};

const getMastermindResponse = (password: string, attemptedPassword: string) => {
  const exactCorrectChars = password.split("").filter((digit, i) => digit === attemptedPassword[i]);

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

  return {
    exactCharacters: exactCorrectChars.length,
    misplacedCharacters: misplacedCorrectChars.length,
  };
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
