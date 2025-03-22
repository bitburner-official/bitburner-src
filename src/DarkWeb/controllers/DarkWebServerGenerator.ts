import { DarkWebServer, DWebServerBuilder } from "../models/DarkWebServer";
import { Icon } from "./ServerIcon";

export const getDarkWebServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  if (difficulty <= 2 || Math.random() < 0.1) {
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
  if (rng < 0.25) {
    return getEchoVulnServer(difficulty, chaRequired, x, y);
  }
  if (rng < 5) {
    return getNoPasswordServer(difficulty, chaRequired, x, y);
  }
  if (rng < 0.75) {
    return getSortedEchoVulnServer(difficulty, chaRequired, x, y);
  }
  return getDefaultPasswordServer(difficulty, chaRequired, x, y);
};

const getComplexServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  if (Math.random() < 0.4) {
    return getMastermindHintServer(difficulty, chaRequired, x, y);
  }
  if (Math.random() < 0.6) {
    return getSortedEchoVulnServer(difficulty, chaRequired, x, y);
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
  return DWebServerBuilder({
    name: getName(difficulty),
    icon: getRandomIcon(),
    difficulty: difficulty,
    chaRequired: chaRequired,
    password: getPassword(4),
    x,
    y,
    passwordChecker: (attemptedPassword: string, server: DarkWebServer) => {
      const hintTemplates = ["The password is", "The PIN is", "Remember to use", "It's set to", "The key is", "The secret is"];
      const hint = hintTemplates[Math.floor(Math.random() * hintTemplates.length)];
      if (attemptedPassword === server.password) {
        server.unlocked = true;
        return getGenericSuccess();
      } else {
        return {
          success: false,
          status: 401,
          msg: `Incorrect. ${hint} ${server.password}`,
          responseTime: getResponseTime(),
          passwordLength: server.password.length,
          passwordFormat: getPasswordType(server.password),
        };
      }
    },
  });
};

export const getSortedEchoVulnServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  return DWebServerBuilder({
    name: getName(difficulty),
    icon: getRandomIcon(),
    difficulty: difficulty,
    chaRequired: chaRequired,
    password: getPassword(4),
    x,
    y,
    passwordChecker: (attemptedPassword: string, server: DarkWebServer) => {
      const hintTemplates = ["The password contains", "The key is made from", "I accidentally sorted the password", "The PIN uses"]
      const hint = hintTemplates[Math.floor(Math.random() * hintTemplates.length)];
      if (attemptedPassword === server.password) {
        server.unlocked = true;
        return getGenericSuccess();
      } else {
        return {
          success: false,
          status: 401,
          msg: `Incorrect. ${hint}: ${server.password.split("").sort().join("")}`,
          responseTime: getResponseTime(),
          passwordLength: server.password.length,
          passwordFormat: getPasswordType(server.password),
        };
      }
    },
  });
}

export const getNoPasswordServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  return DWebServerBuilder({
    name: getName(difficulty),
    icon: getRandomIcon(),
    difficulty: difficulty,
    chaRequired: chaRequired,
    password: "",
    x,
    y,
    passwordChecker: (attemptedPassword: string, server: DarkWebServer) => {
      const hintTemplates = ["The password is not set", "There is no password", "The PIN is empty", "Did I set a code?", "I didn't set a password"];
      const hint = hintTemplates[Math.floor(Math.random() * hintTemplates.length)];
      if (attemptedPassword === server.password) {
        server.unlocked = true;
        return getGenericSuccess();
      } else {
        return {
          success: false,
          status: 401,
          msg: `Hint: ${hint}`,
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
  rainbowTable = ["admin", "password", "0000"],
  hintTemplates = ["The password is the default password", "It's still the default", "The default password is set", "I never changed the password", "It's still the factory settings"],
): DarkWebServer => {
  return DWebServerBuilder({
    name: getName(difficulty),
    icon: getRandomIcon(),
    difficulty: difficulty,
    chaRequired: chaRequired,
    password: rainbowTable[Math.floor(Math.random() * 3)],
    x,
    y,
    passwordChecker: (attemptedPassword: string, server: DarkWebServer) => {
      const hint = hintTemplates[Math.floor(Math.random() * hintTemplates.length)];
      if (attemptedPassword.toLowerCase() === server.password) {
        server.unlocked = true;
        return getGenericSuccess();
      } else {
        return {
          success: false,
          status: 401,
          msg: `Incorrect. (${hint})`,
          responseTime: getResponseTime(),
          passwordLength: server.password.length,
          passwordFormat: getPasswordType(server.password),
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
  return DWebServerBuilder({
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
          passwordFormat: getPasswordType(server.password),
        };
      }
    },
  });
};

export const getTimingAttackServer = (difficulty: number, chaRequired: number, x: number, y: number): DarkWebServer => {
  const length = 3 + difficulty;
  return DWebServerBuilder({
    name: getName(difficulty),
    icon: getRandomIcon(),
    difficulty: difficulty,
    chaRequired: chaRequired,
    password: getPassword(length, true, false),
    x,
    y,
    passwordChecker: function (attemptedPassword: string, server: DarkWebServer) {
      const hintTemplates = ["I thought about it for some time, but that is not the password.", "I spent a while on it, but that's not right", "I considered it for a bit, but that's not it", "I spent some time on it, but that's not the password"];
      const requestTime = getResponseTime(getSharedChars(server.password, attemptedPassword));
      if (attemptedPassword === server.password) {
        server.unlocked = true;
        return getGenericSuccess(requestTime);
      } else {
        return {
          success: false,
          status: 401,
          msg: hintTemplates[Math.floor(Math.random() * hintTemplates.length)],
          responseTime: requestTime,
          passwordLength: server.password.length,
          passwordFormat: getPasswordType(server.password),
        };
      }
    },
  });
};

// TODO: abstract rainbow table generator

// TODO: arithmetic string server (eval bait)

// TODO: verbal description of simple math problem (nth root of x)

// TODO: basic cypher server?

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

export const getPasswordType = (password: string): string => {
  const numbers = "0123456789";
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const passwordArr = password.split("");

  if (passwordArr.every((char) => numbers.includes(char))) {
    return "numeric";
  }
  if (passwordArr.every((char) => letters.includes(char))) {
    return "alphabetic";
  }
  if (passwordArr.every((char) => numbers.includes(char) || letters.includes(char))) {
    return "alphanumeric";
  }
  if (passwordArr.every((char) => char.charCodeAt(0) < 128)) {
    return "ASCII";
  }
  return "unicode";
}

export const getRandomIcon = (): Icon => {
  const icons = Object.values(Icon);
  return <Icon>icons[Math.floor(Math.random() * icons.length)];
};
