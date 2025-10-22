import { AugmentationName, CompletedProgramName } from "@enums";
import { Player } from "@player";
import { PlayerOwnedAugmentation } from "../../../src/Augmentation/PlayerOwnedAugmentation";
import { addCacheToServer } from "../../../src/DarkNet/effects/cacheFiles";
import { getDarkscapeNavigator } from "../../../src/DarkNet/effects/effects";
import { GetServerOrThrow } from "../../../src/Server/AllServers";
import { SpecialServers } from "../../../src/Server/data/SpecialServers";
import { initStockMarket } from "../../../src/StockMarket/StockMarket";
import {
  fixDoImportIssue,
  getNS,
  getWorkerScriptAndNS,
  initGameEnvironment,
  setupBasicTestingEnvironment,
} from "../Utilities";
import type { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { DarknetState, getServerState } from "../../../src/DarkNet/models/DarknetState";
import { getDarknetServerOrThrow } from "../../../src/DarkNet/utils/darknetServerUtils";
import { ResponseCodeEnum } from "../../../src/DarkNet/Enums";
import { getAllMovableDarknetServers } from "../../../src/DarkNet/utils/darknetNetworkUtils";

const hostnameOfNonExistentServer = "fake-server";
const errorMessageForNonExistentServer = `Target server ${hostnameOfNonExistentServer} does not exist. It may have gone offline.`;
const hostnameForOfflineServer = "darknet-offline-server";

fixDoImportIssue();

beforeAll(() => {
  DarknetState.allowServerRevival = false;
  initGameEnvironment();
  initStockMarket();
});
beforeEach(() => {
  setupBasicTestingEnvironment({ purchasePServer: true, purchaseHacknetServer: true });
  getDarkscapeNavigator();
  Player.getHomeComputer().programs.push(CompletedProgramName.formulas);
  Player.gainCharismaExp(1e100);

  DarknetState.offlineServers.push(hostnameForOfflineServer);
});

function getNsOnHome() {
  return getNS(SpecialServers.Home);
}

function getNsOnDarkWeb() {
  return getNS(SpecialServers.DarkWeb);
}

function getFirstDarknetServerAdjacentToDarkWeb() {
  const ns = getNsOnDarkWeb();
  const servers = ns.dnet.probe();
  return servers[0];
}

function getNsOnNonDarkwebDarknetServer() {
  const hostname = getFirstDarknetServerAdjacentToDarkWeb();
  return getNS(hostname);
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
    getDarknetServerOrThrow(ns.getHostname()).programs.push(CompletedProgramName.stormSeed);
    const result2 = ns.dnet.unleashStormSeed();
    // WIP: Add more tests
    expect(result2.success).toStrictEqual(true);
  });
  test("getDarknetInstability", () => {
    // WIP: review as needed
    const ns = getNsOnDarkWeb();
    const initialResult = ns.dnet.getDarknetInstability();

    expect(initialResult.authenticateTimeoutChance).toStrictEqual(0);
    expect(initialResult.authenticateDurationMultiplier).toStrictEqual(1);

    const darknetServers = getAllMovableDarknetServers();

    // The first two backdoors do not increase instability
    darknetServers.slice(0, 2).forEach((server) => (server.backdoorInstalled = true));

    const resultAfterTwoBackdoors = ns.dnet.getDarknetInstability();
    expect(resultAfterTwoBackdoors.authenticateTimeoutChance).toStrictEqual(0);
    expect(resultAfterTwoBackdoors.authenticateDurationMultiplier).toStrictEqual(1);

    // Stasis linked servers do not increase instability
    darknetServers.slice(2, 5).forEach((server) => (server.backdoorInstalled = true));
    darknetServers.slice(2, 5).forEach((server) => (server.hasStasisLink = true));

    const resultAfterFiveBackdoorsAndThreeStasisLinks = ns.dnet.getDarknetInstability();
    expect(resultAfterFiveBackdoorsAndThreeStasisLinks.authenticateTimeoutChance).toStrictEqual(0);
    expect(resultAfterFiveBackdoorsAndThreeStasisLinks.authenticateDurationMultiplier).toStrictEqual(1);

    // The rest of backdoors each increase instability
    darknetServers.slice(5, 8).forEach((server) => (server.backdoorInstalled = true));
    const resultAfterEightBackdoors = ns.dnet.getDarknetInstability();
    expect(resultAfterEightBackdoors.authenticateTimeoutChance).toBeGreaterThan(0);
    expect(resultAfterEightBackdoors.authenticateDurationMultiplier).toBeGreaterThan(1);

    darknetServers.slice(8, 12).forEach((server) => (server.backdoorInstalled = true));
    const resultAfterAllBackdoors = ns.dnet.getDarknetInstability();
    expect(resultAfterAllBackdoors.authenticateTimeoutChance).toBeGreaterThan(
      resultAfterEightBackdoors.authenticateTimeoutChance,
    );
    expect(resultAfterAllBackdoors.authenticateDurationMultiplier).toBeGreaterThan(
      resultAfterEightBackdoors.authenticateDurationMultiplier,
    );
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
    expect(() => {
      ns.dnet.getServer();
    }).toThrow("home is not a darknet server");
  });
  test("getServerAuthDetails", () => {
    const ns = getNsOnHome();
    expect(() => ns.dnet.getServerAuthDetails()).toThrow("home is not a darknet server");
  });
  test("packetCapture", () => {
    const ns = getNsOnHome();
    expect(() => ns.dnet.packetCapture(SpecialServers.Home)).toThrow("home is not a darknet server");
  });
  test("induceServerMigration", () => {
    const ns = getNsOnHome();
    expect(() => ns.dnet.induceServerMigration()).toThrow("home is not a darknet server");
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
    expect(() => ns.dnet.getBlockedRam()).toThrow("This API can only be used on a darknet server");
  });
  test("getDepth", () => {
    const ns = getNsOnHome();
    expect(() => ns.dnet.getDepth()).toThrow("This API can only be used on a darknet server");
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
    expect(() => {
      ns.scp(scriptPath, dnetServerHostname, SpecialServers.Home);
    }).toThrow(`Server ${dnetServerHostname} is password-protected`);
    expect(dnetServer.scripts.size).toStrictEqual(0);
    // Cannot exec before authenticating
    expect(() => {
      ns.exec(scriptPath, dnetServerHostname);
    }).toThrow(`Server ${dnetServerHostname} is password-protected`);

    const { ws, ns: nsDarkWeb } = getWorkerScriptAndNS(SpecialServers.DarkWeb);
    // Authenticate from darkweb
    expect((await nsDarkWeb.dnet.authenticate(dnetServerHostname, dnetServer.password)).success).toStrictEqual(true);
    expect(dnetServer.hasAdminRights).toStrictEqual(true);
    // Check session created after successfully calling authenticate API
    expect(getServerState(dnetServerHostname).authenticatedPIDs.includes(ws.pid)).toStrictEqual(true);
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
    expect(() => {
      ns.scp(scriptPath, dnetServerHostname, SpecialServers.Home);
    }).toThrow(`Server ${dnetServerHostname} requires a session`);
    expect(dnetServer.scripts.size).toStrictEqual(0);
    // Cannot exec from home without a session
    expect(() => {
      ns.exec(scriptPath, dnetServerHostname);
    }).toThrow(`Server ${dnetServerHostname} requires a session`);

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
    expect(() => {
      ns.dnet.getServer();
    }).toThrow("CSEC is not a darknet server");
  });
  test("getServerAuthDetails", () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    expect(() => ns.dnet.getServerAuthDetails()).toThrow("CSEC is not a darknet server");
  });
  test("packetCapture", () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    expect(() => ns.dnet.packetCapture(SpecialServers.CyberSecServer)).toThrow("CSEC is not a darknet server");
  });
  test("induceServerMigration", () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    expect(() => ns.dnet.induceServerMigration()).toThrow("CSEC is not a darknet server");
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
    expect(() => ns.dnet.getBlockedRam()).toThrow("This API can only be used on a darknet server");
  });
  test("getDepth", () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    expect(() => ns.dnet.getDepth()).toThrow("This API can only be used on a darknet server");
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
    expect(() => {
      ns.dnet.getServer();
    }).toThrow("test-server-1 is not a darknet server");
  });
  test("getServerAuthDetails", () => {
    const ns = getNS("test-server-1");
    expect(() => ns.dnet.getServerAuthDetails()).toThrow("test-server-1 is not a darknet server");
  });
  test("packetCapture", () => {
    const ns = getNS("test-server-1");
    expect(() => ns.dnet.packetCapture("test-server-1")).toThrow("test-server-1 is not a darknet server");
  });
  test("induceServerMigration", () => {
    const ns = getNS("test-server-1");
    expect(() => ns.dnet.induceServerMigration()).toThrow("test-server-1 is not a darknet server");
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
    expect(() => ns.dnet.getBlockedRam()).toThrow("This API can only be used on a darknet server");
  });
  test("getDepth", () => {
    const ns = getNS("test-server-1");
    expect(() => ns.dnet.getDepth()).toThrow("This API can only be used on a darknet server");
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
    expect(() => {
      ns.dnet.getServer();
    }).toThrow("hacknet-server-0 is not a darknet server");
  });
  test("getServerAuthDetails", () => {
    const ns = getNS("hacknet-server-0");
    expect(() => ns.dnet.getServerAuthDetails()).toThrow("hacknet-server-0 is not a darknet server");
  });
  test("packetCapture", () => {
    const ns = getNS("hacknet-server-0");
    expect(() => ns.dnet.packetCapture("hacknet-server-0")).toThrow("hacknet-server-0 is not a darknet server");
  });
  test("induceServerMigration", () => {
    const ns = getNS("hacknet-server-0");
    expect(() => ns.dnet.induceServerMigration()).toThrow("hacknet-server-0 is not a darknet server");
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
    expect(() => ns.dnet.getBlockedRam()).toThrow("This API can only be used on a darknet server");
  });
  test("getDepth", () => {
    const ns = getNS("hacknet-server-0");
    expect(() => ns.dnet.getDepth()).toThrow("This API can only be used on a darknet server");
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
      ns.dnet.getServer(hostnameOfNonExistentServer);
    }).toThrow(errorMessageForNonExistentServer);
  });
  test("getServerAuthDetails", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.getServerAuthDetails(hostnameOfNonExistentServer)).toThrow(errorMessageForNonExistentServer);
  });
  test("packetCapture", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.packetCapture(hostnameOfNonExistentServer)).toThrow(errorMessageForNonExistentServer);
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
});

describe("darkweb targets home", () => {
  // WIP: Add more tests
});

// WIP: test expectRunningOnDarknetServer

describe("darkweb", () => {
  test("authenticate from home", async () => {
    const ns = getNsOnHome();
    const result = await ns.dnet.authenticate(SpecialServers.DarkWeb, "leekspin");
    expect(result.success).toStrictEqual(true);
  });
  test("authenticate itself", async () => {
    const ns = getNsOnDarkWeb();
    const result = await ns.dnet.authenticate(SpecialServers.DarkWeb, "leekspin");
    expect(result.success).toStrictEqual(true);
  });
  test("connectToSession from home", () => {
    const ns = getNsOnHome();
    /**
     * Special behavior: darkweb's "hasAdminRights" is always true, so "connectToSession" can be called without
     * calling "authenticate".
     */
    const result = ns.dnet.connectToSession(SpecialServers.DarkWeb, "leekspin");
    expect(result.success).toStrictEqual(true);
  });
  test("heartbleed from home", async () => {
    const ns = getNsOnHome();
    const result = await ns.dnet.heartbleed(SpecialServers.DarkWeb);
    expect(result.success).toStrictEqual(true);
  });
  test("openCache", () => {
    const ns = getNsOnDarkWeb();
    const darkweb = getDarknetServerOrThrow(SpecialServers.DarkWeb);
    const result = addCacheToServer(darkweb, "test");
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
    expect(result.success).toStrictEqual(false);
  });
  test("getServer", () => {
    const ns = getNsOnDarkWeb();
    const server = ns.dnet.getServer();
    // WIP: Update after discussing darkweb and dnet.getServer implementation
    expect(server.passwordHintData).toStrictEqual("leekspin");
  });
  test("getServerAuthDetails", () => {
    const ns = getNsOnDarkWeb();
    const authDetails = ns.dnet.getServerAuthDetails();
    expect(authDetails.data).toStrictEqual("leekspin");
  });
  test("packetCapture from home", async () => {
    const ns = getNsOnHome();
    const result = await ns.dnet.packetCapture(SpecialServers.DarkWeb);
    expect(result.success).toStrictEqual(true);
  });
  test("induceServerMigration", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.induceServerMigration()).toThrow("darkweb is not a valid target: it is a stationary server.");
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
  });
  test("phishingAttack", async () => {
    const ns = getNsOnDarkWeb();
    const result = await ns.dnet.phishingAttack();
    expect(result.success).toStrictEqual(true);
  });
});

describe("Non-darkweb darknet server", () => {
  test("authenticate from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    const target = getFirstDarknetServerAdjacentToDarkWeb();
    const result = await ns.dnet.authenticate(target, getDarknetServerOrThrow(target).password);
    expect(result.success).toStrictEqual(true);
  });
  test("authenticate itself", async () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = await ns.dnet.authenticate(ns.getHostname(), getDarknetServerOrThrow(ns.getHostname()).password);
    expect(result.success).toStrictEqual(true);
  });
  test("connectToSession from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    const target = getFirstDarknetServerAdjacentToDarkWeb();
    const password = getDarknetServerOrThrow(target).password;
    const result1 = await ns.dnet.authenticate(target, password);
    expect(result1.success).toStrictEqual(true);
    const result2 = ns.dnet.connectToSession(target, password);
    expect(result2.success).toStrictEqual(true);
  });
  test.skip("heartbleed from home", async () => {
    const ns = getNsOnHome();
    const target = getFirstDarknetServerAdjacentToDarkWeb();
    const result = await ns.dnet.heartbleed(target);
    expect(result.success).toStrictEqual(false);
  });
  test("heartbleed from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    const target = getFirstDarknetServerAdjacentToDarkWeb();
    const result = await ns.dnet.heartbleed(target);
    expect(result.success).toStrictEqual(true);
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
    expect(servers).toStrictEqual(GetServerOrThrow(ns.getHostname()).serversOnNetwork);
  });
  test("setStasisLink+getStasisLinkedServers", async () => {
    const ns = getNsOnNonDarkwebDarknetServer();

    // Apply stasis link
    const result1 = await ns.dnet.setStasisLink(true);
    expect(result1.success).toStrictEqual(true);

    // Verify stasis link
    const stasisLinkServers = ns.dnet.getStasisLinkedServers();
    expect(stasisLinkServers.length).toStrictEqual(1);
    expect(stasisLinkServers[0]).toStrictEqual(ns.getHostname());
    expect(getDarknetServerOrThrow(ns.getHostname()).hasStasisLink).toStrictEqual(true);

    // Remove stasis link
    const result2 = await ns.dnet.setStasisLink(false);
    expect(result2.success).toStrictEqual(true);
    expect(getDarknetServerOrThrow(ns.getHostname()).hasStasisLink).toStrictEqual(false);
  });
  test("getServer", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const server = ns.dnet.getServer();
    expect(server.hostname).toStrictEqual(ns.getHostname());
  });
  test("getServerAuthDetails", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const authDetails = ns.dnet.getServerAuthDetails();
    expect(authDetails.modelId).toStrictEqual(getDarknetServerOrThrow(ns.getHostname()).modelId);
  });
  test.skip("packetCapture from home", async () => {
    const ns = getNsOnHome();
    const target = getFirstDarknetServerAdjacentToDarkWeb();
    const result = await ns.dnet.packetCapture(target);
    expect(result.success).toStrictEqual(false);
  });
  test("packetCapture from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    const target = getFirstDarknetServerAdjacentToDarkWeb();
    const result = await ns.dnet.packetCapture(target);
    expect(result.success).toStrictEqual(true);
  });
  test("induceServerMigration", async () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = await ns.dnet.induceServerMigration();
    expect(result.success).toStrictEqual(true);
  });
  test("isDarknetServer", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = ns.dnet.isDarknetServer();
    expect(result).toStrictEqual(true);
  });
  test("memoryReallocation", async () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result1 = await ns.dnet.memoryReallocation();
    expect(result1.success).toStrictEqual(false);
    const target = ns.getHostname();
    const server = getDarknetServerOrThrow(target);
    server.ramUsed = server.blockedRam = 1;
    const password = server.password;
    const result2 = await ns.dnet.authenticate(target, password);
    expect(result2.success).toStrictEqual(true);
    const result3 = await ns.dnet.memoryReallocation();
    expect(result3.success).toStrictEqual(true);
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
  });
  test("phishingAttack", async () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = await ns.dnet.phishingAttack();
    expect(result.success).toStrictEqual(true);
  });
});

describe("Offline darknet server", () => {
  // WIP: review as needed
  test("authenticate from home", async () => {
    const ns = getNsOnHome();
    const result = await ns.dnet.authenticate(hostnameForOfflineServer, "leekspin");
    expect(result.success).toStrictEqual(false);
    expect(result.code).toStrictEqual(ResponseCodeEnum.ServiceUnavailable);
  });
  test("authenticate itself", async () => {
    const ns = getNsOnDarkWeb();
    const result = await ns.dnet.authenticate(hostnameForOfflineServer, "leekspin");
    expect(result.success).toStrictEqual(false);
    expect(result.code).toStrictEqual(ResponseCodeEnum.ServiceUnavailable);
  });
  test("connectToSession from home", () => {
    const ns = getNsOnHome();
    const result = ns.dnet.connectToSession(hostnameForOfflineServer, "leekspin");
    expect(result.success).toStrictEqual(false);
    expect(result.code).toStrictEqual(ResponseCodeEnum.ServiceUnavailable);
  });
  test("heartbleed from home", async () => {
    const ns = getNsOnHome();
    const result = await ns.dnet.heartbleed(hostnameForOfflineServer);
    expect(result.success).toStrictEqual(false);
    expect(result.code).toStrictEqual(ResponseCodeEnum.ServiceUnavailable);
  });
  test("getServer", () => {
    const ns = getNsOnDarkWeb();
    const server = ns.dnet.getServer(hostnameForOfflineServer);
    // WIP: Update after discussing darkweb and dnet.getServer implementation
    expect(server.isOnline).toStrictEqual(false);
  });
  test("getServerAuthDetails", () => {
    const ns = getNsOnDarkWeb();
    const authDetails = ns.dnet.getServerAuthDetails(hostnameForOfflineServer);
    expect(authDetails.isOnline).toStrictEqual(false);
  });
  test("packetCapture from home", async () => {
    const ns = getNsOnHome();
    const result = await ns.dnet.packetCapture(hostnameForOfflineServer);
    expect(result.success).toStrictEqual(false);
    expect(result.code).toStrictEqual(ResponseCodeEnum.ServiceUnavailable);
  });
  test("induceServerMigration", async () => {
    const ns = getNsOnDarkWeb();
    const result = await ns.dnet.induceServerMigration(hostnameForOfflineServer);
    expect(result.success).toStrictEqual(false);
    expect(result.code).toStrictEqual(ResponseCodeEnum.ServiceUnavailable);
  });
  test("isDarknetServer", () => {
    const ns = getNsOnDarkWeb();
    const result = ns.dnet.isDarknetServer(hostnameForOfflineServer);
    expect(result).toStrictEqual(false);
  });
  test("memoryReallocation", async () => {
    const ns = getNsOnDarkWeb();
    const result = await ns.dnet.memoryReallocation(hostnameForOfflineServer);
    expect(result.success).toStrictEqual(false);
    expect(result.code).toStrictEqual(ResponseCodeEnum.ServiceUnavailable);
  });
  test("getBlockedRam", () => {
    const ns = getNsOnDarkWeb();
    const result = ns.dnet.getBlockedRam(hostnameForOfflineServer);
    expect(result).toStrictEqual(0);
  });
  test("getDepth", () => {
    const ns = getNsOnDarkWeb();
    const result = ns.dnet.getDepth(hostnameForOfflineServer);
    expect(result).toStrictEqual(-1);
  });
});
