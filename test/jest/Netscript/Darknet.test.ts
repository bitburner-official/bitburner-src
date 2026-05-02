import { AugmentationName, CompletedProgramName } from "@enums";
import { Player } from "@player";
import type { DarknetResult } from "@nsdefs";
import { PlayerOwnedAugmentation } from "../../../src/Augmentation/PlayerOwnedAugmentation";
import { addCacheToServer } from "../../../src/DarkNet/effects/cacheFiles";
import { getDarkscapeNavigator } from "../../../src/DarkNet/effects/effects";
import { connectServers, GetServerOrThrow } from "../../../src/Server/AllServers";
import { SpecialServers } from "../../../src/Server/data/SpecialServers";
import { initStockMarket } from "../../../src/StockMarket/StockMarket";
import {
  fixDoImportIssue,
  getMockedNetscriptContext,
  getNS,
  getWorkerScriptAndNS,
  initGameEnvironment,
  setupBasicTestingEnvironment,
} from "../Utilities";
import type { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { DarknetState, getServerState, triggerNextUpdate } from "../../../src/DarkNet/models/DarknetState";
import { getDarknetServer, getDarknetServerOrThrow } from "../../../src/DarkNet/utils/darknetServerUtils";
import { ModelIds, ResponseCodeEnum } from "../../../src/DarkNet/Enums";
import { getAllMovableDarknetServers } from "../../../src/DarkNet/utils/darknetNetworkUtils";
import { expectRunningOnDarknetServer } from "../../../src/DarkNet/effects/offlineServerHandling";
import { sleep } from "../../../src/utils/Utility";
import { addLowLevelServersIfNeeded } from "../../../src/DarkNet/controllers/NetworkMovement";
import { isIPAddress } from "../../../src/Types/strings";
import { clearDarknet, populateDarknet } from "../../../src/DarkNet/controllers/NetworkGenerator";
import {
  getLabMaze,
  getLabyrinthDetails,
  isLocationStatus,
  LocationStatus,
} from "../../../src/DarkNet/effects/labyrinth";
import { getMostRecentAuthLog } from "../../../src/DarkNet/models/packetSniffing";
import type { Result } from "@nsdefs";
import { assertNonNullish } from "../../../src/utils/TypeAssertion";
import { roundToTwo } from "../../../src/utils/helpers/roundToTwo";

const hostnameOfNonExistentServer = "fake-server";
const errorMessageForNonExistentServer = `Invalid host: '${hostnameOfNonExistentServer}'`;
const hostnameForOfflineServer = "darknet-offline-server";
const ipForOfflineServer = "0.0.0.0";

fixDoImportIssue();

beforeAll(() => {
  initGameEnvironment();
  initStockMarket();
});
beforeEach(() => {
  DarknetState.offlineServers = new Set();
  setupBasicTestingEnvironment({ purchasePServer: true, purchaseHacknetServer: true });
  Player.sourceFiles.set(15, 1);
  getDarkscapeNavigator();
  Player.getHomeComputer().programs.push(CompletedProgramName.formulas);
  Player.mults.charisma = 1e10;
  Player.mults.hacking = 1e10;
  Player.gainCharismaExp(1e100);
  Player.gainHackingExp(1e100);
  getNsOnServerNearLabyrinth();
});

function getNsOnHome() {
  return getNS(SpecialServers.Home);
}

function getNsOnDarkWeb() {
  return getNS(SpecialServers.DarkWeb);
}

function getNsOnServerNearLabyrinth() {
  let server = null;
  while (!server) {
    const labyrinth = getLabyrinthDetails().lab;
    server = labyrinth?.serversOnNetwork.find(
      (hostname) => hostname !== SpecialServers.Home && hostname !== SpecialServers.DarkWeb,
    );
    if (!server) {
      clearDarknet();
      populateDarknet();
    }
  }
  return getNS(server);
}

function getFirstDarknetServerAdjacentToDarkWeb() {
  addLowLevelServersIfNeeded();
  const darkweb = getDarknetServerOrThrow(SpecialServers.DarkWeb);
  const result = darkweb.serversOnNetwork.filter((hostname) => hostname !== SpecialServers.Home)[0];
  if (!result) {
    throw new Error("No darknet server adjacent to darkweb found");
  }
  return result;
}

function getNsOnNonDarkwebDarknetServer() {
  const hostname = getFirstDarknetServerAdjacentToDarkWeb();
  return getNS(hostname);
}

function getRandomDarknetServer(excludedHostnames: string[] = []) {
  const result = DarknetState.Network.flat().find((server) => server && !excludedHostnames.includes(server.hostname));
  if (!result) {
    throw new Error("No darknet server found");
  }
  return result;
}

describe("Common APIs", () => {
  test("getDarknetInstability", () => {
    const ns = getNsOnDarkWeb();
    expect(ns.dnet.getStasisLinkLimit()).toStrictEqual(1);
    Player.augmentations.push(new PlayerOwnedAugmentation(AugmentationName.TheBrokenWings));
    expect(ns.dnet.getStasisLinkLimit()).toStrictEqual(2);
    Player.augmentations.push(new PlayerOwnedAugmentation(AugmentationName.TheHammer));
    expect(ns.dnet.getStasisLinkLimit()).toStrictEqual(3);
  });
  test("unleashStormSeed", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result1 = ns.dnet.unleashStormSeed();
    expect(result1.success).toStrictEqual(false);
    expect(DarknetState.mutationLock).toBeNull();
    getDarknetServerOrThrow(ns.getHostname()).programs.push(CompletedProgramName.stormSeed);
    const result2 = ns.dnet.unleashStormSeed();
    expect(result2.success).toStrictEqual(true);
    expect(DarknetState.mutationLock).toBeTruthy();
  });
  test("getDarknetInstability", () => {
    const ns = getNsOnDarkWeb();
    const initialResult = ns.dnet.getDarknetInstability();

    expect(initialResult.authenticationTimeoutChance).toStrictEqual(0);
    expect(initialResult.authenticationDurationMultiplier).toStrictEqual(1);

    const darknetServers = getAllMovableDarknetServers();

    // The first two backdoors do not increase instability
    darknetServers.slice(0, 2).forEach((server) => (server.backdoorInstalled = true));

    const resultAfterTwoBackdoors = ns.dnet.getDarknetInstability();
    expect(resultAfterTwoBackdoors.authenticationTimeoutChance).toStrictEqual(0);
    expect(resultAfterTwoBackdoors.authenticationDurationMultiplier).toStrictEqual(1);

    // Stasis linked servers do not increase instability
    darknetServers.slice(2, 5).forEach((server) => (server.backdoorInstalled = true));
    darknetServers.slice(2, 5).forEach((server) => (server.hasStasisLink = true));

    const resultAfterFiveBackdoorsAndThreeStasisLinks = ns.dnet.getDarknetInstability();
    expect(resultAfterFiveBackdoorsAndThreeStasisLinks.authenticationTimeoutChance).toStrictEqual(0);
    expect(resultAfterFiveBackdoorsAndThreeStasisLinks.authenticationDurationMultiplier).toStrictEqual(1);

    // The rest of backdoors each increase instability
    darknetServers.slice(5, 8).forEach((server) => (server.backdoorInstalled = true));
    const resultAfterEightBackdoors = ns.dnet.getDarknetInstability();
    expect(resultAfterEightBackdoors.authenticationTimeoutChance).toBeGreaterThan(0);
    expect(resultAfterEightBackdoors.authenticationDurationMultiplier).toBeGreaterThan(1);

    darknetServers.slice(8, 12).forEach((server) => (server.backdoorInstalled = true));
    const resultAfterAllBackdoors = ns.dnet.getDarknetInstability();
    expect(resultAfterAllBackdoors.authenticationTimeoutChance).toBeGreaterThan(
      resultAfterEightBackdoors.authenticationTimeoutChance,
    );
    expect(resultAfterAllBackdoors.authenticationDurationMultiplier).toBeGreaterThan(
      resultAfterEightBackdoors.authenticationDurationMultiplier,
    );
  });
  test("nextMutation", async () => {
    const ns = getNsOnDarkWeb();
    let resolved = false;
    void ns.dnet.nextMutation().then(() => {
      resolved = true;
    });
    expect(resolved).toStrictEqual(false);
    triggerNextUpdate();
    await sleep(10);
    expect(resolved).toStrictEqual(true);
  });
});

describe("home", () => {
  test("authenticate from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    await expect(async () => {
      await ns.dnet.authenticate(SpecialServers.Home, "");
    }).rejects.toContain("home is not a darknet server");
  });
  test("connectToSession", () => {
    const ns = getNsOnHome();
    expect(() => {
      ns.dnet.connectToSession(SpecialServers.Home, "");
    }).toThrow("home is not a darknet server");
  });
  test("heartbleed from darkweb", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.heartbleed(SpecialServers.Home)).toThrow("home is not a darknet server");
  });
  test("openCache", () => {
    // Intentionally empty. Caches cannot be spawned on non-darknet servers.
  });
  test("probe", () => {
    const ns = getNsOnHome();
    const hostnames = ns.dnet.probe();
    expect(hostnames.length).toStrictEqual(1);
    expect(hostnames[0]).toStrictEqual(SpecialServers.DarkWeb);
  });
  test("setStasisLink", () => {
    const ns = getNsOnHome();
    expect(() => ns.dnet.setStasisLink(true)).toThrow("home is not a darknet server.");
  });
  test("getServer", () => {
    const ns = getNsOnHome();
    expect(ns.getServer().hostname).toStrictEqual(SpecialServers.Home);
  });
  test("getServerAuthDetails", () => {
    const ns = getNsOnHome();
    expect(() => ns.dnet.getServerAuthDetails()).toThrow("home is not a darknet server");
  });
  test("induceServerMigration", () => {
    const ns = getNsOnHome();
    expect(() => ns.dnet.induceServerMigration("home")).toThrow("home is not a darknet server");
  });
  test("isDarknetServer", () => {
    const ns = getNsOnHome();
    const result = ns.dnet.isDarknetServer();
    expect(result).toStrictEqual(false);
  });
  test("memoryReallocation", () => {
    const ns = getNsOnHome();
    expect(() => ns.dnet.memoryReallocation()).toThrow("home is not a darknet server");
  });
  test("getBlockedRam", () => {
    const ns = getNsOnHome();
    expect(() => ns.dnet.getBlockedRam()).toThrow("home is not a darknet server");
  });
  test("getDepth", () => {
    const ns = getNsOnHome();
    expect(() => ns.dnet.getDepth()).toThrow("home is not a darknet server");
  });
  test("promoteStock", async () => {
    const ns = getNsOnHome();
    await expect(async () => {
      await ns.dnet.promoteStock("ECP");
    }).rejects.toContain("This API can only be used on a darknet server");
  });
  test("phishingAttack", async () => {
    const ns = getNsOnHome();
    await expect(async () => {
      await ns.dnet.phishingAttack();
    }).rejects.toContain("This API can only be used on a darknet server");
  });
  test("scp to darkweb and exec on darkweb", () => {
    const ns = getNsOnHome();
    const darkweb = GetServerOrThrow(SpecialServers.DarkWeb);
    const scriptPath = "a.js" as ScriptFilePath;
    const scriptContent = "export async function main(ns) {}";
    ns.write(scriptPath, scriptContent);

    expect(darkweb.scripts.has(scriptPath)).toStrictEqual(false);
    ns.scp(scriptPath, SpecialServers.DarkWeb, SpecialServers.Home);
    expect(darkweb.scripts.has(scriptPath)).toStrictEqual(true);

    expect(ns.exec(scriptPath, SpecialServers.DarkWeb)).toBeGreaterThan(0);
  });
  test("scp to dnet server and exec on dnet server", async () => {
    const ns = getNsOnHome();
    const scriptPath = "a.js" as ScriptFilePath;
    const scriptContent = "export async function main(ns) {}";
    const darkweb = GetServerOrThrow(SpecialServers.DarkWeb);

    // Get a dnet server connected to darkweb
    const dnetServerHostname = darkweb.serversOnNetwork.find(
      (hostname) => GetServerOrThrow(hostname).hostname !== SpecialServers.Home,
    );
    if (!dnetServerHostname) {
      throw new Error("Cannot find any darknet server connected to darkweb");
    }
    const dnetServer = getDarknetServerOrThrow(dnetServerHostname);

    // Cannot scp before authenticating
    expect(dnetServer.hasAdminRights).toStrictEqual(false);
    expect(ns.scp(scriptPath, dnetServerHostname, SpecialServers.Home)).toStrictEqual(false);
    expect(dnetServer.scripts.size).toStrictEqual(0);
    // Cannot exec from home because there is no direct connection
    expect(ns.exec(scriptPath, dnetServerHostname)).toStrictEqual(0);

    const { ws: wsDarkWeb, ns: nsDarkWeb } = getWorkerScriptAndNS(SpecialServers.DarkWeb);
    // Authenticate from darkweb
    expect((await nsDarkWeb.dnet.authenticate(dnetServerHostname, dnetServer.password)).success).toStrictEqual(true);
    expect(dnetServer.hasAdminRights).toStrictEqual(true);
    // Check session created after successfully calling authenticate API
    expect(getServerState(dnetServerHostname).authenticatedPIDs.includes(wsDarkWeb.pid)).toStrictEqual(true);
    // Write the test script to darkweb
    nsDarkWeb.write(scriptPath, scriptContent);
    // scp from darkweb
    expect(nsDarkWeb.scp(scriptPath, dnetServerHostname, SpecialServers.DarkWeb)).toStrictEqual(true);
    expect(dnetServer.scripts.has(scriptPath)).toStrictEqual(true);
    // exec from darkweb
    expect(nsDarkWeb.exec(scriptPath, dnetServerHostname)).toBeGreaterThan(0);

    // Clear scripts on dnet server
    dnetServer.scripts.clear();

    // Cannot scp from home without a session
    expect(ns.scp(scriptPath, dnetServerHostname, SpecialServers.Home)).toStrictEqual(false);
    expect(dnetServer.scripts.size).toStrictEqual(0);
    // Cannot exec from home because there is no direct connection
    expect(ns.exec(scriptPath, dnetServerHostname)).toStrictEqual(0);

    // Create a session from home to dnet server
    expect(ns.dnet.connectToSession(dnetServerHostname, dnetServer.password).success).toStrictEqual(true);
    // Write the test script to home
    ns.write(scriptPath, scriptContent);
    // scp from home
    expect(ns.scp(scriptPath, dnetServerHostname, SpecialServers.Home)).toStrictEqual(true);
    expect(dnetServer.scripts.has(scriptPath)).toStrictEqual(true);
    // Cannot exec from home because there is no direct connection
    expect(ns.exec(scriptPath, dnetServerHostname)).toStrictEqual(0);
    // Install backdoor on dnet server
    ns.singularity.connect(SpecialServers.DarkWeb);
    ns.singularity.connect(dnetServerHostname);
    await ns.singularity.installBackdoor();
    // Can exec from home
    expect(ns.exec(scriptPath, dnetServerHostname)).toBeGreaterThan(0);
  });
  test("getServerRequiredCharismaLevel", () => {
    const ns = getNS(SpecialServers.Home);
    const server = GetServerOrThrow(SpecialServers.Home);
    expect(() => {
      ns.dnet.getServerRequiredCharismaLevel(server.hostname);
    }).toThrow("home is not a darknet server");
  });
  test("labreport", async () => {
    const ns = getNsOnHome();
    await expect(async () => {
      await ns.dnet.labreport();
    }).rejects.toContain("This API can only be used on a darknet server");
  });
  test("labradar", async () => {
    const ns = getNsOnHome();
    await expect(async () => {
      await ns.dnet.labradar();
    }).rejects.toContain("This API can only be used on a darknet server");
  });
});

describe("Normal NPC server", () => {
  test("authenticate from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    await expect(async () => {
      await ns.dnet.authenticate(SpecialServers.CyberSecServer, "");
    }).rejects.toContain("CSEC is not a darknet server");
  });
  test("connectToSession", () => {
    const ns = getNsOnHome();
    expect(() => {
      ns.dnet.connectToSession(SpecialServers.CyberSecServer, "");
    }).toThrow("CSEC is not a darknet server");
  });
  test("heartbleed from darkweb", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.heartbleed(SpecialServers.CyberSecServer)).toThrow("CSEC is not a darknet server");
  });
  test("openCache", () => {
    // Intentionally empty. Caches cannot be spawned on non-darknet servers.
  });
  test("probe", () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    expect(ns.dnet.probe().length).toStrictEqual(0);
  });
  test("setStasisLink", () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    expect(() => ns.dnet.setStasisLink(true)).toThrow("CSEC is not a darknet server.");
  });
  test("getServer", () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    expect(ns.getServer().hostname).toStrictEqual(SpecialServers.CyberSecServer);
  });
  test("getServerAuthDetails", () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    expect(() => ns.dnet.getServerAuthDetails()).toThrow("CSEC is not a darknet server");
  });
  test("induceServerMigration", () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    expect(() => ns.dnet.induceServerMigration("CSEC")).toThrow("CSEC is not a darknet server");
  });
  test("isDarknetServer", () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    const result = ns.dnet.isDarknetServer();
    expect(result).toStrictEqual(false);
  });
  test("memoryReallocation", () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    expect(() => ns.dnet.memoryReallocation()).toThrow("CSEC is not a darknet server");
  });
  test("getBlockedRam", () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    expect(() => ns.dnet.getBlockedRam()).toThrow("CSEC is not a darknet server");
  });
  test("getDepth", () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    expect(() => ns.dnet.getDepth()).toThrow("CSEC is not a darknet server");
  });
  test("promoteStock", async () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    await expect(async () => {
      await ns.dnet.promoteStock("ECP");
    }).rejects.toContain("This API can only be used on a darknet server");
  });
  test("phishingAttack", async () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    await expect(async () => {
      await ns.dnet.phishingAttack();
    }).rejects.toContain("This API can only be used on a darknet server");
  });
  test("getServerRequiredCharismaLevel", () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    const server = GetServerOrThrow(SpecialServers.CyberSecServer);
    expect(() => {
      ns.dnet.getServerRequiredCharismaLevel(server.hostname);
    }).toThrow("CSEC is not a darknet server");
  });
  test("labreport", async () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    await expect(async () => {
      await ns.dnet.labreport();
    }).rejects.toContain("This API can only be used on a darknet server");
  });
  test("labradar", async () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    await expect(async () => {
      await ns.dnet.labradar();
    }).rejects.toContain("This API can only be used on a darknet server");
  });
});

describe("Private server", () => {
  test("authenticate from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    await expect(async () => {
      await ns.dnet.authenticate("test-server-1", "");
    }).rejects.toContain("test-server-1 is not a darknet server");
  });
  test("connectToSession", () => {
    const ns = getNsOnHome();
    expect(() => {
      ns.dnet.connectToSession("test-server-1", "");
    }).toThrow("test-server-1 is not a darknet server");
  });
  test("heartbleed from darkweb", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.heartbleed("test-server-1")).toThrow("test-server-1 is not a darknet server");
  });
  test("openCache", () => {
    // Intentionally empty. Caches cannot be spawned on non-darknet servers.
  });
  test("probe", () => {
    const ns = getNS("test-server-1");
    expect(ns.dnet.probe().length).toStrictEqual(0);
  });
  test("setStasisLink", () => {
    const ns = getNS("test-server-1");
    expect(() => ns.dnet.setStasisLink(true)).toThrow("test-server-1 is not a darknet server.");
  });
  test("getServer", () => {
    const ns = getNS("test-server-1");
    expect(ns.getServer().hostname).toStrictEqual("test-server-1");
  });
  test("getServerAuthDetails", () => {
    const ns = getNS("test-server-1");
    expect(() => ns.dnet.getServerAuthDetails()).toThrow("test-server-1 is not a darknet server");
  });
  test("induceServerMigration", () => {
    const ns = getNS("test-server-1");
    expect(() => ns.dnet.induceServerMigration("test-server-1")).toThrow("test-server-1 is not a darknet server");
  });
  test("isDarknetServer", () => {
    const ns = getNS("test-server-1");
    const result = ns.dnet.isDarknetServer();
    expect(result).toStrictEqual(false);
  });
  test("memoryReallocation", () => {
    const ns = getNS("test-server-1");
    expect(() => ns.dnet.memoryReallocation()).toThrow("test-server-1 is not a darknet server");
  });
  test("getBlockedRam", () => {
    const ns = getNS("test-server-1");
    expect(() => ns.dnet.getBlockedRam()).toThrow("test-server-1 is not a darknet server");
  });
  test("getDepth", () => {
    const ns = getNS("test-server-1");
    expect(() => ns.dnet.getDepth()).toThrow("test-server-1 is not a darknet server");
  });
  test("promoteStock", async () => {
    const ns = getNS("test-server-1");
    await expect(async () => {
      await ns.dnet.promoteStock("ECP");
    }).rejects.toContain("This API can only be used on a darknet server");
  });
  test("phishingAttack", async () => {
    const ns = getNS("test-server-1");
    await expect(async () => {
      await ns.dnet.phishingAttack();
    }).rejects.toContain("This API can only be used on a darknet server");
  });
  test("getServerRequiredCharismaLevel", () => {
    const ns = getNS("test-server-1");
    const server = GetServerOrThrow("test-server-1");
    expect(() => {
      ns.dnet.getServerRequiredCharismaLevel(server.hostname);
    }).toThrow("test-server-1 is not a darknet server");
  });
  test("labreport", async () => {
    const ns = getNS("test-server-1");
    await expect(async () => {
      await ns.dnet.labreport();
    }).rejects.toContain("This API can only be used on a darknet server");
  });
  test("labradar", async () => {
    const ns = getNS("test-server-1");
    await expect(async () => {
      await ns.dnet.labradar();
    }).rejects.toContain("This API can only be used on a darknet server");
  });
});

describe("Hashnet server", () => {
  test("authenticate from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    await expect(async () => {
      await ns.dnet.authenticate("hacknet-server-0", "");
    }).rejects.toContain("hacknet-server-0 is not a darknet server");
  });
  test("connectToSession", () => {
    const ns = getNsOnHome();
    expect(() => {
      ns.dnet.connectToSession("hacknet-server-0", "");
    }).toThrow("hacknet-server-0 is not a darknet server");
  });
  test("heartbleed from darkweb", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.heartbleed("hacknet-server-0")).toThrow("hacknet-server-0 is not a darknet server");
  });
  test("openCache", () => {
    // Intentionally empty. Caches cannot be spawned on non-darknet servers.
  });
  test("probe", () => {
    const ns = getNS("hacknet-server-0");
    expect(ns.dnet.probe().length).toStrictEqual(0);
  });
  test("setStasisLink", () => {
    const ns = getNS("hacknet-server-0");
    expect(() => ns.dnet.setStasisLink(true)).toThrow("hacknet-server-0 is not a darknet server.");
  });
  test("getServer", () => {
    const ns = getNS("hacknet-server-0");
    expect(ns.getServer().hostname).toStrictEqual("hacknet-server-0");
  });
  test("getServerAuthDetails", () => {
    const ns = getNS("hacknet-server-0");
    expect(() => ns.dnet.getServerAuthDetails()).toThrow("hacknet-server-0 is not a darknet server");
  });
  test("induceServerMigration", () => {
    const ns = getNS("hacknet-server-0");
    expect(() => ns.dnet.induceServerMigration("hacknet-server-0")).toThrow("hacknet-server-0 is not a darknet server");
  });
  test("isDarknetServer", () => {
    const ns = getNS("hacknet-server-0");
    const result = ns.dnet.isDarknetServer();
    expect(result).toStrictEqual(false);
  });
  test("memoryReallocation", () => {
    const ns = getNS("hacknet-server-0");
    expect(() => ns.dnet.memoryReallocation()).toThrow("hacknet-server-0 is not a darknet server");
  });
  test("getBlockedRam", () => {
    const ns = getNS("hacknet-server-0");
    expect(() => ns.dnet.getBlockedRam()).toThrow("hacknet-server-0 is not a darknet server");
  });
  test("getDepth", () => {
    const ns = getNS("hacknet-server-0");
    expect(() => ns.dnet.getDepth()).toThrow("hacknet-server-0 is not a darknet server");
  });
  test("promoteStock", async () => {
    const ns = getNS("hacknet-server-0");
    await expect(async () => {
      await ns.dnet.promoteStock("ECP");
    }).rejects.toContain("This API can only be used on a darknet server");
  });
  test("phishingAttack", async () => {
    const ns = getNS("hacknet-server-0");
    await expect(async () => {
      await ns.dnet.phishingAttack();
    }).rejects.toContain("This API can only be used on a darknet server");
  });
  test("getServerRequiredCharismaLevel", () => {
    const ns = getNS("hacknet-server-0");
    const server = GetServerOrThrow("hacknet-server-0");
    expect(() => {
      ns.dnet.getServerRequiredCharismaLevel(server.hostname);
    }).toThrow("hacknet-server-0 is not a darknet server");
  });
  test("labreport", async () => {
    const ns = getNS("hacknet-server-0");
    await expect(async () => {
      await ns.dnet.labreport();
    }).rejects.toContain("This API can only be used on a darknet server");
  });
  test("labradar", async () => {
    const ns = getNS("hacknet-server-0");
    await expect(async () => {
      await ns.dnet.labradar();
    }).rejects.toContain("This API can only be used on a darknet server");
  });
});

describe("Non-existent server", () => {
  test("authenticate from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    await expect(async () => {
      await ns.dnet.authenticate(hostnameOfNonExistentServer, "");
    }).rejects.toContain(errorMessageForNonExistentServer);
  });
  test("connectToSession", () => {
    const ns = getNsOnHome();
    expect(() => {
      ns.dnet.connectToSession(hostnameOfNonExistentServer, "");
    }).toThrow(errorMessageForNonExistentServer);
  });
  test("heartbleed from darkweb", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.heartbleed(hostnameOfNonExistentServer)).toThrow(errorMessageForNonExistentServer);
  });
  test("openCache", () => {
    // Intentionally empty. Caches cannot be spawned on non-darknet servers.
  });
  test("getServer", () => {
    const ns = getNsOnDarkWeb();
    expect(() => {
      ns.getServer(hostnameOfNonExistentServer);
    }).toThrow(errorMessageForNonExistentServer);
  });
  test("getServerAuthDetails", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.getServerAuthDetails(hostnameOfNonExistentServer)).toThrow(errorMessageForNonExistentServer);
  });
  test("induceServerMigration", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.induceServerMigration(hostnameOfNonExistentServer)).toThrow(errorMessageForNonExistentServer);
  });
  test("isDarknetServer", () => {
    const ns = getNsOnDarkWeb();
    const result = ns.dnet.isDarknetServer(hostnameOfNonExistentServer);
    expect(result).toStrictEqual(false);
  });
  test("getBlockedRam", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.getBlockedRam(hostnameOfNonExistentServer)).toThrow(errorMessageForNonExistentServer);
  });
  test("getServerRequiredCharismaLevel", () => {
    const ns = getNsOnDarkWeb();
    expect(() => {
      ns.dnet.getServerRequiredCharismaLevel(hostnameOfNonExistentServer);
    }).toThrow(errorMessageForNonExistentServer);
  });
});

describe("darkweb targets home", () => {
  test("authenticate from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    await expect(async () => {
      await ns.dnet.authenticate(SpecialServers.Home, "");
    }).rejects.toContain("home is not a darknet server");
  });
  test("connectToSession", () => {
    const ns = getNsOnDarkWeb();
    expect(() => {
      ns.dnet.connectToSession(SpecialServers.Home, "");
    }).toThrow("home is not a darknet server");
  });
  test("heartbleed from darkweb", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.heartbleed(SpecialServers.Home)).toThrow("home is not a darknet server");
  });
  test("induceServerMigration", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.induceServerMigration(SpecialServers.Home)).toThrow("home is not a darknet server");
  });
  test("isDarknetServer", () => {
    const ns = getNsOnDarkWeb();
    const result = ns.dnet.isDarknetServer(SpecialServers.Home);
    expect(result).toStrictEqual(false);
  });
  test("memoryReallocation", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.memoryReallocation(SpecialServers.Home)).toThrow("home is not a darknet server");
  });
  test("getBlockedRam", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.getBlockedRam(SpecialServers.Home)).toThrow("home is not a darknet server");
  });
  test("getDepth", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.getDepth(SpecialServers.Home)).toThrow("home is not a darknet server");
  });
  test("getServerRequiredCharismaLevel", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.getServerRequiredCharismaLevel(SpecialServers.Home)).toThrow("home is not a darknet server");
  });
});

describe("expectRunningOnDarknetServer", () => {
  test("throws when called on non-darknet server", () => {
    const logger = jest.fn();
    const ctx = getMockedNetscriptContext(logger);
    ctx.workerScript.hostname = SpecialServers.Home;
    expect(() => expectRunningOnDarknetServer(ctx)).toThrow("This API can only be used on a darknet server");
  });
  test("does not throw when called on darknet server", () => {
    const logger = jest.fn();
    const ctx = getMockedNetscriptContext(logger);
    ctx.workerScript.hostname = SpecialServers.DarkWeb;
    expect(() => expectRunningOnDarknetServer(ctx)).not.toThrow();
  });
});

describe("darkweb", () => {
  test("authenticate from home", async () => {
    const ns = getNsOnHome();
    const result = await ns.dnet.authenticate(SpecialServers.DarkWeb, "");
    expect(result.success).toStrictEqual(true);
    expect(result.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("authenticate itself", async () => {
    const ns = getNsOnDarkWeb();
    const result = await ns.dnet.authenticate(SpecialServers.DarkWeb, "");
    expect(result.success).toStrictEqual(true);
    expect(result.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("connectToSession from home", () => {
    const ns = getNsOnHome();
    // Special behavior: darkweb's "hasAdminRights" is always true, so "connectToSession" can be called without calling
    // the "authenticate" API.
    const result = ns.dnet.connectToSession(SpecialServers.DarkWeb, "");
    expect(result.success).toStrictEqual(true);
    expect(result.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("heartbleed from home", async () => {
    const ns = getNsOnHome();
    const result = await ns.dnet.heartbleed(SpecialServers.DarkWeb);
    expect(result.success).toStrictEqual(true);
    expect(result.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("openCache", () => {
    const ns = getNsOnDarkWeb();
    const darkweb = getDarknetServerOrThrow(SpecialServers.DarkWeb);
    const result = addCacheToServer(darkweb, false, "test");
    if (!result.success) {
      throw new Error("Cannot add cache");
    }
    expect(darkweb.caches.length).toBe(1);
    expect(darkweb.caches[0]).toMatch(/test_[0-9]+\.cache/);
    ns.dnet.openCache(result.cacheFilename);
    expect(darkweb.caches.length).toBe(0);
  });
  test("probe", () => {
    const ns = getNsOnDarkWeb();
    const servers = ns.dnet.probe();
    expect(servers.length).toBeGreaterThanOrEqual(1);
  });
  test("setStasisLink", async () => {
    const ns = getNsOnDarkWeb();
    const result = await ns.dnet.setStasisLink(true);
    expect(result.success).toStrictEqual(true);
    expect(result.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("getServer", () => {
    const ns = getNsOnDarkWeb();
    const server = ns.getServer();
    if (!("isOnline" in server)) {
      throw new Error("getServer does not return DarknetServerData");
    }
    expect(server.isOnline).toStrictEqual(true);
    expect(server.ip).toStrictEqual(getDarknetServerOrThrow(SpecialServers.DarkWeb).ip);
  });
  test("getServerAuthDetails", () => {
    const ns = getNsOnDarkWeb();
    const authDetails = ns.dnet.getServerAuthDetails();
    expect(authDetails.isOnline).toStrictEqual(true);
    expect(authDetails.modelId).toStrictEqual(ModelIds.NoPassword);
  });
  test("induceServerMigration", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.induceServerMigration(SpecialServers.DarkWeb)).toThrow(
      "darkweb is not a valid target: it is a stationary server.",
    );
  });
  test("isDarknetServer", () => {
    const ns = getNsOnDarkWeb();
    const result = ns.dnet.isDarknetServer();
    expect(result).toStrictEqual(true);
  });
  test("memoryReallocation", async () => {
    const ns = getNsOnDarkWeb();
    const result = await ns.dnet.memoryReallocation();
    expect(result.success).toStrictEqual(false);
    expect(result.code).toStrictEqual(ResponseCodeEnum.NoBlockRAM);
  });
  test("getBlockedRam", () => {
    const ns = getNsOnDarkWeb();
    const result = ns.dnet.getBlockedRam();
    expect(result).toStrictEqual(0);
  });
  test("getDepth", () => {
    const ns = getNsOnDarkWeb();
    const result = ns.dnet.getDepth();
    expect(result).toStrictEqual(-1);
  });
  test("promoteStock", async () => {
    const ns = getNsOnDarkWeb();
    const result = await ns.dnet.promoteStock("ECP");
    expect(result.success).toStrictEqual(true);
    expect(result.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("phishingAttack", async () => {
    const ns = getNsOnDarkWeb();
    const result = await ns.dnet.phishingAttack();
    expect(result.success).toStrictEqual(true);
    expect(result.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("getServerRequiredCharismaLevel", () => {
    const ns = getNsOnDarkWeb();
    expect(ns.dnet.getServerRequiredCharismaLevel(SpecialServers.DarkWeb)).toStrictEqual(
      getDarknetServerOrThrow(SpecialServers.DarkWeb).requiredCharismaSkill,
    );
  });
  test("labreport", async () => {
    const ns = getNsOnDarkWeb();
    const details = (await ns.dnet.labreport()) as Result;
    // darkweb is not connected to lab, so scripts on it cannot navigate the lab
    expect(details.message).toEqual("You feel disconnected...");
  });
  test("labradar", async () => {
    const ns = getNsOnDarkWeb();
    const details: Result = (await ns.dnet.labradar()) as Result;
    // darkweb is not connected to lab, so scripts on it cannot navigate the lab
    expect(details.message).toEqual("You feel disconnected...");
  });
});

describe("Non-darkweb darknet server", () => {
  test("authenticate from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    const target = getFirstDarknetServerAdjacentToDarkWeb();
    const server = getDarknetServerOrThrow(target);
    const result = await ns.dnet.authenticate(target, server.password);
    // Logging details for debugging flaky test
    if (!result.success) {
      console.log("Server details grabbed before auth:");
      console.log(server);
      console.log("result:");
      console.log(result);
      console.log("currentServerDetails:");
      console.log(getDarknetServer(target));
    }
    expect(result.code).toStrictEqual(ResponseCodeEnum.Success);
    expect(result.success).toStrictEqual(true);
  });
  test("authenticate itself", async () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = await ns.dnet.authenticate(ns.getHostname(), getDarknetServerOrThrow(ns.getHostname()).password);
    expect(result.success).toStrictEqual(true);
    expect(result.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("connectToSession from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    const target = getFirstDarknetServerAdjacentToDarkWeb();
    const password = getDarknetServerOrThrow(target).password;
    const result1 = await ns.dnet.authenticate(target, password);
    expect(result1.success).toStrictEqual(true);
    expect(result1.code).toStrictEqual(ResponseCodeEnum.Success);
    const result2 = ns.dnet.connectToSession(target, password);
    expect(result2.success).toStrictEqual(true);
    expect(result2.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("heartbleed from home", async () => {
    const ns = getNsOnHome();
    const target = getFirstDarknetServerAdjacentToDarkWeb();
    const result = await ns.dnet.heartbleed(target);
    expect(result.success).toStrictEqual(false);
    expect(result.code).toStrictEqual(ResponseCodeEnum.DirectConnectionRequired);
  });
  test("heartbleed from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    const target = getFirstDarknetServerAdjacentToDarkWeb();
    const result = await ns.dnet.heartbleed(target);
    expect(result.success).toStrictEqual(true);
    expect(result.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("openCache", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = addCacheToServer(getDarknetServerOrThrow(ns.getHostname()), "test.cache");
    if (!result.success) {
      throw new Error(result.message);
    }
    ns.dnet.openCache(result.cacheFilename);
  });
  test("probe", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const servers = ns.dnet.probe();
    const expectedServers = getDarknetServerOrThrow(ns.getHostname()).serversOnNetwork;
    expect(servers.sort()).toStrictEqual(expectedServers.sort());
  });
  test("setStasisLink+getStasisLinkedServers", async () => {
    const ns = getNsOnNonDarkwebDarknetServer();

    // Apply stasis link
    const result1 = await ns.dnet.setStasisLink(true);
    expect(result1.success).toStrictEqual(true);
    expect(result1.code).toStrictEqual(ResponseCodeEnum.Success);

    // Verify stasis link
    const stasisLinkServers = ns.dnet.getStasisLinkedServers();
    expect(stasisLinkServers.length).toStrictEqual(1);
    expect(stasisLinkServers[0]).toStrictEqual(ns.getHostname());
    expect(getDarknetServerOrThrow(ns.getHostname()).hasStasisLink).toStrictEqual(true);

    // Remove stasis link
    const result2 = await ns.dnet.setStasisLink(false);
    expect(result2.success).toStrictEqual(true);
    expect(result2.code).toStrictEqual(ResponseCodeEnum.Success);
    expect(getDarknetServerOrThrow(ns.getHostname()).hasStasisLink).toStrictEqual(false);
  });
  test("getServer", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const server = ns.getServer();
    expect(server.hostname).toStrictEqual(ns.getHostname());
  });
  test("getServerAuthDetails", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const authDetails = ns.dnet.getServerAuthDetails();
    expect(authDetails.modelId).toStrictEqual(getDarknetServerOrThrow(ns.getHostname()).modelId);
  });
  test("induceServerMigration targeting connected server", async () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const targetServer = getRandomDarknetServer([SpecialServers.DarkWeb, ns.getHostname()]);
    const hostServer = GetServerOrThrow(ns.getHostname());
    connectServers(hostServer, targetServer);

    const result = await ns.dnet.induceServerMigration(targetServer.hostname);
    expect(result.success).toStrictEqual(true);
    expect(result.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("induceServerMigration targeting non-connected server", async () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const targetServer = getRandomDarknetServer([SpecialServers.DarkWeb, ns.getHostname(), ...ns.dnet.probe()]);

    const result = await ns.dnet.induceServerMigration(targetServer.hostname);
    expect(result.success).toStrictEqual(false);
    expect(result.code).toStrictEqual(ResponseCodeEnum.DirectConnectionRequired);
  });
  test("induceServerMigration itself", async () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = await ns.dnet.induceServerMigration(ns.getHostname());
    expect(result.success).toStrictEqual(false);
    expect(result.code).toStrictEqual(ResponseCodeEnum.DirectConnectionRequired);
  });
  test("isDarknetServer", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = ns.dnet.isDarknetServer();
    expect(result).toStrictEqual(true);
  });
  test("memoryReallocation from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    const target = getFirstDarknetServerAdjacentToDarkWeb();

    const result1 = await ns.dnet.memoryReallocation(target);
    expect(result1.success).toStrictEqual(false);
    expect(result1.code).toStrictEqual(ResponseCodeEnum.AuthFailure);

    const server = getDarknetServerOrThrow(target);
    server.ramUsed = server.blockedRam = 1;
    const password = server.password;

    const result2 = await ns.dnet.authenticate(target, password);
    expect(result2.success).toStrictEqual(true);
    expect(result2.code).toStrictEqual(ResponseCodeEnum.Success);

    const result3 = await ns.dnet.memoryReallocation(target);
    expect(result3.success).toStrictEqual(true);
    expect(result3.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("memoryReallocation itself", async () => {
    const server = getDarknetServerOrThrow(getFirstDarknetServerAdjacentToDarkWeb());
    server.hasAdminRights = true;
    server.ramUsed = server.blockedRam = 1;

    const ns = getNS(server.hostname);
    const result3 = await ns.dnet.memoryReallocation(ns.getHostname());
    expect(result3.success).toStrictEqual(true);
    expect(result3.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("getBlockedRam", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = ns.dnet.getBlockedRam();
    expect(result).toStrictEqual(getDarknetServerOrThrow(ns.getHostname()).blockedRam);
  });
  test("getDepth", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = ns.dnet.getDepth();
    expect(result).toStrictEqual(getDarknetServerOrThrow(ns.getHostname()).depth);
  });
  test("promoteStock", async () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = await ns.dnet.promoteStock("ECP");
    expect(result.success).toStrictEqual(true);
    expect(result.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("phishingAttack", async () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = await ns.dnet.phishingAttack();
    expect(result.success).toStrictEqual(true);
    expect(result.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("getServerRequiredCharismaLevel", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    expect(ns.dnet.getServerRequiredCharismaLevel(ns.getHostname())).toStrictEqual(
      getDarknetServerOrThrow(ns.getHostname()).requiredCharismaSkill,
    );
  });
});

describe("Offline darknet server", () => {
  beforeEach(() => {
    DarknetState.offlineServers.add(hostnameForOfflineServer);
    DarknetState.offlineServers.add(ipForOfflineServer);
  });
  async function testIpAndHostname(func: (host: string) => Promise<DarknetResult>) {
    let result = await func(hostnameForOfflineServer);
    expect(result.success).toStrictEqual(false);
    expect(result.code).toStrictEqual(ResponseCodeEnum.ServiceUnavailable);

    result = await func(ipForOfflineServer);
    expect(result.success).toStrictEqual(false);
    expect(result.code).toStrictEqual(ResponseCodeEnum.ServiceUnavailable);
  }
  test("authenticate from home", async () => {
    const ns = getNsOnHome();
    await testIpAndHostname((host) => ns.dnet.authenticate(host, ""));
  });
  test("authenticate itself", async () => {
    const ns = getNsOnDarkWeb();
    await testIpAndHostname((host) => ns.dnet.authenticate(host, ""));
  });
  test("connectToSession from home", async () => {
    const ns = getNsOnHome();
    await testIpAndHostname((host) => Promise.resolve(ns.dnet.connectToSession(host, "")));
  });
  test("heartbleed from home", async () => {
    const ns = getNsOnHome();
    await testIpAndHostname((host) => ns.dnet.heartbleed(host));
  });
  test("getServer", () => {
    const ns = getNsOnDarkWeb();
    let server = ns.getServer(hostnameForOfflineServer);
    expect(server).toHaveProperty("isOnline", false);
    expect(server.hostname).toBe(hostnameForOfflineServer);
    expect(server.ip).toBe("");

    server = ns.getServer(ipForOfflineServer);
    expect(server).toHaveProperty("isOnline", false);
    expect(server.hostname).toBe("");
    expect(server.ip).toBe(ipForOfflineServer);
  });
  test("getServerAuthDetails", () => {
    const ns = getNsOnDarkWeb();
    let authDetails = ns.dnet.getServerAuthDetails(hostnameForOfflineServer);
    expect(authDetails.isOnline).toStrictEqual(false);

    authDetails = ns.dnet.getServerAuthDetails(ipForOfflineServer);
    expect(authDetails.isOnline).toStrictEqual(false);
  });
  test("induceServerMigration", async () => {
    const ns = getNsOnDarkWeb();
    await testIpAndHostname((host) => ns.dnet.induceServerMigration(host));
  });
  test("isDarknetServer", () => {
    const ns = getNsOnDarkWeb();
    let result = ns.dnet.isDarknetServer(hostnameForOfflineServer);
    expect(result).toStrictEqual(false);

    result = ns.dnet.isDarknetServer(ipForOfflineServer);
    expect(result).toStrictEqual(false);
  });
  test("memoryReallocation", async () => {
    const ns = getNsOnDarkWeb();
    await testIpAndHostname((host) => ns.dnet.memoryReallocation(host));
  });
  test("getBlockedRam", () => {
    const ns = getNsOnDarkWeb();
    let result = ns.dnet.getBlockedRam(hostnameForOfflineServer);
    expect(result).toStrictEqual(0);

    result = ns.dnet.getBlockedRam(ipForOfflineServer);
    expect(result).toStrictEqual(0);
  });
  test("getDepth", () => {
    const ns = getNsOnDarkWeb();
    let result = ns.dnet.getDepth(hostnameForOfflineServer);
    expect(result).toStrictEqual(-1);

    result = ns.dnet.getDepth(ipForOfflineServer);
    expect(result).toStrictEqual(-1);
  });
  test("getServerRequiredCharismaLevel", () => {
    const ns = getNsOnDarkWeb();
    let result = ns.dnet.getServerRequiredCharismaLevel(hostnameForOfflineServer);
    expect(result).toStrictEqual(-1);

    result = ns.dnet.getServerRequiredCharismaLevel(ipForOfflineServer);
    expect(result).toStrictEqual(-1);
  });
});

describe("Use IP instead of hostname", () => {
  let ip: string;
  beforeEach(() => {
    ip = getDarknetServerOrThrow(getFirstDarknetServerAdjacentToDarkWeb()).ip;
  });
  test("authenticate from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    const result = await ns.dnet.authenticate(ip, getDarknetServerOrThrow(ip).password);
    expect(result.success).toStrictEqual(true);
    expect(result.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("connectToSession from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    const password = getDarknetServerOrThrow(ip).password;
    const result1 = await ns.dnet.authenticate(ip, password);
    expect(result1.success).toStrictEqual(true);
    expect(result1.code).toStrictEqual(ResponseCodeEnum.Success);
    const result2 = ns.dnet.connectToSession(ip, password);
    expect(result2.success).toStrictEqual(true);
    expect(result2.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("heartbleed from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    const result = await ns.dnet.heartbleed(ip);
    expect(result.success).toStrictEqual(true);
    expect(result.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("probe", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const servers = ns.dnet.probe(true);
    expect(servers.length).toBeGreaterThanOrEqual(1);
    for (const ip of servers) {
      expect(isIPAddress(ip)).toStrictEqual(true);
    }
  });
  test("getStasisLinkedServers", async () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = await ns.dnet.setStasisLink(true);
    expect(result.success).toStrictEqual(true);
    const servers = ns.dnet.getStasisLinkedServers(true);
    expect(servers.length).toStrictEqual(1);
    for (const ip of servers) {
      expect(isIPAddress(ip)).toStrictEqual(true);
    }
  });
  test("getServer", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const server = ns.getServer(ip);
    if (!("isOnline" in server)) {
      throw new Error("getServer does not return DarknetServerData");
    }
    expect(server.ip).toStrictEqual(ip);
  });
  test("getServerAuthDetails", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const authDetails = ns.dnet.getServerAuthDetails(ip);
    expect(authDetails.isOnline).toStrictEqual(true);
    expect(authDetails.modelId).toStrictEqual(getDarknetServerOrThrow(ip).modelId);
  });
  test("induceServerMigration targeting connected server", async () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const targetServer = getRandomDarknetServer([SpecialServers.DarkWeb, ns.getHostname()]);
    const hostServer = GetServerOrThrow(ns.getHostname());
    connectServers(hostServer, targetServer);

    const result = await ns.dnet.induceServerMigration(targetServer.ip);
    expect(result.success).toStrictEqual(true);
    expect(result.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("induceServerMigration itself", async () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = await ns.dnet.induceServerMigration(ns.getIP());
    expect(result.success).toStrictEqual(false);
    expect(result.code).toStrictEqual(ResponseCodeEnum.DirectConnectionRequired);
  });
  test("isDarknetServer", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = ns.dnet.isDarknetServer(ip);
    expect(result).toStrictEqual(true);
  });
  test("memoryReallocation from darkweb", async () => {
    const ns = getNsOnDarkWeb();

    const result1 = await ns.dnet.memoryReallocation(ip);
    expect(result1.success).toStrictEqual(false);
    expect(result1.code).toStrictEqual(ResponseCodeEnum.AuthFailure);

    const server = getDarknetServerOrThrow(ip);
    server.ramUsed = server.blockedRam = 1;
    const password = server.password;

    const result2 = await ns.dnet.authenticate(ip, password);
    expect(result2.success).toStrictEqual(true);
    expect(result2.code).toStrictEqual(ResponseCodeEnum.Success);

    const result3 = await ns.dnet.memoryReallocation(ip);
    expect(result3.success).toStrictEqual(true);
    expect(result3.code).toStrictEqual(ResponseCodeEnum.Success);
  });
  test("memoryReallocation itself", async () => {
    const server = getDarknetServerOrThrow(getFirstDarknetServerAdjacentToDarkWeb());
    server.hasAdminRights = true;
    server.ramUsed = server.blockedRam = 1;

    const ns = getNS(server.hostname);
    const initialBlockedRam = server.blockedRam;
    const result3 = await ns.dnet.memoryReallocation(ns.getIP());
    const updatedBlockedRam = getDarknetServerOrThrow(server.hostname).blockedRam;
    expect(result3.success).toStrictEqual(true);
    expect(result3.code).toStrictEqual(ResponseCodeEnum.Success);
    expect(updatedBlockedRam).toBeLessThan(initialBlockedRam);
    expect(updatedBlockedRam).toEqual(roundToTwo(updatedBlockedRam));
  });
  test("getBlockedRam", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = ns.dnet.getBlockedRam(ip);
    expect(result).toStrictEqual(getDarknetServerOrThrow(ip).blockedRam);
  });
  test("getDepth", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = ns.dnet.getDepth(ip);
    expect(result).toStrictEqual(getDarknetServerOrThrow(ip).depth);
  });
  test("getServerRequiredCharismaLevel", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    expect(ns.dnet.getServerRequiredCharismaLevel(ip)).toStrictEqual(getDarknetServerOrThrow(ip).requiredCharismaSkill);
  });
});

describe("lab location methods", () => {
  test("dnet.labreport", async () => {
    const ns = getNsOnServerNearLabyrinth();
    const labName = getLabyrinthDetails().name;

    const details = (await ns.dnet.labreport()) as LocationStatus;
    expect(isLocationStatus(details)).toBe(true);

    const maze = getLabMaze();
    expect(details).toMatchObject({
      coords: [1, 1],
      north: false,
      east: maze[1][3] === " ",
      south: maze[3][1] === " ",
      west: false,
    });

    const directionToMove = details.east ? "east" : "south";
    await ns.dnet.authenticate(labName, directionToMove);
    const logs = getMostRecentAuthLog(labName);
    assertNonNullish(logs);
    expect(logs.message).toContain("You have moved to");
    const newDetails = (await ns.dnet.labreport()) as LocationStatus;
    expect(isLocationStatus(newDetails)).toBe(true);
    expect(newDetails.coords).toEqual(directionToMove === "east" ? [3, 1] : [1, 3]);
  });
  test("dnet.labradar()", async () => {
    const ns = getNsOnServerNearLabyrinth();

    // Make sure we are at the starting point.
    const locationStatus = (await ns.dnet.labreport()) as LocationStatus;
    expect(isLocationStatus(locationStatus)).toBe(true);
    expect(locationStatus.coords).toStrictEqual([1, 1]);

    const response = (await ns.dnet.labradar()) as Result;
    assertNonNullish(response.message);
    const surroundingsString = response.message.split("\n");
    const maze = getLabMaze();
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        if (x === 1 && y === 1) {
          //The player icon is shown in the surroundings view
          expect(surroundingsString[x + 2][y + 2]).toEqual("@");
        } else {
          // labradar gives a snapshot of the maze centered on the current script's location
          // We have to offset it by its range to line it up with the maze data
          expect(surroundingsString[x + 2][y + 2]).toBe(maze[x][y]);
        }
      }
    }
  });
});
