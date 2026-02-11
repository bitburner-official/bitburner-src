import {
  AddToAllServers,
  GetAllServers,
  loadAllServers,
  prestigeAllServers,
  saveAllServers,
  renameServer,
  GetServer,
} from "../../../src/Server/AllServers";
import { Server } from "../../../src/Server/Server";
import { IPAddress } from "../../../src/Types/strings";

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

describe("renameServer tests", () => {
  it("rename to self edge case", () => {
    prestigeAllServers();
    expect(GetAllServers(true)).toEqual([]);

    const home = new Server({ hostname: "home", ip: "1.2.3.4" as IPAddress });
    AddToAllServers(home);
    // Failures of toEqual will report badly, due to a Jest bug involving our use of JSONMap.
    expect(GetAllServers(true)).toEqual([home]);

    renameServer("home", "home");
    expect(GetAllServers(true)).toEqual([home]);
    expect(GetServer("home")).toBe(home);
    expect(GetServer("1.2.3.4")).toBe(home);
  });
});
