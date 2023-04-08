import { startWorkerScript } from "../../../src/NetscriptWorker";
import { config as EvaluatorConfig } from "../../../src/NetscriptJSEvaluator";
import { Server } from "../../../src/Server/Server";
import { RunningScript } from "../../../src/Script/RunningScript";
import { AddToAllServers, DeleteServer } from "../../../src/Server/AllServers";
import { WorkerScriptStartStopEventEmitter } from "../../../src/Netscript/WorkerScriptStartStopEventEmitter";
import { AlertEvents } from "../../../src/ui/React/AlertManager";

// Replace Blob/ObjectURL functions, because they don't work natively in Jest
global.Blob = class extends Blob {
  code: string;
  constructor(blobParts?: BlobPart[], options?: BlobPropertyBag) {
    super();
    this.code = (blobParts ?? [])[0] + "";
  }
};
global.URL.revokeObjectURL = function () {};
// Critical: We have to overwrite this, otherwise we get Jest's hooked
// implementation, which will not work without passing special flags to Node,
// and tends to crash even if you do.
EvaluatorConfig.doImport = importActual;

test.each([
  {
    name: "NS1 test /w import",
    expected: ["false home 8", "Script finished running"],
    scripts: [
      {
        name: "import.script",
        code: `
        export function getInfo() {
          return stock.has4SData();
        }
      `,
      },
      {
        name: "simple_test.script",
        code: `
        import { getInfo } from "import.script";

        var access = getInfo();
        var server = getServer();
        printf("%s %s %d", access, server.hostname, server.maxRam);
      `,
      },
    ],
  },
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
  global.URL.createObjectURL = function (blob) {
    return "data:text/javascript," + encodeURIComponent(blob.code);
  };

  let server;
  let eventDelete = () => {};
  let alertDelete = () => {};
  try {
    const alerted = new Promise((resolve) => {
      alertDelete = AlertEvents.subscribe((x) => resolve(x));
    });
    server = new Server({ hostname: "home", adminRights: true, maxRam: 8 });
    AddToAllServers(server);
    for (const s of scripts) {
      expect(server.writeToScriptFile(s.name, s.code)).toEqual({ success: true, overwritten: false });
    }

    const script = server.scripts[server.scripts.length - 1];
    expect(script.filename).toEqual(scripts[scripts.length - 1].name);

    const ramUsage = script.getRamUsage(server.scripts);
    const runningScript = new RunningScript(script, ramUsage as number);
    expect(startWorkerScript(runningScript, server)).toBeGreaterThan(0);
    // We don't care about start, so subscribe after that. Await script death.
    const result = await Promise.race([
      alerted,
      new Promise((resolve) => {
        eventDelete = WorkerScriptStartStopEventEmitter.subscribe(() => {
          if (!server.runningScripts.includes(runningScript)) {
            resolve(null);
          }
        });
      }),
    ]);
    // If an error alert was thrown, we catch it here.
    expect(result).toBeNull();
    expect(runningScript.logs).toEqual(expectedLog);
  } finally {
    eventDelete();
    if (server) DeleteServer(server.hostname);
    alertDelete();
  }
});
