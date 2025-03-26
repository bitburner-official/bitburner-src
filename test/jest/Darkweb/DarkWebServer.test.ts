// noinspection TypeScriptUnresolvedReference

import {
  getEchoVulnServer,
  getNoPasswordServer,
  getDefaultPasswordServer,
  getMastermindHintServer,
  getTimingAttackServer,
} from "../../../src/DarkWeb/controllers/DarkWebServerGenerator";
import { checkPassword, SUCCESS_STATUS, AUTH_FAILURE_STATUS } from "../../../src/DarkWeb/models/DarkWebServerData";
import { defaultSettingsDictionary } from "../../../src/DarkWeb/models/dictionaryData";

describe("DarkwebServer Tests", () => {
  const difficulty = 1;

  test("getEchoVulnServer creates a server and checks password correctly", () => {
    const server = getEchoVulnServer(difficulty, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = checkPassword("wrongPassword", server);
    expect(failedAttemptResponse.status).toBe(401);
    expect(failedAttemptResponse.passwordLength).toBe(server.darkWebData.password.length);
    expect(failedAttemptResponse.msg.includes(server.darkWebData.password)).toBe(true);
    expect(server.hasAdminRights).toBe(false);

    expect(checkPassword(server.darkWebData.password, server).status).toBe(SUCCESS_STATUS);
    expect(server.hasAdminRights).toBe(true);
  });

  test("getNoPasswordServer creates a server with no password", () => {
    const server = getNoPasswordServer(difficulty, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = checkPassword("wrongPassword", server);
    expect(failedAttemptResponse.status).toBe(AUTH_FAILURE_STATUS);
    expect(failedAttemptResponse.passwordLength).toBe(server.darkWebData.password.length);
    expect(server.hasAdminRights).toBe(false);

    
    expect(checkPassword(server.darkWebData.password, server).status).toBe(SUCCESS_STATUS);
    expect(server.hasAdminRights).toBe(true);
  });

  test("getDefaultPasswordServer creates a server with default password", () => {
    const server = getDefaultPasswordServer(difficulty, 0, 0);
    expect(server).toBeDefined();
    const failedAttemptResponse = checkPassword("wrongPassword", server);
    
    expect(failedAttemptResponse.status).toBe(AUTH_FAILURE_STATUS);
    expect(failedAttemptResponse.passwordLength).toBe(server.darkWebData.password.length);
    expect(server.hasAdminRights).toBe(false);
    
    expect(defaultSettingsDictionary.includes(server.darkWebData.password)).toBe(true);

    expect(checkPassword(server.darkWebData.password, server).status).toBe(SUCCESS_STATUS);
    expect(server.hasAdminRights).toBe(true);
  });


  test("getMastermindHintServer creates a server with mastermind hint", () => {
    const password = "11223334";
    const server = getMastermindHintServer(difficulty, 0, 0);
    server.darkWebData.password = password;
    expect(server).toBeDefined();

    const failedAttemptResponse1 = checkPassword("", server);
    expect(failedAttemptResponse1.status).toBe(AUTH_FAILURE_STATUS);
    expect(failedAttemptResponse1.passwordLength).toBe(server.darkWebData.password.length);
    expect(server.hasAdminRights).toBe(false);
    const correctCount1 = failedAttemptResponse1.data.split(",")[0];
    const closeCount1 = failedAttemptResponse1.data.split(",")[1];
    expect(correctCount1).toBe("0");
    expect(closeCount1).toBe("0");

    const failedAttemptResponse2 = checkPassword("123", server);
    expect(failedAttemptResponse2.status).toBe(AUTH_FAILURE_STATUS);
    const correctCount2 = failedAttemptResponse2.data.split(",")[0];
    const closeCount2 = failedAttemptResponse2.data.split(",")[1];
    expect(correctCount2).toBe("1");
    expect(closeCount2).toBe("2");

    const failedAttemptResponse3 = checkPassword("11111111", server);
    expect(failedAttemptResponse3.status).toBe(AUTH_FAILURE_STATUS);
    const correctCount3 = failedAttemptResponse3.data.split(",")[0];
    const closeCount3 = failedAttemptResponse3.data.split(",")[1];
    expect(correctCount3).toBe("2");
    expect(closeCount3).toBe("0");

    const failedAttemptResponse4 = checkPassword("1122334", server);
    expect(failedAttemptResponse4.status).toBe(AUTH_FAILURE_STATUS);
    const correctCount4 = failedAttemptResponse4.data.split(",")[0];
    const closeCount4 = failedAttemptResponse4.data.split(",")[1];
    expect(correctCount4).toBe("6");
    expect(closeCount4).toBe("1");

    const failedAttemptResponse5 = checkPassword("22114333", server);
    expect(failedAttemptResponse5.status).toBe(AUTH_FAILURE_STATUS);
    expect(server.hasAdminRights).toBe(false);
    const correctCount5 = failedAttemptResponse5.data.split(",")[0];
    const closeCount5 = failedAttemptResponse5.data.split(",")[1];
    expect(correctCount5).toBe("2");
    expect(closeCount5).toBe("6");

    expect(checkPassword(server.darkWebData.password, server).status).toBe(SUCCESS_STATUS);
    expect(server.hasAdminRights).toBe(true);
  });

  test("getTimingAttackServer creates a server with timing attack vulnerability", () => {
    const server = getTimingAttackServer(difficulty, 0, 0);
    expect(server).toBeDefined();

    const wrongPasswordWithTwoMatchingDigits = server.darkWebData.password.substring(0, 2) + "     ";
    const failedAttemptResponse = checkPassword(wrongPasswordWithTwoMatchingDigits, server);
    
    expect(failedAttemptResponse.status).toBe(401);
    expect(server.hasAdminRights).toBe(false);
    expect(failedAttemptResponse.passwordLength).toBe(server.darkWebData.password.length);
    expect(failedAttemptResponse.responseTime >= 95 + 25 * 2).toBe(true);
    expect(failedAttemptResponse.responseTime <= 95 + 12 + 25 * 2).toBe(true);

    const wrongPasswordWithThreeMatchingDigits = server.darkWebData.password.substring(0, 3) + "    ";
    const failedAttemptResponse2 = checkPassword(wrongPasswordWithThreeMatchingDigits, server);
    expect(failedAttemptResponse2.status).toBe(AUTH_FAILURE_STATUS);
    expect(failedAttemptResponse2.responseTime >= 95 + 25 * 3).toBe(true);
    expect(failedAttemptResponse2.responseTime <= 95 + 12 + 25 * 3).toBe(true);

    const failedAttemptResponse3 = checkPassword("      ", server);
    expect(failedAttemptResponse3.status).toBe(AUTH_FAILURE_STATUS);
    expect(failedAttemptResponse3.responseTime >= 95).toBe(true);
    expect(failedAttemptResponse3.responseTime <= 95 + 12).toBe(true);

    const wrongPasswordWithFourMatchingDigits = server.darkWebData.password.substring(0, 4) + "   ";
    const failedAttemptResponse4 = checkPassword(wrongPasswordWithFourMatchingDigits, server);
    expect(failedAttemptResponse4.status).toBe(AUTH_FAILURE_STATUS);
    expect(server.hasAdminRights).toBe(false);
    expect(failedAttemptResponse4.responseTime >= 95 + 25 * 4).toBe(true);
    expect(failedAttemptResponse4.responseTime <= 95 + 12 + 25 * 4).toBe(true);

    expect(checkPassword(server.darkWebData.password, server).status).toBe(SUCCESS_STATUS);
    expect(server.hasAdminRights).toBe(true);
  });
});
