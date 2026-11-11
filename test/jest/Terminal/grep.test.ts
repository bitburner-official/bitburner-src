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
import { getOutput } from "./Pipes.test";
import { waitForScripts } from "../Utilities";

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

  it("should retrieve lines matching the pattern from the specified text file", async () => {
    const server = GetServerOrThrow(Player.currentServer);

    const stdOut = new IOStream();
    const stdIO = new StdIO(null, stdOut);

    await grep(["line 2", fileName], server, stdIO);
    const output = stdOut.read();

    expect(Terminal.outputHistory).toEqual([]);
    expect(output).toBe(`This is line 2 of file 1`);
  });

  it("should retrieve lines matching the pattern from the specified script file", async () => {
    const server = GetServerOrThrow(Player.currentServer);
    const scriptFileName = "script.js" as ScriptFilePath;
    const scriptContent = "console.log('Hello World');\n// This is line 2 of the script";
    const scriptFile = new Script(scriptFileName, scriptContent, server.hostname);
    server.scripts.set(scriptFileName, scriptFile);
    const stdOut = new IOStream();
    const stdIO = new StdIO(null, stdOut);

    await grep(["line 2", scriptFileName], server, stdIO);
    const output = stdOut.read();

    expect(Terminal.outputHistory).toEqual([]);
    expect(output).toBe(`// This is line 2 of the script`);
  });

  it("should prefix matches with the filename when searching more than one file", async () => {
    const server = GetServerOrThrow(Player.currentServer);
    const stdOut = new IOStream();
    const stdIO = new StdIO(null, stdOut);

    await grep(["line 2", fileName, fileName2], server, stdIO);

    expect(stdOut.read()).toBe(`example.txt:This is line 2 of file 1\nexample2.txt:This is line 2 of file 2`);
  });

  it("should error when given a pattern but no file and no stdin", async () => {
    const server = GetServerOrThrow(Player.currentServer);
    const stdOut = new IOStream();

    await grep(["line 2"], server, new StdIO(null, stdOut));

    expect(getOutput(Terminal.outputHistory, -1).text).toContain("At least one FILE argument must be passed");
    expect(stdOut.isClosed).toBe(true);
  });

  it("should leave an existing -O file alone when the pattern is an invalid regular expression", async () => {
    const server = GetServerOrThrow(Player.currentServer);
    const outFile = "results.txt" as TextFilePath;
    server.writeToTextFile(outFile, "IMPORTANT");

    await Terminal.executeCommands(`grep -R -f "(" ${fileName} -O ${outFile}`);

    expect(getOutput(Terminal.outputHistory, -1).text).toContain("Invalid regular expression");
    expect(server.textFiles.get(outFile)?.text).toBe("IMPORTANT");
  });

  it("should search an -O file's old contents when it is also an input", async () => {
    const server = GetServerOrThrow(Player.currentServer);

    await Terminal.executeCommands(`grep -f "line 2" ${fileName} -O ${fileName}`);

    expect(server.textFiles.get(fileName)?.text).toBe("This is line 2 of file 1");
  });

  it("should separate context blocks from different files with --", async () => {
    const server = GetServerOrThrow(Player.currentServer);
    const stdOut = new IOStream();
    const stdIO = new StdIO(null, stdOut);

    await grep(["-A", "1", "line 2", fileName, fileName2], server, stdIO);

    expect(stdOut.read()).toBe(`example.txt:This is line 2 of file 1\n--\nexample2.txt:This is line 2 of file 2`);
  });

  it("should not print a -- separator without a context flag", async () => {
    const server = GetServerOrThrow(Player.currentServer);
    const stdOut = new IOStream();
    const stdIO = new StdIO(null, stdOut);

    await grep(["line 2", fileName, fileName2], server, stdIO);

    expect(stdOut.read()).not.toContain("--");
  });

  it("should retrieve lines matching the pattern from stdin", async () => {
    const server = GetServerOrThrow(Player.currentServer);

    const stdIn = new IOStream();
    stdIn.write("First line from stdin\nThis is line 2 from stdin\nThird line from stdin");
    stdIn.close();
    const stdOut = new IOStream();
    const stdIO = new StdIO(stdIn, stdOut);

    await grep(["line 2"], server, stdIO);
    const output = stdOut.read();

    expect(Terminal.outputHistory).toEqual([]);
    expect(output).toBe(`This is line 2 from stdin`);
  });

  it("should grep input piped from cat", async () => {
    await Terminal.executeCommands(`cat ${fileName} ${fileName2} | grep "line 2"`);
    const lastOutput = getOutput(Terminal.outputHistory, -1);
    // Output from cat will not have filenames, and will not add additional newlines between file contents
    expect(stringify(lastOutput.text, true)).toBe(
      `This is line 2 of file 1This is another example text file.\nThis is line 2 of file 2`,
    );
  });

  describe("on stdin that arrives line by line from a running script", () => {
    const logger = "logger.js" as ScriptFilePath;
    const outFile = "out.txt" as TextFilePath;
    const loggerContent = `export async function main(ns) {
      for (const line of ["err one", "ok two", "err three", "ok four"]) {
        ns.tprint(line);
        await ns.sleep(20);
      }
      await ns.sleep(Number(ns.args[0] ?? 0));
    }`;

    beforeEach(() => {
      GetServerOrThrow(Player.currentServer).writeToScriptFile(logger, loggerContent);
    });

    async function runAndReadOutFile(command: string, waitFor?: ScriptFilePath): Promise<string | undefined> {
      await Terminal.executeCommands(command);
      await waitForScripts(waitFor);
      return GetServerOrThrow(Player.currentServer).textFiles.get(outFile)?.text;
    }

    it("should keep counting line numbers across chunks with -n", async () => {
      expect(await runAndReadOutFile(`run ${logger} | grep -n err > ${outFile}`)).toBe(
        "1:logger.js: err one\n3:logger.js: err three",
      );
    });

    it("should write every chunk's matches to the -O file without an 'already exists' error", async () => {
      expect(await runAndReadOutFile(`run ${logger} | grep err -O ${outFile}`)).toBe(
        "logger.js: err one\nlogger.js: err three",
      );
      const terminalText = Terminal.outputHistory.map((line) => stringify(line, true)).join("\n");
      expect(terminalText).not.toContain("already exist");
    });

    it("should print -A context from the next chunk", async () => {
      expect(await runAndReadOutFile(`run ${logger} | grep -A 1 one > ${outFile}`)).toBe(
        "logger.js: err one\nlogger.js: ok two",
      );
    });

    it("should print -B context from the previous chunk", async () => {
      expect(await runAndReadOutFile(`run ${logger} | grep -B 1 three > ${outFile}`)).toBe(
        "logger.js: ok two\nlogger.js: err three",
      );
    });

    it("should stop after -m matches and close its output while the script is still running", async () => {
      const reader = "reader.js" as ScriptFilePath;
      GetServerOrThrow(Player.currentServer).writeToScriptFile(
        reader,
        `export async function main(ns) {
          const stdin = ns.port.getStdin();
          const received = [];
          while (true) {
            if (stdin.empty()) await stdin.nextWrite();
            const data = stdin.read();
            if (data === null) break;
            received.push(data);
          }
          ns.write("${outFile}", received.join("|"), "w");
        }`,
      );

      // The logger keeps running for 5 seconds after its last line, so the reader only finishes if grep closes
      expect(await runAndReadOutFile(`run ${logger} 5000 | grep -m 1 err | run ${reader}`, reader)).toBe(
        "logger.js: err one",
      );
      await Terminal.executeCommands(`kill ${logger}`);
    });
  });
});
