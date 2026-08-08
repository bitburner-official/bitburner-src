import { getDefaultPasswordConfig, serverFactory } from "../../../src/DarkNet/controllers/ServerGenerator";
import { getAuthResult } from "../../../src/DarkNet/effects/authentication";
import { getServerState } from "../../../src/DarkNet/models/DarknetState";
import { initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";

beforeAll(() => {
  initGameEnvironment();
});

beforeEach(() => {
  setupBasicTestingEnvironment();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("authentication preserves generated server logs", () => {
  jest.spyOn(Math, "random").mockReturnValue(0.99);

  const server = serverFactory(getDefaultPasswordConfig, 1, 0, 0);
  server.logTrafficInterval = 1;

  const serverState = getServerState(server.hostname);
  serverState.serverLogs = [{ message: "existing", pid: -1 }];
  serverState.lastLogTime = new Date(Date.now() - 2500);

  getAuthResult(server, "wrongPassword", 1);

  expect(serverState.serverLogs.length).toBeGreaterThanOrEqual(4);
});
