// noinspection TypeScriptUnresolvedReference

import { getEchoVulnServer, getNoPasswordServer, getDefaultPasswordServer, getMastermindHintServer, getTimingAttackServer } from '../../../src/DarkWeb/models/DarkWebServer';
import { DarkWebServer } from '../../../src/DarkWeb/models/DarkWebServer';

describe('DarkwebServer Tests', () => {
  const difficulty = 1;
  const chaRequired = 10;

  test('getEchoVulnServer creates a server and checks password correctly', () => {
    const server: DarkWebServer = getEchoVulnServer(difficulty, chaRequired);
    expect(server).toBeDefined();
    const failedAttemptResponse = server.passwordChecker('wrongPassword');
    expect(failedAttemptResponse.success).toBe(false);
    expect(failedAttemptResponse.status).toBe(401);
    expect(failedAttemptResponse.passwordLength).toBe(server.password.length);
    expect(failedAttemptResponse.msg.includes(server.password)).toBe(true);
    expect(server.unlocked).toBe(false);


    expect(server.passwordChecker(server.password).success).toBe(true);
    expect(server.unlocked).toBe(true);
  });

  test('getNoPasswordServer creates a server with no password', () => {
    const server: DarkWebServer = getNoPasswordServer(difficulty, chaRequired);
    expect(server).toBeDefined();
    expect(server.password).toBe('');

    const failedAttemptResponse = server.passwordChecker('wrongPassword');
    expect(failedAttemptResponse.success).toBe(false);
    expect(failedAttemptResponse.status).toBe(401);
    expect(failedAttemptResponse.msg.includes("no password")).toBe(true);
    expect(server.unlocked).toBe(false);

    expect(server.passwordChecker(server.password).success).toBe(true);
    expect(server.unlocked).toBe(true);
  });

  test('getDefaultPasswordServer creates a server with default password', () => {
    const server: DarkWebServer = getDefaultPasswordServer(difficulty, chaRequired);
    expect(server).toBeDefined();
    expect(["admin", "password", "0000"].includes(server.password)).toBe(true);

    const failedAttemptResponse = server.passwordChecker('wrongPassword');
    expect(failedAttemptResponse.success).toBe(false);
    expect(failedAttemptResponse.status).toBe(401);
    expect(failedAttemptResponse.passwordLength).toBe(server.password.length);
    expect(failedAttemptResponse.msg.includes("default")).toBe(true);
    expect(server.unlocked).toBe(false);

    expect(server.passwordChecker(server.password).success).toBe(true);
    expect(server.unlocked).toBe(true);
  });

  test('getMastermindHintServer creates a server with mastermind hint', () => {
    const password = "11223334";
    const server: DarkWebServer = getMastermindHintServer(difficulty, chaRequired, password);
    expect(server).toBeDefined();

    const failedAttemptResponse1 = server.passwordChecker('');
    expect(failedAttemptResponse1.success).toBe(false);
    expect(failedAttemptResponse1.status).toBe(401);
    expect(failedAttemptResponse1.passwordLength).toBe(server.password.length);
    expect(server.unlocked).toBe(false);
    const correctCount1 = failedAttemptResponse1.msg.match(/correct location: (\d)/)?.[1];
    const closeCount1 = failedAttemptResponse1.msg.match(/wrong location: (\d)/)?.[1];
    expect(correctCount1).toBe("0");
    expect(closeCount1).toBe("0");

    const failedAttemptResponse2 = server.passwordChecker('123');
    expect(failedAttemptResponse2.success).toBe(false);
    const correctCount2 = failedAttemptResponse2.msg.match(/correct location: (\d)/)?.[1];
    const closeCount2 = failedAttemptResponse2.msg.match(/wrong location: (\d)/)?.[1];
    expect(correctCount2).toBe("1");
    expect(closeCount2).toBe("2");

    const failedAttemptResponse3 = server.passwordChecker('11111111');
    expect(failedAttemptResponse3.success).toBe(false);
    const correctCount3 = failedAttemptResponse3.msg.match(/correct location: (\d)/)?.[1];
    const closeCount3 = failedAttemptResponse3.msg.match(/wrong location: (\d)/)?.[1];
    expect(correctCount3).toBe("2");
    expect(closeCount3).toBe("0");

    const failedAttemptResponse4 = server.passwordChecker('1122334');
    expect(failedAttemptResponse4.success).toBe(false);
    const correctCount4 = failedAttemptResponse4.msg.match(/correct location: (\d)/)?.[1];
    const closeCount4 = failedAttemptResponse4.msg.match(/wrong location: (\d)/)?.[1];
    expect(correctCount4).toBe("6");
    expect(closeCount4).toBe("1");

    const failedAttemptResponse5 = server.passwordChecker('22114333');
    expect(failedAttemptResponse5.success).toBe(false);
    expect(server.unlocked).toBe(false);
    const correctCount5 = failedAttemptResponse5.msg.match(/correct location: (\d)/)?.[1];
    const closeCount5 = failedAttemptResponse5.msg.match(/wrong location: (\d)/)?.[1];
    expect(correctCount5).toBe("2");
    expect(closeCount5).toBe("6");

    expect(server.passwordChecker(server.password).success).toBe(true);
    expect(server.unlocked).toBe(true);
  });

  test('getTimingAttackServer creates a server with timing attack vulnerability', () => {
    const server: DarkWebServer = getTimingAttackServer(difficulty, chaRequired);
    expect(server).toBeDefined();

    const wrongPasswordWithTwoMatchingDigits = server.password.substring(0,2) + "     "
    const failedAttemptResponse = server.passwordChecker(wrongPasswordWithTwoMatchingDigits);
    expect(failedAttemptResponse.success).toBe(false);
    expect(failedAttemptResponse.status).toBe(401);
    expect(server.unlocked).toBe(false);
    expect(failedAttemptResponse.passwordLength).toBe(server.password.length);
    expect(failedAttemptResponse.msg.includes("Incorrect")).toBe(true);
    expect(failedAttemptResponse.responseTime >= 95 + 25*2).toBe(true);
    expect(failedAttemptResponse.responseTime <= 95 + 12 + 25*2).toBe(true);

    const wrongPasswordWithThreeMatchingDigits = server.password.substring(0,3) + "    "
    const failedAttemptResponse2 = server.passwordChecker(wrongPasswordWithThreeMatchingDigits);
    expect(failedAttemptResponse2.success).toBe(false);
    expect(failedAttemptResponse2.responseTime >= 95 + 25*3).toBe(true);
    expect(failedAttemptResponse2.responseTime <= 95 + 12 + 25*3).toBe(true);

    const failedAttemptResponse3 = server.passwordChecker('      ');
    expect(failedAttemptResponse3.success).toBe(false);
    expect(failedAttemptResponse3.responseTime >= 95).toBe(true);
    expect(failedAttemptResponse3.responseTime <= 95 + 12).toBe(true);

    const wrongPasswordWithFourMatchingDigits = server.password.substring(0,4) + "   "
    const failedAttemptResponse4 = server.passwordChecker(wrongPasswordWithFourMatchingDigits);
    expect(failedAttemptResponse4.success).toBe(false);
    expect(server.unlocked).toBe(false);
    expect(failedAttemptResponse4.responseTime >= 95 + 25*4).toBe(true);
    expect(failedAttemptResponse4.responseTime <= 95 + 12 + 25*4).toBe(true);

    expect(server.passwordChecker(server.password).success).toBe(true);
    expect(server.unlocked).toBe(true);
  });

});