import type { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";

import { calculateRamUsage } from "../../../src/Script/RamCalculations";
import { RamCosts } from "../../../src/Netscript/RamCostGenerator";
import { Script } from "../../../src/Script/Script";

const BaseCost = 1.6;
const HackCost = 0.1;
const GrowCost = 0.15;
const SleeveGetTaskCost = 4;
const HacknetCost = 4;
const MaxCost = 1024;

const filename = "testfile.js" as ScriptFilePath;
const folderFilename = "test/testfile.js" as ScriptFilePath;
const server = "testserver";
describe("Parsing NetScript code to work out static RAM costs", function () {
  jest.spyOn(console, "error").mockImplementation(() => {});
  /** Tests numeric equality, allowing for floating point imprecision - and includes script base cost */
  function expectCost(val: number | undefined, expected: number) {
    const expectedWithBase = Math.min(expected + BaseCost, MaxCost);
    expect(val).toBeGreaterThanOrEqual(expectedWithBase - 100 * Number.EPSILON);
    expect(val).toBeLessThanOrEqual(expectedWithBase + 100 * Number.EPSILON);
  }

  describe("Single files with basic NS functions", function () {
    it("Empty main function", async function () {
      const code = `
        export async function main(ns) { }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, 0);
    });

    it("Free NS function directly in main", async function () {
      const code = `
        export async function main(ns) {
          ns.print("Slum snakes r00l!");
        }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, 0);
    });

    it("Single simple base NS function directly in main", async function () {
      const code = `
        export async function main(ns) {
          await ns.hack("joesguns");
        }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, HackCost);
    });

    it("Single simple base NS function directly in main with differing arg name", async function () {
      const code = `
        export async function main(X) {
          await X.hack("joesguns");
        }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, HackCost);
    });

    it("Repeated simple base NS function directly in main", async function () {
      const code = `
        export async function main(ns) {
          await ns.hack("joesguns");
          await ns.hack("joesguns");
        }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, HackCost);
    });

    it("Multiple simple base NS functions directly in main", async function () {
      const code = `
        export async function main(ns) {
          await ns.hack("joesguns");
          await ns.grow("joesguns");
        }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, HackCost + GrowCost);
    });

    it("Simple base NS functions in a referenced function", async function () {
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

    it("Simple base NS functions in a referenced class", async function () {
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

    it("Simple base NS functions in a referenced class", async function () {
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
  });

  describe("Functions that can be confused with NS functions", function () {
    it("Function 'get' that can be confused with Stanek.get", async function () {
      const code = `
        export async function main(ns) {
          get();
        }
        function get() { return 0; }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, 0);
    });

    it("Function 'purchaseNode' that can be confused with Hacknet.purchaseNode", async function () {
      const code = `
        export async function main(ns) {
          purchaseNode();
        }
        function purchaseNode() { return 0; }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      // Works at present, because the parser checks the namespace only, not the function name
      expectCost(calculated, 0);
    });

    // TODO: once we fix static parsing this should pass
    it.skip("Function 'getTask' that can be confused with Sleeve.getTask", async function () {
      const code = `
        export async function main(ns) {
          getTask();
        }
        function getTask() { return 0; }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, 0);
    });
  });

  describe("Single files with non-core NS functions", function () {
    it("Hacknet NS function with a cost from namespace", async function () {
      const code = `
        export async function main(ns) {
          ns.hacknet.purchaseNode(0);
        }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, HacknetCost);
    });

    it("Sleeve functions with an individual cost", async function () {
      const code = `
        export async function main(ns) {
          ns.sleeve.getTask(3);
        }
      `;
      const calculated = calculateRamUsage(code, filename, server, new Map()).cost;
      expectCost(calculated, SleeveGetTaskCost);
    });
  });

  describe("Imported files", function () {
    it("Simple imported function with no cost", async function () {
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

    it("Imported ns function", async function () {
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

    it("Importing a single function from a library that exports multiple", async function () {
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

    it("Importing all functions from a library that exports multiple", async function () {
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
    it.skip("Importing a function from a library that contains a class", async function () {
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

    it("Importing a function from a library that creates a class in a function", async function () {
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

    it("Importing with a relative path - One Layer Deep", async function () {
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
    it("Importing with a relative path - Two Layer Deep", async function () {
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
    it("Importing with a relative path - possible path conflict", async function () {
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
