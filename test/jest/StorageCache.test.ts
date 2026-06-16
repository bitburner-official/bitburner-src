import type { ContentFilePath } from "../../src/Paths/ContentFile";
import type { ScriptFilePath } from "../../src/Paths/ScriptFilePath";
import type { IPAddress } from "../../src/Types/strings";
import {
  cacheContentFile,
  recacheContentFile,
  moveCacheOwner,
  deleteContentFile,
  getStorageCacheSaveData,
  clearStorageCache,
} from "../../src/utils/helpers/storageCache";
import {
  AddToAllServers,
  GetServerOrThrow,
  loadAllServers,
  prestigeAllServers,
  saveAllServers,
} from "../../src/Server/AllServers";
import { Server } from "../../src/Server/Server";

const FILE_A = "a.js" as ContentFilePath;
const FILE_B = "b.js" as ContentFilePath;

beforeEach(() => clearStorageCache());

describe("storageCache helper — dedup & owners", () => {
  test("identical content from two files shares one entry, stored once", () => {
    const e1 = cacheContentFile("home", FILE_A, "CODE");
    const e2 = cacheContentFile("n00dles", FILE_A, "CODE");
    expect(e2).toBe(e1); // same content => the very same entry instance

    const save = getStorageCacheSaveData();
    expect(save).toHaveLength(1);
    expect(save[0].content).toBe("CODE");
    expect(save[0].owners).toEqual([
      { server: "home", filename: FILE_A },
      { server: "n00dles", filename: FILE_A },
    ]);
  });

  test("different content produces separate entries", () => {
    cacheContentFile("home", FILE_A, "ONE");
    cacheContentFile("home", FILE_B, "TWO");
    expect(getStorageCacheSaveData()).toHaveLength(2);
  });

  test("re-adding the exact same owner throws", () => {
    cacheContentFile("home", FILE_A, "CODE");
    expect(() => cacheContentFile("home", FILE_A, "CODE")).toThrow(/already exists/);
  });
});

describe("storageCache helper — eviction", () => {
  test("an entry is dropped only when its last owner is removed", () => {
    cacheContentFile("home", FILE_A, "CODE");
    cacheContentFile("n00dles", FILE_A, "CODE");

    deleteContentFile("home", FILE_A, "CODE");
    const afterFirst = getStorageCacheSaveData();
    expect(afterFirst).toHaveLength(1); // one owner remains -> entry survives
    expect(afterFirst[0].owners).toEqual([{ server: "n00dles", filename: FILE_A }]);

    deleteContentFile("n00dles", FILE_A, "CODE");
    expect(getStorageCacheSaveData()).toHaveLength(0); // last owner gone -> entry removed
  });

  test("deleting an owner under the wrong content throws", () => {
    cacheContentFile("home", FILE_A, "CODE");
    expect(() => deleteContentFile("home", FILE_A, "OTHER")).toThrow(/does not exist/);
  });
});

describe("storageCache helper — in-place edit (recache)", () => {
  test("editing content moves the owner and frees the old content", () => {
    cacheContentFile("home", FILE_A, "OLD");
    recacheContentFile("home", FILE_A, "OLD", "NEW");

    const save = getStorageCacheSaveData();
    expect(save).toEqual([{ content: "NEW", owners: [{ server: "home", filename: FILE_A }] }]);
  });

  test("editing one of two shared files splits it off without evicting the shared content", () => {
    cacheContentFile("home", FILE_A, "SHARED");
    cacheContentFile("n00dles", FILE_A, "SHARED");

    recacheContentFile("home", FILE_A, "SHARED", "EDITED");

    const save = getStorageCacheSaveData().sort((a, b) => a.content.localeCompare(b.content));
    expect(save).toEqual([
      { content: "EDITED", owners: [{ server: "home", filename: FILE_A }] },
      { content: "SHARED", owners: [{ server: "n00dles", filename: FILE_A }] },
    ]);
  });
});

describe("storageCache helper — rename / server move", () => {
  test("renaming keeps the content and updates the owner key", () => {
    cacheContentFile("home", FILE_A, "CODE");
    moveCacheOwner("home", FILE_A, "home", FILE_B, "CODE");
    expect(getStorageCacheSaveData()).toEqual([{ content: "CODE", owners: [{ server: "home", filename: FILE_B }] }]);
  });
});

describe("storageCache helper — key encoding", () => {
  test("owners round-trip even when the server name contains a newline", () => {
    // Keys are `${filename}\n${server}`; the filename never contains a newline, so the split is unambiguous.
    const weirdServer = "ser\nver";
    cacheContentFile(weirdServer, FILE_A, "CODE");
    expect(getStorageCacheSaveData()[0].owners).toEqual([{ server: weirdServer, filename: FILE_A }]);
  });

  test("empty content is cached and shared like any other content", () => {
    const e1 = cacheContentFile("home", FILE_A, "");
    const e2 = cacheContentFile("home", FILE_B, "");
    expect(e2).toBe(e1);
    expect(getStorageCacheSaveData()).toEqual([
      {
        content: "",
        owners: [
          { server: "home", filename: FILE_A },
          { server: "home", filename: FILE_B },
        ],
      },
    ]);
  });
});

describe("storageCache save / load integration", () => {
  const WORM = "worm.js" as ScriptFilePath;
  const CODE = "export function main(ns) {}";

  // saveAllServers() is now a bare server map; the cache rides in a separate string. Typed only for what we read.
  type ServersSave = Record<string, { data: { scripts: { data: [string, { data: Record<string, unknown> }][] } } }>;

  beforeEach(() => {
    prestigeAllServers(); // clears AllServers + storageCache
    AddToAllServers(new Server({ hostname: "alpha", ip: "1.1.1.1" as IPAddress }));
    AddToAllServers(new Server({ hostname: "beta", ip: "2.2.2.2" as IPAddress }));
  });

  function codeOf(host: string): string {
    const script = GetServerOrThrow(host).scripts.get(WORM);
    if (!script) throw new Error(`no script ${WORM} on ${host}`);
    return script.code;
  }

  test("identical scripts on two servers dedupe to one shared content string", () => {
    GetServerOrThrow("alpha").writeToScriptFile(WORM, CODE);
    GetServerOrThrow("beta").writeToScriptFile(WORM, CODE);

    expect(codeOf("alpha")).toBe(CODE);
    expect(codeOf("alpha")).toBe(codeOf("beta")); // same string instance, not just equal value

    const cache = getStorageCacheSaveData();
    expect(cache).toHaveLength(1);
    expect(cache[0].owners).toHaveLength(2);
  });

  test("the server save omits inline code; content lives once in the separate cache save", () => {
    GetServerOrThrow("alpha").writeToScriptFile(WORM, CODE);
    GetServerOrThrow("beta").writeToScriptFile(WORM, CODE);

    // Content is stored once in the cache save...
    const cacheSave = getStorageCacheSaveData();
    expect(cacheSave).toHaveLength(1);
    expect(cacheSave[0].content).toBe(CODE);

    // ...and each per-server script object no longer carries its own copy.
    const servers = JSON.parse(saveAllServers()) as ServersSave;
    const scriptEntry = servers.alpha.data.scripts.data.find(([name]) => name === WORM);
    expect(scriptEntry).toBeDefined();
    expect(scriptEntry?.[1].data).not.toHaveProperty("code");
  });

  test("round-trips through the two save strings, preserving sharing", () => {
    GetServerOrThrow("alpha").writeToScriptFile(WORM, CODE);
    GetServerOrThrow("beta").writeToScriptFile(WORM, CODE);

    const serversSave = saveAllServers();
    const cacheSave = JSON.stringify(getStorageCacheSaveData());
    loadAllServers(serversSave, cacheSave);

    expect(codeOf("alpha")).toBe(CODE);
    expect(codeOf("alpha")).toBe(codeOf("beta")); // still one shared instance after load
    expect(getStorageCacheSaveData()).toHaveLength(1);
  });

  test("loads a legacy save (inline code, no cache string) and re-dedupes it", () => {
    GetServerOrThrow("alpha").writeToScriptFile(WORM, CODE);
    GetServerOrThrow("beta").writeToScriptFile(WORM, CODE);

    // Reconstruct a pre-dedup save: inline the code back onto each script, drop the cache save entirely.
    const servers = JSON.parse(saveAllServers()) as ServersSave;
    for (const entry of getStorageCacheSaveData()) {
      for (const owner of entry.owners) {
        const scriptEntry = servers[owner.server].data.scripts.data.find(([name]) => name === owner.filename);
        if (scriptEntry) scriptEntry[1].data.code = entry.content;
      }
    }

    loadAllServers(JSON.stringify(servers)); // no cache string => legacy path

    expect(codeOf("alpha")).toBe(CODE);
    expect(codeOf("alpha")).toBe(codeOf("beta")); // inline code read through the setter and re-shared
    expect(getStorageCacheSaveData()).toHaveLength(1);
  });
});
