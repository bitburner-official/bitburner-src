import { resolveScriptFilePath, type ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { Script } from "../../../src/Script/Script";
import { Server } from "../../../src/Server/Server";

const code = `/** @param {NS} ns */
export async function main(ns) {
	ns.print(ns.getWeakenTime('n00dles'));
}`;

describe("Validate Save Script Works", function () {
  it("Save", function () {
    const hostname = "TestServer";
    const server = new Server({ hostname });
    const filename = resolveScriptFilePath("test.js");
    if (!filename) throw new Error("Could not resolve hardcoded filepath.");

    server.writeToContentFile(filename, code);
    const script = server.scripts.get(filename);
    if (!script) throw new Error("Script was not saved.");

    expect(script.filename).toEqual(filename);
    expect(script.code).toEqual(code);
    expect(script.server).toEqual(hostname);
  });
});

describe("RAM usage cache invalidation", () => {
  const asPath = (path: string) => path as ScriptFilePath;
  const noRamCode = `export function func(ns) { return ns.args.length; }`;
  const hackRamCode = `export function func(ns) { return ns.hack("n00dles"); }`;
  const growRamCode = `export function func(ns) { return ns.grow("n00dles"); }`;

  function makeScripts(entries: [string, string][]): Map<ScriptFilePath, Script> {
    return new Map(
      entries.map(([filename, scriptCode]) => [asPath(filename), new Script(asPath(filename), scriptCode)]),
    );
  }

  it("invalidates a cached importer when an uncompiled dependency changes", () => {
    const scripts = makeScripts([
      ["main.js", `import { func } from "b.js"; export function main(ns) { return func(ns); }`],
      ["b.js", noRamCode],
      ["independent.js", `export function main(ns) { return ns.args.length; }`],
    ]);
    const main = scripts.get(asPath("main.js"));
    const dependency = scripts.get(asPath("b.js"));
    const independent = scripts.get(asPath("independent.js"));
    if (!main || !dependency || !independent) throw new Error("Missing test script");

    const initialRam = main.getRamUsage(scripts);
    const independentRam = independent.getRamUsage(scripts);
    expect(initialRam).not.toBeNull();
    expect(independentRam).not.toBeNull();
    expect(main.mod).toBeNull();
    expect(dependency.mod).toBeNull();

    dependency.content = hackRamCode;

    expect(main.ramUsage).toBeNull();
    expect(independent.ramUsage).toBe(independentRam);
    expect(main.getRamUsage(scripts)).toBeGreaterThan(initialRam ?? 0);
  });

  it("tracks transitive imports", () => {
    const scripts = makeScripts([
      ["main.js", `import { func } from "b.js"; export function main(ns) { return func(ns); }`],
      ["b.js", `import { func as inner } from "c.js"; export function func(ns) { return inner(ns); }`],
      ["c.js", noRamCode],
    ]);
    const main = scripts.get(asPath("main.js"));
    const dependency = scripts.get(asPath("c.js"));
    if (!main || !dependency) throw new Error("Missing test script");

    const initialRam = main.getRamUsage(scripts);
    expect(initialRam).not.toBeNull();

    dependency.content = hackRamCode;
    expect(main.ramUsage).toBeNull();
    expect(main.getRamUsage(scripts)).toBeGreaterThan(initialRam ?? 0);
  });

  it("tracks multiple imports and supports repeated invalidation", () => {
    const scripts = makeScripts([
      [
        "main.js",
        `import { func as b } from "b.js"; import { func as c } from "c.js"; export function main(ns) { b(ns); return c(ns); }`,
      ],
      ["b.js", noRamCode],
      ["c.js", noRamCode],
    ]);
    const main = scripts.get(asPath("main.js"));
    const b = scripts.get(asPath("b.js"));
    const c = scripts.get(asPath("c.js"));
    if (!main || !b || !c) throw new Error("Missing test script");

    const initialRam = main.getRamUsage(scripts);
    expect(initialRam).not.toBeNull();

    b.content = hackRamCode;
    expect(main.ramUsage).toBeNull();
    const afterFirstEdit = main.getRamUsage(scripts);
    expect(afterFirstEdit).toBeGreaterThan(initialRam ?? 0);

    c.content = growRamCode;
    expect(main.ramUsage).toBeNull();
    expect(main.getRamUsage(scripts)).toBeGreaterThan(afterFirstEdit ?? 0);

    c.invalidateModule();
    c.invalidateModule();
    expect(main.ramUsage).toBeNull();
  });

  it("removes stale dependency edges when an importer changes imports", () => {
    const scripts = makeScripts([
      ["main.js", `import { func } from "b.js"; export function main(ns) { return func(ns); }`],
      ["b.js", noRamCode],
      ["c.js", hackRamCode],
    ]);
    const main = scripts.get(asPath("main.js"));
    const b = scripts.get(asPath("b.js"));
    const c = scripts.get(asPath("c.js"));
    if (!main || !b || !c) throw new Error("Missing test script");

    expect(main.getRamUsage(scripts)).not.toBeNull();
    expect(b.dependents).toEqual(new Set([main]));

    main.content = `import { func } from "c.js"; export function main(ns) { return func(ns); }`;
    const currentRam = main.getRamUsage(scripts);
    expect(currentRam).not.toBeNull();
    expect(b.dependents).not.toContain(main);
    expect(c.dependents).toContain(main);

    b.content = growRamCode;
    expect(main.ramUsage).toBe(currentRam);
  });

  it("does not retain deleted importers across same-name recreation", () => {
    const server = new Server({ hostname: "home" });
    const mainPath = asPath("main.js");
    const dependencyPath = asPath("b.js");
    server.writeToScriptFile(dependencyPath, noRamCode);
    const dependency = server.scripts.get(dependencyPath);
    if (!dependency) throw new Error("Missing dependency script");

    const deletedImporters: Script[] = [];
    for (let i = 0; i < 5; i++) {
      server.writeToScriptFile(
        mainPath,
        `import { func } from "b.js"; export function main(ns) { return func(ns) + ${i}; }`,
      );
      const importer = server.scripts.get(mainPath);
      if (!importer) throw new Error("Missing importer script");
      expect(importer.getRamUsage(server.scripts)).not.toBeNull();
      expect(dependency.dependents).toEqual(new Set([importer]));

      deletedImporters.push(importer);
      expect(server.removeFile(mainPath)).toEqual({ res: true });
      expect(dependency.dependents.size).toBe(0);
      expect(dependency.dependents).not.toContain(importer);
    }

    server.writeToScriptFile(mainPath, `import { func } from "b.js"; export function main(ns) { return func(ns); }`);
    const replacement = server.scripts.get(mainPath);
    if (!replacement) throw new Error("Missing replacement script");
    expect(replacement.getRamUsage(server.scripts)).not.toBeNull();
    expect(dependency.dependents).toEqual(new Set([replacement]));
    for (const deletedImporter of deletedImporters) expect(dependency.dependents).not.toContain(deletedImporter);
  });

  it("invalidates an importer when a dependency is deleted and binds to the recreated object", () => {
    const server = new Server({ hostname: "home" });
    const mainPath = asPath("main.js");
    const dependencyPath = asPath("b.js");
    server.writeToScriptFile(mainPath, `import { func } from "b.js"; export function main(ns) { return func(ns); }`);
    server.writeToScriptFile(dependencyPath, noRamCode);
    const main = server.scripts.get(mainPath);
    const oldDependency = server.scripts.get(dependencyPath);
    if (!main || !oldDependency) throw new Error("Missing test script");

    const initialRam = main.getRamUsage(server.scripts);
    expect(initialRam).not.toBeNull();
    expect(server.removeFile(dependencyPath)).toEqual({ res: true });
    expect(main.ramUsage).toBeNull();
    expect(oldDependency.dependents.size).toBe(0);

    server.writeToScriptFile(dependencyPath, hackRamCode);
    const newDependency = server.scripts.get(dependencyPath);
    if (!newDependency) throw new Error("Missing recreated dependency");
    expect(newDependency).not.toBe(oldDependency);
    expect(main.getRamUsage(server.scripts)).toBeGreaterThan(initialRam ?? 0);
    expect(oldDependency.dependents.size).toBe(0);
    expect(newDependency.dependents).toEqual(new Set([main]));
  });

  it("tracks diamond imports without retaining duplicate edges", () => {
    const scripts = makeScripts([
      [
        "a.js",
        `import { funcB } from "b.js"; import { funcC } from "c.js"; export function main(ns) { funcB(ns); return funcC(ns); }`,
      ],
      ["b.js", `import { func } from "d.js"; export function funcB(ns) { return func(ns); }`],
      ["c.js", `import { func } from "d.js"; export function funcC(ns) { return func(ns); }`],
      ["d.js", noRamCode],
    ]);
    const a = scripts.get(asPath("a.js"));
    const b = scripts.get(asPath("b.js"));
    const c = scripts.get(asPath("c.js"));
    const d = scripts.get(asPath("d.js"));
    if (!a || !b || !c || !d) throw new Error("Missing test script");

    const initialRam = a.getRamUsage(scripts);
    expect(initialRam).not.toBeNull();
    expect(d.dependents).toEqual(new Set([b, c]));

    d.content = hackRamCode;
    expect(a.ramUsage).toBeNull();
    expect(a.getRamUsage(scripts)).toBeGreaterThan(initialRam ?? 0);
    expect(d.dependents).toEqual(new Set([b, c]));
  });

  it("ignores self dependencies and keeps repeated RAM queries bounded", () => {
    const scripts = makeScripts([["a.js", `import "a.js"; export function main(ns) { return ns.args.length; }`]]);
    const a = scripts.get(asPath("a.js"));
    if (!a) throw new Error("Missing test script");

    expect(a.getRamUsage(scripts)).not.toBeNull();
    expect(a.getRamUsage(scripts)).not.toBeNull();
    a.updateRamUsage(scripts);
    expect(a.dependents.size).toBe(0);
  });

  it("commits no partial graph on failure and preserves an old graph during a direct failed recalculation", () => {
    const scripts = makeScripts([
      ["main.js", `import { func } from "b.js"; export function main(ns) { return func(ns); }`],
      ["b.js", noRamCode],
    ]);
    const main = scripts.get(asPath("main.js"));
    const b = scripts.get(asPath("b.js"));
    if (!main || !b) throw new Error("Missing test script");

    expect(main.getRamUsage(scripts)).not.toBeNull();
    expect(b.dependents).toEqual(new Set([main]));

    main.code = `import { func } from "b.js"; import { missing } from "missing.js"; export function main(ns) { return func(ns) + missing(ns); }`;
    main.updateRamUsage(scripts);
    expect(main.ramUsage).toBeNull();
    expect(b.dependents).toEqual(new Set([main]));

    main.code = `import { func } from "b.js"; export function main(ns) { return func(ns); }`;
    main.updateRamUsage(scripts);
    expect(main.ramUsage).not.toBeNull();
    expect(b.dependents).toEqual(new Set([main]));
  });

  it("keeps RAM and compile edge ownership independent", () => {
    const scripts = makeScripts([
      ["main.js", `import { func } from "b.js"; export function main(ns) { return func(ns); }`],
      ["b.js", noRamCode],
      ["c.js", hackRamCode],
    ]);
    const main = scripts.get(asPath("main.js"));
    const b = scripts.get(asPath("b.js"));
    const c = scripts.get(asPath("c.js"));
    if (!main || !b || !c) throw new Error("Missing test script");

    expect(main.getRamUsage(scripts)).not.toBeNull();
    main.registerModuleDependency(b);

    main.code = `import { func } from "c.js"; export function main(ns) { return func(ns); }`;
    main.updateRamUsage(scripts);
    expect(b.dependents).toContain(main);
    expect(c.dependents).toContain(main);

    main.clearModuleDependencies();
    expect(b.dependents).not.toContain(main);
    expect(c.dependents).toContain(main);

    main.invalidateModule();
    expect(c.dependents).not.toContain(main);
  });

  it("detaches the old object when a script is renamed through its real lifecycle", () => {
    const server = new Server({ hostname: "home" });
    const sourcePath = asPath("main.js");
    const destinationPath = asPath("renamed.js");
    const dependencyPath = asPath("b.js");
    server.writeToScriptFile(dependencyPath, noRamCode);
    server.writeToScriptFile(sourcePath, `import { func } from "b.js"; export function main(ns) { return func(ns); }`);
    const dependency = server.scripts.get(dependencyPath);
    const oldImporter = server.scripts.get(sourcePath);
    if (!dependency || !oldImporter) throw new Error("Missing test script");

    expect(oldImporter.getRamUsage(server.scripts)).not.toBeNull();
    const content = oldImporter.content;
    expect(oldImporter.deleteFromServer(server)).toBe(true);
    server.writeToScriptFile(destinationPath, content);
    const renamedImporter = server.scripts.get(destinationPath);
    if (!renamedImporter) throw new Error("Missing renamed script");
    expect(renamedImporter).not.toBe(oldImporter);
    expect(renamedImporter.getRamUsage(server.scripts)).not.toBeNull();
    expect(dependency.dependents).toEqual(new Set([renamedImporter]));
    expect(dependency.dependents).not.toContain(oldImporter);
  });

  it("drops an invalidated old graph before a failed calculation", () => {
    const scripts = makeScripts([
      ["main.js", `import { func } from "b.js"; export function main(ns) { return func(ns); }`],
      ["b.js", noRamCode],
    ]);
    const main = scripts.get(asPath("main.js"));
    const b = scripts.get(asPath("b.js"));
    if (!main || !b) throw new Error("Missing test script");

    expect(main.getRamUsage(scripts)).not.toBeNull();
    expect(b.dependents).toContain(main);

    main.content = `import { func } from "b.js"; export function main(ns) {`;
    expect(b.dependents).not.toContain(main);
    expect(main.getRamUsage(scripts)).toBeNull();
    expect(b.dependents).not.toContain(main);
  });

  it("terminates invalidation for a circular import graph", () => {
    const scripts = makeScripts([
      [
        "a.js",
        `import { funcB } from "b.js"; export function funcA(ns) { return ns.args.length; } export function main(ns) { return funcB(ns); }`,
      ],
      ["b.js", `import { funcA } from "a.js"; export function funcB(ns) { funcA(ns); return ns.args.length; }`],
    ]);
    const a = scripts.get(asPath("a.js"));
    const b = scripts.get(asPath("b.js"));
    if (!a || !b) throw new Error("Missing test script");

    expect(a.getRamUsage(scripts)).not.toBeNull();
    expect(a.mod).toBeNull();
    expect(b.mod).toBeNull();

    expect(() => {
      b.content = hackRamCode;
    }).not.toThrow();
    expect(a.ramUsage).toBeNull();
  });
});
