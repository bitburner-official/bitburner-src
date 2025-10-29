import {
  serverFactory,
  getEchoVulnConfig,
  getNoPasswordConfig,
  getDefaultPasswordConfig,
  getMastermindHintConfig,
  encodeNumberInBaseN,
  parseBaseNNumberString,
  getConvertToBase10Config,
  parseSimpleArithmeticExpression,
  generateSimpleArithmeticExpression,
  getLargestPrimeFactorConfig,
  largePrimes,
  getDivisibilityTestConfig,
  getRomanNumeralConfig,
  romanNumeralDecoder,
} from "../../../src/DarkNet/controllers/ServerGenerator";
import { PasswordResponse } from "../../../src/DarkNet/models/DarknetServerOptions";
import { defaultSettingsDictionary } from "../../../src/DarkNet/models/dictionaryData";
import { getAuthResult } from "../../../src/DarkNet/effects/authentication";
import { DarknetState } from "../../../src/DarkNet/models/DarknetState";
import { ResponseCodeEnum } from "../../../src/DarkNet/Enums";
import { initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";
import { getDarkscapeNavigator } from "../../../src/DarkNet/effects/effects";
import * as exceptionAlertModule from "../../../src/utils/helpers/exceptionAlert";
import * as UtilityModule from "../../../src/utils/Utility";
import { mutateDarknet } from "../../../src/DarkNet/controllers/NetworkMovement";
import { launchWebstorm } from "../../../src/DarkNet/effects/webstorm";
import { isNumber } from "../../../src/types";

beforeAll(() => {
  initGameEnvironment();
});

beforeEach(() => {
  setupBasicTestingEnvironment();
  getDarkscapeNavigator();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("Password Tests", () => {
  const difficulty = 1;

  test("getEchoVulnServer creates a server and checks password correctly", () => {
    const server = serverFactory(getEchoVulnConfig, difficulty, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = getAuthResult(server, "wrongPassword", 1);
    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(failedAttemptResponse.response.message.includes(server.password)).toBe(true);
    expect(server.hasAdminRights).toBe(false);

    expect(getAuthResult(server, server.password, 1).result.code).toBe(ResponseCodeEnum.Success);
    expect(server.hasAdminRights).toBe(true);
  });

  test("getNoPasswordServer creates a server with no password", () => {
    const server = serverFactory(getNoPasswordConfig, difficulty, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = getAuthResult(server, "wrongPassword", 1);
    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(server.hasAdminRights).toBe(false);

    expect(getAuthResult(server, server.password, 1).result.code).toBe(ResponseCodeEnum.Success);
    expect(server.hasAdminRights).toBe(true);
  });

  test("getDefaultPasswordServer creates a server with default password", () => {
    const server = serverFactory(getDefaultPasswordConfig, difficulty, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = getAuthResult(server, "wrongPassword", 1);

    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(server.hasAdminRights).toBe(false);

    expect(defaultSettingsDictionary.includes(server.password)).toBe(true);

    expect(getAuthResult(server, server.password, 1).result.code).toBe(ResponseCodeEnum.Success);
    expect(server.hasAdminRights).toBe(true);
  });

  test("getMastermindHintServer creates a server with mastermind hint", () => {
    const password = "11223334";
    const server = serverFactory(getMastermindHintConfig, difficulty, 0, 0);
    server.password = password;
    expect(server).toBeDefined();

    const getData = () => {
      const responseLog = DarknetState.serverState[server.hostname].serverLogs.slice(0, 1)[0];
      const feedback = JSON.parse(responseLog) as PasswordResponse;
      if (!feedback.data) {
        throw new Error(`Invalid responseLog: ${responseLog}`);
      }
      return feedback.data.split(",").map((item) => item.trim());
    };

    const failedAttemptResponse1 = getAuthResult(server, "");
    expect(failedAttemptResponse1.response.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(server.hasAdminRights).toBe(false);

    const [correctCount1, closeCount1] = getData();
    expect(correctCount1).toBe("0");
    expect(closeCount1).toBe("0");

    const failedAttemptResponse2 = getAuthResult(server, "123");
    expect(failedAttemptResponse2.response.code).toBe(ResponseCodeEnum.AuthFailure);
    const [correctCount2, closeCount2] = getData();
    expect(correctCount2).toBe("1");
    expect(closeCount2).toBe("2");

    const failedAttemptResponse3 = getAuthResult(server, "11111111");
    expect(failedAttemptResponse3.response.code).toBe(ResponseCodeEnum.AuthFailure);
    const [correctCount3, closeCount3] = getData();
    expect(correctCount3).toBe("2");
    expect(closeCount3).toBe("0");

    const failedAttemptResponse4 = getAuthResult(server, "1122334");
    expect(failedAttemptResponse4.response.code).toBe(ResponseCodeEnum.AuthFailure);
    const [correctCount4, closeCount4] = getData();
    expect(correctCount4).toBe("6");
    expect(closeCount4).toBe("1");

    const failedAttemptResponse5 = getAuthResult(server, "22114333");
    expect(failedAttemptResponse5.response.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(server.hasAdminRights).toBe(false);
    const [correctCount5, closeCount5] = getData();
    expect(correctCount5).toBe("2");
    expect(closeCount5).toBe("6");

    server.password = "2435";
    const failedAttemptResponse6 = getAuthResult(server, "3423");
    expect(failedAttemptResponse6.response.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(server.hasAdminRights).toBe(false);
    const [correctCount6, closeCount6] = getData();
    expect(correctCount6).toBe("1");
    expect(closeCount6).toBe("2");

    expect(getAuthResult(server, server.password, 1).result.code).toBe(ResponseCodeEnum.Success);
    expect(server.hasAdminRights).toBe(true);
  });

  test("getConvertToBase10Server creates a server with a correct password hint", () => {
    const server = serverFactory(getConvertToBase10Config, 5, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = getAuthResult(server, "wrongPassword", 1);
    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);
    if (!failedAttemptResponse.response.data) {
      throw new Error("Invalid failedAttemptResponse");
    }
    const [base, numberString] = failedAttemptResponse.response.data.split(",");

    expect(numberString).toBe(encodeNumberInBaseN(+server.password, Number(base)));

    const attemptedPassword = parseBaseNNumberString(numberString, Number(base));

    const result = getAuthResult(server, `${attemptedPassword}`, 1);

    expect(result.response.code).toBe(ResponseCodeEnum.Success);
  });

  test("encodeNumberInBaseN and parseBaseNNumberString encode/decode numbers correctly", () => {
    expect(encodeNumberInBaseN(15, 5.5)).toBe("24");
    expect(encodeNumberInBaseN(16, 5.5)).toBe("25");
    expect(encodeNumberInBaseN(17, 5.5)).toBe("30.24");

    expect(parseBaseNNumberString("24", 5.5)).toBe(15);
    expect(parseBaseNNumberString("25", 5.5)).toBe(16);

    const aprox = parseBaseNNumberString("30.24", 5.5);
    expect(Math.abs(aprox - 17) < 0.1).toBe(true);

    expect(encodeNumberInBaseN(7, 2)).toBe("111");
    expect(encodeNumberInBaseN(112, 2)).toBe("1110000");
  });

  test("parseSimpleArithmeticExpression parses expressions correctly", () => {
    expect(parseSimpleArithmeticExpression("1 + 2")).toBe(3);
    expect(parseSimpleArithmeticExpression("1 - 2")).toBe(-1);
    expect(parseSimpleArithmeticExpression("5 + 1 * 3")).toBe(8);
    expect(parseSimpleArithmeticExpression("5 * ( 6 + 7 )")).toBe(65);
    expect(parseSimpleArithmeticExpression("4 + 5 * ( 6 + 7 ) / 2")).toBe(36.5);
    expect(parseSimpleArithmeticExpression("1 + 3 * ( 4 / 5 ) / 2 + 4 ")).toBe(6.2);
    expect(Math.abs(parseSimpleArithmeticExpression("1 + 3 * ((4 / 5) / 2 ) * 3 + 4 ")) - 8.6 < 0.01).toBe(true);
    expect(
      Math.abs(
        parseSimpleArithmeticExpression(
          "23 * ( 41 + 76 + 32 * 27 * 6 ) - 34 - 49 + 93 - ( 11 / 41 - 62 / 6 + 5 ) * 19 - 0",
        ),
      ) -
        122029.235 <
        0.9,
    ).toBe(true);
    expect(parseSimpleArithmeticExpression("48 - 38 * 24 + ( 72 / 8 * 4 ) - 76 * 61 * 16")).toBe(-75004);
    expect(
      Math.ceil(parseSimpleArithmeticExpression("8 / 15 / 91 / ( 54 * 10 * 84 ) - 77 * 83 + ( 83 * 75 / 8 ) + 54")),
    ).toBe(-5558);
    expect(
      parseSimpleArithmeticExpression(
        "37 / 8 / 81 / ( 1 + ( 80 * 31 ) - 26 - 53 ) / 52 / ( 18 * 72 / 78 ) * 83 * ( 21 * 88 + 96 ) + 23",
      ),
    ).toBeCloseTo(24.61, -1);
    expect(parseSimpleArithmeticExpression("94 / ( 76 * 63 * ( 89 * 33 ) + 70 ) * 13 * 73 * 61 * 81 * 74")).toBeCloseTo(
      2319.425,
    );
    expect(
      parseSimpleArithmeticExpression(
        "94 / ( 76 * 63 * ( 89 * 33 ) + 70 ) * 13 * 73 * 61 * 81 * 74;alert('injection!')",
      ),
    ).toBeCloseTo(2319.425);

    const expression = generateSimpleArithmeticExpression(20);
    const cleanedExpression = expression
      .replaceAll("ҳ", "*")
      .replaceAll("➕", "+")
      .replaceAll("➖", "-")
      .replaceAll("÷", "/");
    expect(eval(cleanedExpression)).toBeCloseTo(parseSimpleArithmeticExpression(cleanedExpression));
  });

  test("getRomanNumeralsServer creates a server with a correct password hint", () => {
    const server = serverFactory(() => getRomanNumeralConfig(5), 5, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = getAuthResult(server, "wrongPassword", 1);
    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);

    const attemptedPassword = romanNumeralDecoder(server.passwordHintData);

    const result = getAuthResult(server, `${attemptedPassword}`, 1);

    expect(result.result.success).toBe(true);
    expect(result.response.code).toBe(ResponseCodeEnum.Success);
  });

  test("getLargestPrimeFactor server creates valid password and hint", () => {
    const server = serverFactory(() => getLargestPrimeFactorConfig(20), 5, 0, 0);
    const password = +server.password;
    const hint = +server.passwordHintData;

    expect(isNumber(password)).toBe(true);
    expect(isNumber(hint)).toBe(true);

    const factor = hint / password;
    expect(factor).toEqual(Math.floor(factor));

    const factors = largePrimes
      .filter((n) => hint / n === Math.floor(hint / n))
      .sort()
      .toReversed();
    expect(factors[0]).toEqual(password);
  });

  test("getDivisibilityTestConfig server creates valid password and hint", () => {
    const server = serverFactory(() => getDivisibilityTestConfig(100), 5, 0, 0);

    expect(server.password.includes("+")).toBe(false);
    expect(isNumber(+server.password)).toBe(true);
    expect(isNumber(+server.passwordHintData)).toBe(true);

    DarknetState.serverState[server.hostname] = {
      serverLogs: [],
      authenticatedPIDs: [],
    };
    const nonDivisibleResult = getAuthResult(server, `${server.password + 1}`, 1);
    expect(nonDivisibleResult.response.code).toBe(ResponseCodeEnum.AuthFailure);
    const nonDivisibleLogs = DarknetState.serverState[server.hostname].serverLogs[0];
    expect(nonDivisibleLogs).toContain("not divisible");

    let factor = 2;
    while (+server.password % factor !== 0) {
      ++factor;
    }

    const divisibleResult = getAuthResult(server, `${factor}`, 1);
    expect(divisibleResult.response.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(divisibleResult.response.message).toContain("IS divisible");

    const correctResult = getAuthResult(server, `${server.password}`, 1);
    expect(correctResult.response.code).toBe(ResponseCodeEnum.Success);
  });
});

describe("mutateDarknet and webstorm", () => {
  test("mutateDarknet", () => {
    const spiedExceptionAlert = jest.spyOn(exceptionAlertModule, "exceptionAlert");
    const spiedConsoleError = jest.spyOn(console, "error").mockImplementation();
    for (let i = 0; i < 5000; ++i) {
      mutateDarknet();
    }
    expect(spiedExceptionAlert).not.toHaveBeenCalled();
    expect(spiedConsoleError).not.toHaveBeenCalled();
  });
  test("webstorm", async () => {
    const spiedExceptionAlert = jest.spyOn(exceptionAlertModule, "exceptionAlert");
    const spiedConsoleError = jest.spyOn(console, "error").mockImplementation();
    jest.spyOn(UtilityModule, "sleep").mockImplementation();
    for (let i = 0; i < 100; ++i) {
      await launchWebstorm();
    }
    expect(spiedExceptionAlert).not.toHaveBeenCalled();
    expect(spiedConsoleError).not.toHaveBeenCalled();
  });
});
