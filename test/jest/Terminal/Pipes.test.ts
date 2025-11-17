import { clearPipe, splitPipesFromFirstCommand } from "../../../src/Terminal/Pipe";
import { Terminal } from "../../../src/Terminal";
import { GetServer, prestigeAllServers } from "../../../src/Server/AllServers";
import { Player } from "@player";
import { TextFilePath } from "../../../src/Paths/TextFilePath";
import { PipeState } from "../../../src/Terminal/PipeState";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Terminal Pipes", () => {
  beforeEach(() => {
    prestigeAllServers();
    Player.init();
    clearPipe();
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

  it("should handle piping to a file", async () => {
    const fileName = "output.txt";
    const command = `echo 'Hello World' > ${fileName}`;
    Terminal.executeCommand(command);
    await sleep(200);
    const server = GetServer(Player.currentServer);
    const fileContent = server?.textFiles?.get(fileName as TextFilePath)?.text;
    expect(fileContent).toBe("Hello World");
  });

  it("should handle multiple commands with distinct pipes", async () => {
    const fileName1 = "output.txt";
    const fileName2 = "output2.txt";
    const commandString = `echo test | ${fileName1}; echo test2 | ${fileName2}`;

    Terminal.executeCommands(commandString);
    await sleep(200);

    const server = GetServer(Player.currentServer);
    const fileContent1 = server?.textFiles?.get(fileName1 as TextFilePath)?.text;
    expect(fileContent1).toBe("test");
    const fileContent2 = server?.textFiles?.get(fileName2 as TextFilePath)?.text;
    expect(fileContent2).toBe("test2");
  });
});
