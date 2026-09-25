import type { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";

import { calculateRamUsage, type RamCalculationSuccess } from "../../../src/Script/RamCalculations";
import { RamCosts, RamCostConstants } from "../../../src/Netscript/RamCostGenerator";
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
const WeakenCost = RamCostConstants.Weaken;
const DomCost = RamCostConstants.Dom;

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
  function expectedCost(val: number | undefined, expected: number) {
    const expectedWithBase = Math.min(expected + BaseCost, MaxCost);
    expect(val).toBeGreaterThanOrEqual(expectedWithBase - 100 * Number.EPSILON);
    expect(val).toBeLessThanOrEqual(expectedWithBase + 100 * Number.EPSILON);
  }

  /** Assert that the result of the calculateRamUsage function is a success. */
  function assertRamSuccess(result: ReturnType<typeof calculateRamUsage>): RamCalculationSuccess {
    if ("errorCode" in result) {
      throw new Error(result.errorMessage ?? String(result.errorCode));
    }
    return result;
  }

  describe("Single files with basic NS functions", function () {
    describe("when the main function is empty", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) { }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost only", function () {
        expectedCost(calc.cost, 0);
      });

      it("should not attribute any Netscript API RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).not.toContain("hack");
      });
    });

    describe("when the main function is a free NS function", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            ns.print("Slum snakes r00l!");
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost only", function () {
        expectedCost(calc.cost, 0);
      });

      it("should not attribute hack RAM", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).not.toContain("hack");
      });
    });

    describe("when the main function is a single simple base NS function", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            await ns.hack("joesguns");
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost + hack cost", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when the main function is a single simple base NS function with differing arg name", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(X) {
            await X.hack("joesguns");
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost + hack cost", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when the main function is a repeated simple base NS function", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            await ns.hack("joesguns");
            await ns.hack("joesguns");
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge hack cost only once", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when the main function is a multiple simple base NS functions", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            await ns.hack("joesguns");
            await ns.grow("joesguns");
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge each distinct NS function once", function () {
        expectedCost(calc.cost, HackCost + GrowCost);
      });

      it("should list hack and grow among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
        expect(names).toContain("grow");
      });
    });

    describe("when the main function is a simple base NS function in a referenced function", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            doHacking(ns);
          }

          async function doHacking(ns) {
            await ns.hack("joesguns");
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge hack via referenced helper", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when the main function is a simple base NS function in a referenced class", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
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
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge hack via class method", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when the main function is a simple base NS function in a referenced class", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
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
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge hack via private field on class", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    // Some scripts may hide functions from static analysis (e.g. `ns["hack"]()`)
    // but still need that function in static allocation. A bare `ns.hack` reference without
    // calling (e.g. `void ns.hack`) registers that cost.
    describe("when the main function is a simple base NS function not called", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            void ns.hack;
            const host = "n00dles";
            await ns["hack"](host);
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should still charge hack once combined with bracket call", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when the main function is a simple base NS function that is aliased to local ns inside class method", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
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
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge hack via aliased ns in method", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });
  });

  describe("Functions that can be confused with NS functions", function () {
    describe("when the main function is a function that can be confused with Stanek.get", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
        export async function main(ns) {
          get();
        }
        function get() { return 0; }
      `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost only", function () {
        expectedCost(calc.cost, 0);
      });

      it("should not attribute hack RAM", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).not.toContain("hack");
      });
    });

    describe("when the main function is a function that can be confused with Sleeve.getTask", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            getTask();
          }
          function getTask() { return 0; }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost only", function () {
        expectedCost(calc.cost, 0);
      });

      it("should not attribute sleeve.getTask RAM", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).not.toContain("sleeve.getTask");
      });
    });

    describe("when a parameter is named 'attempt", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            function f(attempt) {
              return attempt + 1;
            }
            f(0);
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost only", function () {
        expectedCost(calc.cost, 0);
      });

      it("should not attribute codingcontract.attempt RAM", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).not.toContain("codingcontract.attempt");
      });
    });

    describe("when a local variable is named 'attempt", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            const attempt = 0;
            ns.tprint(attempt);
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost only", function () {
        expectedCost(calc.cost, 0);
      });

      it("should not attribute codingcontract.attempt RAM", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).not.toContain("codingcontract.attempt");
      });
    });

    describe("when chaining a property on the result of a call that matches a top-level API function name", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            ns.gang.getMemberInformation('').hack;
            ns.gang.getAscensionResult('').hack;
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge gang getters without ns.hack", function () {
        expectedCost(calc.cost, GangGetMemberInformation + GangGetAscensionResult);
      });

      it("should list gang APIs and not hack", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("gang.getMemberInformation");
        expect(names).toContain("gang.getAscensionResult");
        expect(names).not.toContain("hack");
      });
    });

    describe("when a local variable property matches a top-level API function name", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            var readback;
            readback = JSON.parse("{}");
            ns.tprint(readback.weaken);
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost only", function () {
        expectedCost(calc.cost, 0);
      });

      it("should not attribute weaken RAM", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).not.toContain("weaken");
      });
    });

    describe("when optional chaining accesses a property on a plain object that matches an NS API name", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            const x = {};
            void x?.weaken;
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost only", function () {
        expectedCost(calc.cost, 0);
      });

      it("should not list weaken among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).not.toContain("weaken");
      });
    });

    describe("when a user-defined class method matches a top-level API function name", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
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
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost only", function () {
        expectedCost(calc.cost, 0);
      });

      it("should not attribute ns.run RAM", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).not.toContain("run");
      });
    });

    describe("when a local variable shadows an unrelated function parameter of the same name", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          function decode(readback) { return readback; }

          export async function main(ns) {
            var readback;
            readback = JSON.parse("{}");
            ns.tprint(readback.weaken);
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost only", function () {
        expectedCost(calc.cost, 0);
      });

      it("should not attribute weaken RAM", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).not.toContain("weaken");
      });
    });

    describe("when a let-bound local variable shadows an unrelated function parameter of the same name", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          class TestClass { run() {} }

          function helper(test) { return test; }

          export async function main(ns) {
            let test = new TestClass();
            test.run();
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost only", function () {
        expectedCost(calc.cost, 0);
      });

      it("should not attribute ns.run RAM", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).not.toContain("run");
      });
    });

    describe("when a module-level local variable shadows a function parameter of the same name", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(X) {
            await X.hack("joesguns");
          }
          var X;
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge hack via parameter binding over module var", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when chaining a property on the result of a call that matches a top-level API function name", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            ns.alert(ns.gang.getMemberInformation("CoolGuy").hack);
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge gang.getMemberInformation without ns.hack", function () {
        expectedCost(calc.cost, GangGetMemberInformation);
      });

      it("should list gang API and not hack", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("gang.getMemberInformation");
        expect(names).not.toContain("hack");
      });
    });

    describe("when a local variable is assigned from the ns parameter", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            const _ns = ns;
            _ns.hack();
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge hack via local ns alias", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when a module-scope local variable is assigned from the ns parameter", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          let _ns;

          export async function main(ns) {
            _ns = ns;
            _ns.hack();
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge hack via deferred module-scope alias", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when a globalThis.ns alias is assigned from the ns parameter (single depth declaration)", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            globalThis.ns = ns;
            foo();
          }

          function foo() {
            globalThis.ns.hack();
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should pessimistically charge hack via globalThis.ns", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when a globalThis.gang alias is assigned from the ns.gang parameter (multiple depth declaration)", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            globalThis.gang = ns.gang;
            foo();
          }

          function foo() {
            globalThis.gang.getMemberInformation('');
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge gang.getMemberInformation via globalThis", function () {
        expectedCost(calc.cost, GangGetMemberInformation);
      });

      it("should list gang.getMemberInformation among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("gang.getMemberInformation");
      });
    });

    describe("when a globalThis.g alias is assigned from the ns.gang parameter (multiple depth declaration with non-matching alias)", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            globalThis.foo = ns;
            bar();
          }

          function bar() {
            globalThis.foo.hack();
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge hack via globalThis foo alias to ns", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when a globalThis.foo alias is assigned from the ns parameter (single depth declaration)", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            globalThis.foo = ns.gang;
            bar();
          }

          function bar() {
            globalThis.foo.getMemberInformation('');
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge gang.getMemberInformation via globalThis.foo bound to ns.gang", function () {
        expectedCost(calc.cost, GangGetMemberInformation);
      });

      it("should list gang.getMemberInformation among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("gang.getMemberInformation");
      });
    });

    describe("when a globalThis.foo alias is assigned from the ns.gang parameter (multiple depth declaration) and the property chain matches a top-level API function name", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            globalThis.foo = ns.gang;
            bar();
          }

          function bar() {
            globalThis.foo.getMemberInformation('').hack;
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge gang.getMemberInformation without ns.hack", function () {
        expectedCost(calc.cost, GangGetMemberInformation);
      });

      it("should list gang API and not hack", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("gang.getMemberInformation");
        expect(names).not.toContain("hack");
      });
    });

    describe("when ns is nested inside an object parameter", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            await foo({ns, notImportant: 'something'}, 42);
          }

          async function foo(ctx, alsoNotImportant) {
            await ctx.ns.hack('n00dles');
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge hack when ns is nested in a parameter object", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when the main function uses optional chaining on ns.hack", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            await ns?.hack("joesguns");
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost + hack cost", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when this.ns is assigned and used as an alias RHS in a class method", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            await new Wrapper(ns).run();
          }
          class Wrapper {
            constructor(ns) {
              this.ns = ns;
            }
            async run() {
              const x = this.ns;
              await x.hack("joesguns");
            }
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost + hack cost", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when super.ns from a base-class getter is used as an alias RHS in a subclass method", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            await new Child(ns).run();
          }
          class Base {
            constructor(ns) {
              this._ns = ns;
            }
            get ns() {
              return this._ns;
            }
          }
          class Child extends Base {
            async run() {
              const x = super.ns;
              await x.hack("joesguns");
            }
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost + hack cost", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when the main function destructures { hack } from ns and calls hack", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            const { hack } = ns;
            await hack("joesguns");
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost + hack cost", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    // TODO: see if we can charge hack for the renamed destructuring alias when it's invoked.
    describe("when the main function destructures { hack: h } from ns and calls h", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            const { hack: h } = ns;
            await h("joesguns");
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost only", function () {
        expectedCost(calc.cost, 0);
      });

      it("should not list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).not.toContain("hack");
      });
    });

    describe("when the main function calls ns with a computed member key from a variable", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            const k = "hack";
            await ns[k]("joesguns");
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge the base cost only", function () {
        expectedCost(calc.cost, 0);
      });

      it("should not list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).not.toContain("hack");
      });
    });
  });

  describe("Single files with non-core NS functions", function () {
    describe("when a Hacknet NS function is called", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            ns.hacknet.purchaseNode(0);
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge hacknet.purchaseNode", function () {
        expectedCost(calc.cost, Hacknet);
      });

      it("should list hacknet.purchaseNode among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hacknet.purchaseNode");
      });
    });

    describe("when a Sleeve NS function is called", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            ns.sleeve.getTask(3);
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge sleeve.getTask", function () {
        expectedCost(calc.cost, SleeveGetTaskCost);
      });

      it("should list sleeve.getTask among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("sleeve.getTask");
      });
    });

    describe("when a namespace alias is assigned from the ns parameter", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            const g = ns.gang;
            g.getMemberInformation("");
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge gang.getMemberInformation", function () {
        expectedCost(calc.cost, GangGetMemberInformation);
      });

      it("should list gang.getMemberInformation among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("gang.getMemberInformation");
      });
    });

    describe("when a multiple depth namespace alias is assigned from the ns parameter and the property chain matches a top-level API function name", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            const g = ns.gang;
            g.getMemberInformation('').hack;
            g.getAscensionResult('').hack;
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge both gang getters without ns.hack", function () {
        expectedCost(calc.cost, GangGetMemberInformation + GangGetAscensionResult);
      });

      it("should list gang APIs and not hack", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("gang.getMemberInformation");
        expect(names).toContain("gang.getAscensionResult");
        expect(names).not.toContain("hack");
      });
    });

    describe("when destructured namespace is assigned from the ns parameter", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            const {
              createCorporation,
              expandIndustry,
              buyTea,
              buyMaterial, // not called
            } = ns.corporation;
            createCorporation('corp', false);
            expandIndustry('Agriculture', 'ag');
            buyTea('ag', 'Sector-12');
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should charge only called corporation APIs", function () {
        expectedCost(calc.cost, 3 * CorporationAction);
      });

      it("should list expected corporation entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("corporation.createCorporation");
        expect(names).toContain("corporation.expandIndustry");
        expect(names).toContain("corporation.buyTea");
        expect(names).not.toContain("corporation.buyMaterial");
      });
    });
  });

  describe("Imported files", function () {
    describe("when an imported function is called that does not match an ns API function name", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
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
        calc = assertRamSuccess(
          calculateRamUsage(code, filename, server, new Map([["libTest.js" as ScriptFilePath, lib]])),
        );
      });

      it("should charge the base cost only", function () {
        expectedCost(calc.cost, 0);
      });

      it("should not attribute hack RAM", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).not.toContain("hack");
      });
    });

    describe("when an imported factory function is called that returns a function that matches an ns API function name", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const libCode = `
          export function foo() {
            return { "hack": function () {} };
          }
        `;
        const lib = new Script("libTest.js" as ScriptFilePath, libCode);

        const code = `
          import { foo } from "libTest";
          export async function main(ns) {
            foo().hack();
          }
        `;
        calc = assertRamSuccess(
          calculateRamUsage(code, filename, server, new Map([["libTest.js" as ScriptFilePath, lib]])),
        );
      });

      it("should pessimistically charge hack", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when an imported factory return value has a method named like an NS API (weaken)", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const libCode = `
          export function factory() {
            return { weaken: function () {} };
          }
        `;
        const lib = new Script("libTest.js" as ScriptFilePath, libCode);
        const code = `
          import { factory } from "libTest";
          export async function main(ns) {
            factory().weaken();
          }
        `;
        calc = assertRamSuccess(
          calculateRamUsage(code, filename, server, new Map([["libTest.js" as ScriptFilePath, lib]])),
        );
      });

      it("should pessimistically charge the base cost + weaken cost", function () {
        expectedCost(calc.cost, WeakenCost);
      });

      it("should list weaken among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("weaken");
      });
    });

    describe("when an imported ns function is called", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
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
        calc = assertRamSuccess(
          calculateRamUsage(code, filename, server, new Map([["libTest.js" as ScriptFilePath, lib]])),
        );
      });

      it("should charge hack from imported helper", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when a single function is imported from a library that exports multiple functions", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
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
        calc = assertRamSuccess(
          calculateRamUsage(code, filename, server, new Map([["libTest.js" as ScriptFilePath, lib]])),
        );
      });

      it("should charge hack without grow when only doHack is used", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack and not grow among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
        expect(names).not.toContain("grow");
      });
    });

    describe("when the main script default-imports a module that also has named exports", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const libCode = `
          export default async function def(ns) {
            await ns.hack("joesguns");
          }
          export async function unused(ns) {
            await ns.grow("joesguns");
          }
        `;
        const lib = new Script("libTest.js" as ScriptFilePath, libCode);
        const code = `
          import def from "libTest";
          export async function main(ns) {
            await def(ns);
          }
        `;
        calc = assertRamSuccess(
          calculateRamUsage(code, filename, server, new Map([["libTest.js" as ScriptFilePath, lib]])),
        );
      });

      it("should pessimistically charge hack and grow via default import module wildcard", function () {
        expectedCost(calc.cost, HackCost + GrowCost);
      });

      it("should list hack and grow among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
        expect(names).toContain("grow");
      });
    });

    describe("when the main script default-imports a factory and calls a method named like an NS API on its return value", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const libCode = `
          export default function makeObj() {
            return { hack: function () {} };
          }
        `;
        const lib = new Script("libTest.js" as ScriptFilePath, libCode);
        const code = `
          import makeObj from "libTest";
          export async function main(ns) {
            makeObj().hack();
          }
        `;
        calc = assertRamSuccess(
          calculateRamUsage(code, filename, server, new Map([["libTest.js" as ScriptFilePath, lib]])),
        );
      });

      it("should pessimistically charge the base cost + hack cost", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when importing all functions from a library that exports multiple", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
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
        calc = assertRamSuccess(
          calculateRamUsage(code, filename, server, new Map([["libTest.js" as ScriptFilePath, lib]])),
        );
      });

      it("should pessimistically charge hack and grow", function () {
        expectedCost(calc.cost, HackCost + GrowCost);
      });

      it("should list hack and grow among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
        expect(names).toContain("grow");
      });
    });

    describe("when every function in the API is called", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
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
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should hit max RAM cap", function () {
        expectedCost(calc.cost, MaxCost);
      });

      it("should include representative APIs among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
        expect(names).toContain("grow");
      });
    });

    describe("when namespace-importing a function from a library that contains a class", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
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
        calc = assertRamSuccess(
          calculateRamUsage(code, filename, server, new Map([["libTest.js" as ScriptFilePath, lib]])),
        );
      });

      it("should pessimistically charge hack and grow", function () {
        expectedCost(calc.cost, HackCost + GrowCost);
      });

      it("should list hack and grow among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
        expect(names).toContain("grow");
      });
    });

    describe("when importing a function from a library that contains a class", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
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
          import { doHack } from "libTest";
          export async function main(ns) {
            await doHack(ns);
          }
        `;
        calc = assertRamSuccess(
          calculateRamUsage(code, filename, server, new Map([["libTest.js" as ScriptFilePath, lib]])),
        );
      });

      it("should charge hack without unused grow", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack and not grow among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
        expect(names).not.toContain("grow");
      });
    });

    describe("when importing a class from a library that contains a separate function", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const libCode = `
          export async function doHack(ns) { return await ns.hack("joesguns"); }

          export class Grower {
            ns;
            constructor(ns) { this.ns = ns; }
            async doGrow() { return await this.ns.grow("joesguns"); }
          }
        `;
        const lib = new Script("libTest.js" as ScriptFilePath, libCode);

        const code = `
          import { Grower } from "libTest";
          export async function main(ns) {
            const grower = new Grower(ns);
            await grower.doGrow();
          }
        `;
        calc = assertRamSuccess(
          calculateRamUsage(code, filename, server, new Map([["libTest.js" as ScriptFilePath, lib]])),
        );
      });

      it("should charge grow without unused hack export path", function () {
        expectedCost(calc.cost, GrowCost);
      });

      it("should list grow and not hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("grow");
        expect(names).not.toContain("hack");
      });
    });

    describe("when calling a function from an import that creates a class in a function", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const libCode = `
            export function createClass() {
              class Grower {
                ns;
                constructor(ns) { this.ns = ns; }
                async doGrow() { return await this.ns.grow("joesguns"); }
                async doHack() { return await this.ns.hack("joesguns"); }
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
        calc = assertRamSuccess(
          calculateRamUsage(code, filename, server, new Map([["libTest.js" as ScriptFilePath, lib]])),
        );
      });

      it("should charge hack and grow from dynamic class factory", function () {
        expectedCost(calc.cost, GrowCost + HackCost);
      });

      it("should list hack and grow among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
        expect(names).toContain("grow");
      });
    });

    describe("when namespace importing a function from a library that creates a class in a function", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const libCode = `
            export function createClass() {
              class Grower {
                ns;
                constructor(ns) { this.ns = ns; }
                async doGrow() { return await this.ns.grow("joesguns"); }
                async doHack() { return await this.ns.hack("joesguns"); }
              }
              return Grower;
            }
          `;
        const lib = new Script("libTest.js" as ScriptFilePath, libCode);

        const code = `
            import * as libTest from "libTest";

            export async function main(ns) {
              const grower = libTest.createClass();
              const growerInstance = new grower(ns);
              await growerInstance.doGrow();
            }
          `;
        calc = assertRamSuccess(
          calculateRamUsage(code, filename, server, new Map([["libTest.js" as ScriptFilePath, lib]])),
        );
      });

      it("should charge hack and grow from namespace factory import", function () {
        expectedCost(calc.cost, GrowCost + HackCost);
      });

      it("should list hack and grow among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
        expect(names).toContain("grow");
      });
    });

    describe("when importing a function with a relative path - One Layer Deep", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
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
        calc = assertRamSuccess(
          calculateRamUsage(code, folderFilename, server, new Map([["test/libTest.js" as ScriptFilePath, lib]])),
        );
      });

      it("should charge hack via one-hop relative import", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when importing with a relative path - Two Layer Deep", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
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
        calc = assertRamSuccess(
          calculateRamUsage(
            code,
            folderFilename,
            server,
            new Map([
              [libNameOne, libScriptOne],
              [libNameTwo, libScriptTwo],
            ]),
          ),
        );
      });

      it("should charge hack via chained relative imports", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
      });
    });

    describe("when main imports through a barrel that re-exports from separate implementation files", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const implHackPath = "implHack.js" as ScriptFilePath;
        const implGrowPath = "implGrow.js" as ScriptFilePath;
        const barrelPath = "barrel.js" as ScriptFilePath;
        const implHackCode = `
          export async function doHack(ns) {
            await ns.hack("joesguns");
          }
        `;
        const implGrowCode = `
          export async function doGrow(ns) {
            await ns.grow("joesguns");
          }
        `;
        const barrelCode = `
          export { doHack } from "./implHack";
          export { doGrow } from "./implGrow";
        `;
        const mainCode = `
          import { doHack } from "./barrel";
          export async function main(ns) {
            await doHack(ns);
          }
        `;
        const implHackScript = new Script(implHackPath, implHackCode);
        const implGrowScript = new Script(implGrowPath, implGrowCode);
        calc = assertRamSuccess(
          calculateRamUsage(
            mainCode,
            filename,
            server,
            new Map([
              [barrelPath, new Script(barrelPath, barrelCode)],
              [implHackPath, implHackScript],
              [implGrowPath, implGrowScript],
              // Re-exports push `node.source.value` onto the parse queue unresolved.
              ["./implHack" as ScriptFilePath, implHackScript],
              ["./implGrow" as ScriptFilePath, implGrowScript],
            ]),
          ),
        );
      });

      it("should charge only hack when main imports doHack through a multi-export barrel", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack and not grow among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
        expect(names).not.toContain("grow");
      });
    });

    describe("when importing with a relative path - possible path conflict", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
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
        calc = assertRamSuccess(
          calculateRamUsage(
            code,
            folderFilename,
            server,
            new Map([
              [libNameOne, libScriptOne],
              [libNameTwo, libScriptTwo],
              [incorrect_libNameTwo, incorrect_libScriptTwo],
            ]),
          ),
        );
      });

      it("should resolve correct lib and charge hack", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack and not grow among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
        expect(names).not.toContain("grow");
      });
    });

    describe("when an imported accessor returns module-cached ns", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const libCode = `
          let cachedNs;

          export function register(ns) {
            cachedNs = ns;
          }

          export function foo() {
            return cachedNs;
          }

          export async function doGrow(ns) {
            await ns.grow("n00dles");
          }
        `;
        const lib = new Script("test/libTest.js" as ScriptFilePath, libCode);
        const code = `
          import { foo } from "./libTest";

          export async function main(ns) {
            foo().hack();
          }
        `;
        calc = assertRamSuccess(
          calculateRamUsage(code, folderFilename, server, new Map([["test/libTest.js" as ScriptFilePath, lib]])),
        );
      });

      it("should charge hack without unused lib grow export", function () {
        expectedCost(calc.cost, HackCost);
      });

      it("should list hack and not grow among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("hack");
        expect(names).not.toContain("grow");
      });
    });
  });

  describe("Static RAM for override syntax and host globals", function () {
    describe("when main calls ns.ramOverride as its first statement", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            ns.ramOverride(42);
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should use override value as total script RAM", function () {
        expect(calc.cost).toBeGreaterThanOrEqual(42 - 100 * Number.EPSILON);
        expect(calc.cost).toBeLessThanOrEqual(42 + 100 * Number.EPSILON);
      });

      it("should record override in RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("override");
      });
    });

    describe("when main references document and window", function () {
      let calc: RamCalculationSuccess;

      beforeEach(function () {
        const code = `
          export async function main(ns) {
            void document;
            void window;
          }
        `;
        calc = assertRamSuccess(calculateRamUsage(code, filename, server, new Map()));
      });

      it("should add DOM RAM cost for document and window", function () {
        expectedCost(calc.cost, 2 * DomCost);
      });

      it("should list document and window among RAM entries", function () {
        const names = calc.entries.map((e) => e.name);
        expect(names).toContain("document");
        expect(names).toContain("window");
      });
    });
  });
});
