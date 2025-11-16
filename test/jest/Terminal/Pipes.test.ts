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

});