import { getName, getPasswordType, getRandomIcon, Minigames } from "../controllers/DarkWebServerGenerator";
import { Icon } from "../controllers/ServerIcon";

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

export type DwebConnection = {
  id: string;
  x: number;
  y: number;
};

export type DarkWebServer = {
  name: string;
  icon: Icon;
  password: string;
  minigameType: Minigames;

  passwordHint: string;


  id: string;

  x: number;
  y: number;

  difficulty: number;
  chaRequired: number;
  unlocked: boolean;
  connections: DwebConnection[];
}

export const DWebServerBuilder = (options: Partial<DarkWebServer> & { minigameType: Minigames, password: string, passwordHint: string }): DarkWebServer => <DarkWebServer>({
  name: options.name ?? getName(options.difficulty ?? 1),
  icon: options.icon ?? getRandomIcon(),
  password: options.password ?? "",
  passwordHint: options.passwordHint ?? "",
  minigameType: options.minigameType,


  id: Math.random().toString(16).slice(2),

  x: options.x,
  y: options.y,

  difficulty: options.difficulty ?? 1,
  chaRequired: options.chaRequired ?? (options.difficulty ?? 1) * 10,
  unlocked: options.unlocked ?? false,
  connections: options.connections ?? [],
});


export const checkPassword = (attemptedPassword: string, server: DarkWebServer): PasswordResponse => {
  if (server.password === attemptedPassword) {
    server.unlocked = true;
    // TODO: admin access
    return getGenericSuccess();
  }
  else if (server.minigameType === Minigames.MastermindHint) {
    const { exactCharacters, misplacedCharacters } = getMastermindResponse(server.password, attemptedPassword);
    return {
      success: false,
      status: 401,
      msg: `Hint: ${exactCharacters} symbols match, ${misplacedCharacters} ${
        misplacedCharacters == 1 ? "is" : "are"
      } close.`,
      data: exactCharacters,
      data2: misplacedCharacters,
      responseTime: getResponseTime(),
      passwordLength: server.password.length,
      passwordFormat: getPasswordType(server.password),
    };
  }
  else {
    const sharedChars = server.minigameType === Minigames.TimingAttack ? getSharedChars(server.password, attemptedPassword) : 0;
    const responseTime = getResponseTime(sharedChars);
    return {
      success: false,
      status: 401,
      msg: server.passwordHint,
      responseTime: responseTime,
      passwordLength: server.password.length,
      passwordFormat: getPasswordType(server.password),
    };
  }
}

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