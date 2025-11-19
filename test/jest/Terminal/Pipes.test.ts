import { clearPipe, splitPipesFromFirstCommand } from "../../../src/Terminal/Pipe";
import { Terminal } from "../../../src/Terminal";
import { GetServer, prestigeAllServers } from "../../../src/Server/AllServers";
import { Player } from "@player";
import { TextFilePath } from "../../../src/Paths/TextFilePath";
import { PipeState } from "../../../src/Terminal/PipeState";
import { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { config as EvaluatorConfig } from "../../../src/NetscriptJSEvaluator";
import { initGameEnvironment } from "../Netscript/Utilities";
import { LiteratureName, MessageFilename } from "@enums";

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
    GetServer(Player.currentServer)?.scripts.clear();
  });

  describe("piping to files", () => {
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

      expect(Terminal.outputHistory[0].text).toContain(`Args received: ["arguments"]`);
    });

    it("should piping content out of a script", async () => {
      const outputFileName = "scriptOutput.txt" as TextFilePath;
      const scriptName = "testScript.js" as ScriptFilePath;
      const scriptContent = `export async function main(ns) { ns.tprint("Args received: ", ns.args); }`;

      // Add script to server
      Terminal.executeCommand(`echo '${scriptContent}' > ${scriptName}`);

      // Pass arguments to script via pipe
      const command = `echo 'arguments' | ${scriptName} > ${outputFileName}`;
      Terminal.executeCommand(command);
      await sleep(200);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(outputFileName)?.text;

      expect(fileContent).toContain(`Args received: ["arguments"]`);
    });

    it("should pipe content out of a script when the run command is used", async () => {
      const outputFileName = "scriptOutput.txt" as TextFilePath;
      const scriptName = "testScript.js" as ScriptFilePath;
      const scriptContent = `export function main(ns) { ns.tprint("Args received: ", ns.args); }`;

      // Add script to server
      Terminal.executeCommand(`echo '${scriptContent}' > ${scriptName}`);

      // Pass arguments to script via pipe
      const command = `echo 'arguments' | run ${scriptName} test1 > ${outputFileName}`;
      Terminal.executeCommand(command);
      await sleep(200);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(outputFileName)?.text;

      expect(fileContent).toContain(`Args received: ["test1","arguments"]`);
    });

    it("should append to a file when using >> operator", () => {
      const fileName = "output.txt";
      const commandString = `echo first line >> ${fileName}; echo second line >> ${fileName}`;

      Terminal.executeCommands(commandString);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;
      expect(fileContent).toBe("first line\nsecond line");
    });

    it("should overwrite a file when using > operator", () => {
      const fileName = "output.txt";
      const commandString = `echo first line > ${fileName}; echo second line > ${fileName}`;

      Terminal.executeCommands(commandString);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;
      expect(fileContent).toBe("second line");
    });

    it("should overwrite a script file when using > operator", () => {
      const fileName = "output.js";
      const commandString = `echo first line > ${fileName}; echo second line > ${fileName}`;

      Terminal.executeCommands(commandString);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.scripts?.get(fileName as ScriptFilePath)?.content;
      expect(fileContent).toBe("second line");
    });

    it("should only overwrite file contents once per > pipe", async () => {
      // Add file to server with content
      const outputFileName = "scriptOutput.txt" as TextFilePath;
      const commandString = `echo test > ${outputFileName}`;
      Terminal.executeCommands(commandString);

      const scriptName = "testScript.js" as ScriptFilePath;
      const scriptContent = `export async function main(ns) { ns.tprint(ns.args); await ns.sleep(100); ns.tprint(ns.args); }`;

      // Add script to server
      Terminal.executeCommand(`echo '${scriptContent}' > ${scriptName}`);

      // Pass arguments to script via pipe
      const command = `echo 'arguments' | ${scriptName} test1 > ${outputFileName}`;
      Terminal.executeCommand(command);
      await sleep(200);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(outputFileName)?.text;

      expect(fileContent).toEqual(`${scriptName}: ["test1","arguments"]\n${scriptName}: ["test1","arguments"]`);
    });

    it("should pass along file contents if another pipe is included", () => {
      const fileName = "output.txt";
      const commandString = `echo data >> ${fileName} | echo`;

      Terminal.executeCommands(commandString);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;
      expect(fileContent).toBe("data");
      const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1];
      expect(lastOutput.text).toBe("data");
    });
  });

  describe("piping multiple inputs", () => {
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

    it("passes all piped inputs to the output command", async () => {
      Terminal.executeCommand("echo 1337 | file1.txt");
      const command = "echo file1.txt file2.txt | cp";
      Terminal.executeCommand(command);
      await sleep(100);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get("file2.txt" as TextFilePath)?.text;
      expect(fileContent).toBe("1337");
    });
  });

  describe("cat and echo with pipes", () => {
    it("should echo output to terminal", () => {
      Terminal.executeCommand("echo 'Hello, World!' | echo | ");
      const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1];
      expect(lastOutput.text).toBe("Hello, World!");
    });

    it("should pipe cat file contents to specified output", () => {
      const fileName = "test.txt";
      const fileContent = "This is a test file.";
      Terminal.executeCommand(`echo '${fileContent}' > ${fileName}`);
      Terminal.executeCommand(`cat ${fileName} | echo `);

      const server = GetServer(Player.currentServer);
      const newFileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;
      expect(newFileContent).toBe(fileContent);

      const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1];
      expect(lastOutput.text).toBe(fileContent);
    });

    it("should pipe cat .lit file contents to specified output", () => {
      const fileName = "test.txt";
      const server = GetServer(Player.currentServer);
      server?.messages.push(LiteratureName.HackersStartingHandbook);

      Terminal.executeCommand(`cat ${LiteratureName.HackersStartingHandbook} > ${fileName}`);
      Terminal.executeCommand(`cat ${fileName} | echo `);

      const newFileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;
      expect(newFileContent).toContain("hacking is the most profitable way to earn money and progress");

      const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1];
      expect(lastOutput.text).toContain("hacking is the most profitable way to earn money and progress");
    });

    it("should pipe cat message file contents to specified output", () => {
      const fileName = "test.txt";
      const server = GetServer(Player.currentServer);
      server?.messages.push(MessageFilename.TruthGazer);

      Terminal.executeCommand(`cat ${MessageFilename.TruthGazer} > ${fileName}`);
      Terminal.executeCommand(`cat ${fileName} | echo `);

      const newFileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;
      expect(newFileContent).toContain("__ESCAP3__");

      const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1];
      expect(lastOutput.text).toContain("__ESCAP3__");
    });
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
});
