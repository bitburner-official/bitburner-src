import { Player } from "../../../src/Player";
import { NetscriptFunctions, type NSFull } from "../../../src/NetscriptFunctions";
import { RamCosts, getRamCost, RamCostConstants, type RamCostTree } from "../../../src/Netscript/RamCostGenerator";
import { RunningScript } from "../../../src/Script/RunningScript";
import { Script } from "../../../src/Script/Script";
import type { WorkerScript } from "../../../src/Netscript/WorkerScript";
import { calculateRamUsage } from "../../../src/Script/RamCalculations";
import { ns } from "../../../src/NetscriptFunctions";
import type { InternalAPI } from "../../../src/Netscript/APIWrapper";
import type { Singularity } from "@nsdefs";
import type { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";

type PotentiallyAsyncFunction = (arg?: unknown) => { catch?: PotentiallyAsyncFunction };

/** Get a potentiallyAsyncFunction from a layer of the external ns */
function getFunction(fn: unknown) {
  if (typeof fn !== "function") throw new Error("Expected a function at this location.");
  return fn as PotentiallyAsyncFunction;
}
function grabCost<API>(ramEntry: RamCostTree<API>[keyof API]) {
  if (typeof ramEntry === "function") return ramEntry();
  if (typeof ramEntry === "number") return ramEntry;
  throw new Error("Invalid ramcost: " + String(ramEntry));
}

describe("Netscript RAM Calculation/Generation Tests", function () {
  Player.sourceFiles.set(4, 3);
  // For simulating costs of singularity functions.
  const baseCost = RamCostConstants.Base;
  const maxCost = RamCostConstants.Max;
  const script = new Script();
  /** Creates a RunningScript object which calculates static ram usage */
  function createRunningScript(code: string) {
    script.code = code;
    // Force ram calculation reset
    script.ramUsage = null;
    const ramUsage = script.getRamUsage(new Map());
    if (!ramUsage) throw new Error("Ram usage should be defined.");
    const runningScript = new RunningScript(script, ramUsage);
    return runningScript;
  }

  /** Runs a Netscript function and properly catches an error even if it returns promise. */
  function tryFunction(fn: PotentiallyAsyncFunction) {
    try {
      fn()?.catch?.(() => undefined);
    } catch {
      // Intentionally empty
    }
  }

  let scriptRef = createRunningScript("");
  //Since it is expensive to create a workerscript and wrap the ns API, this is done once
  const workerScript = {
    args: [] as string[],
    code: "",
    delay: null,
    dynamicLoadedFns: {},
    dynamicRamUsage: RamCostConstants.Base,
    stopFlag: false,
    runningFn: "",
    vars: null as NSFull | null,
    ramUsage: scriptRef.ramUsage,
    scriptRef,
  };
  const nsExternal = NetscriptFunctions(workerScript as unknown as WorkerScript);

  function combinedRamCheck(
    fn: PotentiallyAsyncFunction,
    fnPath: string[],
    expectedRamCost: number,
    extraLayerCost = 0,
  ) {
    const code = `${fnPath.join(".")}();\n`.repeat(3);
    const fnName = fnPath[fnPath.length - 1];
    const server = "testserver";

    //check imported getRamCost fn vs. expected ram from test
    expect(getRamCost(fnPath, true)).toEqual(expectedRamCost);

    // Static ram check
    const staticCost = calculateRamUsage(code, `${fnName}.js` as ScriptFilePath, server, new Map()).cost;
    expect(staticCost).toBeCloseTo(Math.min(baseCost + expectedRamCost + extraLayerCost, maxCost));

    // reset workerScript for dynamic check
    scriptRef = createRunningScript(code);
    Object.assign(workerScript, {
      code,
      scriptRef,
      ramUsage: scriptRef.ramUsage,
      dynamicRamUsage: baseCost,
      stopFlag: false,
      runningFn: "",
      dynamicLoadedFns: {},
    });
    workerScript.vars = nsExternal;

    // Run the function through the workerscript's args
    const fnPathAsString = fnPath.join(".");
    if (typeof fn === "function") {
      let consoleError;
      let consoleWarning;
      if (fnPathAsString === "ui.setTheme" || fnPathAsString === "ui.setStyles") {
        consoleError = jest.spyOn(console, "error").mockImplementation(jest.fn());
      }
      if (fnPathAsString === "alterReality") {
        consoleWarning = jest.spyOn(console, "warn").mockImplementation(jest.fn());
      }
      tryFunction(fn);
      tryFunction(fn);
      tryFunction(fn);
      consoleError?.mockRestore();
      consoleWarning?.mockRestore();
    } else {
      throw new Error(`Invalid function specified: [${fnPathAsString}]`);
    }

    if (expectedRamCost !== 0) {
      expect(workerScript.dynamicLoadedFns).toHaveProperty(fnName);
    }
    expect(workerScript.dynamicRamUsage).toBeCloseTo(Math.min(expectedRamCost + baseCost, maxCost), 5);
    expect(workerScript.dynamicRamUsage).toBeCloseTo(scriptRef.ramUsage - extraLayerCost, 5);
  }

  describe("ns", () => {
    function testLayer<API>(
      internalLayer: InternalAPI<API>,
      externalLayer: API,
      ramLayer: RamCostTree<API>,
      path: string[],
      extraLayerCost: number,
    ) {
      describe(path[path.length - 1] ?? "Base ns layer", () => {
        for (const [key, val] of Object.entries(internalLayer) as [keyof API, InternalAPI<API>[keyof API]][]) {
          const newPath = [...path, key as string];
          if (typeof val === "function") {
            const fn = getFunction(externalLayer[key]);
            const fnName = newPath.join(".");
            if (!(key in ramLayer)) {
              throw new Error("Missing ramcost for " + fnName);
            }
            const expectedRam = grabCost(ramLayer[key]);
            it(`${fnName}()`, () => combinedRamCheck(fn, newPath, expectedRam, extraLayerCost));
          }
          // A layer should be the only other option, but we don't have any of those with a cost.
          // Other things like args, enums, etc. have no cost.
        }
      });
    }
    testLayer(ns, nsExternal, RamCosts, [], 0);
  });

  describe("Singularity multiplier checks", () => {
    // Checks were already done above for SF4.3 having normal ramcost.
    Player.sourceFiles.set(4, 3);
    const lvlToMult = { 0: 16, 1: 16, 2: 4 };
    const externalSingularity = nsExternal.singularity;
    const ramCostSingularity = RamCosts.singularity;
    const singObjects = (
      Object.entries(ns.singularity) as [keyof Singularity, InternalAPI<Singularity>[keyof Singularity]][]
    )
      .filter(([__, v]) => typeof v === "function")
      .map(([name]) => {
        return {
          name,
          baseRam: grabCost<Singularity>(ramCostSingularity[name]),
        };
      });
    for (const lvl of [0, 1, 2] as const) {
      it(`SF4.${lvl} check for x${lvlToMult[lvl]} costs`, () => {
        Player.sourceFiles.set(4, lvl);
        const expectedMult = lvlToMult[lvl];
        singObjects.forEach(({ name, baseRam }) => {
          const fn = getFunction(externalSingularity[name]);
          combinedRamCheck(fn, ["singularity", name], baseRam * expectedMult);
        });
      });
    }
  });

  /**
   * Static RAM is a safe upper bound for what the runtime dynamic RAM meter can observe
   * (see `updateDynamicRam` in NetscriptHelpers). These scenarios are regression tests for
   * false negatives: if static analysis under-counts, `dynamicRamUsage` exceeds allocation
   * and the worker is killed with "Insufficient static ram available."
   */
  describe("static RAM allocation vs dynamic RAM meter (false-negative guard)", () => {
    /** Must match the multiplier in `NetscriptHelpers.updateDynamicRam`. */
    const dynamicStaticRamEpsilon = 1.00000000000001;

    const fnMainPath = "testfile.js" as ScriptFilePath;
    const fnFolderMainPath = "test/testfile.js" as ScriptFilePath;
    const fnServer = "testserver";
    /** Matches `StaticRamParsingCalculation.test.ts` main module paths for import resolution. */
    const scriptForFnMain = new Script(fnMainPath, "", fnServer);
    const scriptForFnFolder = new Script(fnFolderMainPath, "", fnServer);

    /** Invoke Netscript like tryFunction, but allow sync / Promise / arbitrary return types. */
    function safeInvoke(fn: () => unknown): void {
      try {
        const out = fn();
        if (out != null && typeof (out as Promise<unknown>).then === "function") {
          (out as Promise<unknown>).catch(() => undefined);
        }
      } catch {
        // intentionally empty
      }
    }

    function assertStaticCoversDynamic(
      code: string,
      exerciseDynamicRam: (ns: typeof nsExternal) => void,
      options?: { otherScripts?: Map<ScriptFilePath, Script>; scriptForRam?: Script },
    ): void {
      const scriptForRam = options?.scriptForRam ?? scriptForFnMain;
      const otherScripts = options?.otherScripts ?? new Map<ScriptFilePath, Script>();
      scriptForRam.code = code;
      scriptForRam.ramUsage = null;
      const ramUsage = scriptForRam.getRamUsage(otherScripts);
      if (ramUsage == null) {
        throw new Error(`Static RAM failed: ${scriptForRam.ramCalculationError ?? "unknown"}`);
      }

      scriptRef = new RunningScript(scriptForRam, ramUsage);
      Object.assign(workerScript, {
        code,
        scriptRef,
        ramUsage: scriptRef.ramUsage,
        dynamicRamUsage: RamCostConstants.Base,
        env: new Environment(),
        dynamicLoadedFns: {},
      });
      workerScript.env.vars = nsExternal;

      exerciseDynamicRam(nsExternal);

      expect(workerScript.dynamicRamUsage).toBeLessThanOrEqual(scriptRef.ramUsage * dynamicStaticRamEpsilon);
    }

    it("gang namespace alias: g.getMemberInformation('').hack + g.getAscensionResult('').hack", () => {
      const code = `
        export async function main(ns) {
          const g = ns.gang;
          g.getMemberInformation('').hack;
          g.getAscensionResult('').hack;
        }
      `;
      assertStaticCoversDynamic(code, (ns) => {
        const g = ns.gang;
        if (g == null) throw new Error("expected ns.gang in test harness");
        try {
          g.getMemberInformation("");
        } catch {
          // RAM is charged before the implementation throws without a gang.
        }
        try {
          g.getAscensionResult("");
        } catch {
          // same
        }
      });
    });

    it("gang direct member chain: ns.gang.getMemberInformation('').hack (no top-level hack)", () => {
      const code = `
        export async function main(ns) {
          ns.gang.getMemberInformation('').hack;
          ns.gang.getAscensionResult('').hack;
        }
      `;
      assertStaticCoversDynamic(code, (ns) => {
        const gang = ns.gang;
        if (gang == null) throw new Error("expected ns.gang in test harness");
        try {
          gang.getMemberInformation("");
        } catch {
          // same as alias case
        }
        try {
          gang.getAscensionResult("");
        } catch {
          // same
        }
      });
    });

    it('bracket call ns["hack"] after void ns.hack reference (static must include hack once)', () => {
      const code = `
export async function main(ns) {
  void ns.hack;
  const host = "n00dles";
  await ns["hack"](host);
}
`;
      assertStaticCoversDynamic(code, (ns) => {
        void ns.hack;
        try {
          void ns["hack"]("n00dles");
        } catch {
          // hack can throw for game-state reasons; RAM is already accounted for.
        }
      });
    });

    it("renamed main param X: await X.hack (same dynamic as ns.hack)", () => {
      const code = `
        export async function main(X) {
          await X.hack("joesguns");
        }
      `;
      assertStaticCoversDynamic(code, (ns) => safeInvoke(() => ns.hack("joesguns")));
    });

    it("await ns.hack + await ns.grow in main", () => {
      const code = `
        export async function main(ns) {
          await ns.hack("joesguns");
          await ns.grow("joesguns");
        }
      `;
      assertStaticCoversDynamic(code, (ns) => {
        safeInvoke(() => ns.hack("joesguns"));
        safeInvoke(() => ns.grow("joesguns"));
      });
    });

    it("ns.hack inside helper function doHacking(ns)", () => {
      const code = `
        export async function main(ns) {
          doHacking(ns);
        }
        async function doHacking(ns) {
          await ns.hack("joesguns");
        }
      `;
      assertStaticCoversDynamic(code, (ns) => safeInvoke(() => ns.hack("joesguns")));
    });

    it("class Hacker: await this.ns.hack in method", () => {
      const code = `
        export async function main(ns) {
          await new Hacker(ns).doHacking();
        }
        class Hacker {
          ns;
          constructor(ns) { this.ns = ns; }
          async doHacking() { await this.ns.hack("joesguns"); }
        }
      `;
      assertStaticCoversDynamic(code, (ns) => safeInvoke(() => ns.hack("joesguns")));
    });

    it("class Hacker private #ns: await this.#ns.hack in method", () => {
      const code = `
        export async function main(ns) {
          await new Hacker(ns).doHacking();
        }
        class Hacker {
          #ns;
          constructor(ns) { this.#ns = ns; }
          async doHacking() { await this.#ns.hack("joesguns"); }
        }
      `;
      assertStaticCoversDynamic(code, (ns) => safeInvoke(() => ns.hack("joesguns")));
    });

    it("this.ns re-assigned to local const ns inside class method, then hack", () => {
      const code = `
        /** @param {NS} ns */
        export async function main(ns) {
          const foo = new Foo(ns);
          await foo.bar();
        }

        class Foo {
          constructor(ns) {
            this.ns = ns;
          }
          async bar() {
            const ns = this.ns;
            await ns.hack("n00dles");
          }
        }
      `;
      assertStaticCoversDynamic(code, (ns) => safeInvoke(() => ns.hack("n00dles")));
    });

    it("renamed ns param X wins over module-level var X", () => {
      const code = `
        export async function main(X) {
          await X.hack("joesguns");
        }
        var X;
      `;
      assertStaticCoversDynamic(code, (ns) => safeInvoke(() => ns.hack("joesguns")));
    });

    it("const _ns = ns then _ns.hack()", () => {
      const code = `
        /** @param {NS} ns */
        export async function main(ns) {
          const _ns = ns;
          _ns.hack();
        }
      `;
      assertStaticCoversDynamic(code, (ns) => safeInvoke(() => ns.hack()));
    });

    it("module-scope _ns assigned inside main then _ns.hack()", () => {
      const code = `
        let _ns;
        /** @param {NS} ns */
        export async function main(ns) {
          _ns = ns;
          _ns.hack();
        }
      `;
      assertStaticCoversDynamic(code, (ns) => safeInvoke(() => ns.hack()));
    });

    it("globalThis.ns set in main; foo() calls globalThis.ns.hack()", () => {
      const code = `
        /** @param {NS} ns */
        export async function main(ns) {
          globalThis.ns = ns;
          foo();
        }
        function foo() {
          globalThis.ns.hack();
        }
      `;
      assertStaticCoversDynamic(code, (ns) => {
        const g = globalThis as unknown as Record<string, unknown>;
        const prev = g.ns;
        g.ns = ns;
        try {
          safeInvoke(() => (g.ns as typeof ns).hack());
        } finally {
          if (prev !== undefined) g.ns = prev;
          else delete g.ns;
        }
      });
    });

    it("ns passed in object literal ctx.ns.hack in nested async function", () => {
      const code = `
        /** @param {NS} ns */
        export async function main(ns) {
          await foo({ ns, notImportant: "something" }, 42);
        }

        async function foo(ctx, alsoNotImportant) {
          await ctx.ns.hack("n00dles");
        }
      `;
      assertStaticCoversDynamic(code, (ns) => safeInvoke(() => ns.hack("n00dles")));
    });

    it("ns.alert(ns.gang.getMemberInformation(...).hack) — gang + alert, not top-level hack", () => {
      const code = `
        /** @param {NS} ns */
        export async function main(ns) {
          ns.alert(ns.gang.getMemberInformation("CoolGuy").hack);
        }
      `;
      assertStaticCoversDynamic(code, (ns) => {
        const gang = ns.gang;
        if (gang == null) throw new Error("expected ns.gang in test harness");
        try {
          gang.getMemberInformation("CoolGuy");
        } catch {
          // charged before throw
        }
        safeInvoke(() => ns.alert("fn-guard"));
      });
    });

    it("ns.hacknet.purchaseNode(0)", () => {
      const code = `
        export async function main(ns) {
          ns.hacknet.purchaseNode(0);
        }
      `;
      assertStaticCoversDynamic(code, (ns) =>
        safeInvoke(() => {
          if (ns.hacknet == null) throw new Error("expected ns.hacknet");
          return ns.hacknet.purchaseNode();
        }),
      );
    });

    it("ns.sleeve.getTask(3)", () => {
      const code = `
        export async function main(ns) {
          ns.sleeve.getTask(3);
        }
      `;
      assertStaticCoversDynamic(code, (ns) =>
        safeInvoke(() => {
          if (ns.sleeve == null) throw new Error("expected ns.sleeve");
          return ns.sleeve.getTask(3);
        }),
      );
    });

    it("const g = ns.gang; g.getMemberInformation('')", () => {
      const code = `
        /** @param {NS} ns */
        export async function main(ns) {
          const g = ns.gang;
          g.getMemberInformation("");
        }
      `;
      assertStaticCoversDynamic(code, (ns) => {
        const g = ns.gang;
        if (g == null) throw new Error("expected ns.gang in test harness");
        try {
          g.getMemberInformation("");
        } catch {
          // charged before throw
        }
      });
    });

    it("destructured ns.corporation: createCorporation, expandIndustry, buyTea, buyMaterial", () => {
      const code = `
        /** @param {NS} ns */
        export async function main(ns) {
          const {
            createCorporation,
            expandIndustry,
            buyTea,
            buyMaterial,
          } = ns.corporation;
          createCorporation("corp", false);
          expandIndustry("Agriculture", "ag");
          buyTea("ag", "Sector-12");
          buyMaterial("ag", "Sector-12", "Water", 1);
        }
      `;
      assertStaticCoversDynamic(code, (ns) => {
        const c = ns.corporation;
        if (c == null) throw new Error("expected ns.corporation in test harness");
        safeInvoke(() => c.createCorporation("corp", false));
        safeInvoke(() => c.expandIndustry("Agriculture", "ag"));
        safeInvoke(() => c.buyTea("ag", "Sector-12"));
        safeInvoke(() => c.buyMaterial("ag", "Sector-12", "Water", 1));
      });
    });

    it("import { doHack } from libTest; await doHack(ns)", () => {
      const libCode = `
        export async function doHack(ns) { return await ns.hack("joesguns"); }
      `;
      const lib = new Script("libTest.js" as ScriptFilePath, libCode);
      const code = `
        import { doHack } from "libTest";
        export async function main(ns) {
          await doHack(ns);
        }
      `;
      assertStaticCoversDynamic(code, (ns) => safeInvoke(() => ns.hack("joesguns")), {
        otherScripts: new Map([["libTest.js" as ScriptFilePath, lib]]),
      });
    });

    it("import * as test from libTest (static pulls all exports); exercise hack + grow", () => {
      const libCode = `
        export async function doHack(ns) { return await ns.hack("joesguns"); }
        export async function doGrow(ns) { return await ns.grow("joesguns"); }
      `;
      const lib = new Script("libTest.js" as ScriptFilePath, libCode);
      const code = `
        import * as test from "libTest";
        export async function main(ns) {
          await test.doHack(ns);
        }
      `;
      assertStaticCoversDynamic(
        code,
        (ns) => {
          safeInvoke(() => ns.hack("joesguns"));
          safeInvoke(() => ns.grow("joesguns"));
        },
        { otherScripts: new Map([["libTest.js" as ScriptFilePath, lib]]) },
      );
    });

    it("import createClass from lib; new grower(ns).doGrow()", () => {
      const libCode = `
          export function createClass() {
            class Grower {
              ns;
              constructor(ns) { this.ns = ns; }
              async doGrow() { return await this.ns.grow("joesguns"); }
            }
            return Grower;
          }
        `;
      const lib = new Script("libTest.js" as ScriptFilePath, libCode);
      const code = `
          import { createClass } from "libTest";

          export async function main(ns) {
            const grower = createClass();
            const growerInstance = new grower(ns);
            await growerInstance.doGrow();
          }
        `;
      assertStaticCoversDynamic(code, (ns) => safeInvoke(() => ns.grow("joesguns")), {
        otherScripts: new Map([["libTest.js" as ScriptFilePath, lib]]),
      });
    });

    it("relative import ./libTest from test/testfile.js", () => {
      const libCode = `
          export async function testRelative(ns) {
              await ns.hack("n00dles")
          }
        `;
      const lib = new Script("test/libTest.js" as ScriptFilePath, libCode);
      const code = `
          import { testRelative } from "./libTest";

          export async function main(ns) {
            await testRelative(ns)
          }
        `;
      assertStaticCoversDynamic(code, (ns) => safeInvoke(() => ns.hack("n00dles")), {
        scriptForRam: scriptForFnFolder,
        otherScripts: new Map([["test/libTest.js" as ScriptFilePath, lib]]),
      });
    });

    it("relative import chain test/libTestOne → ./libTestTwo", () => {
      const libNameOne = "test/libTestOne.js" as ScriptFilePath;
      const libNameTwo = "test/libTestTwo.js" as ScriptFilePath;

      const libCodeOne = `
          import { testRelativeAgain } from "./libTestTwo";
          export function testRelative(ns) {
              return testRelativeAgain(ns)
          }
        `;
      const libScriptOne = new Script(libNameOne, libCodeOne);

      const libCodeTwo = `
          export function testRelativeAgain(ns) {
              return ns.hack("n00dles")
          }
        `;
      const libScriptTwo = new Script(libNameTwo, libCodeTwo);

      const code = `
          import { testRelative } from "./libTestOne";

          export async function main(ns) {
            await testRelative(ns)
          }
        `;
      assertStaticCoversDynamic(code, (ns) => safeInvoke(() => ns.hack("n00dles")), {
        scriptForRam: scriptForFnFolder,
        otherScripts: new Map([
          [libNameOne, libScriptOne],
          [libNameTwo, libScriptTwo],
        ]),
      });
    });

    it("relative import foo/libTestOne with path-conflict sibling map (static picks ./libTestTwo next to One)", () => {
      const libNameOne = "foo/libTestOne.js" as ScriptFilePath;
      const libNameTwo = "foo/libTestTwo.js" as ScriptFilePath;
      const incorrect_libNameTwo = "test/libTestTwo.js" as ScriptFilePath;

      const libCodeOne = `
          import { testRelativeAgain } from "./libTestTwo";
          export function testRelative(ns) {
              return testRelativeAgain(ns)
          }
        `;
      const libScriptOne = new Script(libNameOne, libCodeOne);

      const libCodeTwo = `
          export function testRelativeAgain(ns) {
              return ns.hack("n00dles")
          }
        `;
      const libScriptTwo = new Script(libNameTwo, libCodeTwo);

      const incorrect_libCodeTwo = `
          export function testRelativeAgain(ns) {
              return ns.grow("n00dles")
          }
        `;
      const incorrect_libScriptTwo = new Script(incorrect_libNameTwo, incorrect_libCodeTwo);

      const code = `
          import { testRelative } from "foo/libTestOne";

          export async function main(ns) {
            await testRelative(ns)
          }
        `;
      assertStaticCoversDynamic(code, (ns) => safeInvoke(() => ns.hack("n00dles")), {
        scriptForRam: scriptForFnFolder,
        otherScripts: new Map([
          [libNameOne, libScriptOne],
          [libNameTwo, libScriptTwo],
          [incorrect_libNameTwo, incorrect_libScriptTwo],
        ]),
      });
    });
  });

  describe("ramOverride checks", () => {
    test.each([
      ["ns.ramOverride(5)", 5],
      ["ramOverride(5)", 5],
      ["ns.ramOverride(5 * 1024)", baseCost], // Constant expressions are not handled yet
    ])("%s", (code, expected) => {
      const fullCode = `export function main(ns) { ${code} }`;

      const result = calculateRamUsage(fullCode, "testfile.js" as ScriptFilePath, "testserver", new Map());
      expect(result.errorMessage).toBe(undefined);
      expect(result.cost).toBe(expected);
    });
  });
});
