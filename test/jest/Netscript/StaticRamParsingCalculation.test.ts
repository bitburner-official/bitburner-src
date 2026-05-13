import type { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";

import { calculateRamUsage } from "../../../src/Script/RamCalculations";
import { RamCosts } from "../../../src/Netscript/RamCostGenerator";
import { Script } from "../../../src/Script/Script";
import { setPlayer } from "@player";
import { PlayerObject } from "../../../src/PersonObjects/Player/PlayerObject";

const BaseCost = 1.6;
const HackCost = 0.1;
const GrowCost = 0.15;
const SleeveGetTaskCost = 4;
const Hacknet = 0.5;
const GangGetMemberInformation = 2;
const GangGetAscensionResult = 2;
const CorporationAction = 20;
const MaxCost = 1024;

const filename = "testfile.js" as ScriptFilePath;
const folderFilename = "test/testfile.js" as ScriptFilePath;
const server = "testserver";

/**
 * Init the player object. When calculating the RAM usage of singularity APIs, RamCostGenerator.ts needs to access some
 * properties and functions of the player object.
 */
setPlayer(new PlayerObject());

describe("Parsing NetScript code to work out static RAM costs", function () {
  /** Tests numeric equality, allowing for floating point imprecision - and includes script base cost */
  function expectCost(val: number | undefined, expected: number) {
    const expectedWithBase = Math.min(expected + BaseCost, MaxCost);
    expect(val).toBeGreaterThanOrEqual(expectedWithBase - 100 * Number.EPSILON);
    expect(val).toBeLessThanOrEqual(expectedWithBase + 100 * Number.EPSILON);
  }

  describe("Single files with basic NS functions", function () {
    it("Empty main function", function () {
      const code = `
        export async function main(ns) { }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, 0);
    });

    it("Free NS function directly in main", function () {
      const code = `
        export async function main(ns) {
          ns.print("Slum snakes r00l!");
        }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, 0);
    });

    it("Single simple base NS function directly in main", function () {
      const code = `
        export async function main(ns) {
          await ns.hack("joesguns");
        }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, HackCost);
    });

    it("Single simple base NS function directly in main with differing arg name", function () {
      const code = `
        export async function main(X) {
          await X.hack("joesguns");
        }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, HackCost);
    });

    it("Repeated simple base NS function directly in main", function () {
      const code = `
        export async function main(ns) {
          await ns.hack("joesguns");
          await ns.hack("joesguns");
        }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, HackCost);
    });

    it("Multiple simple base NS functions directly in main", function () {
      const code = `
        export async function main(ns) {
          await ns.hack("joesguns");
          await ns.grow("joesguns");
        }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, HackCost + GrowCost);
    });

    it("Simple base NS functions in a referenced function", function () {
      const code = `
        export async function main(ns) {
          doHacking(ns);
        }
        async function doHacking(ns) {
          await ns.hack("joesguns");
        }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, HackCost);
    });

    it("Simple base NS functions in a referenced class", function () {
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
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, HackCost);
    });

    it("Simple base NS functions in a referenced class", function () {
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
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, HackCost);
    });

    // Some scripts may hide functions from static analysis (e.g. `ns["hack"]()`)
    // but still need that function in static allocation. A bare `ns.hack` reference without
    // calling (e.g. `void ns.hack`) registers that cost.
    it('still attributes hack when the invoke path uses ns["hack"]()', function () {
      const code = `
export async function main(ns) {
  void ns.hack;
  const host = "n00dles";
  await ns["hack"](host);
}
`;
      const calc = calculateRamUsage(code, filename, server, new Map());
      if ("errorCode" in calc) {
        throw new Error(calc.errorMessage ?? String(calc.errorCode));
      }
      expectCost(calc.cost, HackCost);
      const names = (calc.entries ?? []).map((e) => e.name);
      expect(names).toContain("hack");
    });

    it("this.ns re-aliased to local ns inside class method reserves hack", function () {
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
            await ns.hack('n00dles');
          }
        }
      `;
      const calc = calculateRamUsage(code, filename, server, new Map());
      const names = (calc.entries ?? []).map((e) => e.name);
      expect(names).toContain("hack");
      expectCost(calc.cost, HackCost);
    });
  });

  describe("Functions that can be confused with NS functions", function () {
    it("Function 'get' that can be confused with Stanek.get", function () {
      const code = `
        export async function main(ns) {
          get();
        }
        function get() { return 0; }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, 0);
    });

    it("Function 'getTask' that can be confused with Sleeve.getTask", function () {
      const code = `
        export async function main(ns) {
          getTask();
        }
        function getTask() { return 0; }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, 0);
    });

    it("Parameter named 'attempt' does not pick up codingcontract.attempt RAM", function () {
      const code = `
        /** @param {NS} ns */
        export async function main(ns) {
          function f(attempt) {
            return attempt + 1;
          }
          f(0);
        }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, 0);
    });

    // Issue #875: property access on the result of a call must not be treated as an
    // NS function reference, even when the property name matches a top-level API.
    it("Property access on call result does not pick up matching top-level API RAM", function () {
      const code = `
        export async function main(ns) {
          ns.gang.getMemberInformation('').hack;
          ns.gang.getAscensionResult('').hack;
        }
      `;
      const calc = calculateRamUsage(code, filename, server, new Map());
      const names = (calc.entries ?? []).map((e) => e.name);
      expect(names).toContain("gang.getMemberInformation");
      expect(names).toContain("gang.getAscensionResult");
      expect(names).not.toContain("hack");
    });

    // Issue #298: a plain local variable property whose name matches a top-level NS API
    // (e.g. `readback.weaken` where `readback` is a JSON parse result) must not be
    // attributed NS RAM.
    it("Local variable property readback.weaken does not pick up weaken() RAM", function () {
      const code = `
        export async function main(ns) {
          var readback;
          readback = JSON.parse("{}");
          ns.tprint(readback.weaken);
        }
      `;
      const calc = calculateRamUsage(code, filename, server, new Map());
      const names = (calc.entries ?? []).map((e) => e.name);
      expect(names).not.toContain("weaken");
    });

    // Issue #1894: a user-defined class method whose name matches a top-level NS API
    // (e.g. `test.run()`) must not be attributed NS RAM.
    it("User class method test.run() does not pick up run() RAM", function () {
      const code = `
        class TestClass {
          constructor() {}
          run() {}
        }
        export async function main(ns) {
          let test = new TestClass();
          test.run();
        }
      `;
      const calc = calculateRamUsage(code, filename, server, new Map());
      const names = (calc.entries ?? []).map((e) => e.name);
      expect(names).not.toContain("run");
    });

    // Scope-shadowing variant of #298: a local var named `readback` in main shadows an
    // unrelated `decode(readback)` helper's parameter of the same name. Per-function
    // scope analysis must keep the local from being treated as a renamed-ns alias.
    it("Local var shadows unrelated function param of same name", function () {
      const code = `
        function decode(readback) { return readback; }

        export async function main(ns) {
          var readback;
          readback = JSON.parse("{}");
          ns.tprint(readback.weaken);
        }
      `;
      const calc = calculateRamUsage(code, filename, server, new Map());
      const names = (calc.entries ?? []).map((e) => e.name);
      expect(names).not.toContain("weaken");
    });

    // Scope-shadowing variant of #1894: a let-bound class instance shadows an unrelated
    // helper's `test` parameter. Same scope-analysis requirement as the previous test.
    it("Let-bound local shadows unrelated function param of same name", function () {
      const code = `
        class TestClass { run() {} }
        function helper(test) { return test; }
        export async function main(ns) {
          let test = new TestClass();
          test.run();
        }
      `;
      const calc = calculateRamUsage(code, filename, server, new Map());
      const names = (calc.entries ?? []).map((e) => e.name);
      expect(names).not.toContain("run");
    });

    // Sharpened renamed-ns test: a module-level `var X` must NOT shadow the function's
    // own `X` parameter. The function frame's params should win against the outer module
    // frame's locals during innermost-first scope lookup.
    it("Renamed ns param wins over a module-level local of the same name", function () {
      const code = `
        export async function main(X) {
          await X.hack("joesguns");
        }
        var X;
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, HackCost);
    });

    // Issue #875: `.hack` on the gang API return value is a number, not `ns.hack`.
    it("ns.alert(ns.gang.getMemberInformation().hack) does not charge top-level hack", function () {
      const code = `
        /** @param {NS} ns */
        export async function main(ns) {
          ns.alert(ns.gang.getMemberInformation("CoolGuy").hack);
        }
      `;
      const calc = calculateRamUsage(code, filename, server, new Map());
      const names = (calc.entries ?? []).map((e) => e.name);
      expect(names).toContain("gang.getMemberInformation");
      expect(names).not.toContain("hack");
      expectCost(calc.cost, GangGetMemberInformation);
    });

    // simplest renamed-ns case — `const _ns = ns; _ns.hack();`. `_ns` is a local,
    // not a parameter, but it's directly assigned from the `ns` param so any call on it
    // must be treated like a call on `ns`.
    it("const _ns = ns alias reserves hack", function () {
      const code = `
        /** @param {NS} ns */
        export async function main(ns) {
          const _ns = ns;
          _ns.hack();
        }
      `;
      const calc = calculateRamUsage(code, filename, server, new Map());
      const names = (calc.entries ?? []).map((e) => e.name);
      expect(names).toContain("hack");
      expectCost(calc.cost, HackCost);
    });

    // same renamed-ns pattern, but the alias is declared at module
    // scope and assigned inside main. The module-level binding must not lose its
    // ns-alias provenance just because the assignment happens later.
    it("module-scope _ns assigned inside main reserves hack", function () {
      const code = `
        let _ns;
        /** @param {NS} ns */
        export async function main(ns) {
          _ns = ns;
          _ns.hack();
        }
      `;
      const calc = calculateRamUsage(code, filename, server, new Map());
      const names = (calc.entries ?? []).map((e) => e.name);
      expect(names).toContain("hack");
      expectCost(calc.cost, HackCost);
    });

    // `ns` is stashed on `globalThis` in main and consumed by a sibling function.
    // Pessimism: any call against `globalThis.ns.X` must reserve `X`'s RAM, because we
    // cannot statically prove `globalThis.ns` isn't an alias of the ns param.
    it("globalThis.ns alias reserves hack", function () {
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
      const calc = calculateRamUsage(code, filename, server, new Map());
      const names = (calc.entries ?? []).map((e) => e.name);
      expect(names).toContain("hack");
      expectCost(calc.cost, HackCost);
    });

    it("globalThis.gang = ns.gang reserves gang API across sibling functions", function () {
      const code = `
        /** @param {NS} ns */
        export async function main(ns) {
          globalThis.gang = ns.gang;
          foo();
        }
        function foo() {
          globalThis.gang.getMemberInformation('');
        }
      `;
      const calc = calculateRamUsage(code, filename, server, new Map());
      const names = (calc.entries ?? []).map((e) => e.name);
      expect(names).toContain("gang.getMemberInformation");
      expectCost(calc.cost, GangGetMemberInformation);
    });

    it("globalThis renames ns.gang slot (globalThis.g = ns.gang) still reserves gang API", function () {
      const code = `
        /** @param {NS} ns */
        export async function main(ns) {
          globalThis.g = ns.gang;
          foo();
        }
        function foo() {
          globalThis.g.getMemberInformation('');
        }
      `;
      const calc = calculateRamUsage(code, filename, server, new Map());
      const names = (calc.entries ?? []).map((e) => e.name);
      expect(names).toContain("gang.getMemberInformation");
      expectCost(calc.cost, GangGetMemberInformation);
    });

    it("globalThis.foo = ns reserves hack on sibling access via globalThis.foo", function () {
      const code = `
        /** @param {NS} ns */
        export async function main(ns) {
          globalThis.foo = ns;
          bar();
        }
        function bar() {
          globalThis.foo.hack();
        }
      `;
      const calc = calculateRamUsage(code, filename, server, new Map());
      const names = (calc.entries ?? []).map((e) => e.name);
      expect(names).toContain("hack");
      expectCost(calc.cost, HackCost);
    });

    // ns is bundled inside an object literal that's passed as a parameter, then
    // accessed via `ctx.ns.X`.
    it("ns nested inside object parameter reserves hack", function () {
      const code = `
        /** @param {NS} ns */
        export async function main(ns) {
          await foo({ns, notImportant: 'something'}, 42);
        }

        async function foo(ctx, alsoNotImportant) {
          await ctx.ns.hack('n00dles');
        }
      `;
      const calc = calculateRamUsage(code, filename, server, new Map());
      const names = (calc.entries ?? []).map((e) => e.name);
      expect(names).toContain("hack");
      expectCost(calc.cost, HackCost);
    });
  });

  describe("Single files with non-core NS functions", function () {
    it("Hacknet NS functions with an individual cost", function () {
      const code = `
        export async function main(ns) {
          ns.hacknet.purchaseNode(0);
        }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, Hacknet);
    });

    it("Sleeve functions with an individual cost", function () {
      const code = `
        export async function main(ns) {
          ns.sleeve.getTask(3);
        }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, SleeveGetTaskCost);
    });

    // namespace alias — `const g = ns.gang; g.getMemberInformation("");`
    it("const g = ns.gang namespace alias reserves gang.getMemberInformation", function () {
      const code = `
        /** @param {NS} ns */
        export async function main(ns) {
          const g = ns.gang;
          g.getMemberInformation("");
        }
      `;
      const calc = calculateRamUsage(code, filename, server, new Map());
      const names = (calc.entries ?? []).map((e) => e.name);
      expect(names).toContain("gang.getMemberInformation");
      expectCost(calc.cost, GangGetMemberInformation);
    });

    // namespace-alias variant of issue #875 — `.hack` on return values is not top-level `hack`.
    it("ns.gang alias with call-result .hack does not charge top-level hack", function () {
      const code = `
        export async function main(ns) {
          const g = ns.gang;
          g.getMemberInformation('').hack;
          g.getAscensionResult('').hack;
        }
      `;
      const calc = calculateRamUsage(code, filename, server, new Map());
      const names = (calc.entries ?? []).map((e) => e.name);
      expect(names).toContain("gang.getMemberInformation");
      expect(names).toContain("gang.getAscensionResult");
      expect(names).not.toContain("hack");
      expectCost(calc.cost, GangGetMemberInformation + GangGetAscensionResult);
    });

    // destructured namespace — names from `ns.corporation` map to `corporation.*` APIs.
    it("destructured ns.corporation members reserve every referenced API", function () {
      const code = `
        /** @param {NS} ns */
        export async function main(ns) {
          const {
            createCorporation,
            expandIndustry,
            buyTea,
            buyMaterial,
          } = ns.corporation;
          createCorporation('corp', false);
          expandIndustry('Agriculture', 'ag');
          buyTea('ag', 'Sector-12');
          buyMaterial('ag', 'Sector-12', 'Water', 1);
        }
      `;
      const calc = calculateRamUsage(code, filename, server, new Map());
      const names = (calc.entries ?? []).map((e) => e.name);
      expect(names).toContain("corporation.createCorporation");
      expect(names).toContain("corporation.expandIndustry");
      expect(names).toContain("corporation.buyTea");
      expect(names).toContain("corporation.buyMaterial");
      expectCost(calc.cost, 4 * CorporationAction);
    });
  });

  describe("Imported files", function () {
    it("Simple imported function with no cost", function () {
      const libCode = `
        export function dummy() { return 0; }
      `;
      const lib = new Script("libTest.js" as ScriptFilePath, libCode);

      const code = `
        import { dummy } from "libTest";
        export async function main(ns) {
          dummy();
        }
      `;
      const calculated = calculateRamUsage(
        code,
        filename,
        server,
        new Map([["libTest.js" as ScriptFilePath, lib]]),
      ).cost;
      expectCost(calculated, 0);
    });

    it("Imported ns function", function () {
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
      const calculated = calculateRamUsage(
        code,
        filename,
        server,
        new Map([["libTest.js" as ScriptFilePath, lib]]),
      ).cost;
      expectCost(calculated, HackCost);
    });

    it("Importing a single function from a library that exports multiple", function () {
      const libCode = `
        export async function doHack(ns) { return await ns.hack("joesguns"); }
        export async function doGrow(ns) { return await ns.grow("joesguns"); }
      `;
      const lib = new Script("libTest.js" as ScriptFilePath, libCode);

      const code = `
        import { doHack } from "libTest";
        export async function main(ns) {
          await doHack(ns);
        }
      `;
      const calculated = calculateRamUsage(
        code,
        filename,
        server,
        new Map([["libTest.js" as ScriptFilePath, lib]]),
      ).cost;
      expectCost(calculated, HackCost);
    });

    it("Importing all functions from a library that exports multiple", function () {
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
      const calculated = calculateRamUsage(
        code,
        filename,
        server,
        new Map([["libTest.js" as ScriptFilePath, lib]]),
      ).cost;
      expectCost(calculated, HackCost + GrowCost);
    });

    it("Using every function in the API costs MaxCost", () => {
      const lines: string[] = [];
      for (const [key, val] of Object.entries(RamCosts)) {
        if (typeof val === "object") {
          const namespace = key;
          for (const name of Object.keys(val)) {
            lines.push(`ns.${namespace}.${name}()`);
          }
        } else {
          lines.push(`ns.${key}()`);
        }
      }
      const code = `
        export async function main(ns) {
          ${lines.join("\n")};
        }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, MaxCost);
    });

    // TODO: once we fix static parsing this should pass
    it.skip("Importing a function from a library that contains a class", function () {
      const libCode = `
        export async function doHack(ns) { return await ns.hack("joesguns"); }
        class Grower {
          ns;
          constructor(ns) { this.ns = ns; }
          async doGrow() { return await this.ns.grow("joesguns"); }
        }
      `;
      const lib = new Script("libTest.js" as ScriptFilePath, libCode);

      const code = `
        import * as test from "libTest";
        export async function main(ns) {
          await test.doHack(ns);
        }
      `;
      const calculated = calculateRamUsage(
        code,
        filename,
        server,
        new Map([["libTest.js" as ScriptFilePath, lib]]),
      ).cost;
      expectCost(calculated, HackCost);
    });

    it("Importing a function from a library that creates a class in a function", function () {
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
      const calculated = calculateRamUsage(
        code,
        filename,
        server,
        new Map([["libTest.js" as ScriptFilePath, lib]]),
      ).cost;
      expectCost(calculated, GrowCost);
    });

    it("Importing with a relative path - One Layer Deep", function () {
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
      const calculated = calculateRamUsage(
        code,
        folderFilename,
        server,
        new Map([["test/libTest.js" as ScriptFilePath, lib]]),
      ).cost;
      expectCost(calculated, HackCost);
    });
    it("Importing with a relative path - Two Layer Deep", function () {
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
      const calculated = calculateRamUsage(
        code,
        folderFilename,
        server,
        new Map([
          [libNameOne, libScriptOne],
          [libNameTwo, libScriptTwo],
        ]),
      ).cost;
      expectCost(calculated, HackCost);
    });
    it("Importing with a relative path - possible path conflict", function () {
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
      const calculated = calculateRamUsage(
        code,
        folderFilename,
        server,
        new Map([
          [libNameOne, libScriptOne],
          [libNameTwo, libScriptTwo],
          [incorrect_libNameTwo, incorrect_libScriptTwo],
        ]),
      ).cost;
      expectCost(calculated, HackCost);
    });
  });
});
