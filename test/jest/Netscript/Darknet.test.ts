import { AugmentationName, CompletedProgramName } from "@enums";
import { Player } from "@player";
import { PlayerOwnedAugmentation } from "../../../src/Augmentation/PlayerOwnedAugmentation";
import { addCacheToServer } from "../../../src/DarkNet/effects/cacheFiles";
import { getDarkscapeNavigator } from "../../../src/DarkNet/effects/effects";
import { GetDarknetServerOrThrow, GetServerOrThrow } from "../../../src/Server/AllServers";
import { SpecialServers } from "../../../src/Server/data/SpecialServers";
import { initStockMarket } from "../../../src/StockMarket/StockMarket";
import { getNS, initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";

const hostnameOfNonExistentServer = "fake-server";
const errorMessageForNonExistentServer = `Target server ${hostnameOfNonExistentServer} does not exist. It may have gone offline.`;

beforeAll(() => {
  initGameEnvironment();
  initStockMarket();
});
beforeEach(() => {
  setupBasicTestingEnvironment();
  getDarkscapeNavigator();
  Player.getHomeComputer().programs.push(CompletedProgramName.formulas);
  Player.gainCharismaExp(1e100);
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
  test("getCurrentDarknetInstability", () => {
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
    GetDarknetServerOrThrow(ns.getHostname()).programs.push(CompletedProgramName.stormSeed);
    const result2 = ns.dnet.unleashStormSeed();
    // WIP: Add more tests
    expect(result2.success).toStrictEqual(true);
  });
  test("getCurrentDarknetInstability", () => {
    const ns = getNsOnDarkWeb();
    const result = ns.dnet.getCurrentDarknetInstability();
    // WIP: Add more tests
    expect(Number.isFinite(result.authenticateDurationIncrease)).toStrictEqual(true);
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
    expect(() => {
      ns.dnet.probe();
    }).toThrow("home is not a darknet server");
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
  test("getOwnerAllocatedRam", () => {
    const ns = getNsOnHome();
    expect(() => ns.dnet.getOwnerAllocatedRam()).toThrow("home is not a darknet server");
  });
  test("getCurrentDepth", () => {
    const ns = getNsOnHome();
    expect(() => ns.dnet.getCurrentDepth()).toThrow("home is not a darknet server");
  });
  test("promoteStock", async () => {
    const ns = getNsOnHome();
    await expect(async () => {
      await ns.dnet.promoteStock("ECP");
    }).rejects.toContain("home is not a darknet server");
  });
  test("phishingAttack", async () => {
    const ns = getNsOnHome();
    await expect(async () => {
      await ns.dnet.phishingAttack();
    }).rejects.toContain("home is not a darknet server");
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
    expect(() => {
      ns.dnet.probe();
    }).toThrow("CSEC is not a darknet server");
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
  test("getOwnerAllocatedRam", () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    expect(() => ns.dnet.getOwnerAllocatedRam()).toThrow("CSEC is not a darknet server");
  });
  test("getCurrentDepth", () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    expect(() => ns.dnet.getCurrentDepth()).toThrow("CSEC is not a darknet server");
  });
  test("promoteStock", async () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    await expect(async () => {
      await ns.dnet.promoteStock("ECP");
    }).rejects.toContain("CSEC is not a darknet server");
  });
  test("phishingAttack", async () => {
    const ns = getNS(SpecialServers.CyberSecServer);
    await expect(async () => {
      await ns.dnet.phishingAttack();
    }).rejects.toContain("CSEC is not a darknet server");
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
    expect(() => {
      ns.dnet.probe();
    }).toThrow("test-server-1 is not a darknet server");
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
  test("getOwnerAllocatedRam", () => {
    const ns = getNS("test-server-1");
    expect(() => ns.dnet.getOwnerAllocatedRam()).toThrow("test-server-1 is not a darknet server");
  });
  test("getCurrentDepth", () => {
    const ns = getNS("test-server-1");
    expect(() => ns.dnet.getCurrentDepth()).toThrow("test-server-1 is not a darknet server");
  });
  test("promoteStock", async () => {
    const ns = getNS("test-server-1");
    await expect(async () => {
      await ns.dnet.promoteStock("ECP");
    }).rejects.toContain("test-server-1 is not a darknet server");
  });
  test("phishingAttack", async () => {
    const ns = getNS("test-server-1");
    await expect(async () => {
      await ns.dnet.phishingAttack();
    }).rejects.toContain("test-server-1 is not a darknet server");
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
    expect(() => {
      ns.dnet.probe();
    }).toThrow("hacknet-server-0 is not a darknet server");
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
  test("getOwnerAllocatedRam", () => {
    const ns = getNS("hacknet-server-0");
    expect(() => ns.dnet.getOwnerAllocatedRam()).toThrow("hacknet-server-0 is not a darknet server");
  });
  test("getCurrentDepth", () => {
    const ns = getNS("hacknet-server-0");
    expect(() => ns.dnet.getCurrentDepth()).toThrow("hacknet-server-0 is not a darknet server");
  });
  test("promoteStock", async () => {
    const ns = getNS("hacknet-server-0");
    await expect(async () => {
      await ns.dnet.promoteStock("ECP");
    }).rejects.toContain("hacknet-server-0 is not a darknet server");
  });
  test("phishingAttack", async () => {
    const ns = getNS("hacknet-server-0");
    await expect(async () => {
      await ns.dnet.phishingAttack();
    }).rejects.toContain("hacknet-server-0 is not a darknet server");
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
  test("getOwnerAllocatedRam", () => {
    const ns = getNsOnDarkWeb();
    expect(() => ns.dnet.getOwnerAllocatedRam(hostnameOfNonExistentServer)).toThrow(errorMessageForNonExistentServer);
  });
});

describe("darkweb targets home", () => {
  // WIP: Add more tests
});

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
    const darkweb = GetDarknetServerOrThrow(SpecialServers.DarkWeb);
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
  test("getOwnerAllocatedRam", () => {
    const ns = getNsOnDarkWeb();
    const result = ns.dnet.getOwnerAllocatedRam();
    expect(result).toStrictEqual(0);
  });
  test("getCurrentDepth", () => {
    const ns = getNsOnDarkWeb();
    const result = ns.dnet.getCurrentDepth();
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
    const result = await ns.dnet.authenticate(target, GetDarknetServerOrThrow(target).password);
    expect(result.success).toStrictEqual(true);
  });
  test("authenticate itself", async () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = await ns.dnet.authenticate(ns.getHostname(), GetDarknetServerOrThrow(ns.getHostname()).password);
    expect(result.success).toStrictEqual(true);
  });
  test("connectToSession from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    const target = getFirstDarknetServerAdjacentToDarkWeb();
    const password = GetDarknetServerOrThrow(target).password;
    const result1 = await ns.dnet.authenticate(target, password);
    expect(result1.success).toStrictEqual(true);
    const result2 = ns.dnet.connectToSession(target, password);
    expect(result2.success).toStrictEqual(true);
  });
  test("heartbleed from home", async () => {
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
    const result = addCacheToServer(GetDarknetServerOrThrow(ns.getHostname()), "test.cache");
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
    expect(GetDarknetServerOrThrow(ns.getHostname()).hasStasisLink).toStrictEqual(true);

    // Remove stasis link
    const result2 = await ns.dnet.setStasisLink(false);
    expect(result2.success).toStrictEqual(true);
    expect(GetDarknetServerOrThrow(ns.getHostname()).hasStasisLink).toStrictEqual(false);
  });
  test("getServer", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const server = ns.dnet.getServer();
    expect(server.hostname).toStrictEqual(ns.getHostname());
  });
  test("getServerAuthDetails", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const authDetails = ns.dnet.getServerAuthDetails();
    expect(authDetails.modelId).toStrictEqual(GetDarknetServerOrThrow(ns.getHostname()).modelId);
  });
  test("packetCapture from home", async () => {
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
    const server = GetDarknetServerOrThrow(target);
    server.ramUsed = server.ramBlock = 1;
    const password = server.password;
    const result2 = await ns.dnet.authenticate(target, password);
    expect(result2.success).toStrictEqual(true);
    const result3 = await ns.dnet.memoryReallocation();
    expect(result3.success).toStrictEqual(true);
  });
  test("getOwnerAllocatedRam", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = ns.dnet.getOwnerAllocatedRam();
    expect(result).toStrictEqual(GetDarknetServerOrThrow(ns.getHostname()).ramBlock);
  });
  test("getCurrentDepth", () => {
    const ns = getNsOnNonDarkwebDarknetServer();
    const result = ns.dnet.getCurrentDepth();
    expect(result).toStrictEqual(GetDarknetServerOrThrow(ns.getHostname()).depth);
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
  // WIP: Add more tests
});
