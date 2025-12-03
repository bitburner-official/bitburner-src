import { IOStream } from "../../../src/Terminal/StdIO/IOStream";
import { callOnRead, getTerminalStdIO } from "../../../src/Terminal/StdIO/RedirectIO";
import { Terminal } from "../../../src/Terminal";
import { fixDoImportIssue, initGameEnvironment } from "../Utilities";
import { GetServer, prestigeAllServers } from "../../../src/Server/AllServers";
import { Player } from "@player";
import { StdIO } from "../../../src/Terminal/StdIO/StdIO";

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
});
