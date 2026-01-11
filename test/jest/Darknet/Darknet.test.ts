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
  getBufferOverflowConfig,
  getParseArithmeticExpressionConfig,
  getBinaryEncodedConfig,
  getTimingAttackConfig,
  getSpiceLevelConfig,
  getGuessNumberConfig,
  getCaptchaConfig,
  getYesn_tConfig,
  cleanArithmeticExpression,
  getXorMaskEncryptedPasswordConfig,
  getTripleModuloConfig,
} from "../../../src/DarkNet/controllers/ServerGenerator";
import { defaultSettingsDictionary } from "../../../src/DarkNet/models/dictionaryData";
import { getAuthResult, isCloseToCorrectPassword } from "../../../src/DarkNet/effects/authentication";
import { DarknetState } from "../../../src/DarkNet/models/DarknetState";
import { GenericResponseMessage, ResponseCodeEnum } from "../../../src/DarkNet/Enums";
import { getNS, initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";
import { getDarkscapeNavigator } from "../../../src/DarkNet/effects/effects";
import * as exceptionAlertModule from "../../../src/utils/helpers/exceptionAlert";
import * as UtilityModule from "../../../src/utils/Utility";
import { mutateDarknet } from "../../../src/DarkNet/controllers/NetworkMovement";
import { launchWebstorm } from "../../../src/DarkNet/effects/webstorm";
import { isNumber } from "../../../src/types";
import { getMostRecentAuthLog } from "../../../src/DarkNet/models/packetSniffing";
import { Player } from "@player";

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
      const authLog = getMostRecentAuthLog(server.hostname);
      if (!authLog) {
        throw new Error(`Cannot find the most recent auth log in ${server.hostname}`);
      }
      if (!authLog.data) {
        throw new Error(`Auth log does not contain data: ${JSON.stringify(authLog)}`);
      }
      return authLog.data.split(",").map((item) => item.trim());
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
      throw new Error(`Password response does not contain data: ${JSON.stringify(failedAttemptResponse.response)}`);
    }
    const [base, numberString] = failedAttemptResponse.response.data.split(",");
    expect(numberString).toBe(encodeNumberInBaseN(+server.password, Number(base)));

    const attemptedPassword = Number.parseInt(numberString, Number(base));

    const result = getAuthResult(server, `${attemptedPassword}`, 1);

    expect(isCloseToCorrectPassword(server.password, attemptedPassword, true)).toBe(true);
    expect(result.response.code).toBe(ResponseCodeEnum.Success);
  });

  test("getConvertToBase10Server creates a server with a correct password hint, and has a non-integer solution at higher difficulties ", () => {
    const server = serverFactory(getConvertToBase10Config, 15, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = getAuthResult(server, "wrongPassword", 1);
    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);

    if (!failedAttemptResponse.response.data) {
      throw new Error(`Password response does not contain data: ${JSON.stringify(failedAttemptResponse.response)}`);
    }
    const [base, numberString] = failedAttemptResponse.response.data.split(",");
    expect(numberString).toBe(encodeNumberInBaseN(+server.password, Number(base)));

    // custom parser is used to handle non-integer answers
    const attemptedPassword = parseBaseNNumberString(numberString, Number(base));

    const result = getAuthResult(server, `${attemptedPassword}`, 1);

    expect(isCloseToCorrectPassword(server.password, attemptedPassword)).toBe(true);
    expect(result.response.code).toBe(ResponseCodeEnum.Success);
  });

  test("encodeNumberInBaseN and parseBaseNNumberString encode/decode numbers correctly", () => {
    expect(encodeNumberInBaseN(15, 5.5)).toBe("24");
    expect(encodeNumberInBaseN(16, 5.5)).toBe("25");
    expect(encodeNumberInBaseN(17, 5.5)).toBe("30.24034");
    expect(encodeNumberInBaseN(264, 17.6)).toBe("EH.A9F");

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

    const value = parseSimpleArithmeticExpression("76 + 30 * ( 3 * 10 + 14 ) - 83 / 47 + 16");
    expect(isCloseToCorrectPassword(value.toString(), 1410.2340425531916)).toBe(true);

    const value2 = parseSimpleArithmeticExpression(
      " 5 ÷ ( 30 ➕ 64 ➕ 11 ) ҳ 98 ÷ 17 ➕ 20 ➕ 58 ➖ ( 64 ➖ 4 ҳ 80 ) ҳ 90",
    );
    expect(isCloseToCorrectPassword(value2.toString(), 23118.274509803923)).toBe(true);

    const expression = generateSimpleArithmeticExpression(20);
    expect(eval(cleanArithmeticExpression(expression))).toBeCloseTo(parseSimpleArithmeticExpression(expression));
  });

  test("getParseArithmeticExpressionConfig server creates a server with a correct password hint", () => {
    const server = serverFactory(() => getParseArithmeticExpressionConfig(25), 25, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = getAuthResult(server, "wrongPassword", 1);
    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);

    const expression = failedAttemptResponse.response.data;
    const attemptedPassword = parseSimpleArithmeticExpression(`${expression}`);

    const result = getAuthResult(server, `${attemptedPassword}`, 1);

    expect(isCloseToCorrectPassword(server.password, attemptedPassword, true)).toBe(true);
    expect(result.response.code).toBe(ResponseCodeEnum.Success);
  });

  test("getBinaryEncodedConfig server creates a server with a correct password hint", () => {
    const server = serverFactory(() => getBinaryEncodedConfig(20), 20, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = getAuthResult(server, "wrongPassword", 1);
    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);

    const binaryString = failedAttemptResponse.response.data;

    // convert each 8 bits to a character, then join
    const attemptedPassword = String.fromCharCode(...`${binaryString}`.split(" ").map((byte) => parseInt(byte, 2)));
    const result = getAuthResult(server, `${attemptedPassword}`, 1);
    expect(attemptedPassword).toBe(server.password);
    expect(result.response.code).toBe(ResponseCodeEnum.Success);
  });

  test("getXorMaskEncryptedPasswordConfig server creates a server with a correct password hint", () => {
    const server = serverFactory(() => getXorMaskEncryptedPasswordConfig(), 20, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = getAuthResult(server, "wrongPassword", 1);
    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);

    const xorData = failedAttemptResponse.response.data;
    if (!xorData) {
      throw new Error(`Password response does not contain data: ${JSON.stringify(failedAttemptResponse.response)}`);
    }
    const [encryptedPasswordString, maskString] = xorData.split(";");
    const mask = maskString.split(" ").map((byte) => parseInt(byte, 2));
    const encryptedPasswordChars = encryptedPasswordString.split("");

    const attemptedPassword = encryptedPasswordChars
      .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ mask[i]))
      .join("");

    const result = getAuthResult(server, `${attemptedPassword}`, 1);
    expect(attemptedPassword).toBe(server.password);
    expect(result.response.code).toBe(ResponseCodeEnum.Success);
  });

  test("getTimingAttackConfig server creates a server that takes longer the more correct characters are submitted, starting from the left", async () => {
    Player.gainCharismaExp(1e200);
    const server = serverFactory(() => getTimingAttackConfig(20), 20, 0, 0);
    server.logTrafficInterval = -1;
    const ns = getNS(server.hostname);
    expect(server).toBeDefined();
    const failedAttemptResponse = getAuthResult(server, "wrongPassword", 1);
    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);

    const getLatestResponseTime = () => {
      const lastLog = DarknetState.serverState[server.hostname].serverLogs[0].message;
      if (typeof lastLog === "string") {
        throw new Error(`Latest log is a string and not a password response: ${lastLog}`);
      }
      return lastLog.responseTime ?? 0;
    };

    const response1 = await ns.dnet.authenticate(server.hostname, server.password.slice(0, 1) + "%%%%", 0);
    const firstAuthTime = getLatestResponseTime();
    const response2 = await ns.dnet.authenticate(server.hostname, server.password.slice(0, 2) + "%%%", 0);
    const secondAuthTime = getLatestResponseTime();
    const response3 = await ns.dnet.authenticate(server.hostname, server.password.slice(0, 3) + "%%", 0);
    const thirdAuthTime = getLatestResponseTime();
    const response4WithWorseGuess = await ns.dnet.authenticate(server.hostname, "%%%%%%", 0);
    const badAuthTime = getLatestResponseTime();

    expect(badAuthTime).toBeLessThan(firstAuthTime);
    expect(secondAuthTime).toBeGreaterThan(firstAuthTime);
    expect(thirdAuthTime).toBeGreaterThan(secondAuthTime);

    expect(response1.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(response2.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(response3.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(response4WithWorseGuess.code).toBe(ResponseCodeEnum.AuthFailure);

    expect(response1.message).toBe(GenericResponseMessage.AuthFailure);

    const serverLogs = DarknetState.serverState[server.hostname].serverLogs;
    expect(serverLogs.length).toBe(5);
    expect(serverLogs[4].message.message).toBe("Found a mismatch while checking each character (0)");
    expect(serverLogs[3].message.message).toBe("Found a mismatch while checking each character (1)");
    expect(serverLogs[2].message.message).toBe("Found a mismatch while checking each character (2)");
    expect(serverLogs[1].message.message).toBe("Found a mismatch while checking each character (3)");
    expect(serverLogs[0].message.message).toBe("Found a mismatch while checking each character (0)");

    const successfulResponse = await ns.dnet.authenticate(server.hostname, server.password, 0);
    expect(successfulResponse.code).toBe(ResponseCodeEnum.Success);
  });

  test("getSpiceLevelConfig server creates a server with a correct password hint", () => {
    const server = serverFactory(() => getSpiceLevelConfig(20), 20, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = getAuthResult(server, "wrongPassword", 1);
    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);

    const correctChars = server.password.slice(0, 3);

    const result1 = getAuthResult(server, `${correctChars}%%%%%%`, 1);
    expect(result1.response.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(result1.response.message).toBe("Not spicy enough");
    expect(result1.response.data).toBe("🌶️🌶️🌶️/10");

    const result2 = getAuthResult(server, `%%%%%%%%`, 1);
    expect(result2.response.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(result2.response.message).toBe("Not spicy enough");
    expect(result2.response.data).toBe("0/10");

    const result3 = getAuthResult(server, `${correctChars.slice(0, 2)}%%%%`, 1);
    expect(result3.response.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(result3.response.message).toBe("Not spicy enough");
    expect(result3.response.data).toBe("🌶️🌶️/10");

    const result4 = getAuthResult(server, server.password, 1);
    expect(result4.response.code).toBe(ResponseCodeEnum.Success);
  });

  test("getGuessNumberConfig server creates a server with a correct password hint", () => {
    const server = serverFactory(() => getGuessNumberConfig(20), 20, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = getAuthResult(server, "wrongPassword", 1);
    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);

    const response1 = getAuthResult(server, `${+server.password - 10}`, 1);
    expect(response1.response.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(response1.response.data).toBe("Higher");

    const response2 = getAuthResult(server, `${+server.password + 10}`, 1);
    expect(response2.response.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(response2.response.data).toBe("Lower");

    const response3 = getAuthResult(server, server.password, 1);
    expect(response3.response.code).toBe(ResponseCodeEnum.Success);
  });

  test("getCaptchaConfig server creates a server with a correct password hint", () => {
    const server = serverFactory(() => getCaptchaConfig(20), 20, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = getAuthResult(server, "wrongPassword", 1);
    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);

    const password = server.passwordHintData
      .split("")
      .filter((c) => !isNaN(+c))
      .join("");
    const result = getAuthResult(server, `${password}`, 1);
    expect(result.result.success).toBe(true);
  });

  test("getYesn_tConfig server creates a server with a correct password hint", () => {
    const server = serverFactory(() => getYesn_tConfig(20), 20, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = getAuthResult(server, "wrongPassword", 1);
    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);

    const result1 = getAuthResult(server, server.password.slice(0, 2) + "%%%%%", 1);
    expect(result1.response.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(result1.response.data).toBe("yes,yes,yesn't,yesn't,yesn't,yesn't,yesn't");

    const result2 = getAuthResult(server, `%%%${server.password.slice(3, 5)}%%%%%`, 1);
    expect(result2.response.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(result2.response.data).toBe("yesn't,yesn't,yesn't,yes,yes,yesn't,yesn't,yesn't,yesn't,yesn't");

    const result3 = getAuthResult(server, server.password, 1);
    expect(result3.response.code).toBe(ResponseCodeEnum.Success);
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
    expect(nonDivisibleResult.response.message).toContain("not divisible");
    const authLog = getMostRecentAuthLog(server.hostname);
    if (!authLog) {
      throw new Error(`Cannot find the most recent auth log in ${server.hostname}`);
    }
    expect(authLog.message).toContain("not divisible");

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

  test("getTripleModuloConfig server creates valid password and hint", () => {
    const server = serverFactory(() => getTripleModuloConfig(60), 5, 0, 0);

    const guess1 = server.password + 1;
    const expectedResult1 = (+server.password % guess1) % (((guess1 - 1) % 32) + 1);
    const result1 = getAuthResult(server, `${guess1}`, 1);
    expect(result1.response.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(getMostRecentAuthLog(server.hostname)?.message).toContain(`= ${expectedResult1}`);
    expect(getMostRecentAuthLog(server.hostname)?.data).toBe(`${expectedResult1}`);

    const guess2 = +server.password - 1;
    const expectedResult2 = (+server.password % guess2) % (((guess2 - 1) % 32) + 1);
    const result2 = getAuthResult(server, `${guess2}`, 1);
    expect(result2.response.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(getMostRecentAuthLog(server.hostname)?.message).toContain(`= ${expectedResult2}`);
    expect(getMostRecentAuthLog(server.hostname)?.data).toBe(`${expectedResult2}`);

    const guess3 = Math.floor(+server.password / 2);
    const expectedResult3 = (+server.password % guess3) % (((guess3 - 1) % 32) + 1);
    const result3 = getAuthResult(server, `${guess3}`, 1);
    expect(result3.response.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(getMostRecentAuthLog(server.hostname)?.message).toContain(`= ${expectedResult3}`);
    expect(getMostRecentAuthLog(server.hostname)?.data).toBe(`${expectedResult3}`);

    // Check a known factor
    server.password = (BigInt(server.password) * BigInt(2)).toString();
    const guessOfFactor = 2;
    const expectedResultOfFactor = 0;
    const resultOfFactor = getAuthResult(server, `${guessOfFactor}`, 1);
    expect(resultOfFactor.response.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(getMostRecentAuthLog(server.hostname)?.message).toContain(`= ${expectedResultOfFactor}`);
    expect(getMostRecentAuthLog(server.hostname)?.data).toBe(`${expectedResultOfFactor}`);

    const correctResult = getAuthResult(server, `${server.password}`, 1);
    expect(correctResult.response.code).toBe(ResponseCodeEnum.Success);
  });

  test("bufferOverflow server creates valid password and hint", () => {
    const bufferOverflowServer = serverFactory(getBufferOverflowConfig, 5, 0, 0);
    bufferOverflowServer.logTrafficInterval = -1;
    const passwordLength = bufferOverflowServer.password.length;
    const failedResult = getAuthResult(bufferOverflowServer, "1", 1);
    expect(failedResult.response.code).toBe(ResponseCodeEnum.AuthFailure);

    const authLog = getMostRecentAuthLog(bufferOverflowServer.hostname);
    if (!authLog) {
      throw new Error(`Cannot find the most recent auth log in ${bufferOverflowServer.hostname}`);
    }
    const received = "1".padEnd(passwordLength, "ˍ").slice(0, passwordLength);
    const expected = "■".repeat(passwordLength);
    expect(authLog.message).toBe(`auth failed: received '${received}', expected '${expected}'`);
    expect(authLog.passwordAttempted).toBe("1".padEnd(passwordLength, "ˍ").slice(0, passwordLength));

    const successResult = getAuthResult(bufferOverflowServer, "A".repeat(passwordLength * 2), 1);
    expect(successResult.response.code).toBe(ResponseCodeEnum.Success);
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
