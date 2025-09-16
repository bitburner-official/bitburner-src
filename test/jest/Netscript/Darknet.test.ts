import { AugmentationName, CompletedProgramName } from "@enums";
import { Player } from "@player";
import { PlayerOwnedAugmentation } from "../../../src/Augmentation/PlayerOwnedAugmentation";
import { addCacheToServer } from "../../../src/DarkNet/effects/cacheFiles";
import { getDarkscapeNavigator } from "../../../src/DarkNet/effects/effects";
import { GetDarknetServerOrThrow, GetServerOrThrow } from "../../../src/Server/AllServers";
import { SpecialServers } from "../../../src/Server/data/SpecialServers";
import { initStockMarket } from "../../../src/StockMarket/StockMarket";
import { getNS, initGameEnvironment, setupBasicTestingEnvironment } from "./Utilities";

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
  // WIP-@fico: Inconsistent behavior. This API should throw.
  test("heartbleed from darkweb", async () => {
    const ns = getNsOnDarkWeb();
    const result = await ns.dnet.heartbleed(SpecialServers.Home);
    expect(result.success).toStrictEqual(false);
  });
  test("openCache", () => {
    // Intentionally empty. Caches cannot be spawned on non-darknet servers.
  });
  test("probe", () => {
    const ns = getNsOnHome();
    const result = ns.dnet.probe();
    expect(result.length).toStrictEqual(1);
    expect(result[0]).toStrictEqual("darkweb");
  });
  // WIP-@fico: Inconsistent behavior. This API should throw.
  test("setStasisLink", async () => {
    const ns = getNsOnHome();
    const result = await ns.dnet.setStasisLink(true);
    expect(result.success).toStrictEqual(false);
  });
  test("getServer", () => {
    const ns = getNsOnHome();
    expect(() => {
      ns.dnet.getServer();
    }).toThrow("home is not a darknet server");
  });
  // WIP-@fico: Inconsistent behavior. This API should throw.
  test("getServerAuthDetails", () => {
    const ns = getNsOnHome();
    const authDetails = ns.dnet.getServerAuthDetails();
    expect(authDetails.modelId).toStrictEqual("");
  });
  // WIP-@fico: Inconsistent behavior. This API should throw.
  test("packetCapture", async () => {
    const ns = getNsOnHome();
    const result = await ns.dnet.packetCapture(SpecialServers.Home);
    expect(result.success).toStrictEqual(false);
  });
  // WIP-@fico: Inconsistent behavior. This API should throw.
  test("induceServerMigration", async () => {
    const ns = getNsOnHome();
    const result = await ns.dnet.induceServerMigration();
    expect(result.success).toStrictEqual(false);
  });
  test("isDarknetServer", () => {
    const ns = getNsOnHome();
    const result = ns.dnet.isDarknetServer();
    expect(result).toStrictEqual(false);
  });
  // WIP-@fico: Inconsistent behavior. This API should throw.
  test("memoryReallocation", async () => {
    const ns = getNsOnHome();
    const result = await ns.dnet.memoryReallocation();
    expect(result.success).toStrictEqual(false);
  });
  // WIP-@fico: Inconsistent behavior. This API should throw.
  test("getOwnerAllocatedRam", () => {
    const ns = getNsOnHome();
    const result = ns.dnet.getOwnerAllocatedRam();
    expect(result).toStrictEqual(0);
  });
  // WIP-@fico: Inconsistent behavior. This API should throw.
  test("getCurrentDepth", () => {
    const ns = getNsOnHome();
    const result = ns.dnet.getCurrentDepth();
    expect(result).toStrictEqual(-1);
  });
  test("promoteStock", async () => {
    const ns = getNsOnHome();
    await expect(async () => {
      await ns.dnet.promoteStock("ECP");
    }).rejects.toThrow("home is not a darknet server");
  });
  test("phishingAttack", async () => {
    const ns = getNsOnHome();
    await expect(async () => {
      await ns.dnet.phishingAttack();
    }).rejects.toThrow("home is not a darknet server");
  });
});

describe("Normal NPC server", () => {
  // WIP: Add more tests
});

describe("Private server", () => {
  // WIP: Add more tests
});

describe("Hashnet server", () => {
  // WIP: Add more tests
});

describe("Non-existent server", () => {
  // WIP: Add more tests
});

describe("darkweb", () => {
  test("authenticate from home", async () => {
    const ns = getNsOnHome();
    const result = await ns.dnet.authenticate(SpecialServers.DarkWeb, "leekspin");
    expect(result.success).toStrictEqual(true);
  });
  // test("authenticate itself", async () => {
  //   // WIP: bug in expectPassword. "authenticate" fails if running on darkweb
  //   const ns = getNsOnDarkWeb();
  //   const result = await ns.dnet.authenticate(SpecialServers.DarkWeb, "leekspin");
  //   console.log(result);
  //   expect(result.success).toStrictEqual(true);
  // });
  test("connectToSession from home", () => {
    const ns = getNsOnHome();
    /**
     * Special behavior: darkweb's "hasAdminRights" is always true, so "connectToSession" can be called without
     * calling "authenticate".
     */
    const result = ns.dnet.connectToSession(SpecialServers.DarkWeb, "leekspin");
    expect(result.success).toStrictEqual(true);
  });
  // test("heartbleed from home", async () => {
  //   // WIP: bug in isDarknetServer
  //   const ns = getNsOnHome();
  //   const result = await ns.dnet.heartbleed(SpecialServers.DarkWeb);
  //   console.log(result);
  //   expect(result.success).toStrictEqual(true);
  // });
  test("openCache", () => {
    const ns = getNsOnDarkWeb();
    // WIP: Change this test if needed after discussing the design of darkweb
    const result = addCacheToServer(GetServerOrThrow(SpecialServers.DarkWeb), "test.cache");
    if (!result.success) {
      throw new Error(result.message);
    }
    ns.dnet.openCache(result.cacheFilename);
  });
  test("probe", () => {
    const ns = getNsOnDarkWeb();
    const servers = ns.dnet.probe();
    expect(servers.length).toBeGreaterThanOrEqual(1);
  });
  test("setStasisLink", async () => {
    const ns = getNsOnDarkWeb();
    // WIP-@fico: Why does this API not work with darkweb?
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
  test("induceServerMigration", async () => {
    // WIP-@fico: Should we explicitly mention in TSDoc that this API does not work with darkweb?
    const ns = getNsOnDarkWeb();
    const result = await ns.dnet.induceServerMigration();
    expect(result.success).toStrictEqual(false);
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
    const result = addCacheToServer(GetServerOrThrow(ns.getHostname()), "test.cache");
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
