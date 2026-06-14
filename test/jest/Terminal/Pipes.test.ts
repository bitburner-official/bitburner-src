import { Terminal } from "../../../src/Terminal";
import { GetServer, prestigeAllServers } from "../../../src/Server/AllServers";
import { Player } from "@player";
import { type TextFilePath } from "../../../src/Paths/TextFilePath";
import { type ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { LiteratureName, MessageFilename } from "@enums";
import { fixDoImportIssue, initGameEnvironment } from "../Utilities";
import { runScript } from "../../../src/Terminal/commands/runScript";
import { getTerminalStdIO } from "../../../src/Terminal/StdIO/RedirectIO";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

fixDoImportIssue();
initGameEnvironment();

describe("Terminal Pipes", () => {
  beforeEach(() => {
    prestigeAllServers();
    Player.init();
    Terminal.outputHistory = [];
    GetServer(Player.currentServer)?.textFiles.clear();
    GetServer(Player.currentServer)?.scripts.clear();
  });

  describe("piping to files", () => {
    it("should handle piping to a file", async () => {
      const fileName = "output.txt";
      const command = `echo 'Hello World' > ${fileName}`;
      await Terminal.executeCommands(command);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;

      expect(JSON.stringify(Terminal.outputHistory)).toBe("[]");
      expect(fileContent).toBe("Hello World");
    });

    it("should reject invalid text filenames", async () => {
      const invalidFileName = 'a".txt';
      const command = `echo 'Hello World' > ${invalidFileName}`;
      await Terminal.executeCommands(command);

      const mostRecentOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1];
      expect(mostRecentOutput?.text).toBe(`Invalid file path provided: ${invalidFileName}`);
    });

    it("should reject invalid script filenames", async () => {
      const invalidFileName = 'a".js';
      const command = `echo 'Hello World' > ${invalidFileName}`;
      await Terminal.executeCommands(command);

      const mostRecentOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1];
      expect(mostRecentOutput?.text).toBe(`Invalid file path provided: ${invalidFileName}`);
    });

    it("should append to a file when using >> operator", async () => {
      const fileName = "output.txt";
      const commandString = `echo first line >> ${fileName}; echo second line >> ${fileName}`;

      await Terminal.executeCommands(commandString);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;

      expect(JSON.stringify(Terminal.outputHistory)).toBe("[]");
      expect(fileContent).toBe("first line\nsecond line");
    });

    it("should overwrite a file when using > operator", async () => {
      const fileName = "output.txt";
      const commandString = `echo first line > ${fileName}; echo second line > ${fileName}`;

      await Terminal.executeCommands(commandString);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;
      expect(fileContent).toBe("second line");
    });

    it("should only overwrite file contents once per > pipe", async () => {
      // Add file to server with content
      const outputFileName = "scriptOutput9.txt" as TextFilePath;
      const startingData = "startingData";
      const commandString = `echo ${startingData} > ${outputFileName}`;
      await Terminal.executeCommands(commandString);

      const scriptName = "testScript.js" as ScriptFilePath;
      const scriptContent = `export async function main(ns) { ns.tprint(ns.args); await ns.sleep(100); ns.tprint(ns.args); }`;

      // Add script to server
      await Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}`);

      // Pass arguments to script via pipe
      const command = `run ${scriptName} test1 > ${outputFileName}`;
      await Terminal.executeCommands(command);
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
      await Terminal.executeCommands(commandString);

      const scriptName = "testScript.js" as ScriptFilePath;
      const scriptContent = `export async function main(ns) { ns.tprint(ns.getStdin().read()); await ns.sleep(100); ns.tprint(ns.getStdin().read()); }`;

      // Add script to server
      await Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}`);

      // Pass arguments to script via pipe
      const command = `echo test1 test2 | ${scriptName} > ${outputFileName}`;
      await Terminal.executeCommands(command);
      await sleep(200);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(outputFileName)?.text;

      expect(Terminal.outputHistory.length).toBe(1);
      expect(fileContent).toContain(`${scriptName}: test1 test2\n${scriptName}: null`);
      expect(fileContent).not.toContain(startingData);
    });

    it("should only overwrite script contents once per > pipe when arguments are piped in", async () => {
      // Add file to server with content
      const outputFileName = "outputScript.js" as ScriptFilePath;
      const startingData = "startingData";
      const commandString = `echo ${startingData} > ${outputFileName}`;
      await Terminal.executeCommands(commandString);

      const scriptName = "testScript.js" as ScriptFilePath;
      const scriptContent = `export async function main(ns) { ns.tprint(ns.getStdin().read()); await ns.sleep(100); ns.tprint(ns.getStdin().read()); }`;

      // Add script to server
      await Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}`);

      // Pass arguments to script via pipe
      const command = `echo test1 test2 | ${scriptName} > ${outputFileName}`;
      await Terminal.executeCommands(command);
      await sleep(200);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.scripts?.get(outputFileName)?.content;

      expect(Terminal.outputHistory.length).toBe(1);
      expect(fileContent).toContain(`${scriptName}: test1 test2\n${scriptName}: null`);
      expect(fileContent).not.toContain(startingData);
    });
  });

  describe("piping multiple inputs", () => {
    it("should handle multiple commands with distinct pipes", async () => {
      const fileName1 = "output.txt";
      const fileName2 = "output2.txt";
      const commandString = `echo test > ${fileName1}; echo test2 > ${fileName2}`;
      await Terminal.executeCommands(commandString);

      expect(JSON.stringify(Terminal.outputHistory)).toBe("[]");

      const server = GetServer(Player.currentServer);
      const fileContent1 = server?.textFiles?.get(fileName1 as TextFilePath)?.text;
      expect(fileContent1).toBe("test");

      const fileContent2 = server?.textFiles?.get(fileName2 as TextFilePath)?.text;
      expect(fileContent2).toBe("test2");
    });

    it("passes all piped inputs to the output command", async () => {
      await Terminal.executeCommands("echo 1337 > file1.txt");
      const command = "cat file1.txt > file2.txt";
      await Terminal.executeCommands(command);
      await sleep(100);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get("file2.txt" as TextFilePath)?.text;
      expect(fileContent).toBe("1337");
    });
  });

  describe("cat and echo with pipes", () => {
    it("should pipe cat file contents to specified output", async () => {
      const fileName = "test4.txt";
      const fileContent = "This is a test file.";
      await Terminal.executeCommands(`echo '${fileContent}' > ${fileName}`);
      await Terminal.executeCommands(`cat '${fileName}' | cat`);

      const server = GetServer(Player.currentServer);
      const newFileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;
      expect(newFileContent).toBe(fileContent);

      const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1];
      expect(lastOutput.text).toContain(fileContent);
    });

    it("should pipe cat .lit file contents to specified output", async () => {
      const fileName = "test.txt";
      const server = GetServer(Player.currentServer);
      server?.messages.push(LiteratureName.HackersStartingHandbook);

      await Terminal.executeCommands(`cat ${LiteratureName.HackersStartingHandbook} > ${fileName}`);
      await Terminal.executeCommands(`cat ${fileName} | cat `);

      const newFileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;
      expect(newFileContent).toContain("hacking is the most profitable way to earn money and progress");

      const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1];
      expect(lastOutput.text).toContain("hacking is the most profitable way to earn money and progress");
    });

    it("should pipe cat message file contents to specified output", async () => {
      const fileName = "test3.txt";
      const server = GetServer(Player.currentServer);
      server?.messages.push(MessageFilename.TruthGazer);

      await Terminal.executeCommands(`cat ${MessageFilename.TruthGazer} > ${fileName}`);
      await Terminal.executeCommands(`cat ${fileName} | cat `);

      const newFileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;
      expect(newFileContent).toContain("__ESCAP3__");

      const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1];
      expect(lastOutput.text).toContain("__ESCAP3__");
    });
  });

  describe("piping to and from scripts", () => {
    it("should handle piping to a script file, and passing arguments into a script to run", async () => {
      const scriptName = "testScript2.js" as ScriptFilePath;
      const scriptContent = `export function main(ns) { ns.tprint('Input received: ', ns.getStdin().peek()); }`;

      // Add script to server
      await Terminal.executeCommands(`echo "${scriptContent}" > ${scriptName}`);

      const content = GetServer(Player.currentServer)?.scripts.get(scriptName)?.content;
      expect(content).toBe(scriptContent);

      // Pass arguments to script via pipe
      const command = `echo 'data' | run ${scriptName}`;
      await Terminal.executeCommands(command);
      await sleep(100);

      expect(Terminal.outputHistory[0]?.text).toContain(`Running script with 1 thread`);
      expect(Terminal.outputHistory[1]?.text).toEqual(`${scriptName}: Input received: data`);
    });

    it("should piping content out of a script", async () => {
      const outputFileName = "scriptOutput4.txt" as TextFilePath;
      const scriptName = "testScript.js" as ScriptFilePath;
      const scriptContent = `export async function main(ns) { ns.tprint('Input received: ', ns.getStdin().peek()); }`;

      // Add script to server
      await Terminal.executeCommands(`echo "${scriptContent}" > ${scriptName}`);

      const content = GetServer(Player.currentServer)?.scripts.get(scriptName)?.content;
      expect(content).toBe(scriptContent);

      // Pass arguments to script via pipe
      const command = `echo 'data' | ${scriptName} > ${outputFileName}`;
      await Terminal.executeCommands(command);
      await sleep(200);

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(outputFileName)?.text;

      expect(Terminal.outputHistory.length).toBe(1);
      expect(fileContent).toContain(`Input received: data`);
    });

    it("should pipe content out of a script when the run command is used", async () => {
      const outputFileName = "scriptOutput3.txt" as TextFilePath;
      const scriptName = "testScript.js" as ScriptFilePath;
      const scriptContent = `export function main(ns) { ns.tprint('Args received: ', ns.args); }`;

      // Add script to server
      await Terminal.executeCommands(`echo "${scriptContent}" > ${scriptName}`);

      const content = GetServer(Player.currentServer)?.scripts.get(scriptName)?.content;
      expect(content).toBe(scriptContent);

      // Pass arguments to script via pipe
      const command = `run ${scriptName} test1 arguments > ${outputFileName}`;
      await Terminal.executeCommands(command);
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
      await Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}`);

      // Pass arguments to script via pipe
      const command = `run ${scriptName} test1 test2 > ${outputFileName}; run ${scriptName} test3 test4 > ${outputFileName2}`;
      await Terminal.executeCommands(command);
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
      await Terminal.executeCommands(
        `echo '${scriptContent}' > ${scriptName}; echo '${scriptContent2}' > ${scriptName2}`,
      );

      // Pass arguments to script via pipe
      const command = `echo 1 | ${scriptName} | ${scriptName2} > ${outputFileName}`;
      await Terminal.executeCommands(command);
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
      await Terminal.executeCommands(
        `echo '${scriptContent}' > ${scriptName}; echo '${scriptContent2}' > ${scriptName2}`,
      );
      await Terminal.executeCommands(`cat ${scriptName} > ${scriptName3}; cat ${scriptName2} > ${scriptName4};`);

      // Pass arguments to script via pipe
      const command = `echo 1 | ${scriptName} | ${scriptName2} > ${outputFileName}; echo 2 | ${scriptName3} | ${scriptName4} > ${outputFileName2}`;
      await Terminal.executeCommands(command);
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
    it("should use file contents as input stream if input redirection < is used", async () => {
      const fileContent = "File input data";
      const fileName = "inputFile.txt";
      await Terminal.executeCommands(`echo '${fileContent}' > ${fileName}`);

      const fileContentOnServer = GetServer(Player.currentServer)?.textFiles?.get(fileName as TextFilePath)?.text;
      expect(fileContentOnServer).toBe(fileContent);

      const commandString = `cat < ${fileName} | cat `;
      await Terminal.executeCommands(commandString);

      const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1];
      expect(lastOutput?.text).toBe(fileContent);
    });

    it("should return an error if input redirection file does not exist", async () => {
      const fileName = "nonExistentFile.txt";
      const commandString = `cat < ${fileName}`;
      await Terminal.executeCommands(commandString);

      const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 2];
      expect(lastOutput?.text).toBe(`No file at path ${fileName}`);
    });

    it("should return an error if the input redirection is not the first pipe in the chain", async () => {
      await Terminal.executeCommands(`echo 'Some data' | cat < inputFile.txt`);

      const error = Terminal.outputHistory[0];
      expect(error?.text).toBe(
        `Error in pipe command: Invalid pipe command. Only the first command in a pipe chain can have input redirection '<'.`,
      );
    });
  });

  it("should handle piping content to cat", async () => {
    const testContent = "This is a test.";
    const commandString = `echo "${testContent}" | cat`;
    await Terminal.executeCommands(commandString);
    await sleep(50);

    expect(Terminal.outputHistory.length).toBe(1);
    expect(Terminal.outputHistory[0].text).toContain(testContent);
  });

  it("should replace $! with the PID of the last script run", async () => {
    const scriptName = "testScript.js" as ScriptFilePath;
    const scriptContent = `export async function main(ns) { ns.print('Script is running'); await ns.sleep(100); }`;
    const server = GetServer(Player.currentServer);

    // Add script to server
    await Terminal.executeCommands(`echo "${scriptContent}" > ${scriptName}`);
    await sleep(50);

    // Run the script to set PipeState.pidOfLastScriptRun
    const runningScript = runScript(scriptName, [], server, getTerminalStdIO());
    const expectedPid = runningScript?.pid;
    await sleep(200);

    const command = `echo $! > pidOutput.txt`;
    await Terminal.executeCommands(command);
    await sleep(50);
    const fileContent = server?.textFiles?.get("pidOutput.txt" as TextFilePath)?.text;

    expect(Number(fileContent)).toBe(expectedPid);
  });

  it("should replace $! with -1 if the prior command was not a run", async () => {
    const scriptName = "testScript.js" as ScriptFilePath;
    const scriptContent = `export async function main(ns) { ns.print("Script is running"); await ns.sleep(100); }`;
    const server = GetServer(Player.currentServer);

    // Add script to server
    await Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}`);
    await sleep(50);

    // Run the script to set PipeState.pidOfLastScriptRun
    await Terminal.executeCommands(`run ${scriptName}`);
    await sleep(200);

    await Terminal.executeCommands(`echo "Not a run command"`);

    const command = `echo $! > pidOutput.txt`;
    await Terminal.executeCommands(command);
    const fileContent = server?.textFiles?.get("pidOutput.txt" as TextFilePath)?.text;

    expect(Number(fileContent)).toBe(-1);
  });

  it("should pipe the tail output of scripts to stdout when specified with $!", async () => {
    const scriptContent = `export async function main(ns) {ns.print('foo');await ns.sleep(50);ns.print('test2');}`;
    const scriptName = "testScript.jsx" as ScriptFilePath;
    const tailOutputFileName = "tailOutput.txt" as TextFilePath;

    // Add script to server
    await Terminal.executeCommands(`echo "${scriptContent}" > ${scriptName}`);

    const fileContent = GetServer(Player.currentServer)?.scripts?.get(scriptName)?.content;
    expect(fileContent).toBe(scriptContent);

    await Terminal.executeCommands(`run ${scriptName}; tail $! > ${tailOutputFileName}`);
    await sleep(200);

    const outputFileContent = GetServer(Player.currentServer)?.textFiles?.get(tailOutputFileName)?.text;
    expect(outputFileContent).toContain("foo\nsleep: Sleeping for 0.050 seconds.\ntest2");
  });

  it("should pipe the tail output of scripts to stdout", async () => {
    const scriptContent = `export async function main(ns) {ns.print('foo');await ns.sleep(50);ns.print('test2');}`;
    const scriptName = "testScript.jsx" as ScriptFilePath;
    const tailOutputFileName = "tailOutput.txt" as TextFilePath;

    // Add script to server
    await Terminal.executeCommands(`echo "${scriptContent}" > ${scriptName}`);

    const fileContent = GetServer(Player.currentServer)?.scripts?.get(scriptName)?.content;
    expect(fileContent).toBe(scriptContent);

    await Terminal.executeCommands(`run ${scriptName}; tail ${scriptName} > ${tailOutputFileName}`);
    await sleep(200);

    const outputFileContent = GetServer(Player.currentServer)?.textFiles?.get(tailOutputFileName)?.text;
    expect(outputFileContent).toContain("foo\nsleep: Sleeping for 0.050 seconds.\ntest2");
  });
});
