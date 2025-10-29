import { handleLabyrinthPassword, isLabyrinthServer } from "./labyrinth";
import { handleFailedAuth, handleSuccessfulAuth } from "./effects";
import type { DarknetResult } from "@nsdefs";
import { PasswordResponse } from "../models/DarknetServerOptions";
import { logPasswordAttempt } from "../models/packetSniffing";
import { getServerState } from "../models/DarknetState";
import { GenericResponseMessage, ModelIds, ResponseCodeEnum } from "../Enums";
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
  pid: number,
  responseTime = 0,
): PasswordResponse => {
  if (isLabyrinthServer(server.hostname)) {
    return handleLabyrinthPassword(attemptedPassword, server, pid);
  }

  if (server.password === attemptedPassword) {
    return getGenericSuccess(attemptedPassword);
  }

  switch (server.modelId) {
    case ModelIds.MastermindHint: {
      const { exactCharacters, misplacedCharacters } = getMastermindResponse(server.password, attemptedPassword);
      const message = `Hint: ${exactCharacters} symbols match, ${misplacedCharacters} ${
        misplacedCharacters == 1 ? "is" : "are"
      } close.`;
      return getFailureResponse(attemptedPassword, message, `${exactCharacters},${misplacedCharacters}`);
    }
    case ModelIds.GuessNumber: {
      const hintData = Number(attemptedPassword) > Number(server.password) ? "Lower" : "Higher";
      return getFailureResponse(attemptedPassword, server.staticPasswordHint, hintData);
    }
    case ModelIds.Yesn_t: {
      const response = attemptedPassword
        .slice(0, 36)
        .split("")
        .map((char, i) => (char === server.password[i] ? "yes" : "yesn't"))
        .join(",");
      return getFailureResponse(attemptedPassword, "that wasn't right", response);
    }
    case ModelIds.Synchronize: {
      const exactChars = getExactCorrectCharsCount(server.password, attemptedPassword);
      const closeChars = getMisplacedCorrectCharsCount(server.password, attemptedPassword);
      const syncDecimal = ((exactChars + closeChars * 0.5) / server.password.length) * 100;
      const responseData = `${Math.round(syncDecimal * 10) / 10}`;
      return getFailureResponse(attemptedPassword, `Synchronization status: ${responseData}%`, responseData);
    }
    case ModelIds.SpiceLevel: {
      const exactChars = getExactCorrectChars(server.password, attemptedPassword);
      const pepperRepresentation = exactChars.map((val) => (val ? "🌶️" : "")).join("") || "0";
      return getFailureResponse(
        attemptedPassword,
        "Not spicy enough",
        `${pepperRepresentation}/${server.password.length}`,
      );
    }
    case ModelIds.divisibilityTest: {
      const password = Number(server.password);
      const attemptedDivisor = Number(attemptedPassword);
      if (isNaN(attemptedDivisor) || password % attemptedDivisor || attemptedPassword === "") {
        return getFailureResponse(attemptedPassword, `Password is not divisible by '${attemptedPassword}'`, "false");
      }
      return getFailureResponse(attemptedPassword, `Password IS divisible by '${attemptedPassword}'`, "true");
    }
    case ModelIds.ConvertToBase10:
    case ModelIds.parsedExpression: {
      const parsedAttemptedPassword = parseFloat(attemptedPassword);
      if (
        !isNaN(parsedAttemptedPassword) &&
        Math.abs((parsedAttemptedPassword - Number(server.password)) / Number(server.password)) < 0.005
      ) {
        // ignore small rounding errors during floating point operations
        return getGenericSuccess(attemptedPassword);
      }
      return getFailureResponse(attemptedPassword, server.staticPasswordHint, server.passwordHintData);
    }
    case ModelIds.TimingAttack:
      return {
        responseTime,
        ...getFailureResponse(attemptedPassword, server.staticPasswordHint, server.passwordHintData),
      };
    default:
      return getFailureResponse(attemptedPassword, server.staticPasswordHint, server.passwordHintData);
  }
};

export const getAuthResult = (
  server: DarknetServer,
  attemptedPassword: string,
  threads = 1,
  responseTime = 0,
  pid = -1,
  logActivity = true,
): { result: DarknetResult; response: PasswordResponse } => {
  const response = checkPassword(server, attemptedPassword, pid, responseTime);
  if (logActivity) {
    logPasswordAttempt(server, response);
  }
  if (response.code === ResponseCodeEnum.Success) {
    handleSuccessfulAuth(server, threads, pid);
    return {
      result: {
        success: true,
        code: ResponseCodeEnum.Success,
        message: GenericResponseMessage.Success,
      },
      response: response,
    };
  }
  handleFailedAuth(server, threads);
  return {
    result: {
      success: false,
      code: ResponseCodeEnum.AuthFailure,
      message: GenericResponseMessage.AuthFailure,
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
