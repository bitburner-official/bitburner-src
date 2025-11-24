import { splitPipesFromFirstCommand } from "../../../src/Terminal/Pipe";
import { Terminal } from "../../../src/Terminal";
import { GetServer, prestigeAllServers } from "../../../src/Server/AllServers";
import { Player } from "@player";
import { type TextFilePath } from "../../../src/Paths/TextFilePath";
import { clearPipe, PipeState } from "../../../src/Terminal/PipeState";
import { type ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { LiteratureName, MessageFilename } from "@enums";
import { fixDoImportIssue, initGameEnvironment } from "../Utilities";
import * as dialogBox from "../../../src/ui/React/DialogBox";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

fixDoImportIssue();
initGameEnvironment();
let dialogMock;

describe("Terminal Pipes", () => {
  beforeEach(() => {
    prestigeAllServers();
    Player.init();
    clearPipe();
    Terminal.outputHistory = [];
    GetServer(Player.currentServer)?.textFiles.clear();
    GetServer(Player.currentServer)?.scripts.clear();
    dialogMock = jest.spyOn(dialogBox, "dialogBoxCreate").mockImplementation(() => {});
  });

  describe("piping to files", () => {
    it("should handle piping to a file", () => {
      const fileName = "output.txt";
      const command = `echo 'Hello World' > ${fileName}`;
      Terminal.executeCommands(command);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;

      expect(Terminal.outputHistory.length).toBe(0);
      expect(fileContent).toBe("Hello World");
    });

    it("should append to a file when using >> operator", () => {
      const fileName = "output.txt";
      const commandString = `echo first line >> ${fileName}; echo second line >> ${fileName}`;

      Terminal.executeCommands(commandString);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;

      expect(Terminal.outputHistory.length).toBe(0);
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

      expect(Terminal.outputHistory.length).toBe(0);
      expect(fileContent).toBe("second line");
    });

    it("should only overwrite file contents once per > pipe", async () => {
      // Add file to server with content
      const outputFileName = "scriptOutput9.txt" as TextFilePath;
      const startingData = "startingData";
      const commandString = `echo ${startingData} > ${outputFileName}`;
      Terminal.executeCommands(commandString);

      const scriptName = "testScript.js" as ScriptFilePath;
      const scriptContent = `export async function main(ns) { ns.tprint(ns.args); await ns.sleep(100); ns.tprint(ns.args); }`;

      // Add script to server
      Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}`);

      // Pass arguments to script via pipe
      const command = `run ${scriptName} test1 > ${outputFileName}`;
      Terminal.executeCommands(command);
      await sleep(200);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(outputFileName)?.text;

      expect(Terminal.outputHistory.length).toBe(0);
      expect(fileContent).toContain(`${scriptName}: ["test1"]\n${scriptName}: ["test1"]`);
      expect(fileContent).not.toContain(startingData);
    });

    it("should only overwrite file contents once per > pipe when arguments are piped in", async () => {
      // Add file to server with content
      const outputFileName = "scriptOutput8.txt" as TextFilePath;
      const startingData = "startingData";
      const commandString = `echo ${startingData} > ${outputFileName}`;
      Terminal.executeCommands(commandString);

      const scriptName = "testScript.js" as ScriptFilePath;
      const scriptContent = `export async function main(ns) { ns.tprint(ns.stdin.read()); await ns.sleep(100); ns.tprint(ns.stdin.read()); }`;

      // Add script to server
      Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}`);

      // Pass arguments to script via pipe
      const command = `echo test1 test2 | ${scriptName} > ${outputFileName}`;
      Terminal.executeCommands(command);
      await sleep(200);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(outputFileName)?.text;

      expect(Terminal.outputHistory.length).toBe(0);
      expect(fileContent).toContain(`${scriptName}: test1 test2\n${scriptName}: NULL PORT DATA`);
      expect(fileContent).not.toContain(startingData);
    });
  });

  describe("piping multiple inputs", () => {
    it("should handle multiple commands with distinct pipes", () => {
      const fileName1 = "output.txt";
      const fileName2 = "output2.txt";
      const commandString = `echo test | ${fileName1}; echo test2 | ${fileName2}`;
      Terminal.executeCommands(commandString);

      expect(Terminal.outputHistory.length).toBe(0);

      const server = GetServer(Player.currentServer);
      const fileContent1 = server?.textFiles?.get(fileName1 as TextFilePath)?.text;
      expect(fileContent1).toBe("test");

      const fileContent2 = server?.textFiles?.get(fileName2 as TextFilePath)?.text;
      expect(fileContent2).toBe("test2");
    });

    it("passes all piped inputs to the output command", async () => {
      Terminal.executeCommands("echo 1337 | file1.txt");
      const command = "echo file1.txt file2.txt | cp";
      Terminal.executeCommands(command);
      await sleep(100);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get("file2.txt" as TextFilePath)?.text;
      expect(fileContent).toBe("1337");
    });
  });

  describe("cat and echo with pipes", () => {
    it("should echo output to terminal", () => {
      Terminal.executeCommands("echo 'Hello, World!' | echo | ");
      const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1];
      expect(lastOutput.text).toBe("Hello, World!");
    });

    it("should pipe cat file contents to specified output", () => {
      const fileName = "test4.txt";
      const fileContent = "This is a test file.";
      Terminal.executeCommands(`echo '${fileContent}' > ${fileName}`);
      Terminal.executeCommands(`cat ${fileName} | echo `);

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

      Terminal.executeCommands(`cat ${LiteratureName.HackersStartingHandbook} > ${fileName}`);
      Terminal.executeCommands(`cat ${fileName} | echo `);

      const newFileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;
      expect(newFileContent).toContain("hacking is the most profitable way to earn money and progress");

      const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1];
      expect(lastOutput.text).toContain("hacking is the most profitable way to earn money and progress");
    });

    it("should pipe cat message file contents to specified output", () => {
      const fileName = "test3.txt";
      const server = GetServer(Player.currentServer);
      server?.messages.push(MessageFilename.TruthGazer);

      Terminal.executeCommands(`cat ${MessageFilename.TruthGazer} > ${fileName}`);
      Terminal.executeCommands(`cat ${fileName} | echo `);

      const newFileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;
      expect(newFileContent).toContain("__ESCAP3__");

      const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1];
      expect(lastOutput.text).toContain("__ESCAP3__");
    });
  });

  describe("piping to and from scripts", () => {
    it("should handle piping to a script file, and passing arguments into a script to run", async () => {
      const scriptName = "testScript2.js" as ScriptFilePath;
      const scriptContent = `export async function main(ns) { ns.tprint("Input received: ", ns.stdin.peek()); }`;

      // Add script to server
      Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}`);

      // Pass arguments to script via pipe
      const command = `echo 'data' | run ${scriptName}`;
      Terminal.executeCommands(command);
      await sleep(100);

      expect(Terminal.outputHistory[0]?.text).toContain(`Running script with 1 thread`);
      expect(Terminal.outputHistory[1]?.text).toEqual(`${scriptName}: Input received: data`);
    });

    it("should piping content out of a script", async () => {
      const outputFileName = "scriptOutput4.txt" as TextFilePath;
      const scriptName = "testScript.js" as ScriptFilePath;
      const scriptContent = `export async function main(ns) { ns.tprint("Input received: ", ns.stdin.peek()); }`;

      // Add script to server
      Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}`);

      // Pass arguments to script via pipe
      const command = `echo 'data' | ${scriptName} > ${outputFileName}`;
      Terminal.executeCommands(command);
      await sleep(200);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(outputFileName)?.text;

      expect(Terminal.outputHistory.length).toBe(0);
      expect(fileContent).toContain(`Input received: data`);
    });

    it("should pipe content out of a script when the run command is used", async () => {
      const outputFileName = "scriptOutput3.txt" as TextFilePath;
      const scriptName = "testScript.js" as ScriptFilePath;
      const scriptContent = `export function main(ns) { ns.tprint("Args received: ", ns.args); }`;

      // Add script to server
      Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}`);

      // Pass arguments to script via pipe
      const command = `run ${scriptName} test1 arguments > ${outputFileName}`;
      Terminal.executeCommands(command);
      await sleep(200);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(outputFileName)?.text;

      expect(Terminal.outputHistory.length).toBe(0);
      expect(fileContent).toContain(`Args received: ["test1","arguments"]`);
    });

    it("should correctly pipe each script's async output to its specified location", async () => {
      // Add file to server with content
      const outputFileName = "scriptOutput.txt" as TextFilePath;
      const outputFileName2 = "scriptOutput2.txt" as TextFilePath;
      Terminal.executeCommands(`echo > ${outputFileName}; echo > ${outputFileName2}`);

      const scriptName = "testScript.js" as ScriptFilePath;
      const scriptContent = `export async function main(ns) { ns.tprint(ns.args); await ns.sleep(100); ns.tprint(ns.args); }`;

      // Add script to server
      Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}`);

      // Pass arguments to script via pipe
      const command = `run ${scriptName} test1 test2 > ${outputFileName}; run ${scriptName} test3 test4 > ${outputFileName2}`;
      Terminal.executeCommands(command);
      await sleep(300);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(outputFileName)?.text;
      const fileContent2 = server?.textFiles?.get(outputFileName2)?.text;

      expect(Terminal.outputHistory.length).toBe(0);
      expect(fileContent).toContain(`${scriptName}: ["test1","test2"]\n${scriptName}: ["test1","test2"]`);
      expect(fileContent2).toContain(`${scriptName}: ["test3","test4"]\n${scriptName}: ["test3","test4"]`);
    });
  });

  it("should handle piping content to cat", () => {
    const testContent = "This is a test.";
    const commandString = `echo "${testContent}" | cat`;
    Terminal.executeCommands(commandString);
    expect(Terminal.outputHistory.length).toBe(0);
    expect(dialogMock).toHaveBeenCalledWith(testContent);
  });

  it("should correctly split the first command from later pipes", () => {
    const command = "echo hello | grep h";
    let firstCommand = splitPipesFromFirstCommand(command);
    expect(firstCommand).toBe("echo hello");
    expect(PipeState.currentTerminalPipe?.pipeSymbol).toEqual("|");
    expect(PipeState.currentTerminalPipe?.commandString).toBe("grep h");

    clearPipe();
    const command2 = "cat file.txt >> output.txt";
    firstCommand = splitPipesFromFirstCommand(command2);
    expect(firstCommand).toBe("cat file.txt");
    expect(PipeState.currentTerminalPipe?.pipeSymbol).toEqual(">>");
    expect(PipeState.currentTerminalPipe?.commandString).toBe("output.txt");
  });
});
