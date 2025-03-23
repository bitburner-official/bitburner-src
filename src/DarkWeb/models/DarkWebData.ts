import { getName, getPasswordType, Minigames } from "../controllers/DarkWebServerGenerator";
import { Icon } from "../controllers/ServerIcon";
import { IConstructorParams, Server } from "../../Server/Server";
import { AddToAllServers, createUniqueRandomIp } from "../../Server/AllServers";

export type PasswordResponse = {
  success: boolean;
  status: number;
  msg: string;
  responseTime: number;
  passwordLength?: number;
  passwordFormat?: string;
  data?: number;
  data2?: number;
};

export type DarkWebData = {
  icon: Icon;
  password: string;
  minigameType: Minigames;
  passwordHint: string;
  x: number;
  y: number;
};

export const DWebServerBuilder = (options: DarkWebData, name: string = getName(1), difficulty: number = 1): Server => {
  const darkWebData = {
    icon: options.icon ?? Icon.ConnectedTv,
    password: options.password,
    minigameType: options.minigameType,
    passwordHint: options.passwordHint,
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
  console.log("Added ", name, " to standard network");

  return standardServer;
};

export const checkPassword = (attemptedPassword: string, server: Server): PasswordResponse => {
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
      success: false,
      status: 401,
      msg: `Hint: ${exactCharacters} symbols match, ${misplacedCharacters} ${
        misplacedCharacters == 1 ? "is" : "are"
      } close.`,
      data: exactCharacters,
      data2: misplacedCharacters,
      responseTime: getResponseTime(),
      passwordLength: darkWebData.password.length,
      passwordFormat: getPasswordType(darkWebData.password),
    };
  } else {
    const sharedChars =
      darkWebData.minigameType === Minigames.TimingAttack ? getSharedChars(darkWebData.password, attemptedPassword) : 0;
    const responseTime = getResponseTime(sharedChars);
    return {
      success: false,
      status: 401,
      msg: darkWebData.passwordHint,
      responseTime: responseTime,
      passwordLength: darkWebData.password.length,
      passwordFormat: getPasswordType(darkWebData.password),
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
  success: true,
  status: 200,
  msg: "Success",
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
