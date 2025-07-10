import type { Script } from "../../../src/Script/Script";
import type { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { runScriptFromScript, startWorkerScript } from "../../../src/NetscriptWorker";
import { workerScripts } from "../../../src/Netscript/WorkerScripts";
import { config as EvaluatorConfig } from "../../../src/NetscriptJSEvaluator";
import { Server } from "../../../src/Server/Server";
import { RunningScript } from "../../../src/Script/RunningScript";
import { AddToAllServers, DeleteServer, GetServerOrThrow } from "../../../src/Server/AllServers";
import { AlertEvents } from "../../../src/ui/React/AlertManager";
import { initGameEnvironment, setupBasicTestingEnvironment } from "./Utilities";
import { Terminal } from "../../../src/Terminal";
import { runScript } from "../../../src/Terminal/commands/runScript";
import { Player } from "@player";
import { resetPidCounter } from "../../../src/Netscript/Pid";
import { SpecialServers } from "../../../src/Server/data/SpecialServers";
import { WorkerScript } from "../../../src/Netscript/WorkerScript";
import { NetscriptFunctions } from "../../../src/NetscriptFunctions";
import type { PositiveInteger } from "../../../src/types";
import { ErrorState } from "../../../src/ErrorHandling/ErrorState";

declare const importActual: (typeof EvaluatorConfig)["doImport"];

// Replace Blob/ObjectURL functions, because they don't work natively in Jest
global.Blob = class extends Blob {
  code: string;
  constructor(blobParts?: BlobPart[], __options?: BlobPropertyBag) {
    super();
    this.code = String((blobParts ?? [])[0]);
  }
};
global.URL.revokeObjectURL = function () {};
// Critical: We have to overwrite this, otherwise we get Jest's hooked
// implementation, which will not work without passing special flags to Node,
// and tends to crash even if you do.
EvaluatorConfig.doImport = importActual;

global.URL.createObjectURL = function (blob) {
  return "data:text/javascript," + encodeURIComponent((blob as unknown as { code: string }).code);
};

initGameEnvironment();

test.each([
  {
    name: "NS2 test /w import",
    expected: ["false home 8", "Script finished running"],
    scripts: [
      {
        name: "import.js",
        code: `
        export function getInfo(ns) {
          return ns.stock.has4SData();
        }
      `,
      },
      {
        name: "simple_test.js",
        code: `
        import { getInfo } from "./import.js";

        export async function main(ns) {
          var access = getInfo(ns);
          var server = ns.getServer();
          ns.printf("%s %s %d", access, server.hostname, server.maxRam);
        }
      `,
      },
    ],
  },
])("Netscript execution: $name", async function ({ expected: expectedLog, scripts }) {
  let server = {} as Server;
  const eventDelete = () => {};
  let alertDelete = () => {};
  try {
    const alerted = new Promise((resolve) => {
      alertDelete = AlertEvents.subscribe((x) => resolve(x));
    });
    server = new Server({ hostname: "home", adminRights: true, maxRam: 8 });
    AddToAllServers(server);
    for (const s of scripts) {
      expect(server.writeToScriptFile(s.name as ScriptFilePath, s.code)).toEqual({ overwritten: false });
    }

    const script = server.scripts.get(scripts[scripts.length - 1].name as ScriptFilePath) as Script;
    expect(script.filename).toEqual(scripts[scripts.length - 1].name);

    const ramUsage = script.getRamUsage(server.scripts);
    if (!ramUsage) throw new Error(`ramUsage calculated to be ${ramUsage}`);
    const runningScript = new RunningScript(script, ramUsage);
    const pid = startWorkerScript(runningScript, server);
    expect(pid).toBeGreaterThan(0);
    // Manually attach an atExit to the now-created WorkerScript, so we can
    // await script death.
    const ws = workerScripts.get(pid);
    expect(ws).toBeDefined();
    const result = await Promise.race([
      alerted,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- ws was asserted above
      new Promise<void>((resolve) => (ws!.atExit = new Map([["default", resolve]]))),
    ]);
    // If an error alert was thrown, we catch it here.
    expect(result).not.toBeDefined();
    expect(runningScript.logs).toEqual(expectedLog);
  } finally {
    eventDelete();
    if (server) DeleteServer(server.hostname);
    alertDelete();
  }
});

const testScriptPath = "test.js" as ScriptFilePath;
const parentTestScriptPath = "parent_script.js" as ScriptFilePath;
const runOptions = {
  threads: 1 as PositiveInteger,
  temporary: false,
  preventDuplicates: false,
};

async function expectErrorWhenRunningScript(
  scripts: { filePath: ScriptFilePath; code: string }[],
  testScriptPath: ScriptFilePath,
  errorShown: Promise<unknown>,
  errorMessage: string,
): Promise<void> {
  /**
   * Suppress console.error(). When there is a thrown error in the player's script, we print it to the console. In
   * this test, we intentionally throw an error, so we can ignore it.
   */
  jest.spyOn(console, "error").mockImplementation(jest.fn());
  for (const script of scripts) {
    Player.getHomeComputer().writeToScriptFile(script.filePath, script.code);
  }
  runScript(testScriptPath, [], Player.getHomeComputer());
  const workerScript = workerScripts.get(1);
  if (!workerScript) {
    throw new Error(`Invalid worker script`);
  }
  const result = await Promise.race([
    errorShown,
    new Promise<void>((resolve) => (workerScript.atExit = new Map([["default", resolve]]))),
  ]);
  expect(result).toBeDefined();
  expect(workerScript.scriptRef.logs[0]).toContain(errorMessage);
}

describe("runScript and runScriptFromScript", () => {
  let alertEventCleanUpFunction: () => void;
  let alerted: Promise<unknown>;
  let errorPopUpEventCleanUpFunction: () => void;
  let errorShown: Promise<unknown>;

  beforeEach(() => {
    setupBasicTestingEnvironment();
    Terminal.clear();
    resetPidCounter();

    alerted = new Promise((resolve) => {
      alertEventCleanUpFunction = AlertEvents.subscribe((x) => resolve(x));
    });
    errorShown = new Promise((resolve) => {
      errorPopUpEventCleanUpFunction = ErrorState.ErrorUpdate.subscribe((x) => resolve(x));
    });
  });
  afterEach(() => {
    alertEventCleanUpFunction();
    errorPopUpEventCleanUpFunction();
    ErrorState.ActiveError = null;
    ErrorState.Errors.length = 0;
    ErrorState.UnreadErrors = 0;
  });

  describe("runScript", () => {
    describe("Success", () => {
      test("Normal", async () => {
        Player.getHomeComputer().writeToScriptFile(
          testScriptPath,
          `export async function main(ns) {
             const server = ns.getServer("home");
             ns.print(server.hostname);
           }`,
        );
        runScript(testScriptPath, [], Player.getHomeComputer());
        const workerScript = workerScripts.get(1);
        if (!workerScript) {
          throw new Error(`Invalid worker script`);
        }
        const result = await Promise.race([
          alerted,
          new Promise<void>((resolve) => (workerScript.atExit = new Map([["default", resolve]]))),
        ]);
        expect(result).not.toBeDefined();
        expect(workerScript.scriptRef.logs[0]).toStrictEqual(SpecialServers.Home);
      });
    });
    describe("Failure", () => {
      test("Script does not exist", () => {
        runScript(testScriptPath, [], Player.getHomeComputer());
        expect((Terminal.outputHistory[1] as { text: string }).text).toContain(
          `Script ${testScriptPath} does not exist on home`,
        );
      });
      test("No root access", () => {
        const server = GetServerOrThrow("n00dles");
        server.writeToScriptFile(
          testScriptPath,
          `export async function main(ns) {
           }`,
        );
        runScript(testScriptPath, [], server);
        expect((Terminal.outputHistory[1] as { text: string }).text).toContain(
          `You do not have root access on ${server.hostname}`,
        );
      });
      test("Cannot calculate RAM", () => {
        Player.getHomeComputer().writeToScriptFile(
          testScriptPath,
          `export async function main(ns) {
             {
           }`,
        );
        runScript(testScriptPath, [], Player.getHomeComputer());
        expect((Terminal.outputHistory[1] as { text: string }).text).toContain(
          `Cannot calculate RAM usage of ${testScriptPath}`,
        );
      });
      test("Not enough RAM", () => {
        Player.getHomeComputer().writeToScriptFile(
          testScriptPath,
          `export async function main(ns) {
             ns.ramOverride(1024);
           }`,
        );
        runScript(testScriptPath, [], Player.getHomeComputer());
        expect((Terminal.outputHistory[1] as { text: string }).text).toContain("This script requires 1.02TB of RAM");
      });
      test("Thrown error in main function", async () => {
        const errorMessage = `Test error ${Date.now()}`;
        await expectErrorWhenRunningScript(
          [
            {
              filePath: testScriptPath,
              code: `export async function main(ns) {
                      throw new Error("${errorMessage}");
                    }`,
            },
          ],
          testScriptPath,
          errorShown,
          errorMessage,
        );
      });
      test("Circular dependencies: Import itself", async () => {
        await expectErrorWhenRunningScript(
          [
            {
              filePath: testScriptPath,
              code: `import * as test from "./test";
                    export async function main(ns) {
                    }`,
            },
          ],
          testScriptPath,
          errorShown,
          "Circular dependencies detected",
        );
      });
      test("Circular dependencies: Circular import", async () => {
        await expectErrorWhenRunningScript(
          [
            {
              filePath: testScriptPath,
              code: `import { libValue } from "./lib";
                    export const testValue = 1;
                    export async function main(ns) {
                    }`,
            },
            {
              filePath: "lib.js" as ScriptFilePath,
              code: `import { testValue } from "./test";
                    export const libValue = testValue;`,
            },
          ],
          testScriptPath,
          errorShown,
          "Circular dependencies detected",
        );
      });
    });
  });

  describe("runScriptFromScript", () => {
    let parentWorkerScript: WorkerScript;
    beforeEach(() => {
      // Set up parentWorkerScript for passing to runScriptFromScript.
      const home = GetServerOrThrow(SpecialServers.Home);
      home.writeToScriptFile(parentTestScriptPath, "");
      const script = home.scripts.get(parentTestScriptPath);
      if (!script) {
        throw new Error("Invalid script");
      }
      const runningScript = new RunningScript(script, 4);
      parentWorkerScript = new WorkerScript(runningScript, 1, NetscriptFunctions);
      home.runScript(runningScript);
    });

    describe("Success", () => {
      test("Normal", async () => {
        Player.getHomeComputer().writeToScriptFile(
          testScriptPath,
          `export async function main(ns) {
             const server = ns.getServer("home");
             ns.print(server.hostname);
           }`,
        );
        runScriptFromScript("run", Player.getHomeComputer(), testScriptPath, [], parentWorkerScript, runOptions);
        const workerScript = workerScripts.get(1);
        if (!workerScript) {
          throw new Error(`Invalid worker script`);
        }
        const result = await Promise.race([
          alerted,
          new Promise<void>((resolve) => (workerScript.atExit = new Map([["default", resolve]]))),
        ]);

        expect(result).not.toBeDefined();
        expect(workerScript.scriptRef.logs[0]).toStrictEqual(SpecialServers.Home);
      });
    });
    describe("Failure", () => {
      test("Prevent duplicates", () => {
        runScriptFromScript("run", Player.getHomeComputer(), parentTestScriptPath, [], parentWorkerScript, {
          ...runOptions,
          preventDuplicates: true,
        });
        expect(parentWorkerScript.scriptRef.logs[0]).toContain("is already running");
      });
    });
  });
});
