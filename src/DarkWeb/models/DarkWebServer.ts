
export type PasswordResponse = {
  success: boolean;
  status: number;
  msg: string;
  responseTime: number;
  passwordLength?: number;
  passwordFormat?: string;
  charsMatchingAndCorrectlyLocated?: number;
  charsMatchingButMisplaced?: number;
}

export enum Icon {
  ConnectedTv = "ConnectedTv",
  LaptopMac = "LaptopMac",
  DesktopMac = "DesktopMac",
  Dns = "Dns",
  TapAndPlay = "TapAndPlay",
  PhoneIphone = "PhoneIphone",
  Terminal = "Terminal",
  SatelliteAlt = "SatelliteAlt"
}

export class DarkWebServer {
    name: string;
    icon: Icon;
    difficulty: number;
    chaRequired: number;
    password: string;
    passwordChecker: (password: string) => PasswordResponse;
    unlocked: boolean = false;

    constructor(options: Partial<DarkWebServer> & {passwordChecker: (password: string) => PasswordResponse}) {
      this.difficulty = options.difficulty ?? 1;
      this.name = options.name ?? getName(this.difficulty);
      this.icon = options.icon ?? Icon.ConnectedTv;
      this.chaRequired = options.chaRequired ?? 1;
      this.password = options.password ?? "";
      this.passwordChecker = options.passwordChecker;
      this.unlocked = options.unlocked ?? false;
    }
}

export const getDarkWebServer = (difficulty: number, chaRequired: number): DarkWebServer => {
    if (difficulty === 1) {
        return getSimpleServer(difficulty, chaRequired);
    } else {
        return getComplexServer(difficulty, chaRequired);
    }
}

const getName = (difficulty: number): string => {
  // TODO: Implement
  return `${getResponseTime()}.${getResponseTime(difficulty * 5)}.0.${getResponseTime()}`;
}

const getSimpleServer = (difficulty: number, chaRequired: number): DarkWebServer => {
    const rng = Math.random();
    if (rng < 0.3) {
      return getEchoVulnServer(difficulty, chaRequired);
    }
    if (rng < 6) {
      return getNoPasswordServer(difficulty, chaRequired);
    }
    return getDefaultPasswordServer(difficulty, chaRequired);

}

const getComplexServer = (difficulty: number, chaRequired: number): DarkWebServer => {
  if (Math.random() < 0.5) {
    return getMastermindHintServer(difficulty, chaRequired);
  }
  return getTimingAttackServer(difficulty, chaRequired);
}

export const getEchoVulnServer = (difficulty: number, chaRequired: number): DarkWebServer => {
  const password = getPassword(4);
  return new DarkWebServer({
    name: getName(difficulty),
    icon: Icon.TapAndPlay,
    difficulty: difficulty,
    chaRequired: chaRequired,
    password,
    passwordChecker: function (attemptedPassword: string) {
      if (attemptedPassword === password) {
        this.unlocked = true;
        return {
          success: true,
          status: 200,
          msg: "Success",
          responseTime: getResponseTime()
        }
      } else {
        return {
          success: false,
          status: 401,
          msg: `Incorrect, the password is ${password}`,
          responseTime: getResponseTime(),
          passwordLength: password.length,
          passwordFormat: "numeric"
        }
      }
    }
  })
}

export const getNoPasswordServer = (difficulty: number, chaRequired: number): DarkWebServer => {
  return new DarkWebServer({
    name: getName(difficulty),
    icon: Icon.PhoneIphone,
    difficulty: difficulty,
    chaRequired: chaRequired,
    password: "",
    passwordChecker: function (attemptedPassword: string) {
      if (attemptedPassword === this.password) {
        this.unlocked = true;
        return {
          success: true,
          status: 200,
          msg: "Success",
          responseTime: getResponseTime()
        }
      } else {
        return {
          success: false,
          status: 401,
          msg: `Hint: there is no password`,
          responseTime: getResponseTime()
        }
      }
    }
  })
}

export const getDefaultPasswordServer = (difficulty: number, chaRequired: number): DarkWebServer => {
  const password = ["admin", "password", "0000"][Math.floor(Math.random() * 3)];
  return new DarkWebServer({
    name: getName(difficulty),
    icon: Icon.DesktopMac,
    difficulty: difficulty,
    chaRequired: chaRequired,
    password,
    passwordChecker: function (attemptedPassword: string) {
      if (attemptedPassword.toLowerCase() === password) {
        this.unlocked = true;
        return {
          success: true,
          status: 200,
          msg: "Success",
          responseTime: getResponseTime()
        }
      } else {
        return {
          success: false,
          status: 401,
          msg: `Incorrect. (The password is the default password.)`,
          responseTime: getResponseTime(),
          passwordLength: password.length,
          passwordFormat: "default"
        }
      }
    }
  })
}

export const getMastermindHintServer = (difficulty: number, chaRequired: number, passwordOverride? : string): DarkWebServer => {
  const length = 4;
  const password = passwordOverride ?? getPassword(length);
  return new DarkWebServer({
    name: getName(difficulty),
    icon: Icon.Terminal,
    difficulty: difficulty,
    chaRequired: chaRequired,
    password,
    passwordChecker: function (attemptedPassword: string) {
      if (attemptedPassword === password) {
        this.unlocked = true;
        return {
          success: true,
          status: 200,
          msg: "Success",
          responseTime: getResponseTime()
        }
      } else {
        const mastermindResponse = getMastermindResponse(password, attemptedPassword);
        return {
          success: false,
          status: 401,
          msg: `Hint: ${mastermindResponse.exactCharacters} symbols match, ${mastermindResponse.misplacedCharacters} ${mastermindResponse.misplacedCharacters == 1 ? "is" : "are"} close.`,
          charsMatchingAndCorrectlyLocated: mastermindResponse.exactCharacters,
          charsMatchingButMisplaced: mastermindResponse.misplacedCharacters,
          responseTime: getResponseTime(),
          passwordLength: password.length,
          passwordFormat: `numeric`
        }
      }
    }
  })
}

export const getTimingAttackServer = (difficulty: number, chaRequired: number): DarkWebServer => {
  const length = 5;
  const password = getPassword(length, true, false);
  return new DarkWebServer({
    name: getName(difficulty),
    icon: Icon.Dns,
    difficulty: difficulty,
    chaRequired: chaRequired,
    password,
    passwordChecker: function (attemptedPassword: string) {
      const requestTime = getResponseTime(getSharedChars(password, attemptedPassword));
      if (attemptedPassword === password) {
        this.unlocked = true;
        return {
          success: true,
          status: 200,
          msg: "Success",
          responseTime: requestTime
        }
      } else {
        return {
          success: false,
          status: 401,
          msg: `Incorrect.`,
          responseTime: requestTime,
          passwordLength: password.length,
          passwordFormat: `numeric`
        }
      }
    }
  })
}

// TODO: arithmetic string server (eval bait)

// TODO: basic cypher server

// TODO: simple rainbow table server (dog's name, cat's name, etc)

// TODO: eval pwn server


const getResponseTime = (additionalPasses = 0) => Math.floor(95 + (Math.random() * 12) + additionalPasses * 25);

const getMastermindResponse = (password: string, attemptedPassword: string) => {
  const exactCorrectChars = password.split("").filter((digit, i) => digit === attemptedPassword[i]);

  const remainingPasswordChars = password.split("").filter((digit, i) => digit !== attemptedPassword[i]);
  const remainingAttemptedPasswordChars = attemptedPassword.split("").filter((digit, i) => digit !== password[i]);

  const misplacedCorrectChars = remainingAttemptedPasswordChars
    .filter((digit, i) => {
      const isNotExactlyCorrect = digit !== remainingPasswordChars[i];
      const isPresentInPassword = remainingPasswordChars.includes(digit);
      const countInAttemptedPasswordThusFar = remainingAttemptedPasswordChars.slice(0, i).filter((prevDigit) => prevDigit === digit).length
      const countInPassword = remainingPasswordChars.filter((prevDigit) => prevDigit === digit).length;
      return isNotExactlyCorrect && isPresentInPassword && countInAttemptedPasswordThusFar <= countInPassword;
    });

  return {
    exactCharacters: exactCorrectChars.length,
    misplacedCharacters: misplacedCorrectChars.length,
  }
}

const getSharedChars = (password: string, attemptedPassword: string): number => {
  for (let i = 0; i < password.length; i++) {
    if (password[i] !== attemptedPassword[i]) {
      return i;
    }
  }
  return password.length;
}

const getPassword = (length: number, allowNumbers = true, allowLetters = false, allowSpecial = false, allowUnicode = false): string => {
  const numbers = "0123456789";
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const unicode = "¼░╡╢╣╤╥╦╧╨╩╪╫╬╭╮╯╰╱╲╳╴╵╶╷╸╹╺╻╼╽╾╿";

  const characters = (allowNumbers ? numbers : "") + (allowLetters ? letters : "") + (allowSpecial ? special : "") + (allowUnicode ? unicode : "");
  let password = "";
  for (let i = 0; i < length; i++) {
    password += characters[Math.floor(Math.random() * characters.length)];
  }
  return password;
}