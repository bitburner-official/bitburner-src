import { cat } from "../../../src/Terminal/commands/cat";
import { GetServerOrThrow, prestigeAllServers } from "../../../src/Server/AllServers";
import { Player } from "@player";
import { Terminal } from "../../../src/Terminal";
import { StdIO } from "../../../src/Terminal/StdIO/StdIO";
import { IOStream } from "../../../src/Terminal/StdIO/IOStream";
import { TextFile } from "../../../src/TextFile";
import { TextFilePath } from "../../../src/Paths/TextFilePath";
import { LiteratureName, MessageFilename } from "@enums";
import { Literatures } from "../../../src/Literature/Literatures";
import { stringifyReactElement } from "../../../src/Terminal/StdIO/utils";
import { Messages } from "../../../src/Message/MessageHelpers";

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
    server.messages.length = 0; //Remove .lit and .msg files
    server.messages.push(LiteratureName.HackersStartingHandbook);
    server.messages.push(MessageFilename.Jumper0);
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

    expect(output).toBe(`${fileContent1}${fileContent2}`);
  });

  it("should read from stdin when '-' is provided as an argument", () => {
    const server = GetServerOrThrow(Player.currentServer);
    const stdinStuff = "\nInput from stdin line 1";

    const stdIn = new IOStream();
    stdIn.write(stdinStuff);
    const stdOut = new IOStream();
    const stdIO = new StdIO(stdIn, stdOut);

    cat([fileName, "-", fileName2], server, stdIO);
    const output = stdOut.read();

    expect(output).toBe(`${fileContent1}${stdinStuff}${fileContent2}`);
  });

  it("should read from stdin and concat it last when '-' is not provided as an argument", () => {
    const server = GetServerOrThrow(Player.currentServer);

    const stdIn = new IOStream();
    stdIn.write("Input from stdin line 1");
    const stdOut = new IOStream();
    const stdIO = new StdIO(stdIn, stdOut);

    cat([fileName, fileName2], server, stdIO);
    const output = stdOut.read();

    expect(output).toBe(`${fileContent1}${fileContent2}Input from stdin line 1`);
  });

  it("should be able to read .lit files", () => {
    const server = GetServerOrThrow(Player.currentServer);

    const stdOut = new IOStream();
    const stdIO = new StdIO(null, stdOut);

    cat([`${LiteratureName.HackersStartingHandbook}`], server, stdIO);
    const output = stdOut.read();

    const bodyText = stringifyReactElement(Literatures[LiteratureName.HackersStartingHandbook].text);
    const expectedOutput = `${Literatures[LiteratureName.HackersStartingHandbook].title}\n\n${bodyText}\n`;

    expect(output).toBe(expectedOutput);
    expect(output).toContain("When starting out, hacking is the most profitable way to earn money and progress.");
  });

  it("should be able to read msg files", () => {
    const server = GetServerOrThrow(Player.currentServer);

    const stdOut = new IOStream();
    const stdIO = new StdIO(null, stdOut);

    cat([`${MessageFilename.Jumper0}`], server, stdIO);
    const output = stdOut.read();

    const text = Messages[MessageFilename.Jumper0].msg + "\n";

    expect(output).toBe(text);
  });

  it("should be able to concatenate lit and msg files", () => {
    const server = GetServerOrThrow(Player.currentServer);

    const stdOut = new IOStream();
    const stdIO = new StdIO(null, stdOut);

    cat([`${LiteratureName.HackersStartingHandbook}`, `${MessageFilename.Jumper0}`], server, stdIO);
    const output = stdOut.read();

    const bodyText = stringifyReactElement(Literatures[LiteratureName.HackersStartingHandbook].text);
    const expectedLitOutput = `${Literatures[LiteratureName.HackersStartingHandbook].title}\n\n${bodyText}\n`;
    const expectedMsgOutput = Messages[MessageFilename.Jumper0].msg + "\n";
    const expectedOutput = `${expectedLitOutput}${expectedMsgOutput}`;

    expect(output).toBe(expectedOutput);
  });

  it("should be able to concatenate lit and msg files with stdin", () => {
    const server = GetServerOrThrow(Player.currentServer);

    const stdIn = new IOStream();
    stdIn.write("Input from stdin line 1");
    const stdOut = new IOStream();
    const stdIO = new StdIO(stdIn, stdOut);

    cat([`${LiteratureName.HackersStartingHandbook}`, "-", `${MessageFilename.Jumper0}`], server, stdIO);
    const output = stdOut.read();

    const bodyText = stringifyReactElement(Literatures[LiteratureName.HackersStartingHandbook].text);
    const expectedLitOutput = `${Literatures[LiteratureName.HackersStartingHandbook].title}\n\n${bodyText}\n`;
    const expectedMsgOutput = Messages[MessageFilename.Jumper0].msg + "\n";
    const expectedOutput = `${expectedLitOutput}Input from stdin line 1${expectedMsgOutput}`;

    expect(output).toBe(expectedOutput);
  });
});
