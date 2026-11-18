import React from "react";
import { Player } from "@player";
import { Terminal } from "../../../src/Terminal";
import { GetServerOrThrow, prestigeAllServers } from "../../../src/Server/AllServers";
import { type TextFilePath } from "../../../src/Paths/TextFilePath";
import { type ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { stringifyReactElement } from "../../../src/Terminal/StdIO/utils";
import { fixDoImportIssue, initGameEnvironment } from "../Utilities";

fixDoImportIssue();
initGameEnvironment();

describe("stringifyReactElement", () => {
  it("should not add spaces around text next to inline elements", () => {
    const element = (
      <>
        <span>BruteSSH.exe</span> - <span>$500.000k</span> - <span>Opens up SSH Ports.</span>
      </>
    );

    expect(stringifyReactElement(element)).toBe("BruteSSH.exe - $500.000k - Opens up SSH Ports.");
  });

  it("should separate adjacent sibling elements with a single space", () => {
    const element = (
      <span>
        <span>
          <span>a.js</span>
        </span>
        <span>
          <span>b.js</span>
        </span>
      </span>
    );

    expect(stringifyReactElement(element)).toBe("a.js b.js");
  });

  it("should turn <br /> into a newline without indenting the next line", () => {
    const element = (
      <p>
        first line
        <br />
        second line
      </p>
    );

    expect(stringifyReactElement(element)).toBe("first line\nsecond line");
  });

  it("should keep leading indentation", () => {
    expect(stringifyReactElement(<span>{"  indented"}</span>)).toBe("  indented");
  });
});

describe("piping React output to a file", () => {
  beforeEach(() => {
    prestigeAllServers();
    Player.init();
    Terminal.outputHistory = [];
  });

  it("should write buy -l output, which uses theme colors, with single spaces", async () => {
    jest.spyOn(Player, "hasTorRouter").mockReturnValue(true);
    const fileName = "items.txt" as TextFilePath;

    await Terminal.executeCommands(`buy -l > ${fileName}`);

    const firstLine = GetServerOrThrow(Player.currentServer).textFiles.get(fileName)?.text.split("\n")[0];
    expect(firstLine).toMatch(/^BruteSSH\.exe - \$\S+ - \S/);
    expect(firstLine).not.toContain("  ");
  });

  it("should write ls file names separated by single spaces", async () => {
    const server = GetServerOrThrow(Player.currentServer);
    server.scripts.clear();
    server.textFiles.clear();
    server.writeToScriptFile("a.js" as ScriptFilePath, "");
    server.writeToScriptFile("b.js" as ScriptFilePath, "");
    const fileName = "files.txt" as TextFilePath;

    await Terminal.executeCommands(`ls > ${fileName}`);

    // ls prints one line per file type (programs, then scripts)
    expect(server.textFiles.get(fileName)?.text.split("\n")).toContain("a.js b.js");
  });
});
