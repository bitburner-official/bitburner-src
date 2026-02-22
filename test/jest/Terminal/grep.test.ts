import { GetServerOrThrow, prestigeAllServers } from "../../../src/Server/AllServers";
import { Player } from "@player";
import { Terminal } from "../../../src/Terminal";
import { StdIO } from "../../../src/Terminal/StdIO/StdIO";
import { IOStream } from "../../../src/Terminal/StdIO/IOStream";
import { TextFile } from "../../../src/TextFile";
import { TextFilePath } from "../../../src/Paths/TextFilePath";
import { grep } from "../../../src/Terminal/commands/grep";
import { ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { Script } from "../../../src/Script/Script";
import { stringify } from "../../../src/Terminal/StdIO/utils";

const fileName = "example.txt" as TextFilePath;
const fileName2 = "example2.txt" as TextFilePath;
const fileContent1 = "This is an example text file.\nThis is line 2 of file 1";
const fileContent2 = "This is another example text file.\nThis is line 2 of file 2";

describe("grep command", () => {
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

  it("should retrieve lines matching the pattern from the specified text file", () => {
    const server = GetServerOrThrow(Player.currentServer);

    const stdOut = new IOStream();
    const stdIO = new StdIO(null, stdOut);

    grep(["line 2", fileName], server, stdIO);
    const output = stdOut.read();

    expect(Terminal.outputHistory).toEqual([]);
    expect(output).toBe(`example.txt:This is line 2 of file 1`);
  });

  it("should retrieve lines matching the pattern from the specified script file", () => {
    const server = GetServerOrThrow(Player.currentServer);
    const scriptFileName = "script.js" as ScriptFilePath;
    const scriptContent = "console.log('Hello World');\n// This is line 2 of the script";
    const scriptFile = new Script(scriptFileName, scriptContent, server.hostname);
    server.scripts.set(scriptFileName, scriptFile);
    const stdOut = new IOStream();
    const stdIO = new StdIO(null, stdOut);

    grep(["line 2", scriptFileName], server, stdIO);
    const output = stdOut.read();

    expect(Terminal.outputHistory).toEqual([]);
    expect(output).toBe(`script.js:// This is line 2 of the script`);
  });

  it("should retrieve lines matching the pattern from stdin", () => {
    const server = GetServerOrThrow(Player.currentServer);

    const stdIn = new IOStream();
    stdIn.write("First line from stdin\nThis is line 2 from stdin\nThird line from stdin");
    stdIn.close();
    const stdOut = new IOStream();
    const stdIO = new StdIO(stdIn, stdOut);

    grep(["line 2"], server, stdIO);
    const output = stdOut.read();

    expect(Terminal.outputHistory).toEqual([]);
    expect(output).toBe(`This is line 2 from stdin`);
  });

  it("should grep input piped from cat", async () => {
    await Terminal.executeCommands(`cat ${fileName} ${fileName2} | grep "line 2"`);
    const lastOutput = Terminal.outputHistory[Terminal.outputHistory.length - 1];
    // Output from cat will not have filenames, and will not add additional newlines between file contents
    expect(stringify(lastOutput.text, true)).toBe(
      `This is line 2 of file 1This is another example text file.\nThis is line 2 of file 2`,
    );
  });
});
