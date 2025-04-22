import {
  getEchoVulnServer,
  getNoPasswordServer,
  getDefaultPasswordServer,
  getMastermindHintServer,
  getTimingAttackServer,
  encodeNumberInBaseN,
  parseBaseNNumberString,
  getConvertToBase10Server,
  parseSimpleArithmeticExpression,
  generateSimpleArithmeticExpression,
} from "../../../src/DarkWeb/controllers/DarknetServerGenerator";
import { checkPassword, ResponseStatus } from "../../../src/DarkWeb/models/DnetServerData";
import { defaultSettingsDictionary } from "../../../src/DarkWeb/models/dictionaryData";
import { BaseServer } from "../../../src/Server/BaseServer";

describe("DarkWebServer Tests", () => {
  const difficulty = 1;

  test("getEchoVulnServer creates a server and checks password correctly", () => {
    const server = getEchoVulnServer(difficulty, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = checkPassword("wrongPassword", server);
    expect(failedAttemptResponse.status).toBe(401);
    expect(failedAttemptResponse.passwordLength).toBe(server.darknetData.password.length);
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
    expect(failedAttemptResponse.passwordLength).toBe(server.darknetData.password.length);
    expect(server.hasAdminRights).toBe(false);

    expect(checkPassword(server.darknetData.password, server).status).toBe(ResponseStatus.SUCCESS);
    expect(server.hasAdminRights).toBe(true);
  });

  test("getDefaultPasswordServer creates a server with default password", () => {
    const server = getDefaultPasswordServer(difficulty, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = checkPassword("wrongPassword", server);

    expect(failedAttemptResponse.status).toBe(ResponseStatus.AUTH_FAILURE);
    expect(failedAttemptResponse.passwordLength).toBe(server.darknetData.password.length);
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
    //
    // const failedAttemptResponse1 = checkPassword("", server);
    // expect(failedAttemptResponse1.status).toBe(ResponseStatus.AUTH_FAILURE);
    // expect(failedAttemptResponse1.passwordLength).toBe(server.darknetData.password.length);
    // expect(server.hasAdminRights).toBe(false);
    // const correctCount1 = failedAttemptResponse1.data.split(",")[0];
    // const closeCount1 = failedAttemptResponse1.data.split(",")[1];
    // expect(correctCount1).toBe("0");
    // expect(closeCount1).toBe("0");
    //
    // const failedAttemptResponse2 = checkPassword("123", server);
    // expect(failedAttemptResponse2.status).toBe(ResponseStatus.AUTH_FAILURE);
    // const correctCount2 = failedAttemptResponse2.data.split(",")[0];
    // const closeCount2 = failedAttemptResponse2.data.split(",")[1];
    // expect(correctCount2).toBe("1");
    // expect(closeCount2).toBe("2");
    //
    // const failedAttemptResponse3 = checkPassword("11111111", server);
    // expect(failedAttemptResponse3.status).toBe(ResponseStatus.AUTH_FAILURE);
    // const correctCount3 = failedAttemptResponse3.data.split(",")[0];
    // const closeCount3 = failedAttemptResponse3.data.split(",")[1];
    // expect(correctCount3).toBe("2");
    // expect(closeCount3).toBe("0");
    //
    // const failedAttemptResponse4 = checkPassword("1122334", server);
    // expect(failedAttemptResponse4.status).toBe(ResponseStatus.AUTH_FAILURE);
    // const correctCount4 = failedAttemptResponse4.data.split(",")[0];
    // const closeCount4 = failedAttemptResponse4.data.split(",")[1];
    // expect(correctCount4).toBe("6");
    // expect(closeCount4).toBe("1");
    //
    // const failedAttemptResponse5 = checkPassword("22114333", server);
    // expect(failedAttemptResponse5.status).toBe(ResponseStatus.AUTH_FAILURE);
    // expect(server.hasAdminRights).toBe(false);
    // const correctCount5 = failedAttemptResponse5.data.split(",")[0];
    // const closeCount5 = failedAttemptResponse5.data.split(",")[1];
    // expect(correctCount5).toBe("2");
    // expect(closeCount5).toBe("6");

    const failedAttemptResponse6 = checkPassword("3423", {
      ...server,
      darknetData: { ...server.darknetData, password: "2435" },
    } as BaseServer);
    expect(failedAttemptResponse6.status).toBe(ResponseStatus.AUTH_FAILURE);
    expect(server.hasAdminRights).toBe(false);
    const correctCount6 = failedAttemptResponse6.data.split(",")[0];
    const closeCount6 = failedAttemptResponse6.data.split(",")[1];
    expect(correctCount6).toBe("1");
    expect(closeCount6).toBe("2");

    expect(checkPassword(server.darknetData.password, server).status).toBe(ResponseStatus.SUCCESS);
    expect(server.hasAdminRights).toBe(true);
  });

  test("getTimingAttackServer creates a server with timing attack vulnerability", () => {
    const server = getTimingAttackServer(difficulty, 0, 0);
    expect(server).toBeDefined();

    const wrongPasswordWithTwoMatchingDigits = server.darknetData.password.substring(0, 2) + "     ";
    const failedAttemptResponse = checkPassword(wrongPasswordWithTwoMatchingDigits, server);

    expect(failedAttemptResponse.status).toBe(ResponseStatus.AUTH_FAILURE);
    expect(server.hasAdminRights).toBe(false);
    expect(failedAttemptResponse.passwordLength).toBe(server.darknetData.password.length);
    expect(failedAttemptResponse.responseTime >= 95 + 25 * 2).toBe(true);
    expect(failedAttemptResponse.responseTime <= 95 + 12 + 25 * 2).toBe(true);

    const wrongPasswordWithThreeMatchingDigits = server.darknetData.password.substring(0, 3) + "    ";
    const failedAttemptResponse2 = checkPassword(wrongPasswordWithThreeMatchingDigits, server);
    expect(failedAttemptResponse2.status).toBe(ResponseStatus.AUTH_FAILURE);
    expect(failedAttemptResponse2.responseTime >= 95 + 25 * 3).toBe(true);
    expect(failedAttemptResponse2.responseTime <= 95 + 12 + 25 * 3).toBe(true);

    const failedAttemptResponse3 = checkPassword("      ", server);
    expect(failedAttemptResponse3.status).toBe(ResponseStatus.AUTH_FAILURE);
    expect(failedAttemptResponse3.responseTime >= 95).toBe(true);
    expect(failedAttemptResponse3.responseTime <= 95 + 12).toBe(true);

    const wrongPasswordWithFourMatchingDigits = server.darknetData.password.substring(0, 4) + "   ";
    const failedAttemptResponse4 = checkPassword(wrongPasswordWithFourMatchingDigits, server);
    expect(failedAttemptResponse4.status).toBe(ResponseStatus.AUTH_FAILURE);
    expect(server.hasAdminRights).toBe(false);
    expect(failedAttemptResponse4.responseTime >= 95 + 25 * 4).toBe(true);
    expect(failedAttemptResponse4.responseTime <= 95 + 12 + 25 * 4).toBe(true);

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
