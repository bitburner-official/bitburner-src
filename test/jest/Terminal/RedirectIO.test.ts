import { IOStream } from "../../../src/Terminal/StdIO/IOStream";
import {
  callOnRead,
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

  it("should redirect output to the terminal correctly from a TerminalStdIO", async () => {
    const data = "Hello, Terminal!";
    const stdout = new IOStream();
    const terminalIO = getTerminalStdIO(stdout);
    expect(terminalIO.stdin.deref()).toBe(stdout);
    stdout.write(data);
    await sleep(50);

    expect(Terminal.outputHistory.length).toBe(1);
    expect(Terminal.outputHistory[0].text).toContain(data);
  });

  it("should pass along redirect output through a pass-through StdIO", async () => {
    const data = "Hello, Distant Terminal!";
    const stdin = new IOStream();
    const stdio = new StdIO(stdin);
    void callOnRead(stdio, (data: unknown) => {
      stdio.stdout.write(data);
    });

    getTerminalStdIO(stdio.stdout);

    stdin.write(data);
    await sleep(50);

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
      const stdio = new StdIO(null);
      handleCommand(stdio, commandString.split(" "));
      await sleep(50);

      expect(stdio.stdout.empty()).toBe(false);
      const output = stdio.stdout.read();
      expect(output).toBe("Hello, World");
    });

    it("should handle writing stdin contents to files", async () => {
      const filename = "output.txt";
      const commandString = `> ${filename}`;
      const stdin = new IOStream();
      const stdio = new StdIO(stdin);
      void handleCommand(stdio, commandString.split(" "));
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

      parseRedirectedCommands(commandString);
      await sleep(50);

      const server = GetServer(Player.currentServer);
      const file = server?.textFiles.get(filename as TextFilePath);
      expect(file).toBeDefined();
      expect(file?.content).toBe("First Line\nSecond Line");
    });
  });
});
