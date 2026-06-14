import { IOStream } from "../../../src/Terminal/StdIO/IOStream";
import {
  findCommandsSplitByRedirects,
  getTerminalStdIO,
  handleCommand,
  parseRedirectedCommands,
} from "../../../src/Terminal/StdIO/RedirectIO";
import { Terminal } from "../../../src/Terminal";
import { fixDoImportIssue, initGameEnvironment } from "../Utilities";
import { GetServer, prestigeAllServers } from "../../../src/Server/AllServers";
import { Player } from "@player";
import { StdIO } from "../../../src/Terminal/StdIO/StdIO";
import { TextFilePath } from "../../../src/Paths/TextFilePath";
import { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { Output } from "../../../src/Terminal/OutputTypes";
import { ANSI_ESCAPE } from "../../../src/ui/React/ANSIITypography";

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

fixDoImportIssue();
initGameEnvironment();

describe("RedirectIOTests", () => {
  beforeEach(() => {
    prestigeAllServers();
    Player.init();
    Terminal.outputHistory = [];
    GetServer(Player.currentServer)?.textFiles.clear();
    GetServer(Player.currentServer)?.scripts.clear();
  });

  it("should redirect output to the terminal correctly from a terminal StdIO", async () => {
    const data = "Hello, Terminal!";
    const terminalIO = getTerminalStdIO();
    terminalIO.write(data);
    await sleep(50);

    expect(Terminal.outputHistory.length).toBe(1);
    expect(Terminal.outputHistory[0].text).toContain(data);
  });

  it("findCommandsSplitByRedirects should split commands by pipes", () => {
    const commandString = "echo Hello > file.txt >> anotherFile.txt | echo World";
    const parsedCommands = commandString.split(" ");
    const result = findCommandsSplitByRedirects(parsedCommands);

    expect(result[0]).toEqual(["echo", "Hello"]);
    expect(result[1]).toEqual([">", "file.txt"]);
    expect(result[2]).toEqual([">>", "anotherFile.txt"]);
    expect(result[3]).toEqual(["|", "echo", "World"]);
    expect(result.length).toBe(4);
  });

  describe("handleCommand", () => {
    it("should handle echo command passing its args to stdout", async () => {
      const commandString = "echo Hello, World";
      const stdIO = new StdIO(null);
      handleCommand(stdIO, commandString.split(" "));
      await sleep(50);

      expect(stdIO.stdout.empty()).toBe(false);
      const output = stdIO.stdout.read();
      expect(output).toBe("Hello, World");
    });

    it("should handle writing stdin contents to files", async () => {
      const filename = "output.txt";
      const commandString = `> ${filename}`;
      const stdin = new IOStream();
      const stdIO = new StdIO(stdin);
      void handleCommand(stdIO, commandString.split(" "));
      stdin.write("File content line 1");
      stdin.write("File content line 2");

      await sleep(50);
      const server = GetServer(Player.currentServer);
      const file = server?.textFiles.get(filename as TextFilePath);
      expect(file).toBeDefined();
      expect(file?.content).toBe("File content line 1\nFile content line 2");
    });
  });

  describe("parseRedirectedCommands", () => {
    it("should append echo output redirected to a file", async () => {
      const filename = "appendOutput.txt";
      const commandString = `echo First Line >> ${filename} | echo Second Line >> ${filename}`;

      await parseRedirectedCommands(commandString);

      const server = GetServer(Player.currentServer);
      const file = server?.textFiles.get(filename as TextFilePath);
      expect(file).toBeDefined();
      expect(file?.content).toBe("First Line\nSecond Line");
    });
  });

  describe("stdout from scripts", () => {
    it("should redirect tprint output from a running script to a file", async () => {
      const scriptName = "testScript.js";
      const filename = "scriptLog.txt";
      const scriptContent = `export function main(ns) { ns.tprint('Logging to file' ); }`;
      await Terminal.executeCommands(`echo "${scriptContent}" > ${scriptName}`);

      const currentScripts = GetServer(Player.currentServer)?.scripts;
      const script = currentScripts?.get(scriptName as ScriptFilePath);
      expect(script?.content).toBe(scriptContent);

      await Terminal.executeCommands(`run ${scriptName} >> ${filename}`);
      await sleep(50);

      const server = GetServer(Player.currentServer);
      const file = server?.textFiles.get(filename as TextFilePath);
      expect(file?.content).toBe("testScript.js: Logging to file");
    });
  });

  describe("stdin to scripts", () => {
    it("should provide stdin input to a running script", async () => {
      const scriptName = "inputScript.js";
      const scriptContent = `export async function main(ns) {
          const stdIn = await ns.getStdin();
          if (stdIn?.empty()) {
            ns.tprint('No input received yet');
            await stdIn.nextWrite();
          }
          const input = stdIn?.read();
          ns.tprint('Received input: ' + input);
        }`;
      await Terminal.executeCommands(`echo "${scriptContent}" > ${scriptName}`);

      const inputData = "Hello from stdin!";
      await Terminal.executeCommands(`echo "${inputData}" | run ${scriptName}`);
      await sleep(50);

      console.log(Terminal.outputHistory);
      const outputLog: Output[] = Terminal.outputHistory.filter(isOutput);
      const outputText: Output = outputLog.find((entry: Output) => entry.text?.includes("Received input:"));
      expect(outputText?.text).toEqual(`${scriptName}: Received input: ${inputData}`);
    });

    it("should provide stdin input from a script to a running script", async () => {
      const scriptName = "inputScript.js";
      const scriptContent = `export async function main(ns) {
          const stdIn = await ns.getStdin();
          if (stdIn?.empty()) {
            ns.tprint('No input received yet');
            await stdIn.nextWrite();
          }
          const input = stdIn?.read();
          ns.tprint('Received input: ' + input);
        }`;
      await Terminal.executeCommands(`echo "${scriptContent}" > ${scriptName}`);

      const inputData = "Hello from stdin!";
      await Terminal.executeCommands(`echo "${inputData}" | ${scriptName} | run ${scriptName}`);
      await sleep(50);

      console.log(Terminal.outputHistory);
      const outputLog: Output[] = Terminal.outputHistory.filter(isOutput);
      const outputText: Output = outputLog.find((entry: Output) => entry.text?.includes("Received input:"));
      expect(outputText?.text).toEqual(`${scriptName}: Received input: ${scriptName}: Received input: ${inputData}`);
    });
  });

  describe("cat and grep with redirected IO", () => {
    it("should be able to read files to the terminal", async () => {
      const filename = "appendOutput.txt";
      const setupCommandString = `echo First Line >> ${filename} | echo Second Line >> ${filename}`;

      await parseRedirectedCommands(setupCommandString);

      await parseRedirectedCommands(`echo 1 | cat ${filename}`);
      expect(Terminal.outputHistory.length).toBe(1);
      expect(Terminal.outputHistory[0].text).toBe("First Line\nSecond Line1");
    });

    it("should be able to grep files read by cat", async () => {
      const filename = "appendOutput.txt";
      const setupCommandString = `echo First Line >> ${filename} | echo Second Line >> ${filename}`;

      await parseRedirectedCommands(setupCommandString);

      await parseRedirectedCommands(`cat ${filename} | grep Second`);

      expect(Terminal.outputHistory.length).toBe(1);
      const log = Terminal.outputHistory[0];
      if (!isOutput(log)) throw new Error("Expected output to be of type Output");
      expect(log.text.replaceAll(ANSI_ESCAPE, "")).toBe("Second Line");
    });
  });
});

function isOutput(entry: unknown): entry is Output {
  return !!entry && typeof entry === "object" && entry instanceof Output;
}
