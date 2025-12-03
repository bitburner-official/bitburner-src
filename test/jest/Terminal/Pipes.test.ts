import { Terminal } from "../../../src/Terminal";
import { GetServer, prestigeAllServers } from "../../../src/Server/AllServers";
import { Player } from "@player";
import { type TextFilePath } from "../../../src/Paths/TextFilePath";
import { clearPipe } from "../../../src/Terminal/PipeState";
import { type ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { LiteratureName, MessageFilename } from "@enums";
import { fixDoImportIssue, initGameEnvironment } from "../Utilities";
import { runScript } from "../../../src/Terminal/commands/runScript";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

fixDoImportIssue();
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
      Terminal.executeCommands(command);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;

      expect(JSON.stringify(Terminal.outputHistory)).toBe("[]");
      expect(fileContent).toBe("Hello World");
    });

    it("should append to a file when using >> operator", () => {
      const fileName = "output.txt";
      const commandString = `echo first line >> ${fileName}; echo second line >> ${fileName}`;

      Terminal.executeCommands(commandString);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;

      expect(JSON.stringify(Terminal.outputHistory)).toBe("[]");
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

      expect(Terminal.outputHistory.length).toBe(1);
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
      const scriptContent = `export async function main(ns) { ns.tprint(ns.getStdin().read()); await ns.sleep(100); ns.tprint(ns.getStdin().read()); }`;

      // Add script to server
      Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}`);

      // Pass arguments to script via pipe
      const command = `echo test1 test2 | ${scriptName} > ${outputFileName}`;
      Terminal.executeCommands(command);
      await sleep(200);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(outputFileName)?.text;

      expect(Terminal.outputHistory.length).toBe(1);
      expect(fileContent).toContain(`${scriptName}: test1 test2\n${scriptName}: NULL PORT DATA`);
      expect(fileContent).not.toContain(startingData);
    });

    it("should not permit overwriting a script file with content", () => {
      const fileName = "output.js";
      const commandString = `echo 'console.log("Hello World")' > ${fileName}; echo 'Malicious Content' > ${fileName}`;

      Terminal.executeCommands(commandString);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.scripts?.get(fileName as ScriptFilePath)?.content;

      expect(fileContent).toContain('"Hello World"');
    });
  });

  describe("piping multiple inputs", () => {
    it("should handle multiple commands with distinct pipes", () => {
      const fileName1 = "output.txt";
      const fileName2 = "output2.txt";
      const commandString = `echo test > ${fileName1}; echo test2 > ${fileName2}`;
      Terminal.executeCommands(commandString);

      expect(JSON.stringify(Terminal.outputHistory)).toBe("[]");

      const server = GetServer(Player.currentServer);
      const fileContent1 = server?.textFiles?.get(fileName1 as TextFilePath)?.text;
      expect(fileContent1).toBe("test");

      const fileContent2 = server?.textFiles?.get(fileName2 as TextFilePath)?.text;
      expect(fileContent2).toBe("test2");
    });

    it("passes all piped inputs to the output command", async () => {
      Terminal.executeCommands("echo 1337 > file1.txt");
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
      const scriptContent = `export async function main(ns) { ns.tprint("Input received: ", ns.getStdin().peek()); }`;

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
      const scriptContent = `export async function main(ns) { ns.tprint("Input received: ", ns.getStdin().peek()); }`;

      // Add script to server
      Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}`);

      // Pass arguments to script via pipe
      const command = `echo 'data' | ${scriptName} > ${outputFileName}`;
      Terminal.executeCommands(command);
      await sleep(200);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(outputFileName)?.text;

      expect(Terminal.outputHistory.length).toBe(1);
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

      expect(Terminal.outputHistory.length).toBe(1);
      expect(fileContent).toContain(`Args received: ["test1","arguments"]`);
    });

    it("should correctly pipe each script's async output to its specified location", async () => {
      // Add file to server with content
      const outputFileName = "scriptOutput.txt" as TextFilePath;
      const outputFileName2 = "scriptOutput2.txt" as TextFilePath;

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

      expect(Terminal.outputHistory.length).toBe(2);
      expect(fileContent).toContain(`${scriptName}: ["test1","test2"]\n${scriptName}: ["test1","test2"]`);
      expect(fileContent2).toContain(`${scriptName}: ["test3","test4"]\n${scriptName}: ["test3","test4"]`);
    });

    it("should correctly pipe a script's async output to a specified destination script", async () => {
      // Add file to server with content
      const outputFileName = "scriptOutput.txt" as TextFilePath;

      const scriptName = "testScript.js" as ScriptFilePath;
      const scriptName2 = "testScript2.js" as ScriptFilePath;
      const scriptContent = `export async function main(ns) { ns.tprint(ns.getStdin().peek()); await ns.sleep(80); ns.tprint(ns.getStdin().peek()); }`;
      const scriptContent2 = `export async function main(ns) { ns.tprint(ns.getStdin().read()); await ns.sleep(200); ns.tprint(ns.getStdin().read()); ns.tprint(ns.getStdin().read()); }`;

      // Add script to server
      Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}; echo '${scriptContent2}' > ${scriptName2}`);

      // Pass arguments to script via pipe
      const command = `echo 1 | ${scriptName} | ${scriptName2} > ${outputFileName}`;
      Terminal.executeCommands(command);
      await sleep(300);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(outputFileName)?.text;

      expect(Terminal.outputHistory.length).toBe(2);
      expect(fileContent).toContain(`${scriptName2}: ${scriptName}: 1\n${scriptName2}: NULL PORT DATA`);
    });

    it("should correctly pipe each script's async output to its specified destination script", async () => {
      // Add file to server with content
      const outputFileName = "scriptOutput.txt" as TextFilePath;
      const outputFileName2 = "scriptOutput2.txt" as TextFilePath;

      const scriptName = "testScript.js" as ScriptFilePath;
      const scriptName2 = "testScript2.js" as ScriptFilePath;
      const scriptName3 = "testScript3.js" as ScriptFilePath;
      const scriptName4 = "testScript4.js" as ScriptFilePath;
      const scriptContent = `export async function main(ns) { ns.tprint(ns.getStdin().peek()); await ns.sleep(80); ns.tprint(ns.getStdin().peek()); }`;
      const scriptContent2 = `export async function main(ns) { ns.tprint(ns.getStdin().read()); await ns.sleep(200); ns.tprint(ns.getStdin().read()); ns.tprint(ns.getStdin().read()); }`;

      // Add script to server
      Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}; echo '${scriptContent2}' > ${scriptName2}`);
      Terminal.executeCommands(`cat ${scriptName} > ${scriptName3}; cat ${scriptName2} > ${scriptName4};`);

      // Pass arguments to script via pipe
      const command = `echo 1 | ${scriptName} | ${scriptName2} > ${outputFileName}; echo 2 | ${scriptName3} | ${scriptName4} > ${outputFileName2}`;
      Terminal.executeCommands(command);
      await sleep(300);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(outputFileName)?.text;
      const fileContent2 = server?.textFiles?.get(outputFileName2)?.text;

      expect(Terminal.outputHistory.length).toBe(4);
      expect(fileContent).toContain(`${scriptName2}: ${scriptName}: 1\n${scriptName2}: NULL PORT DATA`);
      expect(fileContent2).toContain(`${scriptName4}: ${scriptName3}: 2\n${scriptName4}: NULL PORT DATA`);
    });
  });

  describe("input redirection", () => {
    it("should use file contents as input stream if input redirection < is used", () => {
      const fileContent = "File input data";
      const fileName = "inputFile.txt";
      Terminal.executeCommands(`echo '${fileContent}' > ${fileName}`);
      const commandString = `cat < ${fileName} | echo `;
      Terminal.executeCommands(commandString);

      const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1];
      expect(lastOutput?.text).toBe(fileContent);
    });

    it("should return an error if input redirection file does not exist", () => {
      const fileName = "nonExistentFile.txt";
      const commandString = `cat < ${fileName} | echo `;
      Terminal.executeCommands(commandString);

      const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1];
      expect(lastOutput?.text).toBe(`No file at path ${fileName}`);
    });

    it("should return an error if the input redirection is not the first pipe in the chain", () => {
      Terminal.executeCommands(`echo 'Some data' | echo < inputFile.txt`);

      const error = Terminal.outputHistory[0];
      expect(error?.text).toBe(
        `Error in pipe command: Invalid pipe command. Only the first command in a pipe chain can have input redirection '<'.`,
      );
    });
  });

  it("should handle piping content to cat", () => {
    const testContent = "This is a test.";
    const commandString = `echo "${testContent}" | cat`;
    Terminal.executeCommands(commandString);
    expect(Terminal.outputHistory.length).toBe(1);
    expect(Terminal.outputHistory[0].text).toBe(testContent);
  });

  // it("should correctly split the first command from later pipes", () => {
  //   const command = "echo hello | grep h";
  //   let firstCommand = splitPipesFromFirstCommand(command);
  //   expect(firstCommand).toBe("echo hello");
  //   expect(PipeState.currentTerminalPipe?.pipeSymbol).toEqual("|");
  //   expect(PipeState.currentTerminalPipe?.commandString).toBe("grep h");
  //
  //   clearPipe();
  //   const command2 = "cat file.txt >> output.txt";
  //   firstCommand = splitPipesFromFirstCommand(command2);
  //   expect(firstCommand).toBe("cat file.txt");
  //   expect(PipeState.currentTerminalPipe?.pipeSymbol).toEqual(">>");
  //   expect(PipeState.currentTerminalPipe?.commandString).toBe("output.txt");
  // });

  it("should replace $! with the PID of the last script run", async () => {
    const scriptName = "testScript.js" as ScriptFilePath;
    const scriptContent = `export async function main(ns) { ns.print("Script is running"); await ns.sleep(100); }`;
    const server = GetServer(Player.currentServer);

    // Add script to server
    Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}`);

    // Run the script to set PipeState.pidOfLastScriptRun
    const runningScript = runScript(scriptName, [], server);
    const expectedPid = runningScript?.pid;
    await sleep(200);

    const command = `echo $! > pidOutput.txt`;
    Terminal.executeCommands(command);
    const fileContent = server?.textFiles?.get("pidOutput.txt" as TextFilePath)?.text;

    expect(Number(fileContent)).toBe(expectedPid);
  });

  it("should replace $! with -1 if the prior command was not a run", async () => {
    const scriptName = "testScript.js" as ScriptFilePath;
    const scriptContent = `export async function main(ns) { ns.print("Script is running"); await ns.sleep(100); }`;
    const server = GetServer(Player.currentServer);

    // Add script to server
    Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}`);

    // Run the script to set PipeState.pidOfLastScriptRun
    Terminal.executeCommand(`run ${scriptName}`);
    await sleep(200);

    Terminal.executeCommands(`echo "Not a run command"`);

    const command = `echo $! > pidOutput.txt`;
    Terminal.executeCommands(command);
    const fileContent = server?.textFiles?.get("pidOutput.txt" as TextFilePath)?.text;

    expect(Number(fileContent)).toBe(-1);
  });
});
