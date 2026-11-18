import { Terminal } from "../../../src/Terminal";
import { TerminalCommands } from "../../../src/Terminal/Terminal";
import { AddToAllServers, GetServer, GetServerOrThrow, prestigeAllServers } from "../../../src/Server/AllServers";
import { Server } from "../../../src/Server/Server";
import { Player } from "@player";
import { type TextFilePath } from "../../../src/Paths/TextFilePath";
import { type ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { CompletedProgramName, LiteratureName, MessageFilename } from "@enums";
import { fixDoImportIssue, initGameEnvironment, waitForScripts } from "../Utilities";
import { runScript } from "../../../src/Terminal/commands/runScript";
import { getTerminalStdIO } from "../../../src/Terminal/StdIO/RedirectIO";
import { StdIO } from "../../../src/Terminal/StdIO/StdIO";
import { IOStream } from "../../../src/Terminal/StdIO/IOStream";
import { stringify } from "../../../src/Terminal/StdIO/utils";
import { ITutorial, iTutorialSteps } from "../../../src/InteractiveTutorial";
import { Link, Output, RawOutput } from "../../../src/Terminal/OutputTypes";
import { PromptEvent } from "../../../src/ui/React/PromptManager";
import { TerminalEvents } from "../../../src/Terminal/TerminalEvents";
import { workerScripts } from "../../../src/Netscript/WorkerScripts";
import type { TerminalAction } from "../../../src/Terminal/TerminalAction";
import { Settings } from "../../../src/Settings/Settings";
import { NetscriptPorts } from "../../../src/NetscriptPort";
import React from "react";

function findRunningScript(filename: string) {
  return [...workerScripts.values()].find((ws) => ws.name === filename)?.scriptRef;
}

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

      const mostRecentOutput = getOutput(Terminal.outputHistory, -1);
      expect(mostRecentOutput?.text).toBe(`Invalid file path provided: ${invalidFileName}`);
    });

    it("should reject invalid script filenames", async () => {
      const invalidFileName = 'a".js';
      const command = `echo 'Hello World' > ${invalidFileName}`;
      await Terminal.executeCommands(command);

      const mostRecentOutput = getOutput(Terminal.outputHistory, -1);
      if (!(mostRecentOutput instanceof Output)) {
        throw new Error("Unexpected terminal output: was not an Output");
      }
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

    it("should treat quoted pipe symbols as literal arguments", async () => {
      const fileName = "quoted.txt" as TextFilePath;
      await Terminal.executeCommands(`echo "a | b"; echo ">" > ${fileName}`);

      expect(getOutput(Terminal.outputHistory, 0).text).toBe("a | b");
      expect(GetServer(Player.currentServer)?.textFiles.get(fileName)?.text).toBe(">");
    });

    it("should keep a quoted pipe symbol literal when the command is piped", async () => {
      await Terminal.executeCommands(`echo "a | b" | grep a`);

      // grep highlights matches with ANSI color codes
      expect(stringify(getOutput(Terminal.outputHistory, -1).text, true)).toBe("a | b");
    });

    it("should pipe and redirect when the symbols have no spaces around them", async () => {
      const server = GetServerOrThrow(Player.currentServer);
      server.writeToTextFile("in.txt" as TextFilePath, "x1\ny2");

      await Terminal.executeCommands(
        "echo 1|grep 1>piped.txt; echo a>out.txt; echo b>>out.txt; cat<in.txt|grep x>in-grep.txt",
      );

      expect(server.textFiles.get("piped.txt" as TextFilePath)?.text).toBe("1");
      expect(server.textFiles.get("out.txt" as TextFilePath)?.text).toBe("a\nb");
      expect(server.textFiles.get("in-grep.txt" as TextFilePath)?.text).toBe("x1");
      expect(Terminal.outputHistory).toEqual([]);
    });

    it("should keep quoted pipe symbols literal when they have no spaces around them", async () => {
      await Terminal.executeCommands(`echo "a|b"; echo 'c>d'>quoted.txt`);

      expect(getOutput(Terminal.outputHistory, 0).text).toBe("a|b");
      expect(GetServer(Player.currentServer)?.textFiles.get("quoted.txt" as TextFilePath)?.text).toBe("c>d");
    });

    it("should not overwrite a file passed after a quoted > argument", async () => {
      const fileName = "notes.txt" as TextFilePath;
      const server = GetServerOrThrow(Player.currentServer);
      server.writeToTextFile(fileName, "a > b\nkeep me");

      await Terminal.executeCommands(`grep ">" ${fileName}`);

      expect(server.textFiles.get(fileName)?.text).toBe("a > b\nkeep me");
    });

    it("should not truncate large files when appending", async () => {
      const fileName = "big.txt" as TextFilePath;
      const server = GetServerOrThrow(Player.currentServer);
      const lines = Array.from({ length: 3000 }, (_, i) => `line ${i}`);
      server.writeToTextFile(fileName, lines.join("\n"));

      await Terminal.executeCommands(`echo extra >> ${fileName}`);

      expect(server.textFiles.get(fileName)?.text).toBe([...lines, "extra"].join("\n"));
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
      await waitForScripts();

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
      const scriptContent = `export async function main(ns) { ns.tprint(ns.port.getStdin().read()); await ns.sleep(100); ns.tprint(ns.port.getStdin().read()); }`;

      // Add script to server
      await Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}`);

      // Pass arguments to script via pipe
      const command = `echo test1 test2 | ${scriptName} > ${outputFileName}`;
      await Terminal.executeCommands(command);
      await waitForScripts();

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
      const scriptContent = `export async function main(ns) { ns.tprint(ns.port.getStdin().read()); await ns.sleep(100); ns.tprint(ns.port.getStdin().read()); }`;

      // Add script to server
      await Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}`);

      // Pass arguments to script via pipe
      const command = `echo test1 test2 | ${scriptName} > ${outputFileName}`;
      await Terminal.executeCommands(command);
      await waitForScripts();

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

      const lastOutput = getOutput(Terminal.outputHistory, -1);
      expect(lastOutput.text).toContain(fileContent);
    });

    it("should keep the line breaks of multi-line command output piped into cat", async () => {
      const server = GetServerOrThrow(Player.currentServer);
      // Created up front so both listings are the same
      server.writeToTextFile("direct.txt" as TextFilePath, "");
      server.writeToTextFile("piped.txt" as TextFilePath, "");
      Player.getHomeComputer().pushProgram(CompletedProgramName.nuke);

      await Terminal.executeCommands("ls > direct.txt; ls | cat > piped.txt");

      const direct = server.textFiles.get("direct.txt" as TextFilePath)?.text;
      expect(direct).toContain("\n");
      expect(server.textFiles.get("piped.txt" as TextFilePath)?.text).toBe(direct);
    });

    it("should pipe cat .lit file contents to specified output", async () => {
      const fileName = "test.txt";
      const server = GetServer(Player.currentServer);
      server?.messages.push(LiteratureName.HackersStartingHandbook);

      await Terminal.executeCommands(`cat ${LiteratureName.HackersStartingHandbook} > ${fileName}`);
      await Terminal.executeCommands(`cat ${fileName} | cat `);

      const newFileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;
      expect(newFileContent).toContain("hacking is the most profitable way to earn money and progress");

      const lastOutput = getOutput(Terminal.outputHistory, -1);
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

      const lastOutput = getOutput(Terminal.outputHistory, -1);
      expect(lastOutput.text).toContain("__ESCAP3__");
    });
  });

  describe("piping to and from scripts", () => {
    it("should run a script by path with its arguments", async () => {
      const scriptName = "byPath.js" as ScriptFilePath;
      const server = GetServerOrThrow(Player.currentServer);
      server.writeToScriptFile(scriptName, `export function main(ns) { ns.tprint(JSON.stringify(ns.args)); }`);

      await Terminal.executeCommands(`./${scriptName} a 1`);
      await waitForScripts();

      expect(getOutput(Terminal.outputHistory, -1).text).toBe(`${scriptName}: ["a",1]`);
    });

    it.each(["./byPath.js", "byPath.js"])(
      "should run '%s' as the first stage of a redirect instead of treating it as a file",
      async (scriptPath) => {
        const scriptName = "byPath.js" as ScriptFilePath;
        const fileName = "byPathOut.txt" as TextFilePath;
        const server = GetServerOrThrow(Player.currentServer);
        server.writeToScriptFile(scriptName, `export function main(ns) { ns.tprint(JSON.stringify(ns.args)); }`);

        await Terminal.executeCommands(`${scriptPath} a 1 > ${fileName}`);
        await waitForScripts();

        expect(server.textFiles.get(fileName)?.text).toBe(`${scriptName}: ["a",1]`);
      },
    );

    it("should run a script by path as the first stage of a pipe", async () => {
      const scriptName = "byPath.js" as ScriptFilePath;
      const fileName = "byPathGrep.txt" as TextFilePath;
      const server = GetServerOrThrow(Player.currentServer);
      server.writeToScriptFile(scriptName, `export function main(ns) { ns.tprint("found it"); ns.tprint("skip"); }`);

      await Terminal.executeCommands(`./${scriptName} | grep found > ${fileName}`);
      await waitForScripts();

      expect(server.textFiles.get(fileName)?.text).toBe(`${scriptName}: found it`);
    });

    it("should pass the same args to a piped script as to an unpiped one", async () => {
      const scriptName = "pipedArgs.js" as ScriptFilePath;
      const argsFile = "pipedArgs.txt" as TextFilePath;
      const server = GetServerOrThrow(Player.currentServer);
      server.writeToScriptFile(
        scriptName,
        `export function main(ns) { ns.write("${argsFile}", JSON.stringify(ns.args), "w"); }`,
      );

      await Terminal.executeCommands(`run ${scriptName} "007" true 'say "hi" now' | grep x`);
      await waitForScripts();

      expect(JSON.parse(server.textFiles.get(argsFile)?.text ?? "null")).toEqual(["007", true, 'say "hi" now']);
    });

    it("should handle piping to a script file, and passing arguments into a script to run", async () => {
      const scriptName = "testScript2.js" as ScriptFilePath;
      const scriptContent = `export function main(ns) { ns.tprint('Input received: ', ns.port.getStdin().peek()); }`;

      // Add script to server
      await Terminal.executeCommands(`echo "${scriptContent}" > ${scriptName}`);

      const content = GetServer(Player.currentServer)?.scripts.get(scriptName)?.content;
      expect(content).toBe(scriptContent);

      // Pass arguments to script via pipe
      const command = `echo 'data' | run ${scriptName}`;
      await Terminal.executeCommands(command);
      await waitForScripts();

      expect(getOutput(Terminal.outputHistory, 0)?.text).toContain(`Running script with 1 thread`);
      expect(getOutput(Terminal.outputHistory, 1)?.text).toEqual(`${scriptName}: Input received: data`);
    });

    it("should piping content out of a script", async () => {
      const outputFileName = "scriptOutput4.txt" as TextFilePath;
      const scriptName = "testScript.js" as ScriptFilePath;
      const scriptContent = `export async function main(ns) { ns.tprint('Input received: ', ns.port.getStdin().peek()); }`;

      // Add script to server
      await Terminal.executeCommands(`echo "${scriptContent}" > ${scriptName}`);

      const content = GetServer(Player.currentServer)?.scripts.get(scriptName)?.content;
      expect(content).toBe(scriptContent);

      // Pass arguments to script via pipe
      const command = `echo 'data' | ${scriptName} > ${outputFileName}`;
      await Terminal.executeCommands(command);
      await waitForScripts();

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
      await waitForScripts();

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
      await waitForScripts();

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
      const scriptContent = `export async function main(ns) { ns.tprint(ns.port.getStdin().peek()); await ns.sleep(80); ns.tprint(ns.port.getStdin().peek()); }`;
      const scriptContent2 = `export async function main(ns) { ns.tprint(ns.port.getStdin().read()); await ns.sleep(200); ns.tprint(ns.port.getStdin().read()); ns.tprint(ns.port.getStdin().read()); }`;

      // Add script to server
      await Terminal.executeCommands(
        `echo '${scriptContent}' > ${scriptName}; echo '${scriptContent2}' > ${scriptName2}`,
      );

      // Pass arguments to script via pipe
      const command = `echo 1 | ${scriptName} | ${scriptName2} > ${outputFileName}`;
      await Terminal.executeCommands(command);
      await waitForScripts();

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(outputFileName)?.text;

      expect(Terminal.outputHistory.length).toBe(2);
      expect(fileContent).toContain(`${scriptName2}: ${scriptName}: 1\n${scriptName2}: null`);
    });

    it("should correctly pipe each script's async output to its specified destination script", async () => {
      // Add file to server with content
      const outputFileName = "scriptOutput.txt" as TextFilePath;
      const outputFileName2 = "scriptOutput2.txt" as TextFilePath;

      const scriptName = "testScript.js" as ScriptFilePath;
      const scriptName2 = "testScript2.js" as ScriptFilePath;
      const scriptName3 = "testScript3.js" as ScriptFilePath;
      const scriptName4 = "testScript4.js" as ScriptFilePath;
      const scriptContent = `export async function main(ns) { ns.tprint(ns.port.getStdin().peek()); await ns.sleep(80); ns.tprint(ns.port.getStdin().peek()); }`;
      const scriptContent2 = `export async function main(ns) { ns.tprint(ns.port.getStdin().read()); await ns.sleep(200); ns.tprint(ns.port.getStdin().read()); ns.tprint(ns.port.getStdin().read()); }`;

      // Add script to server
      await Terminal.executeCommands(
        `echo '${scriptContent}' > ${scriptName}; echo '${scriptContent2}' > ${scriptName2}`,
      );
      await Terminal.executeCommands(`cat ${scriptName} > ${scriptName3}; cat ${scriptName2} > ${scriptName4};`);

      // Pass arguments to script via pipe
      const command = `echo 1 | ${scriptName} | ${scriptName2} > ${outputFileName}; echo 2 | ${scriptName3} | ${scriptName4} > ${outputFileName2}`;
      await Terminal.executeCommands(command);
      await waitForScripts();

      const server = GetServer(Player.currentServer);
      const fileContent = server?.textFiles?.get(outputFileName)?.text;
      const fileContent2 = server?.textFiles?.get(outputFileName2)?.text;

      expect(Terminal.outputHistory.length).toBe(4);
      expect(fileContent).toContain(`${scriptName2}: ${scriptName}: 1\n${scriptName2}: null`);
      expect(fileContent2).toContain(`${scriptName4}: ${scriptName3}: 2\n${scriptName4}: null`);
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

      const lastOutput = getOutput(Terminal.outputHistory, -1);
      expect(lastOutput?.text).toBe(fileContent);
    });

    it("should return an error if input redirection file does not exist", async () => {
      const fileName = "nonExistentFile.txt";
      const commandString = `cat < ${fileName}`;
      await Terminal.executeCommands(commandString);

      const lastOutput = getOutput(Terminal.outputHistory, -2);
      expect(lastOutput?.text).toBe(`No file at path ${fileName}`);
    });

    it("should return an error if the input redirection is not the first pipe in the chain", async () => {
      await Terminal.executeCommands(`echo 'Some data' | cat < inputFile.txt`);

      const error = getOutput(Terminal.outputHistory, 0);
      expect(error?.text).toBe(
        `Error in pipe command: Input redirection '<' can only be used after the first pipe command.`,
      );
    });
  });

  it("should handle piping content to cat", async () => {
    const testContent = "This is a test.";
    const commandString = `echo "${testContent}" | cat`;
    await Terminal.executeCommands(commandString);

    expect(Terminal.outputHistory.length).toBe(1);
    expect(getOutput(Terminal.outputHistory, 0).text).toContain(testContent);
  });

  it("should replace $! with the PID of the last script run", async () => {
    const scriptName = "testScript.js" as ScriptFilePath;
    const scriptContent = `export async function main(ns) { ns.print('Script is running'); await ns.sleep(100); }`;
    const server = GetServerOrThrow(Player.currentServer);

    // Add script to server
    await Terminal.executeCommands(`echo "${scriptContent}" > ${scriptName}`);

    // Run the script to set PipeState.pidOfLastScriptRun
    const runningScript = runScript(scriptName, [], server, getTerminalStdIO());
    const expectedPid = runningScript?.pid;
    await waitForScripts();

    const command = `echo $! > pidOutput.txt`;
    await Terminal.executeCommands(command);
    const fileContent = server?.textFiles?.get("pidOutput.txt" as TextFilePath)?.text;

    expect(Number(fileContent)).toBe(expectedPid);
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
    await waitForScripts();

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
    await waitForScripts();

    const outputFileContent = GetServer(Player.currentServer)?.textFiles?.get(tailOutputFileName)?.text;
    expect(outputFileContent).toContain("foo\nsleep: Sleeping for 0.050 seconds.\ntest2");
  });

  describe("error paths and pipeline drainage", () => {
    it("should create an empty file when grep finds no matches in piped input", async () => {
      const fileName = "noMatch.txt" as TextFilePath;
      await Terminal.executeCommands(`echo 'hello world' | grep 'missing' > ${fileName}`);

      const file = GetServer(Player.currentServer)?.textFiles?.get(fileName);
      expect(file).toBeDefined();
      expect(file?.text).toBe("");
    });

    it("should drain the pipeline and continue past a grep with no matches", async () => {
      const fileName = "afterGrep.txt" as TextFilePath;
      await Terminal.executeCommands(`echo 'hello world' | grep 'missing'; echo 'after' > ${fileName}`);

      const file = GetServer(Player.currentServer)?.textFiles?.get(fileName);
      expect(file?.text).toBe("after");
    });

    it("should close a timed action's output so the rest of the ; chain runs", async () => {
      const fileName = "afterAnalyze.txt" as TextFilePath;
      const commands = Terminal.executeCommands(`analyze | grep 'missing'; echo 'after' > ${fileName}`);

      const timeout = new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), 3000));
      const result = await Promise.race([commands.then(() => "finished" as const), timeout]);

      expect(result).toBe("finished");
      expect(GetServer(Player.currentServer)?.textFiles?.get(fileName)?.text).toBe("after");
    }, 10000);

    it("should close a program's output when run by path so the rest of the ; chain runs", async () => {
      const fileName = "afterNuke.txt" as TextFilePath;
      Player.getHomeComputer().pushProgram(CompletedProgramName.nuke);
      const commands = Terminal.executeCommands(`NUKE.exe | grep 'missing'; echo 'after' > ${fileName}`);

      const timeout = new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), 1000));
      const result = await Promise.race([commands.then(() => "finished" as const), timeout]);

      expect(result).toBe("finished");
      expect(GetServer(Player.currentServer)?.textFiles?.get(fileName)?.text).toBe("after");
    });

    it("should write both tprint chunks to a script file across a single > redirect when the file does not yet exist", async () => {
      const scriptName = "testScript.js" as ScriptFilePath;
      const outputScriptName = "freshOutput.js" as ScriptFilePath;
      const scriptContent = `export async function main(ns) { ns.tprint(ns.port.getStdin().read()); await ns.sleep(100); ns.tprint(ns.port.getStdin().read()); }`;
      await Terminal.executeCommands(`echo '${scriptContent}' > ${scriptName}`);

      // Confirm the output file does not exist before the run.
      expect(GetServer(Player.currentServer)?.scripts?.get(outputScriptName)).toBeUndefined();

      await Terminal.executeCommands(`echo first second | ${scriptName} > ${outputScriptName}`);
      await waitForScripts();

      const fileContent = GetServer(Player.currentServer)?.scripts?.get(outputScriptName)?.content;
      expect(fileContent).toContain(`${scriptName}: first second\n${scriptName}: null`);
    });

    describe("closing stdout so a downstream script sees end of input", () => {
      const readerScript = `export async function main(ns) {
        const stdin = ns.port.getStdin();
        const received = [];
        while (true) {
          if (stdin.empty()) await stdin.nextWrite();
          const data = stdin.read();
          if (data === null) break;
          received.push(data);
        }
        ns.write("eof.txt", JSON.stringify(received), "w");
      }`;

      beforeEach(() => {
        const server = GetServerOrThrow(Player.currentServer);
        server.writeToScriptFile("reader.js" as ScriptFilePath, readerScript);
        server.writeToTextFile("notes.txt" as TextFilePath, "keep me\nother");
        server.writeToScriptFile("legacy.script" as ScriptFilePath, "tprint('x');");
      });

      it.each([
        ["echo hi | grep h | run reader.js", ["hi"]],
        ["echo hi | cat | run reader.js", ["hi"]],
        ["cat notes.txt | run reader.js", ["keep me\nother"]],
        ["grep keep notes.txt | run reader.js", ["keep me"]],
        ["run legacy.script | run reader.js", []],
      ])("%s", async (command, expected) => {
        const server = GetServerOrThrow(Player.currentServer);
        await Terminal.executeCommands(command);
        await waitForScripts();

        expect(JSON.parse(server.textFiles.get("eof.txt" as TextFilePath)?.text ?? "null")).toEqual(expected);
      });

      it("a second piped tail of the same script ends the first tail's pipe", async () => {
        const server = GetServerOrThrow(Player.currentServer);
        server.writeToScriptFile(
          "long.js" as ScriptFilePath,
          `export async function main(ns) { await ns.sleep(10000); }`,
        );

        await Terminal.executeCommands("run long.js; tail long.js | run reader.js");
        const readerStdin = findRunningScript("reader.js")?.stdin;
        expect(readerStdin?.isClosed).toBe(false);
        // Logged directly, so it reaches the first tail regardless of when long.js starts running
        findRunningScript("long.js")?.log("first");

        await Terminal.executeCommands("tail long.js > second.txt");
        expect(readerStdin?.isClosed).toBe(true);
        await waitForScripts("reader.js");
        await Terminal.executeCommands("kill long.js");

        expect(JSON.parse(server.textFiles.get("eof.txt" as TextFilePath)?.text ?? "null")).toContain("first");
      });

      describe("rm with a confirmation prompt", () => {
        let promptShown: Promise<(value: boolean) => void>;
        let unsubscribe: () => void;

        beforeEach(() => {
          promptShown = new Promise((resolve) => {
            unsubscribe = PromptEvent.subscribe((prompt) => resolve(prompt.resolve));
          });
          const server = GetServerOrThrow(Player.currentServer);
          server.writeToTextFile("a.txt" as TextFilePath, "a");
          server.writeToTextFile("b.txt" as TextFilePath, "b");
        });

        afterEach(() => unsubscribe());

        it("should write its result to the pipe once the prompt is confirmed", async () => {
          const server = GetServerOrThrow(Player.currentServer);
          const commands = Terminal.executeCommands("rm a.txt b.txt | grep Deleted > rm.txt; echo after > after.txt");
          const answerPrompt = await promptShown;
          // The rest of the ; chain waits for the prompt
          expect(server.textFiles.get("after.txt" as TextFilePath)).toBeUndefined();

          answerPrompt(true);
          await commands;

          expect(server.textFiles.get("after.txt" as TextFilePath)?.text).toBe("after");
          expect(server.textFiles.has("a.txt" as TextFilePath)).toBe(false);
          expect(server.textFiles.get("rm.txt" as TextFilePath)?.text).toBe("Deleted: a.txt\nDeleted: b.txt");
        });

        it("should close the pipe without deleting anything when the prompt is declined", async () => {
          const server = GetServerOrThrow(Player.currentServer);
          const commands = Terminal.executeCommands("rm a.txt b.txt | run reader.js");
          (await promptShown)(false);
          await commands;
          await waitForScripts();

          expect(server.textFiles.has("a.txt" as TextFilePath)).toBe(true);
          expect(JSON.parse(server.textFiles.get("eof.txt" as TextFilePath)?.text ?? "null")).toEqual([]);
        });
      });
    });

    describe("; chains wait for each pipeline's output", () => {
      it.each([
        ["echo hi | grep h > first.txt", "hi"],
        ["echo hi | cat > first.txt", "hi"],
        ["echo hi > first.txt", "hi"],
      ])("'%s' has finished writing before the next command runs", async (pipeline, expected) => {
        await Terminal.executeCommands(`${pipeline}; grep h first.txt > second.txt`);

        expect(GetServerOrThrow(Player.currentServer).textFiles.get("second.txt" as TextFilePath)?.text).toBe(expected);
      });

      it.each(["run long.js | grep first > out.txt", "tail long.js | grep first > out.txt"])(
        "'%s' does not hold up the rest of the chain while the script runs",
        async (pipeline) => {
          const server = GetServerOrThrow(Player.currentServer);
          server.writeToScriptFile(
            "long.js" as ScriptFilePath,
            `export async function main(ns) { ns.print("first"); ns.tprint("first"); await ns.sleep(10000); }`,
          );
          if (pipeline.startsWith("tail")) await Terminal.executeCommands("run long.js");

          const commands = Terminal.executeCommands(`${pipeline}; echo after > after.txt`);
          const timeout = new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), 1000));
          const result = await Promise.race([commands.then(() => "finished" as const), timeout]);
          await Terminal.executeCommands("kill long.js");

          expect(result).toBe("finished");
          expect(server.textFiles.get("after.txt" as TextFilePath)?.text).toBe("after");
        },
      );
    });

    it.each([
      ["todo.txt | grep x", "Invalid command string: no pipe symbol found for piping to file todo.txt."],
      [
        "echo hi > ls | grep x",
        "Invalid pipe symbol '>' for command: ls. > and >> can only be used to pipe into files.",
      ],
      ["ls |", "Invalid command string: no command found after output redirect |."],
      ["ls > | grep x", "Invalid command string: no command found after output redirect >."],
    ])("should print the redirect error for '%s' to the terminal and finish the pipeline", async (command, error) => {
      const commands = Terminal.executeCommands(command);

      const timeout = new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), 1000));
      const result = await Promise.race([commands.then(() => "finished" as const), timeout]);

      expect(result).toBe("finished");
      expect(getOutput(Terminal.outputHistory, -1).text).toBe(error);
    });
    describe("during the interactive tutorial", () => {
      beforeEach(() => {
        // The tutorial looks up n00dles before checking the command
        AddToAllServers(new Server({ hostname: "n00dles" }));
      });

      afterEach(() => {
        ITutorial.isRunning = false;
      });

      it.each([
        [
          iTutorialSteps.TerminalHelp,
          "ls | grep x",
          "Bad command. Please follow the tutorial or click 'Exit Tutorial' if you'd like to skip it.",
        ],
        [iTutorialSteps.TerminalLs, "1s | grep x", "Command '1s' not found. Did you mean 'ls' with a lowercase L?"],
        [iTutorialSteps.TerminalConnect, "connect foo | grep x", "Wrong command! Try again!"],
        [
          iTutorialSteps.Start,
          "ls | grep x",
          "Please follow the tutorial or click 'Exit Tutorial' if you'd like to skip it",
        ],
      ])(
        "should print the rejection for '%s' (step %s) to the terminal and finish the pipeline",
        async (step, command, error) => {
          ITutorial.isRunning = true;
          ITutorial.currStep = step;
          const commands = Terminal.executeCommands(command);

          const timeout = new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), 1000));
          const result = await Promise.race([commands.then(() => "finished" as const), timeout]);

          expect(result).toBe("finished");
          // Every stage is rejected, so grep prints its own rejection too
          expect(Terminal.outputHistory.map((line) => (line as Output).text)).toContain(error);
        },
      );
    });
  });

  describe("with timestamps enabled", () => {
    const timestamp = String.raw`\[\d\d:\d\d:\d\d\] `;

    beforeEach(() => {
      Settings.TimestampsFormat = "HH:mm:ss";
      const server = GetServerOrThrow(Player.currentServer);
      server.writeToTextFile("a.txt" as TextFilePath, "a");
      server.writeToTextFile("b.txt" as TextFilePath, "b");
    });

    afterEach(() => {
      Settings.TimestampsFormat = "";
    });

    it("keeps timestamps out of redirected files", async () => {
      await Terminal.executeCommands("cp a.txt b.txt > log.txt");

      expect(GetServerOrThrow(Player.currentServer).textFiles.get("log.txt" as TextFilePath)?.text).toBe(
        "File a.txt copied to b.txt\nb.txt was overwritten.",
      );
    });

    it("shows one timestamp on a coloured line piped back to the terminal", async () => {
      await Terminal.executeCommands("cp a.txt b.txt | grep overwritten");

      expect(stringify(getOutput(Terminal.outputHistory, -1), true)).toMatch(
        new RegExp(`^${timestamp}b\\.txt was overwritten\\.$`),
      );
    });

    it("still timestamps every kind of output shown directly on the terminal", async () => {
      await Terminal.executeCommands("cp a.txt b.txt");
      Terminal.printRaw(React.createElement("span", null, "raw"), getTerminalStdIO());

      const lines = Terminal.outputHistory.map((line) => stringify(line, true));
      expect(lines).toHaveLength(3);
      for (const line of lines) expect(line).toMatch(new RegExp(`^${timestamp}`));
    });
  });

  describe("freeing pipe data nobody reads", () => {
    const pipePorts = () => [...NetscriptPorts.keys()].filter((n) => n < 0);

    beforeEach(() => {
      const server = GetServerOrThrow(Player.currentServer);
      server.writeToScriptFile("noread.js" as ScriptFilePath, `export async function main(ns) { await ns.sleep(10); }`);
      server.writeToScriptFile(
        "chatty.js" as ScriptFilePath,
        `export async function main(ns) { for (let i = 0; i < 5; i++) { ns.tprintf("x%d", i); await ns.sleep(10); } }`,
      );
    });

    it.each(["echo hi | ls", "echo hi | run noread.js", "run chatty.js | run noread.js"])(
      "'%s' leaves no pipe data behind",
      async (command) => {
        const before = pipePorts();

        await Terminal.executeCommands(command);
        await waitForScripts();

        expect(pipePorts()).toEqual(before);
      },
    );
  });

  describe("re-review regressions", () => {
    it("keeps every line of a large burst of script output piped into a file", async () => {
      const server = GetServerOrThrow(Player.currentServer);
      server.writeToScriptFile(
        "burst.js" as ScriptFilePath,
        `export function main(ns) { for (let i = 0; i < 1500; i++) ns.tprintf("L%d", i); }`,
      );

      await Terminal.executeCommands("run burst.js > burst.txt");
      await waitForScripts();

      const lines = server.textFiles.get("burst.txt" as TextFilePath)?.text.split("\n");
      expect(lines?.length).toBe(1500);
      expect(lines?.[0]).toBe("L0");
      expect(lines?.[1499]).toBe("L1499");
    });

    it("shows a script's output on the terminal after the command reading it stops", async () => {
      const server = GetServerOrThrow(Player.currentServer);
      server.writeToScriptFile(
        "producer.js" as ScriptFilePath,
        `export async function main(ns) { ns.tprintf("started"); await ns.sleep(50); ns.tprintf("later output"); }`,
      );

      await Terminal.executeCommands("run producer.js | grep -m 1 started");
      await waitForScripts();

      const texts = Terminal.outputHistory.map((line) => stringify(line));
      // grep highlights the match, so only check the line is there
      expect(texts.some((text) => text.includes("started"))).toBe(true);
      expect(texts).toContain("later output");
    });

    it.each([
      ["run logger.js > log.txt", true],
      ["run logger.js | grep x", true],
      ["echo hi | run logger.js", true],
      ["run logger.js", false],
    ])("'%s' makes the script temporary: %s", async (command, temporary) => {
      const server = GetServerOrThrow(Player.currentServer);
      server.writeToScriptFile(
        "logger.js" as ScriptFilePath,
        `export async function main(ns) { await ns.sleep(10000); }`,
      );

      await Terminal.executeCommands(command);
      const script = findRunningScript("logger.js");
      await Terminal.executeCommands("kill logger.js");

      expect(script?.temporary).toBe(temporary);
    });

    it("lets a script read its stdin again, and after clear(), without freezing", async () => {
      const server = GetServerOrThrow(Player.currentServer);
      server.writeToScriptFile(
        "rereader.js" as ScriptFilePath,
        `export async function main(ns) {
          const stdin = ns.port.getStdin();
          const readAll = async () => {
            const received = [];
            for (let i = 0; i < 100; i++) {
              if (stdin.empty()) await stdin.nextWrite();
              const data = stdin.read();
              if (data === null) return received;
              received.push(data);
            }
            return "never ended";
          };
          const first = await readAll();
          const second = await readAll();
          stdin.clear();
          const third = await readAll();
          ns.write("reads.txt", JSON.stringify([first, second, third]), "w");
        }`,
      );

      await Terminal.executeCommands("echo hi | run rereader.js");
      await waitForScripts();

      expect(JSON.parse(server.textFiles.get("reads.txt" as TextFilePath)?.text ?? "null")).toEqual([["hi"], [], []]);
    });

    describe("cat with stdin that has no data", () => {
      it.each(["echo hi | grep zzz | cat > out.txt", "cat < empty.txt > out.txt"])(
        "'%s' writes an empty file without an error",
        async (command) => {
          const server = GetServerOrThrow(Player.currentServer);
          server.writeToTextFile("empty.txt" as TextFilePath, "");

          await Terminal.executeCommands(command);

          expect(Terminal.outputHistory.map((line) => stringify(line))).toEqual([]);
          expect(server.textFiles.get("out.txt" as TextFilePath)?.text).toBe("");
        },
      );

      it("still errors when there are no files and nothing is piped in", async () => {
        await Terminal.executeCommands("cat");

        expect(getOutput(Terminal.outputHistory, -1).text).toContain("No files specified, and no stdin provided");
      });

      it("does not add a blank first line while a script's output is still streaming in", async () => {
        const server = GetServerOrThrow(Player.currentServer);
        server.writeToScriptFile(
          "slow.js" as ScriptFilePath,
          `export async function main(ns) { await ns.sleep(20); ns.tprintf("a"); ns.tprintf("b"); }`,
        );

        await Terminal.executeCommands("run slow.js | cat | grep -n b > lines.txt");
        await waitForScripts();

        expect(server.textFiles.get("lines.txt" as TextFilePath)?.text).toBe("2:b");
      });
    });
  });

  describe("cancellation", () => {
    it("an action that ignores Ctrl-C does not clear the next action when it finishes", async () => {
      // Like upload, whose cancel() does nothing
      const startAction = (name: string, onCancel: () => void) => {
        let finish = () => {};
        const finished = new Promise<void>((resolve) => (finish = resolve));
        let action: TerminalAction | undefined;
        TerminalCommands[name] = (_args, _server, stdIO) =>
          (action = { cancel: onCancel, finished, getProgressText: () => "", stdIO });
        const commands = Terminal.executeCommands(name);
        return { commands, finish, action: () => action };
      };
      let secondCancelled = false;
      try {
        const first = startAction("ignorescancel", () => {});
        expect(Terminal.action).toBe(first.action());
        Terminal.cancelAction();
        expect(Terminal.action).toBeNull();

        const second = startAction("secondaction", () => (secondCancelled = true));
        expect(Terminal.action).toBe(second.action());

        first.finish();
        await first.commands;

        expect(Terminal.action).toBe(second.action());
        expect(secondCancelled).toBe(false);

        second.finish();
        await second.commands;
        expect(Terminal.action).toBeNull();
      } finally {
        delete TerminalCommands.ignorescancel;
        delete TerminalCommands.secondaction;
      }
    });

    it("cancelAction closes the running action's stdIO", () => {
      const stdin = new IOStream();
      const stdIO = new StdIO(stdin);
      let cancelCalled = false;
      Terminal.action = {
        cancel: () => {
          cancelCalled = true;
        },
        finished: Promise.resolve(),
        getProgressText: () => "",
        stdIO,
      };

      Terminal.cancelAction();

      expect(cancelCalled).toBe(true);
      expect(Terminal.action).toBeNull();
      expect(stdIO.stdout?.isClosed).toBe(true);
      expect(stdin.isClosed).toBe(true);
    });

    it("cancelAction allows a downstream pipe consumer to drain instead of hanging", async () => {
      const upstream = new StdIO(null);
      const downstreamStdin = upstream.stdout;
      const downstream = new StdIO(downstreamStdin, null);

      const received: unknown[] = [];
      const drained = (async () => {
        for await (const chunk of downstream) {
          if (chunk === null) break;
          received.push(chunk);
        }
      })();

      upstream.write("first");

      Terminal.action = {
        cancel: () => {},
        finished: Promise.resolve(),
        getProgressText: () => "",
        stdIO: upstream,
      };
      Terminal.cancelAction();

      // Race the drain against a short timeout to fail fast if cancellation leaks the pipe.
      const timeout = new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), 100));
      const result = await Promise.race([drained.then(() => "drained" as const), timeout]);

      expect(result).toBe("drained");
      expect(received).toEqual(["first"]);
      expect(downstreamStdin?.isClosed).toBe(true);
    });

    it.each(["analyze", "analyze | grep missing"])(
      "Ctrl-C during '%s' stops the rest of the ; chain",
      async (command) => {
        const fileName = "afterCancel.txt" as TextFilePath;
        const actionStarted = new Promise<void>((resolve) => {
          const unsubscribe = TerminalEvents.subscribe(() => {
            if (!Terminal.action) return;
            unsubscribe();
            resolve();
          });
        });
        const commands = Terminal.executeCommands(`${command}; echo after > ${fileName}`);
        await actionStarted;
        expect(Terminal.action).not.toBeNull();

        Terminal.cancelAction();
        const timeout = new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), 1000));
        const result = await Promise.race([commands.then(() => "finished" as const), timeout]);

        expect(result).toBe("finished");
        expect(Terminal.action).toBeNull();
        expect(GetServer(Player.currentServer)?.textFiles?.get(fileName)).toBeUndefined();
      },
    );
  });
});

export function getOutput(outputHistory: (Output | Link | RawOutput)[], index = 0) {
  const locationIndex = index < 0 ? outputHistory.length - Math.abs(index) : index;
  const mostRecentOutput = outputHistory[locationIndex];
  if (!(mostRecentOutput instanceof Output)) {
    throw new Error("Unexpected terminal output: was not an Output");
  }
  return mostRecentOutput;
}
