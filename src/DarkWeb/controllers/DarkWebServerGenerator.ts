import { DarkWebServer } from "../models/DarkWebServer";
import { Icon } from "./ServerIcon";

export const getDarkWebServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  if (difficulty <= 2) {
    return getSimpleServer(difficulty, chaRequired, x, y);
  } else {
    return getComplexServer(difficulty, chaRequired, x, y);
  }
};

export const getName = (difficulty: number): string => {
  // TODO: Implement
  return `${getResponseTime()}.${getResponseTime(difficulty * 5)}.0.${getResponseTime()}`;
};

const getSimpleServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  const rng = Math.random();
  if (rng < 0.3) {
    return getEchoVulnServer(difficulty, chaRequired, x, y);
  }
  if (rng < 6) {
    return getNoPasswordServer(difficulty, chaRequired, x, y);
  }
  return getDefaultPasswordServer(difficulty, chaRequired, x, y);
};

const getComplexServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  if (Math.random() < 0.5) {
    return getMastermindHintServer(difficulty, chaRequired, x, y);
  }
  return getTimingAttackServer(difficulty, chaRequired, x, y);
};

const getGenericSuccess = (responseTime = 0) => ({
  success: true,
  status: 200,
  msg: "Success",
  responseTime: getResponseTime(responseTime),
});

export const getEchoVulnServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  return new DarkWebServer({
    name: getName(difficulty),
    icon: getRandomIcon(),
    difficulty: difficulty,
    chaRequired: chaRequired,
    password: getPassword(4),
    x,
    y,
    passwordChecker: (attemptedPassword: string, server: DarkWebServer) => {
      if (attemptedPassword === server.password) {
        server.unlocked = true;
        return getGenericSuccess();
      } else {
        return {
          success: false,
          status: 401,
          msg: `Incorrect, the password is ${server.password}`,
          responseTime: getResponseTime(),
          passwordLength: server.password.length,
          passwordFormat: "numeric",
        };
      }
    },
  });
};

export const getNoPasswordServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  return new DarkWebServer({
    name: getName(difficulty),
    icon: getRandomIcon(),
    difficulty: difficulty,
    chaRequired: chaRequired,
    password: "",
    x,
    y,
    passwordChecker: (attemptedPassword: string, server: DarkWebServer) => {
      if (attemptedPassword === server.password) {
        server.unlocked = true;
        return getGenericSuccess();
      } else {
        return {
          success: false,
          status: 401,
          msg: `Hint: there is no password`,
          responseTime: getResponseTime(),
        };
      }
    },
  });
};

export const getDefaultPasswordServer = (
  difficulty: number,
  chaRequired: number,
  x: number,
  y: number,
): DarkWebServer => {
  return new DarkWebServer({
    name: getName(difficulty),
    icon: getRandomIcon(),
    difficulty: difficulty,
    chaRequired: chaRequired,
    password: ["admin", "password", "0000"][Math.floor(Math.random() * 3)],
    x,
    y,
    passwordChecker: (attemptedPassword: string, server: DarkWebServer) => {
      if (attemptedPassword.toLowerCase() === server.password) {
        server.unlocked = true;
        return getGenericSuccess();
      } else {
        return {
          success: false,
          status: 401,
          msg: `Incorrect. (The password is the default password.)`,
          responseTime: getResponseTime(),
          passwordLength: server.password.length,
          passwordFormat: "default",
        };
      }
    },
  });
};

export const getMastermindHintServer = (
  difficulty: number,
  chaRequired: number,
  x: number,
  y: number,
): DarkWebServer => {
  return new DarkWebServer({
    name: getName(difficulty),
    icon: getRandomIcon(),
    difficulty: difficulty,
    chaRequired: chaRequired,
    password: getPassword(2 + difficulty),
    x,
    y,
    passwordChecker: (attemptedPassword: string, server: DarkWebServer) => {
      if (attemptedPassword === server.password) {
        server.unlocked = true;
        return getGenericSuccess();
      } else {
        const mastermindResponse = getMastermindResponse(server.password, attemptedPassword);
        return {
          success: false,
          status: 401,
          msg: `Hint: ${mastermindResponse.exactCharacters} symbols match, ${mastermindResponse.misplacedCharacters} ${
            mastermindResponse.misplacedCharacters == 1 ? "is" : "are"
          } close.`,
          charsMatchingAndCorrectlyLocated: mastermindResponse.exactCharacters,
          charsMatchingButMisplaced: mastermindResponse.misplacedCharacters,
          responseTime: getResponseTime(),
          passwordLength: server.password.length,
          passwordFormat: `numeric`,
        };
      }
    },
  });
};

export const getTimingAttackServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  const length = 3 + difficulty;
  return new DarkWebServer({
    name: getName(difficulty),
    icon: getRandomIcon(),
    difficulty: difficulty,
    chaRequired: chaRequired,
    password: getPassword(length, true, false),
    x,
    y,
    passwordChecker: function (attemptedPassword: string, server: DarkWebServer) {
      const requestTime = getResponseTime(getSharedChars(server.password, attemptedPassword));
      if (attemptedPassword === server.password) {
        server.unlocked = true;
        return getGenericSuccess(requestTime);
      } else {
        return {
          success: false,
          status: 401,
          msg: `Incorrect.`,
          responseTime: requestTime,
          passwordLength: server.password.length,
          passwordFormat: `numeric`,
        };
      }
    },
  });
};

// TODO: arithmetic string server (eval bait)

// TODO: basic cypher server

// TODO: simple rainbow table server (dog's name, cat's name, etc)

// TODO: eval pwn server

const getResponseTime = (additionalPasses = 0) => Math.floor(95 + Math.random() * 12 + additionalPasses * 25);

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

const getSharedChars = (password: string, attemptedPassword: string): number => {
  for (let i = 0; i < password.length; i++) {
    if (password[i] !== attemptedPassword[i]) {
      return i;
    }
  }
  return password.length;
};

const getPassword = (
  length: number,
  allowNumbers = true,
  allowLetters = false,
  allowSpecial = false,
  allowUnicode = false,
): string => {
  const numbers = "0123456789";
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const unicode = "¼░╡╢╣╤╥╦╧╨╩╪╫╬╭╮╯╰╱╲╳╴╵╶╷╸╹╺╻╼╽╾╿";

  const characters =
    (allowNumbers ? numbers : "") +
    (allowLetters ? letters : "") +
    (allowSpecial ? special : "") +
    (allowUnicode ? unicode : "");
  let password = "";
  for (let i = 0; i < length; i++) {
    password += characters[Math.floor(Math.random() * characters.length)];
  }
  return password;
};

const getRandomIcon = (): Icon => {
  const icons = Object.values(Icon);
  return <Icon>icons[Math.floor(Math.random() * icons.length)];
};
