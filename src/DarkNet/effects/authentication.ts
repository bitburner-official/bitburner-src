import { handleLabyrinthPassword, isLabyrinthServer } from "./labyrinth";
import { handleFailedAuth, handleSuccessfulAuth } from "./effects";
import type { DarknetResult } from "@nsdefs";
import { PasswordResponse } from "../models/DarknetServerOptions";
import { capturePackets, logPasswordAttempt } from "../models/packetSniffing";
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
import { SpecialServers } from "../../Server/data/SpecialServers";
import { WHRNG } from "../../Casino/RNG";

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
      const exactCharsMessage = `${exactCharacters} symbol${exactCharacters == 1 ? " is" : "s are"} match exactly`;
      const misplacedCharsMessage = `${misplacedCharacters} symbol${misplacedCharacters == 1 ? "" : "s"} match but ${
        misplacedCharacters == 1 ? "is" : "are"
      } in the wrong place`;
      const message = `Hint: ${exactCharsMessage},  and ${misplacedCharsMessage}.`;
      return getFailureResponse(attemptedPassword, message, `${exactCharacters},${misplacedCharacters}`);
    }
    case ModelIds.GuessNumber: {
      const hintData = Number(attemptedPassword) > Number(server.password) ? "Lower" : "Higher";
      return getFailureResponse(attemptedPassword, server.staticPasswordHint, hintData);
    }
    case ModelIds.RomanNumeral: {
      const hintData = Number(attemptedPassword) > Number(server.password) ? "ALTUS NIMIS" : "PARUM BREVIS";
      return getFailureResponse(attemptedPassword, server.staticPasswordHint, hintData);
    }
    case ModelIds.Yesn_t: {
      const response = attemptedPassword
        .split("")
        .map((char, i) => (char === server.password[i] ? "yes" : "yesn't"))
        .join(",");
      return getFailureResponse(attemptedPassword, "that wasn't right", response);
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
      if (isNaN(+attemptedPassword) || password % attemptedDivisor || attemptedPassword === "") {
        return getFailureResponse(attemptedPassword, `Password is not divisible by '${attemptedPassword}'`, "false");
      }
      return getFailureResponse(attemptedPassword, `Password IS divisible by '${attemptedPassword}'`, "true");
    }
    case ModelIds.tripleModulo: {
      const password = Number(server.password);
      const input = Number(attemptedPassword);
      const result = (password % input) % (((input - 1) % 32) + 1);
      const message =
        input % 32 === 0
          ? `(Password % ${input}) % 32 = ${result}`
          : `(Password % ${input}) % (${input} % 32) = ${result}`;

      return getFailureResponse(attemptedPassword, message, result.toString());
    }
    case ModelIds.ConvertToBase10:
    case ModelIds.parsedExpression: {
      const parsedAttemptedPassword = parseFloat(attemptedPassword);
      if (!isNaN(parsedAttemptedPassword) && isCloseToCorrectPassword(server.password, parsedAttemptedPassword)) {
        // ignore small rounding errors during floating point operations
        return getGenericSuccess(attemptedPassword);
      }
      return getFailureResponse(attemptedPassword, server.staticPasswordHint, server.passwordHintData);
    }
    case ModelIds.TimingAttack: {
      const indexOfDifference = server.password.split("").findIndex((char, i) => char !== attemptedPassword[i]);
      const hint = `Found a mismatch while checking each character (${indexOfDifference})`;
      const data = `Response time: ${responseTime}ms`;
      return getFailureResponse(attemptedPassword, hint, data);
    }
    case ModelIds.BufferOverflow: {
      // If the attempted password is longer than the server's actual password, it starts overwriting the
      // part of the "buffer" that holds the expected password, which can "trick" the comparison into matching
      const maskCharacter = attemptedPassword === "■".repeat(server.password.length) ? "?" : "■";
      const buffer = "ˍ".repeat(server.password.length) + maskCharacter.repeat(server.password.length);
      const overwrittenBuffer = attemptedPassword.slice(0, buffer.length) + buffer.slice(attemptedPassword.length);

      const receivedBuffer = overwrittenBuffer.slice(0, server.password.length);
      const expectedValueBuffer = overwrittenBuffer.slice(server.password.length);

      if (receivedBuffer === expectedValueBuffer) {
        return getGenericSuccess(attemptedPassword);
      }

      const failureMessage = `auth failed: received '${receivedBuffer}', expected '${expectedValueBuffer}'`;
      const data = `${receivedBuffer},${expectedValueBuffer}`;
      return getFailureResponse(attemptedPassword, failureMessage, data);
    }
    case ModelIds.globalMaxima: {
      const altitude = getKingOfTheHillAltitude(server, attemptedPassword);
      return getFailureResponse(
        attemptedPassword,
        `current altitude: ${altitude.toFixed(5)} m; highest peak: 10,000 m`,
        `${altitude}`,
      );
    }
    case ModelIds.SortedEchoVuln: {
      if (server.password.length < 5 || attemptedPassword.length !== server.password.length) {
        return getFailureResponse(attemptedPassword, server.staticPasswordHint, server.passwordHintData);
      }
      let squaredError = 0;
      for (let i = 0; i < attemptedPassword.length; i++) {
        const attempted = Number(attemptedPassword[i]);
        const actual = Number(server.password[i]);
        if (!Number.isFinite(attempted)) {
          return getFailureResponse(attemptedPassword, server.staticPasswordHint, server.passwordHintData);
        }
        squaredError += (attempted - actual) ** 2;
      }
      const rmsd = Math.sqrt(squaredError / attemptedPassword.length);
      const rmsdMessage = `${server.passwordHintData}; RMS Deviation:${rmsd.toFixed(3)}`;
      return getFailureResponse(attemptedPassword, server.staticPasswordHint, rmsdMessage);
    }
    case ModelIds.packetSniffer: {
      return getFailureResponse(attemptedPassword, server.staticPasswordHint, capturePackets(server));
    }
    default:
      return getFailureResponse(attemptedPassword, server.staticPasswordHint, server.passwordHintData);
  }
};

export const isCloseToCorrectPassword = (
  correctPassword: string,
  attemptedPassword: number,
  logIfNotClose = false,
): boolean => {
  const difference = Math.abs(attemptedPassword - Number(correctPassword));
  const fractionalDiff = Math.abs(difference / Number(correctPassword));
  const result = difference < 0.01 || fractionalDiff < 0.005;

  if (logIfNotClose && !result) {
    console.warn(`Attempted password ${attemptedPassword} is not close enough to correct password ${correctPassword}`);
  }
  return result;
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
    logPasswordAttempt(server, response, pid);
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
  if (!server.hasAdminRights) {
    return false;
  }
  const serverState = getServerState(server.hostname);
  return serverState.authenticatedPIDs.includes(pid) || server.hostname === SpecialServers.DarkWeb;
};

export const getMastermindResponse = (password: string, attemptedPassword: string) => {
  return {
    exactCharacters: getExactCorrectCharsCount(password, attemptedPassword),
    misplacedCharacters: getMisplacedCorrectCharsCount(password, attemptedPassword),
  };
};

export const getKingOfTheHillAltitude = (server: DarknetServer, attemptedPassword: string) => {
  const password = Number(server.password);
  const x = Number(attemptedPassword);
  const rng = new WHRNG(password);
  const hillCount = Math.min(Math.floor(server.difficulty / 8), 4) * 2 + 1;
  const passwordHillIndex = Math.floor(rng.random() * (hillCount - 2)) + 1;
  const width = 10 ** Math.max(server.password.length - 2, 0) + 1;

  // As the player gets very close to the password, only consider the main hill
  // This is to ensure the data is very clean as they approach, and that the peak is not
  // moved off of the password value by some of the side hills
  if (Math.abs((x - password) / password) < 0.03) {
    return getAltitudeGivenHillSpecs(x, password, 10000, width);
  }

  // Otherwise, give them the full graph result with all hills
  let altitude = 0;
  for (let i = 0; i < hillCount; i++) {
    const locationOffset = (i - passwordHillIndex) * width * 3 * (rng.random() * 0.2 + 0.9);
    const heightOffset = Math.abs((i - passwordHillIndex) * 2600) * (rng.random() * 0.1 + 0.95);
    altitude += getAltitudeGivenHillSpecs(x, password + locationOffset, 10000 - heightOffset, width);
  }

  return altitude;
};

const getAltitudeGivenHillSpecs = (x: number, location: number, height: number, width: number) => {
  return height * Math.exp(((x - location) ** 2 / width ** 2) * -1);
};
