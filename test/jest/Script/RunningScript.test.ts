import { RunningScript } from "../../../src/Script/RunningScript";
import { Reviver, makeReviverWithContext } from "../../../src/utils/GenericReviver";
import { Script } from "../../../src/Script/Script";
import { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { setJSONContext } from "../../../src/utils/JSONContext";

describe("Validate that a RunningScript can be saved and loaded", () => {
  it("Save and Load", function () {
    const hostname = "__proto__";
    const filename = "test.js" as ScriptFilePath;
    const args = ["arg1", "arg2"];
    const ramUsage = 1.7;

    const script = new Script(filename, "", hostname);

    const runningScript = new RunningScript(script, ramUsage, args);
    runningScript.dataMap.set(hostname, [1000, 2, 3, 4]);

    const stringData = new Map<string, number>();
    let json;
    try {
      setJSONContext(stringData);
      json = JSON.stringify(runningScript);
    } finally {
      setJSONContext(undefined);
    }
    const revivedRunningScript = JSON.parse(json, makeReviverWithContext([...stringData.keys()])) as RunningScript;

    expect(revivedRunningScript).toBeInstanceOf(RunningScript);
    expect(revivedRunningScript.filename).toEqual(filename);
    expect(revivedRunningScript.server).toEqual(hostname);
    expect(revivedRunningScript.args).toEqual(args);
    expect(revivedRunningScript.ramUsage).toEqual(ramUsage);
    expect(revivedRunningScript.dataMap.get(hostname)).toEqual([1000, 2, 3, 4]);
  });

  it("Loads a standard savefile shape", () => {
    const data = ` {"ctor":"RunningScript","data":{"args":["arg1","arg2"],"dataMap":{"testserver":[1000,2,3,4]},"filename":"test.js","offlineExpGained":0,"offlineMoneyMade":0,"offlineRunningTime":0.01,"onlineExpGained":0,"onlineMoneyMade":0,"onlineRunningTime":0.01,"ramUsage":1.7,"server":"testserver","scriptKey":"test.js*[\\"arg1\\",\\"arg2\\"]","stdin":null,"tailOutputPipeConfig":null,"terminalOutputPipeConfig":null,"title":"test.js arg1 arg2","threads":1,"temporary":false}}`;
    const hostname = "testserver";
    const filename = "test.js" as ScriptFilePath;
    const args = ["arg1", "arg2"];
    const ramUsage = 1.7;

    const revivedRunningScript = JSON.parse(data, Reviver) as RunningScript;

    expect(revivedRunningScript).toBeInstanceOf(RunningScript);
    expect(revivedRunningScript.filename).toEqual(filename);
    expect(revivedRunningScript.server).toEqual(hostname);
    expect(revivedRunningScript.ramUsage).toEqual(ramUsage);
    expect(revivedRunningScript.args).toEqual(args);
    expect(revivedRunningScript.dataMap.get(hostname)).toEqual([1000, 2, 3, 4]);
  });
});
