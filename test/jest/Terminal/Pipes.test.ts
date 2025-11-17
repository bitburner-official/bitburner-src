import { clearPipe, splitPipesFromFirstCommand } from "../../../src/Terminal/Pipe";
import { Terminal } from "../../../src/Terminal";
import { GetServer, prestigeAllServers } from "../../../src/Server/AllServers";
import { Player } from "@player";
import { TextFilePath } from "../../../src/Paths/TextFilePath";
import { PipeState } from "../../../src/Terminal/PipeState";
import { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { config as EvaluatorConfig } from "../../../src/NetscriptJSEvaluator";
import { initGameEnvironment } from "../Netscript/Utilities";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Set up environment so scripts can be run. See RunScript.test.ts for more details
declare const importActual: (typeof EvaluatorConfig)["doImport"];
global.Blob = class extends Blob {
  code: string;
  constructor(blobParts?: BlobPart[], __options?: BlobPropertyBag) {
    super();
    this.code = String((blobParts ?? [])[0]);
  }
};
global.URL.revokeObjectURL = function () {};
EvaluatorConfig.doImport = importActual;
global.URL.createObjectURL = function (blob) {
  return "data:text/javascript," + encodeURIComponent((blob as unknown as { code: string }).code);
};
initGameEnvironment();

describe("Terminal Pipes", () => {
  beforeEach(() => {
    prestigeAllServers();
    Player.init();
    clearPipe();
    Terminal.outputHistory = [];
    GetServer(Player.currentServer)?.textFiles.clear();
  });

  it("should correctly split the first command from later pipes", () => {
    const command = "echo hello | grep h";
    let firstCommand = splitPipesFromFirstCommand(command);
    expect(firstCommand).toBe("echo hello");
    expect(PipeState.currentTerminalPipe?.pipeType).toEqual("|");
    expect(PipeState.currentTerminalPipe?.commandString).toBe("grep h");

    clearPipe();
    const command2 = "cat file.txt >> output.txt";
    firstCommand = splitPipesFromFirstCommand(command2);
    expect(firstCommand).toBe("cat file.txt");
    expect(PipeState.currentTerminalPipe?.pipeType).toEqual(">>");
    expect(PipeState.currentTerminalPipe?.commandString).toBe("output.txt");
  });

  it("should handle piping to a file", () => {
    const fileName = "output.txt";
    const command = `echo 'Hello World' > ${fileName}`;
    Terminal.executeCommand(command);

    const server = GetServer(Player.currentServer);
    const fileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;
    expect(fileContent).toBe("Hello World");
  });

  it("should handle piping to a script file, and passing arguments into a script to run", async () => {
    const scriptName = "testScript.js" as ScriptFilePath;
    const scriptContent = `export async function main(ns) { ns.tprint("Args received: ", ns.args); }`;

    // Add script to server
    Terminal.executeCommand(`echo '${scriptContent}' > ${scriptName}`);

    // Pass arguments to script via pipe
    const command = `echo 'arguments' | run ${scriptName}`;
    Terminal.executeCommand(command);
    await sleep(100);

    expect(Terminal.outputHistory[0].text).toContain(`args: ["arguments"]`);
    expect(Terminal.outputHistory[1].text).toContain(`Args received: ["arguments"]`);
  });

  it("should handle multiple commands with distinct pipes", () => {
    const fileName1 = "output.txt";
    const fileName2 = "output2.txt";
    const commandString = `echo test | ${fileName1}; echo test2 | ${fileName2}`;

    Terminal.executeCommands(commandString);

    const server = GetServer(Player.currentServer);
    const fileContent1 = server?.textFiles?.get(fileName1 as TextFilePath)?.text;
    expect(fileContent1).toBe("test");
    const fileContent2 = server?.textFiles?.get(fileName2 as TextFilePath)?.text;
    expect(fileContent2).toBe("test2");
  });
});
