import {
  AddToAllServers,
  GetAllServers,
  loadAllServers,
  prestigeAllServers,
  saveAllServers,
  renameServer,
  GetServer,
  ipExists,
  GetServerOrThrow,
} from "../../../src/Server/AllServers";
import { Server } from "../../../src/Server/Server";
import { IPAddress } from "../../../src/Types/strings";
import { initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";
import { serverMetadata } from "../../../src/Server/data/servers";
import { resolveScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { discoverableNetworkScripts } from "../../../src/Literature/DiscoverableNetworkScripts";

describe("AllServers can be saved and loaded", () => {
  it("saves and loads servers correctly", () => {
    prestigeAllServers();
    expect(GetAllServers(true)).toEqual([]);
    const hostname = "__proto__";
    const server1 = new Server({
      hostname,
      ip: "173.78.146.183" as IPAddress,
    });
    AddToAllServers(server1);
    expect(GetAllServers(true)).toEqual([server1]);

    const serializedServers = saveAllServers();
    expect(serializedServers).toEqual(
      `{"__proto__":{"ctor":"Server","data":{"contracts":[],"cpuCores":1,"ftpPortOpen":false,"hasAdminRights":false,"hostname":"__proto__","httpPortOpen":false,"ip":"173.78.146.183","isConnectedTo":false,"maxRam":0,"messages":[],"organizationName":"","programs":[],"scripts":{"ctor":"JSONMap","data":[]},"serversOnNetwork":[],"smtpPortOpen":false,"sqlPortOpen":false,"sshPortOpen":false,"textFiles":{"ctor":"JSONMap","data":[]},"purchasedByPlayer":false,"backdoorInstalled":false,"baseDifficulty":1,"hackDifficulty":1,"minDifficulty":1,"moneyAvailable":0,"moneyMax":0,"numOpenPortsRequired":5,"openPortCount":0,"requiredHackingSkill":1,"serverGrowth":1,"runningScripts":[]}}}`,
    );

    loadAllServers(serializedServers);
    const loadedServers = GetAllServers(true);
    expect(loadedServers.length).toEqual(1);
    const loadedServer = loadedServers[0];
    expect(loadedServer).toBeInstanceOf(Server);
    expect(loadedServer.hostname).toEqual(server1.hostname);
    expect(loadedServer.ip).toEqual(server1.ip);
    expect(loadedServer.numOpenPortsRequired).toEqual(server1.numOpenPortsRequired);
  });
});

describe("ipExists", () => {
  beforeEach(() => {
    prestigeAllServers();
  });

  it("returns true for an IP that exists in AllServers", () => {
    const server = new Server({ hostname: "test-server", ip: "10.20.30.40" as IPAddress });
    AddToAllServers(server);
    expect(ipExists("10.20.30.40")).toBe(true);
  });

  it("returns false for an IP that does not exist", () => {
    expect(ipExists("99.99.99.99")).toBe(false);
  });

  it("does not use linear scan (performance: uses Map.has, not iteration)", () => {
    // Add a server so the map is non-empty
    const server = new Server({ hostname: "perf-test", ip: "1.1.1.1" as IPAddress });
    AddToAllServers(server);

    // Spy on Map.prototype.values to detect if ipExists iterates
    const valuesSpy = jest.spyOn(Map.prototype, "values");

    ipExists("1.1.1.1");
    ipExists("2.2.2.2");

    // With the fix (Map.has), values() should NOT be called by ipExists
    // With the bug (for...of iteration), values() WOULD be called
    expect(valuesSpy).not.toHaveBeenCalled();

    valuesSpy.mockRestore();
  });
});

describe("renameServer tests", () => {
  it("rename to self edge case", () => {
    prestigeAllServers();
    expect(GetAllServers(true)).toEqual([]);

    const home = new Server({ hostname: "home", ip: "1.2.3.4" as IPAddress });
    AddToAllServers(home);
    // Failures of toEqual will report badly, due to a Jest bug involving our use of JSONMap.
    // The context is similar to this issue: https://github.com/hapijs/joi/issues/2350
    // I didn't run it all the way down, because it only affects error-reporting, not the comparison,
    // so everything is fine when tests are passing.
    expect(GetAllServers(true)).toEqual([home]);

    renameServer("home", "home");
    expect(GetAllServers(true)).toEqual([home]);
    expect(GetServer("home")).toBe(home);
    expect(GetServer("1.2.3.4")).toBe(home);
  });
});

describe("initForeignServers seeds discoverable scripts onto the right servers", () => {
  initGameEnvironment();

  beforeAll(() => {
    setupBasicTestingEnvironment();
  });

  const seededMetadata = serverMetadata.filter((m) => m.discoverableScripts && m.discoverableScripts.length > 0);

  it.each(seededMetadata.map((m) => [m.hostname, m.discoverableScripts]))(
    "places discoverable scripts on %s",
    (hostname, scriptNames) => {
      const server = GetServerOrThrow(hostname);
      for (const scriptName of scriptNames) {
        const path = resolveScriptFilePath(scriptName);
        if (!path) throw new Error(`Missing script ${scriptName} on ${hostname}`);
        const script = server.scripts.get(path);
        expect(script).toBeDefined();
        expect(script?.code).toBe(discoverableNetworkScripts[scriptName].content);
        expect(script?.server).toBe(hostname);
      }
    },
  );
});
