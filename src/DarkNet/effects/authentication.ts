import { handleLabyrinthPassword, isLabyrinthServer } from "./labyrinth";
import { handleFailedAuth, handleSuccessfulAuth } from "./effects";
import { Result } from "@nsdefs";
import { PasswordResponse } from "../models/DarknetServerOptions";
import { logPasswordAttempt } from "../models/packetSniffing";
import { getServerState } from "../models/DarknetState";
import { ModelIds, ResponseStatus } from "../Enums";
import {
  getExactCorrectChars,
  getExactCorrectCharsCount,
  getFailureResponse,
  getGenericSuccess,
  getMisplacedCorrectCharsCount,
} from "../utils/darknetAuthUtils";
import type { DarknetServer } from "../../Server/DarknetServer";

export const checkPassword = (
  server: DarknetServer,
  attemptedPassword: string,
  threads: number,
  // WIP-@fico
  pid?: number,
  responseTime = 0,
): PasswordResponse => {
  if (isLabyrinthServer(server.hostname)) {
    return handleLabyrinthPassword(attemptedPassword, server, threads, pid);
  }

  if (server.password === attemptedPassword) {
    handleSuccessfulAuth(server, threads, pid);
    return getGenericSuccess(attemptedPassword);
  }
  handleFailedAuth(server, threads);

  if (server.modelId === ModelIds.MastermindHint) {
    const { exactCharacters, misplacedCharacters } = getMastermindResponse(server.password, attemptedPassword);
    const message = `Hint: ${exactCharacters} symbols match, ${misplacedCharacters} ${
      misplacedCharacters == 1 ? "is" : "are"
    } close.`;
    return getFailureResponse(attemptedPassword, message, `${exactCharacters},${misplacedCharacters}`);
  } else if (server.modelId === ModelIds.GuessNumber) {
    const hintData = +attemptedPassword > +server.password ? "Lower" : "Higher";
    return getFailureResponse(attemptedPassword, server.staticPasswordHint, hintData);
  } else if (server.modelId === ModelIds.Yesn_t) {
    const response = attemptedPassword
      .slice(0, 36)
      .split("")
      .map((char, i) => (char === server.password[i] ? "yes" : "yesn't"))
      .join(",");
    return getFailureResponse(attemptedPassword, "that wasn't right", response);
  } else if (server.modelId === ModelIds.Synchronize) {
    const exactChars = getExactCorrectCharsCount(server.password, attemptedPassword);
    const closeChars = getMisplacedCorrectCharsCount(server.password, attemptedPassword);
    const syncDecimal = ((exactChars + closeChars * 0.5) / server.password.length) * 100;
    const responseData = `${Math.round(syncDecimal * 10) / 10}`;
    return getFailureResponse(attemptedPassword, `Synchronization status: ${responseData}%`, responseData);
  } else if (server.modelId === ModelIds.SpiceLevel) {
    const exactChars = getExactCorrectChars(server.password, attemptedPassword);
    const pepperRepresentation = exactChars.map((val) => (val ? "🌶️" : "")).join("") || "0";
    return getFailureResponse(
      attemptedPassword,
      "Not spicy enough",
      `${pepperRepresentation}/${server.password.length}`,
    );
  } else if (server.modelId === ModelIds.divisibilityTest) {
    const password = +server.password;
    const attemptedDivisor = +attemptedPassword;
    if (isNaN(attemptedDivisor) || password % attemptedDivisor || attemptedPassword === "") {
      return getFailureResponse(attemptedPassword, `Password is not divisible by '${attemptedPassword}'`, "false");
    }
    return getFailureResponse(attemptedPassword, `Password IS divisible by '${attemptedPassword}'`, "true");
  } else if (server.modelId === ModelIds.ConvertToBase10 || server.modelId === ModelIds.parsedExpression) {
    const parsedAttemptedPassword = parseFloat(attemptedPassword);
    if (
      !isNaN(parsedAttemptedPassword) &&
      Math.abs((parsedAttemptedPassword - +server.password) / +server.password) < 0.005
    ) {
      // ignore small rounding errors during floating point operations
      // WIP-@fico
      handleSuccessfulAuth(server, threads);
      return getGenericSuccess(attemptedPassword);
    }
    return getFailureResponse(attemptedPassword, server.staticPasswordHint, server.passwordHintData ?? "");
  } else if (server.modelId === ModelIds.TimingAttack) {
    return {
      responseTime,
      ...getFailureResponse(attemptedPassword, server.staticPasswordHint, server.passwordHintData ?? ""),
    };
  } else {
    return getFailureResponse(attemptedPassword, server.staticPasswordHint, server.passwordHintData ?? "");
  }
};

export const getAuthResult = (
  server: DarknetServer,
  attemptedPassword: string,
  threads = 1,
  responseTime = 0,
  pid = -1,
  logActivity = true,
): { result: Result; response: PasswordResponse } => {
  const response = checkPassword(server, attemptedPassword, threads, pid, responseTime);
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

export const isAuthenticated = (server: DarknetServer, pid: number): boolean => {
  const serverState = getServerState(server.hostname);
  return serverState.authenticatedPIDs.includes(pid);
};

export const getMastermindResponse = (password: string, attemptedPassword: string) => {
  return {
    exactCharacters: getExactCorrectCharsCount(password, attemptedPassword),
    misplacedCharacters: getMisplacedCorrectCharsCount(password, attemptedPassword),
  };
};
