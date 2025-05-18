import {
  getEchoVulnServer,
  getNoPasswordServer,
  getDefaultPasswordServer,
  getMastermindHintServer,
  encodeNumberInBaseN,
  parseBaseNNumberString,
  getConvertToBase10Server,
  parseSimpleArithmeticExpression,
  generateSimpleArithmeticExpression,
} from "../../../src/DarkNet/controllers/ServerGenerator";
import { PasswordResponse, ResponseStatus } from "../../../src/DarkNet/models/DarknetServerData";
import { defaultSettingsDictionary } from "../../../src/DarkNet/models/dictionaryData";
import { checkPassword, getAuthResult } from "../../../src/DarkNet/effects/authentication";
import { DarknetState } from "../../../src/DarkNet/models/DarknetState";

describe("DarkWebServer Tests", () => {
  const difficulty = 1;

  test("getEchoVulnServer creates a server and checks password correctly", () => {
    const server = getEchoVulnServer(difficulty, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = checkPassword("wrongPassword", server);
    expect(failedAttemptResponse.status).toBe(ResponseStatus.AUTH_FAILURE);
    expect(failedAttemptResponse.message.includes(server.darknetData.password)).toBe(true);
    expect(server.hasAdminRights).toBe(false);

    expect(checkPassword(server.darknetData.password, server).status).toBe(ResponseStatus.SUCCESS);
    expect(server.hasAdminRights).toBe(true);
  });

  test("getNoPasswordServer creates a server with no password", () => {
    const server = getNoPasswordServer(difficulty, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = checkPassword("wrongPassword", server);
    expect(failedAttemptResponse.status).toBe(ResponseStatus.AUTH_FAILURE);
    expect(server.hasAdminRights).toBe(false);

    expect(checkPassword(server.darknetData.password, server).status).toBe(ResponseStatus.SUCCESS);
    expect(server.hasAdminRights).toBe(true);
  });

  test("getDefaultPasswordServer creates a server with default password", () => {
    const server = getDefaultPasswordServer(difficulty, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = checkPassword("wrongPassword", server);

    expect(failedAttemptResponse.status).toBe(ResponseStatus.AUTH_FAILURE);
    expect(server.hasAdminRights).toBe(false);

    expect(defaultSettingsDictionary.includes(server.darknetData.password)).toBe(true);

    expect(checkPassword(server.darknetData.password, server).status).toBe(ResponseStatus.SUCCESS);
    expect(server.hasAdminRights).toBe(true);
  });

  test("getMastermindHintServer creates a server with mastermind hint", () => {
    const password = "11223334";
    const server = getMastermindHintServer(difficulty, 0, 0);
    server.darknetData.password = password;
    expect(server).toBeDefined();

    const getData = () => {
      console.log(DarknetState.serverState, server.hostname);
      const responseLog = DarknetState.serverState[server.hostname].serverLogs.slice(0, 1)[0];
      const feedback = JSON.parse(responseLog) as PasswordResponse;
      return feedback.data.split(",").map((item) => item.trim());
    };

    const failedAttemptResponse1 = getAuthResult("", server);
    expect(failedAttemptResponse1.response.status).toBe(ResponseStatus.AUTH_FAILURE);
    expect(server.hasAdminRights).toBe(false);

    const [correctCount1, closeCount1] = getData();
    expect(correctCount1).toBe("0");
    expect(closeCount1).toBe("0");

    const failedAttemptResponse2 = getAuthResult("123", server);
    expect(failedAttemptResponse2.response.status).toBe(ResponseStatus.AUTH_FAILURE);
    const [correctCount2, closeCount2] = getData();
    expect(correctCount2).toBe("1");
    expect(closeCount2).toBe("2");

    const failedAttemptResponse3 = getAuthResult("11111111", server);
    expect(failedAttemptResponse3.response.status).toBe(ResponseStatus.AUTH_FAILURE);
    const [correctCount3, closeCount3] = getData();
    expect(correctCount3).toBe("2");
    expect(closeCount3).toBe("0");

    const failedAttemptResponse4 = getAuthResult("1122334", server);
    expect(failedAttemptResponse4.response.status).toBe(ResponseStatus.AUTH_FAILURE);
    const [correctCount4, closeCount4] = getData();
    expect(correctCount4).toBe("6");
    expect(closeCount4).toBe("1");

    const failedAttemptResponse5 = getAuthResult("22114333", server);
    expect(failedAttemptResponse5.response.status).toBe(ResponseStatus.AUTH_FAILURE);
    expect(server.hasAdminRights).toBe(false);
    const [correctCount5, closeCount5] = getData();
    expect(correctCount5).toBe("2");
    expect(closeCount5).toBe("6");

    server.darknetData.password = "2435";
    const failedAttemptResponse6 = getAuthResult("3423", server);
    expect(failedAttemptResponse6.response.status).toBe(ResponseStatus.AUTH_FAILURE);
    expect(server.hasAdminRights).toBe(false);
    const [correctCount6, closeCount6] = getData();
    expect(correctCount6).toBe("1");
    expect(closeCount6).toBe("2");

    expect(checkPassword(server.darknetData.password, server).status).toBe(ResponseStatus.SUCCESS);
    expect(server.hasAdminRights).toBe(true);
  });

  test(" getConvertToBase10Server creates a server with a correct password hint", () => {
    const server = getConvertToBase10Server(20, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = checkPassword("wrongPassword", server);
    expect(failedAttemptResponse.status).toBe(ResponseStatus.AUTH_FAILURE);
    const [base, numberString] = failedAttemptResponse.data.split(",");

    expect(numberString).toBe(encodeNumberInBaseN(+server.darknetData?.password, base));

    const attemptedPassword = parseBaseNNumberString(numberString, base);

    const result = checkPassword(`${attemptedPassword}`, server);

    expect(result.status).toBe(ResponseStatus.SUCCESS);
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

    const expression = generateSimpleArithmeticExpression(13);
    const numberParts = expression.substring(0, expression.indexOf(";"));
    expect(eval(numberParts)).toBeCloseTo(parseSimpleArithmeticExpression(expression));
  });
});
