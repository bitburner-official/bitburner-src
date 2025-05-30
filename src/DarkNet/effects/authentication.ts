import { BaseServer } from "../../Server/BaseServer";
import { SpecialServers } from "../../Server/data/SpecialServers";
import { handleLabyrinthPassword, isLabyrinthServer } from "./labyrinth";
import { handleFailedAuth, handleSuccessfulAuth, isDarknetServer } from "./effects";
import { Result } from "@nsdefs";
import { PasswordResponse } from "../models/DarknetServerOptions";
import { logPasswordAttempt } from "../models/packetSniffing";
import { getServerState } from "../models/DarknetState";
import { Minigames, ResponseStatus } from "../enums";

export const checkPassword = (
  attemptedPassword: string,
  server: BaseServer,
  threads: number = 1,
  pid?: number,
  responseTime = 0,
): PasswordResponse => {
  if (server.hostname === SpecialServers.DarkWeb) {
    return handleDarkwebSpecialServerAuth(attemptedPassword, server, threads);
  }
  if (!isDarknetServer(server)) {
    return {
      status: ResponseStatus.AUTH_FAILURE,
      message: "This server is not a darknet server",
      passwordAttempted: attemptedPassword,
    };
  }

  if (isLabyrinthServer(server.hostname)) {
    return handleLabyrinthPassword(attemptedPassword, server, threads, pid);
  }

  if (server.password === attemptedPassword) {
    handleSuccessfulAuth(server, threads, pid);
    return getGenericSuccess(attemptedPassword);
  }
  handleFailedAuth(server, threads);

  if (server.modelId === Minigames.MastermindHint) {
    const { exactCharacters, misplacedCharacters } = getMastermindResponse(server.password, attemptedPassword);
    const message = `Hint: ${exactCharacters} symbols match, ${misplacedCharacters} ${
      misplacedCharacters == 1 ? "is" : "are"
    } close.`;
    return getFailureResponse(attemptedPassword, message, `${exactCharacters},${misplacedCharacters}`);
  } else if (server.modelId === Minigames.GuessNumber) {
    const hintData = +attemptedPassword > +server.password ? "Lower" : "Higher";
    return getFailureResponse(attemptedPassword, server.staticPasswordHint, hintData);
  } else if (server.modelId === Minigames.Yesn_t) {
    const response = attemptedPassword
      .slice(0, 36)
      .split("")
      .map((char, i) => (char === server.password[i] ? "yes" : "yesn't"))
      .join(",");
    return getFailureResponse(attemptedPassword, "that wasn't right", response);
  } else if (server.modelId === Minigames.Synchronize) {
    const exactChars = getExactCorrectCharsCount(server.password, attemptedPassword);
    const closeChars = getMisplacedCorrectCharsCount(server.password, attemptedPassword);
    const syncDecimal = ((exactChars + closeChars * 0.5) / server.password.length) * 100;
    const responseData = `${Math.round(syncDecimal * 10) / 10}`;
    return getFailureResponse(attemptedPassword, `Synchronization status: ${responseData}%`, responseData);
  } else if (server.modelId === Minigames.SpiceLevel) {
    const exactChars = getExactCorrectChars(server.password, attemptedPassword);
    const pepperRepresentation = exactChars.map((val) => (val ? "🌶️" : "")).join("") || "0";
    return getFailureResponse(
      attemptedPassword,
      "Not spicy enough",
      `${pepperRepresentation}/${server.password.length}`,
    );
  } else if (server.modelId === Minigames.divisibilityTest) {
    const password = +server.password;
    const attemptedDivisor = +attemptedPassword;
    if (isNaN(attemptedDivisor) || password % attemptedDivisor || attemptedPassword === "") {
      return getFailureResponse(attemptedPassword, `Password is not divisible by '${attemptedPassword}'`, "false");
    }
    return getFailureResponse(attemptedPassword, `Password IS divisible by '${attemptedPassword}'`, "true");
  } else if (server.modelId === Minigames.ConvertToBase10 || server.modelId === Minigames.parsedExpression) {
    const parsedAttemptedPassword = parseFloat(attemptedPassword);
    if (
      !isNaN(parsedAttemptedPassword) &&
      Math.abs((parsedAttemptedPassword - +server.password) / +server.password) < 0.001
    ) {
      // ignore small rounding errors during floating point operations
      handleSuccessfulAuth(server, threads);
      return getGenericSuccess(attemptedPassword);
    }
    return getFailureResponse(attemptedPassword, server.staticPasswordHint, server.passwordHintData ?? "");
  } else if (server.modelId === Minigames.TimingAttack) {
    return {
      responseTime,
      ...getFailureResponse(attemptedPassword, server.staticPasswordHint, server.passwordHintData ?? ""),
    };
  } else {
    return getFailureResponse(attemptedPassword, server.staticPasswordHint, server.passwordHintData ?? "");
  }
};

export const getAuthResult = (
  attemptedPassword: string,
  server: BaseServer,
  threads = 1,
  responseTime = 0,
  pid = -1,
  logActivity = true,
): { result: Result; response: PasswordResponse } => {
  const response = checkPassword(attemptedPassword, server, threads, pid, responseTime);
  if (logActivity) {
    logPasswordAttempt(server, response);
  }
  if (response.status === ResponseStatus.SUCCESS) {
    return {
      result: {
        success: true,
        message: ResponseStatus.SUCCESS,
      },
      response: response,
    };
  }
  return {
    result: {
      success: false,
      message: ResponseStatus.AUTH_FAILURE,
    },
    response: response,
  };
};

export const isAuthenticated = (server: BaseServer, pid: number): boolean => {
  if (!isDarknetServer(server)) {
    return true;
  }
  const serverState = getServerState(server.hostname);
  return serverState.authenticatedPIDs.includes(pid);
};

const handleDarkwebSpecialServerAuth = (
  attemptedPassword: string,
  server: BaseServer,
  threads: number = 1,
): PasswordResponse => {
  if (attemptedPassword === "leekspin") {
    handleSuccessfulAuth(server, threads);
    return getGenericSuccess(attemptedPassword);
  } else {
    handleFailedAuth(server, threads);
    return getFailureResponse(attemptedPassword, "The passkey is 'leekspin'", "");
  }
};

const getFailureResponse = (attemptedPassword: string, message: string, data: string) => ({
  status: ResponseStatus.AUTH_FAILURE,
  message,
  data,
  passwordAttempted: attemptedPassword,
});

export const getMastermindResponse = (password: string, attemptedPassword: string) => {
  return {
    exactCharacters: getExactCorrectCharsCount(password, attemptedPassword),
    misplacedCharacters: getMisplacedCorrectCharsCount(password, attemptedPassword),
  };
};

export const getExactCorrectChars = (password: string, attemptedPassword: string) =>
  password.split("").map((digit, i: number) => digit === attemptedPassword[i]);

const getExactCorrectCharsCount = (password: string, attemptedPassword: string) =>
  getExactCorrectChars(password, attemptedPassword).filter((isCorrect) => isCorrect).length;

const getMisplacedCorrectCharsCount = (password: string, attemptedPassword: string) => {
  // filter out exact correct chars from both the attempted and correct password, to simplify checking for duplicate counts
  const remainingPasswordChars = password.split("").filter((digit, i) => digit !== attemptedPassword[i]);
  const remainingAttemptedPasswordChars = attemptedPassword.split("").filter((digit, i) => digit !== password[i]);

  const misplacedCorrectChars = remainingAttemptedPasswordChars.filter((digit, i) => {
    const isPresentInPassword = remainingPasswordChars.includes(digit);
    const countInAttemptedPasswordThusFar = remainingAttemptedPasswordChars
      .slice(0, i)
      .filter((prevDigit) => prevDigit === digit).length;
    const countInPassword = remainingPasswordChars.filter((prevDigit) => prevDigit === digit).length;
    return isPresentInPassword && countInAttemptedPasswordThusFar < countInPassword;
  });

  return misplacedCorrectChars.length;
};

const getGenericSuccess = (attemptedPassword: string) => ({
  status: ResponseStatus.SUCCESS,
  message: "Success! Access granted.",
  passwordAttempted: attemptedPassword,
});

export const getSharedChars = (password: string, attemptedPassword: string): number => {
  for (let i = 0; i < password.length; i++) {
    if (password[i] !== attemptedPassword[i]) {
      return i;
    }
  }
  return password.length;
};
