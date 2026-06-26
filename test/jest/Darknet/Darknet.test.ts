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
  getKingOfTheHillConfig,
  getSortedEchoVulnConfig,
} from "../../../src/DarkNet/controllers/ServerGenerator";
import {
  commonPasswordDictionary,
  connectors,
  defaultSettingsDictionary,
  l33t,
  lettersLowercase,
  lettersUppercase,
  loreNames,
  notebookFileNames,
  numbers,
  passwordFileNames,
  presetNames,
  ServerNamePrefixes,
  ServerNameSuffixes,
} from "../../../src/DarkNet/models/dictionaryData";
import { getAuthResult, isCloseToCorrectPassword } from "../../../src/DarkNet/effects/authentication";
import { DarknetState } from "../../../src/DarkNet/models/DarknetState";
import { GenericResponseMessage, ResponseCodeEnum } from "../../../src/DarkNet/Enums";
import { expectWithMessage, getNS, initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";
import { getClueFileName, getDarkscapeNavigator } from "../../../src/DarkNet/effects/effects";
import * as exceptionAlertModule from "../../../src/utils/helpers/exceptionAlert";
import * as UtilityModule from "../../../src/utils/Utility";
import { mutateDarknet } from "../../../src/DarkNet/controllers/NetworkMovement";
import { launchWebstorm } from "../../../src/DarkNet/effects/webstorm";
import { isNumber } from "../../../src/types";
import { getMostRecentAuthLog, getServerLogs } from "../../../src/DarkNet/models/packetSniffing";
import { Player } from "@player";
import { assertString } from "../../../src/utils/TypeAssertion";
import { assertPasswordResponse, generateDarknetServerName } from "../../../src/DarkNet/models/DarknetServerOptions";
import { DarknetServer } from "../../../src/Server/DarknetServer";
import { isDirectoryPath } from "../../../src/Paths/Directory";
import { isFilePath } from "../../../src/Paths/FilePath";
import { LAB_CACHE_NAME } from "../../../src/DarkNet/effects/labyrinth";
import { generateCacheFilename, getRewardFromCache, getStockReward } from "../../../src/DarkNet/effects/cacheFiles";
import { getAllDarknetServers } from "../../../src/DarkNet/utils/darknetNetworkUtils";
import { prestigeAugmentation } from "../../../src/Prestige";
import { initStockMarket, StockMarket, SymbolToStockMap } from "../../../src/StockMarket/StockMarket";
import { StockSymbol } from "@enums";
import { disconnectServers, GetAllServers, GetServerOrThrow } from "../../../src/Server/AllServers";
import { roundToTwo } from "../../../src/utils/helpers/roundToTwo";
import { getRamBlock } from "../../../src/DarkNet/effects/ramblock";
import { SpecialServers } from "../../../src/Server/data/SpecialServers";
import { clearDarknet } from "../../../src/DarkNet/controllers/NetworkGenerator";
import { getTorRouter } from "../../../src/Server/ServerHelpers";

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

const getLatestResponseTime = (server: DarknetServer) => {
  const lastPasswordResponse = getServerLogs(server, 1, true)[0].message;
  assertPasswordResponse(lastPasswordResponse);
  assertString(lastPasswordResponse.data);
  const timeMatch = lastPasswordResponse.data.match(/Response time: (\d+\.?\d*)ms/);
  if (!timeMatch) {
    throw new Error(`No response time found in log: ${JSON.stringify(lastPasswordResponse)}`);
  }
  const responseTime = Number(timeMatch[1]);
  if (!Number.isFinite(responseTime)) {
    throw new Error(`No response time found in log: ${JSON.stringify(lastPasswordResponse)}`);
  }
  return responseTime;
};

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

    expect((defaultSettingsDictionary as unknown as string[]).includes(server.password)).toBe(true);

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
      assertString(authLog.data);
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
    assertString(failedAttemptResponse.response.data);
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
    assertString(failedAttemptResponse.response.data);
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
    assertString(xorData);
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
    const server = serverFactory(getTimingAttackConfig, 20, 0, 0);
    server.logTrafficInterval = -1;
    const ns = getNS(server.hostname);
    expect(server).toBeDefined();
    const failedAttemptResponse = getAuthResult(server, "$$$$$$$", 1);
    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);

    const response1 = await ns.dnet.authenticate(server.hostname, server.password.slice(0, 1) + "%%%%", 0);
    const firstAuthTime = getLatestResponseTime(server);
    const response2 = await ns.dnet.authenticate(server.hostname, server.password.slice(0, 2) + "%%%", 0);
    const secondAuthTime = getLatestResponseTime(server);
    const response3 = await ns.dnet.authenticate(server.hostname, server.password.slice(0, 3) + "%%", 0);
    const thirdAuthTime = getLatestResponseTime(server);
    const response4WithWorseGuess = await ns.dnet.authenticate(server.hostname, "%%%%%%", 0);
    const badAuthTime = getLatestResponseTime(server);

    expect(badAuthTime).toBeLessThan(firstAuthTime);
    expect(secondAuthTime).toBeGreaterThan(firstAuthTime);
    expect(thirdAuthTime).toBeGreaterThan(secondAuthTime);

    expect(response1.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(response2.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(response3.code).toBe(ResponseCodeEnum.AuthFailure);
    expect(response4WithWorseGuess.code).toBe(ResponseCodeEnum.AuthFailure);

    expect(response1.message).toBe(GenericResponseMessage.AuthFailure);

    const serverLogs = getServerLogs(server, 5, true);
    expect(serverLogs.length).toBe(5);
    assertPasswordResponse(serverLogs[4].message);
    assertPasswordResponse(serverLogs[3].message);
    assertPasswordResponse(serverLogs[2].message);
    assertPasswordResponse(serverLogs[1].message);
    assertPasswordResponse(serverLogs[0].message);
    expect(serverLogs[4].message.message).toBe("Found a mismatch while checking each character (0)");
    expect(serverLogs[3].message.message).toBe("Found a mismatch while checking each character (1)");
    expect(serverLogs[2].message.message).toBe("Found a mismatch while checking each character (2)");
    expect(serverLogs[1].message.message).toBe("Found a mismatch while checking each character (3)");
    expect(serverLogs[0].message.message).toBe("Found a mismatch while checking each character (0)");

    const successfulResponse = await ns.dnet.authenticate(server.hostname, server.password, 0);
    expect(successfulResponse.code).toBe(ResponseCodeEnum.Success);
  });

  test("getTimingAttackConfig server only gives response time improvements on the exact correct character", () => {
    const server = serverFactory(getTimingAttackConfig, 20, 0, 0);
    server.logTrafficInterval = -1;
    expect(server).toBeDefined();

    getAuthResult(server, server.password.slice(0, 3), 0);
    const baseAuthTime = getLatestResponseTime(server);
    expect(getServerLogs(server, 10).length).toBe(1);

    for (const char of [...lettersUppercase, ...lettersLowercase, ...numbers]) {
      if (char === server.password[1]) continue;
      getAuthResult(server, server.password.slice(0, 3) + char, 0);
      const testAuthTime = getLatestResponseTime(server);
      expect(testAuthTime).toBe(baseAuthTime);
      expect(getServerLogs(server, 10).length).toBe(1);
    }
  });

  test("getSpiceLevelConfig server creates a server with a correct password hint", () => {
    const server = serverFactory(getSpiceLevelConfig, 20, 0, 0);
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
    const server = serverFactory(getGuessNumberConfig, 20, 0, 0);
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
    const server = serverFactory(getCaptchaConfig, 20, 0, 0);
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
    const server = serverFactory(getYesn_tConfig, 20, 0, 0);
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
    const server = serverFactory(getRomanNumeralConfig, 5, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = getAuthResult(server, "wrongPassword", 1);
    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);

    const attemptedPassword = romanNumeralDecoder(server.passwordHintData);

    const result = getAuthResult(server, `${attemptedPassword}`, 1);

    expect(result.result.success).toBe(true);
    expect(result.response.code).toBe(ResponseCodeEnum.Success);
  });

  test("getLargestPrimeFactor server creates valid password and hint", () => {
    const server = serverFactory(getLargestPrimeFactorConfig, 20, 0, 0);
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
    const server = serverFactory(getDivisibilityTestConfig, 100, 0, 0);

    expect(server.password.includes("+")).toBe(false);
    expect(isNumber(+server.password)).toBe(true);
    expect(isNumber(+server.passwordHintData)).toBe(true);

    DarknetState.serverState.set(server.hostname, {
      serverLogs: [],
      authenticatedPIDs: [],
    });
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
    const server = serverFactory(getTripleModuloConfig, 60, 0, 0);

    const guess1 = +server.password + 1;
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

  test("sortedEchoVuln creates a valid password and hint", () => {
    const sortedEchoVulnServer = serverFactory(getSortedEchoVulnConfig, 20, 0, 0);
    sortedEchoVulnServer.password = "12345";
    sortedEchoVulnServer.passwordHintData = "41532";

    expect(sortedEchoVulnServer).toBeDefined();
    const failedAttemptResponse = getAuthResult(sortedEchoVulnServer, "23456", 1);
    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);
    const logs1 = getMostRecentAuthLog(sortedEchoVulnServer.hostname);
    expect(logs1?.data).toBe(`${sortedEchoVulnServer.passwordHintData}; RMS Deviation:1.000`);

    getAuthResult(sortedEchoVulnServer, "23579", 1);
    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);
    const logs2 = getMostRecentAuthLog(sortedEchoVulnServer.hostname);
    expect(logs2?.data).toBe(`${sortedEchoVulnServer.passwordHintData}; RMS Deviation:2.490`);

    getAuthResult(sortedEchoVulnServer, "12355", 1);
    expect(failedAttemptResponse.result.code).toBe(ResponseCodeEnum.AuthFailure);
    const logs3 = getMostRecentAuthLog(sortedEchoVulnServer.hostname);
    expect(logs3?.data).toBe(`${sortedEchoVulnServer.passwordHintData}; RMS Deviation:0.447`);

    expect(getAuthResult(sortedEchoVulnServer, sortedEchoVulnServer.password, 1).result.code).toBe(
      ResponseCodeEnum.Success,
    );
    expect(sortedEchoVulnServer.hasAdminRights).toBe(true);
  });

  test("kingOfTheHill server creates a valid password and hint", () => {
    const kingOfTheHillServer = serverFactory(getKingOfTheHillConfig, 60, 0, 0);
    const password = Number(kingOfTheHillServer.password);

    const result1 = getAuthResult(kingOfTheHillServer, `${password - 50}`, 1);
    expect(result1.response.code).toBe(ResponseCodeEnum.AuthFailure);
    const logs1 = getMostRecentAuthLog(kingOfTheHillServer.hostname);
    const result2 = getAuthResult(kingOfTheHillServer, `${password + 50}`, 1);
    expect(result2.response.code).toBe(ResponseCodeEnum.AuthFailure);
    const logs2 = getMostRecentAuthLog(kingOfTheHillServer.hostname);
    const resultNearPassword = getAuthResult(kingOfTheHillServer, `${password + 1}`, 1);
    expect(resultNearPassword.response.code).toBe(ResponseCodeEnum.AuthFailure);
    const logsNearPassword = getMostRecentAuthLog(kingOfTheHillServer.hostname);
    getAuthResult(kingOfTheHillServer, `${password - 1}`, 1);
    const logsNearPassword2 = getMostRecentAuthLog(kingOfTheHillServer.hostname);
    expect(Number(logs1?.data)).toBeLessThan(Number(logsNearPassword?.data));
    expect(Number(logs2?.data)).toBeLessThan(Number(logsNearPassword?.data));
    expect(Number(logsNearPassword?.data)).toBeLessThan(10000);
    expect(Number(logsNearPassword2?.data)).toBeLessThan(10000);

    getAuthResult(kingOfTheHillServer, `12345`, 1);
    const logs3 = getMostRecentAuthLog(kingOfTheHillServer.hostname);
    getAuthResult(kingOfTheHillServer, `12345`, 1);
    const logs4 = getMostRecentAuthLog(kingOfTheHillServer.hostname);
    expect(Number(logs3?.data)).toBe(Number(logs4?.data));

    // For testing password spreads: poll the altitude and log the resulting graph
    // const results = [];
    // for (let attempt = password * 0.6; attempt <= password * 1.4; attempt += password/200) {
    //   getAuthResult(kingOfTheHillServer, `${attempt}`, 1);
    //   const data = getMostRecentAuthLog(kingOfTheHillServer.hostname)?.data;
    //   results.push({ attempt, altitude: Number(data) });
    // }
    // const graph = results.map(r => {
    //   if (r.altitude > 0) {
    //     return ".".repeat(Math.min(50, Math.floor(r.altitude / 200))) + "*";
    //   }
    //   return "-".repeat(Math.min(50, Math.floor(-r.altitude / 200)));
    // }).join("\n");
    //
    // console.log(graph);

    const correctResult = getAuthResult(kingOfTheHillServer, `${password}`, 1);
    expect(correctResult.response.code).toBe(ResponseCodeEnum.Success);
  });
});

const serverSnapshot = () =>
  getAllDarknetServers()
    .map((s) => ({ hostname: s.hostname, depth: s.depth, leftOffset: s.leftOffset }))
    .sort((a, b) => (a.hostname < b.hostname ? -1 : a.hostname === b.hostname ? 0 : 1));

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
  test("mutation during webstorm", async () => {
    const realRandom = Math.random;
    try {
      jest.useFakeTimers();
      const promise = launchWebstorm();
      expect(DarknetState.mutationLock).toBeTruthy();

      await jest.advanceTimersByTimeAsync(10000);
      expect(DarknetState.mutationLock).toBeTruthy();

      const initialServers = serverSnapshot();
      // Low rolls cause stuff to happen, we want deterministic testing.
      // Jest spies keep state, make our own mock so it doesn't eat memory in
      // case something goes wrong.
      let count = 0;
      Math.random = () => count++ * (Number.EPSILON * 1024);
      mutateDarknet();
      expect(serverSnapshot()).toEqual(initialServers);

      await jest.runAllTimersAsync();
      await promise; // Should immediately finish
      expect(DarknetState.mutationLock).toBeNull();

      mutateDarknet();
      expect(serverSnapshot()).not.toEqual(initialServers);
    } finally {
      jest.useRealTimers();
      Math.random = realRandom;
    }
  });
  test("prestige during webstorm", async () => {
    try {
      jest.useFakeTimers();
      const promise = launchWebstorm();
      await jest.advanceTimersByTimeAsync(0); // Finish any promises
      expect(DarknetState.mutationLock).toBeTruthy();

      const beforePrestige = serverSnapshot();
      prestigeAugmentation();

      expect(DarknetState.mutationLock).toBeNull();
      const initialServers = serverSnapshot();
      // Validate that prestige changed the network
      expect(initialServers).not.toEqual(beforePrestige);

      await jest.runAllTimersAsync();
      await promise; // Should immediately finish

      expect(DarknetState.mutationLock).toBeNull();
      // Webstorm should not have changed anything
      expect(serverSnapshot()).toEqual(initialServers);
    } finally {
      jest.useRealTimers();
    }
  });
});

function validatePath(hostname: string): void {
  expectWithMessage(isDirectoryPath(`${hostname}/`), true, `Invalid hostname: ${hostname}`);
  expectWithMessage(isFilePath(`${hostname}/data.txt`), true, `Invalid hostname: ${hostname}`);
  expectWithMessage(hostname.isWellFormed(), true, `Malformed hostname: ${hostname}`);
}

describe("Darknet server name generator", () => {
  test("Base name and l33t", () => {
    for (const name of commonPasswordDictionary) {
      validatePath(name);
    }
    for (const name of loreNames) {
      validatePath(name);
    }
    for (const name of presetNames) {
      validatePath(name);
    }
    for (const prefix of ServerNamePrefixes) {
      for (const connector of connectors) {
        for (const suffix of ServerNameSuffixes) {
          validatePath(`${prefix}${connector}${suffix}`);
        }
      }
    }
    for (const name of Object.values(l33t)) {
      validatePath(name);
    }
  });
  test("generateDarknetServerName", () => {
    DarknetState.offlineServers = new Set();
    for (let i = 0; i < 1000; ++i) {
      validatePath(generateDarknetServerName());
    }
  });
});

describe("Cache filename generator", () => {
  test("Random prefix", () => {
    for (let i = 0; i < 10000; ++i) {
      const cacheFilename = generateCacheFilename(false);
      if (!cacheFilename) {
        throw new Error("Invalid cache filename");
      }
      validatePath(cacheFilename);
    }
  });
  test("Cache file in labyrinth server", () => {
    const cacheFilename = generateCacheFilename(false, LAB_CACHE_NAME);
    if (!cacheFilename) {
      throw new Error("Invalid cache filename");
    }
    validatePath(cacheFilename);
  });
});

describe("Clue filename generator", () => {
  test("getClueFileName", () => {
    for (let i = 0; i < 10000; ++i) {
      expect(() => {
        getClueFileName(passwordFileNames);
        getClueFileName(notebookFileNames);
      }).not.toThrow();
    }
  });
});

describe("CacheReward", () => {
  test("stock reward does not exceed maxShares and falls back to money reward", () => {
    initStockMarket();

    const remaining = 3;
    // Fill every stock to near capacity so no matter which one is randomly picked, it triggers clamping
    for (const stockName of Object.keys(StockSymbol)) {
      const stock = StockMarket[stockName];
      stock.playerShares = stock.maxShares - remaining;
      stock.playerShortShares = 0;
    }

    // Use high difficulty to ensure the unclamped share count would exceed remaining
    const difficulty = 100;
    const result = getStockReward(difficulty);

    // Should have awarded at most `remaining` shares
    expect(result.message).toContain(`${remaining} shares`);

    // Verify the chosen stock was clamped to exactly maxShares
    for (const stockName of Object.keys(StockSymbol)) {
      const stock = StockMarket[stockName];
      expect(stock.playerShares).toBeLessThanOrEqual(stock.maxShares);
    }
  });

  test("stock reward falls back to money when stock is fully owned", () => {
    initStockMarket();

    // Fill every stock to max capacity
    for (const stockName of Object.keys(StockSymbol)) {
      const stock = StockMarket[stockName];
      stock.playerShares = stock.maxShares;
      stock.playerShortShares = 0;
    }

    const moneyBefore = Player.money;
    const result = getStockReward(5);

    // Should have fallen back to a money reward
    expect(result.message).toContain("discovered a cache with");
    expect(Player.money).toBeGreaterThan(moneyBefore);
  });

  test("CacheReward", () => {
    for (let i = 0; i < 500; ++i) {
      Player.queuedAugmentations.length = 0;
      prestigeAugmentation();
      initStockMarket();
      Player.money = 0;
      Player.getHomeComputer().programs.length = 0;
      const dnetServers = [];
      for (const server of GetAllServers(true)) {
        server.messages.length = 0;
        if (server instanceof DarknetServer) {
          dnetServers.push(server);
        }
      }
      const randomServer = dnetServers[Math.floor(Math.random() * dnetServers.length)];

      const result = getRewardFromCache(randomServer, "test.d.cache");

      const home = Player.getHomeComputer();
      expect(typeof result.success).toBe("boolean");
      expect(typeof result.message).toBe("string");
      expect(Number.isFinite(result.karmaLoss)).toBe(true);

      expect(result.wseAccount).toBe(Player.hasWseAccount);
      expect(result.tixApiAccess).toBe(Player.hasTixApiAccess);
      expect(result.fourSigmaData).toBe(Player.has4SData);

      if (Player.money > 0) {
        expect(result.money).toBe(Player.money);
      } else {
        expect(result.money).toBeUndefined();
      }

      if (home.programs.length > 0) {
        expect(home.programs.length).toBe(1);
        expect(result.programName).toBe(home.programs[0]);
      } else {
        expect(result.programName).toBeUndefined();
      }

      if (Object.values(SymbolToStockMap).some((stock) => stock.playerShares > 0)) {
        expect(result.stockSymbol).toBeDefined();
        expect(SymbolToStockMap[result.stockSymbol as string].playerShares).toBe(result.stockShares);
      } else {
        expect(result.stockSymbol).toBeUndefined();
        expect(result.stockShares).toBeUndefined();
      }

      const dataFilePaths = [];
      const contractFilePaths = [];
      for (const server of GetAllServers(true)) {
        dataFilePaths.push(...server.messages);
        dataFilePaths.push(...server.textFiles.keys());
        contractFilePaths.push(...server.contracts.map((c) => c.fn));
      }
      dataFilePaths.sort();
      contractFilePaths.sort();
      if (dataFilePaths.length > 0) {
        expect(result.dataFilePaths?.sort()).toStrictEqual(dataFilePaths);
      } else {
        expect(result.dataFilePaths).toBeUndefined();
      }
      if (contractFilePaths.length > 0) {
        expect(result.contractFilePaths?.sort()).toStrictEqual(contractFilePaths);
      } else {
        expect(result.contractFilePaths).toBeUndefined();
      }

      if (Player.queuedAugmentations.length > 0) {
        expect(Player.queuedAugmentations).toBe(1);
        expect(result.augmentationName).toStrictEqual(Player.queuedAugmentations[0]);
      } else {
        expect(result.augmentationName).toBeUndefined();
      }
    }
  });
});

describe("ramblock", () => {
  test.each([16, 16.01, 32.01, 64.01])("getRamBlock rounds %d correctly", (maxRam: number) => {
    // This *must* be done within the function, Jest internally relies on
    // Math.random so the mock must be restored immediately after.
    const saved = Math.random;
    let rng: number;
    try {
      Math.random = () => rng;
      for (let i = 0; i < 1; i += 1.0 / 8.0) {
        rng = i;
        const result = getRamBlock(maxRam);
        // We want *exact* equality
        expect(result).toBe(roundToTwo(result));
      }
    } finally {
      Math.random = saved;
    }
  });
});

describe("clearDarknet", () => {
  it("leaves home<->darkweb disconnected on both sides when the player has no TOR router", () => {
    const home = Player.getHomeComputer();
    const darkweb = GetServerOrThrow(SpecialServers.DarkWeb);

    disconnectServers(home, darkweb);
    expect(Player.hasTorRouter()).toBe(false);

    clearDarknet();

    expect(darkweb.serversOnNetwork.includes(home.hostname)).toBe(home.serversOnNetwork.includes(darkweb.hostname));
    expect(home.serversOnNetwork).not.toContain(darkweb.hostname);
    expect(darkweb.serversOnNetwork).not.toContain(home.hostname);
  });

  it("leaves home<->darkweb connected on both sides when the player has a TOR router", () => {
    const home = Player.getHomeComputer();
    const darkweb = GetServerOrThrow(SpecialServers.DarkWeb);

    getTorRouter();
    expect(Player.hasTorRouter()).toBe(true);

    clearDarknet();

    expect(darkweb.serversOnNetwork.includes(home.hostname)).toBe(home.serversOnNetwork.includes(darkweb.hostname));
    expect(home.serversOnNetwork).toContain(darkweb.hostname);
    expect(darkweb.serversOnNetwork).toContain(home.hostname);
  });
});
