import { cat } from "../../../src/Terminal/commands/cat";
import { GetServerOrThrow, prestigeAllServers } from "../../../src/Server/AllServers";
import { Player } from "@player";
import { Terminal } from "../../../src/Terminal";
import { StdIO } from "../../../src/Terminal/StdIO/StdIO";
import { IOStream } from "../../../src/Terminal/StdIO/IOStream";
import { TextFile } from "../../../src/TextFile";
import { TextFilePath } from "../../../src/Paths/TextFilePath";

const fileName = "example.txt" as TextFilePath;
const fileName2 = "example2.txt" as TextFilePath;
const fileContent1 = "This is an example text file.";
const fileContent2 = "This is another example text file.";

describe("cat command", () => {
  beforeEach(() => {
    prestigeAllServers();
    Player.init();
    Terminal.outputHistory = [];
    const server = GetServerOrThrow(Player.currentServer);
    server.textFiles.clear();
    server.scripts.clear();
    const file = new TextFile(fileName, fileContent1);
    server.textFiles.set(fileName, file);
    const file2 = new TextFile(fileName2, fileContent2);
    server.textFiles.set(fileName2, file2);
  });

  it("should retrieve file contents and pass to stdout", () => {
    const server = GetServerOrThrow(Player.currentServer);

    const stdOut = new IOStream();
    const stdIO = new StdIO(null, stdOut);

    cat([fileName, fileName2], server, stdIO);
    const output = stdOut.read();

    expect(output).toBe(`${fileContent1}\n${fileContent2}`);
  });

  it("should read from stdin when '-' is provided as an argument", () => {
    const server = GetServerOrThrow(Player.currentServer);

    const stdIn = new IOStream();
    stdIn.write("Input from stdin line 1");
    const stdOut = new IOStream();
    const stdIO = new StdIO(stdIn, stdOut);

    cat([fileName, "-", fileName2], server, stdIO);
    const output = stdOut.read();

    expect(output).toBe(`${fileContent1}\nInput from stdin line 1\n${fileContent2}`);
  });

  it("should read from stdin and concat it last when '-' is not provided as an argument", () => {
    const server = GetServerOrThrow(Player.currentServer);

    const stdIn = new IOStream();
    stdIn.write("Input from stdin line 1");
    const stdOut = new IOStream();
    const stdIO = new StdIO(stdIn, stdOut);

    cat([fileName, fileName2], server, stdIO);
    const output = stdOut.read();

    expect(output).toBe(`${fileContent1}\n${fileContent2}\nInput from stdin line 1`);
  });
});
