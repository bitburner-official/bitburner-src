import { Terminal } from "../../../src/Terminal";
import { GetServerOrThrow, prestigeAllServers } from "../../../src/Server/AllServers";
import { Player } from "@player";
import { type TextFilePath } from "../../../src/Paths/TextFilePath";
import { type ScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { fixDoImportIssue, initGameEnvironment } from "../Utilities";
import { Output } from "../../../src/Terminal/OutputTypes";

fixDoImportIssue();
initGameEnvironment();

const url = "https://example.com/data";
const originalFetch = globalThis.fetch;
let fetchMock: jest.Mock;

function mockResponse(status: number, body: string) {
  fetchMock.mockResolvedValue({ status, text: () => Promise.resolve(body) });
}

const server = () => GetServerOrThrow(Player.currentServer);
const textFile = (name: string) => server().textFiles.get(name as TextFilePath)?.text;
const outputText = () => Terminal.outputHistory.filter((entry) => entry instanceof Output).map((output) => output.text);

describe("wget", () => {
  beforeEach(() => {
    prestigeAllServers();
    Player.init();
    Terminal.outputHistory = [];
    server().textFiles.clear();
    server().scripts.clear();
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it("writes the content to a new text file", async () => {
    mockResponse(200, "line1\nline2");
    await Terminal.executeCommands(`wget ${url} data.txt`);

    expect(fetchMock).toHaveBeenCalledWith(url, expect.anything());
    expect(textFile("data.txt")).toBe("line1\nline2");
    expect(outputText()).toEqual(["wget successfully retrieved content to new file data.txt"]);
  });

  it("overwrites an existing script file", async () => {
    server().writeToContentFile("a.js" as ScriptFilePath, "old");
    mockResponse(200, "new");
    await Terminal.executeCommands(`wget ${url} a.js`);

    expect(server().scripts.get("a.js" as ScriptFilePath)?.code).toBe("new");
    expect(outputText()).toEqual(["wget successfully retrieved content and overwrote a.js"]);
  });

  it("writes the content to stdout when piped", async () => {
    mockResponse(200, "apple\nbanana");
    await Terminal.executeCommands(`wget ${url} | grep an > out.txt`);

    expect(textFile("out.txt")).toBe("banana");
    expect(outputText()).toEqual(["wget successfully retrieved content"]);
  });

  it("finishes before the next command in a ; chain runs", async () => {
    mockResponse(200, "hello");
    await Terminal.executeCommands(`wget ${url} data.txt; cat data.txt > copy.txt`);

    expect(textFile("copy.txt")).toBe("hello");
  });

  it("does not write a file when the request fails", async () => {
    mockResponse(404, "not found");
    await Terminal.executeCommands(`wget ${url} data.txt`);

    expect(textFile("data.txt")).toBeUndefined();
    expect(outputText()).toEqual(["wget failed. HTTP code: 404."]);
  });

  it("reports a rejected request", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    await Terminal.executeCommands(`wget ${url} data.txt`);

    expect(textFile("data.txt")).toBeUndefined();
    expect(outputText()).toEqual([expect.stringContaining("network down")]);
  });

  it.each([
    [`wget ${url} data.txt | cat`, "Either specify a destination file or redirect the output with a pipe, not both."],
    [`wget ${url}`, "Usage: wget [url] [target file]"],
    [`wget`, "Usage: wget [url] [target file]"],
    [`wget ${url} data.exe`, "Target file must be a script file or a text file."],
  ])("rejects %s without fetching", async (command, error) => {
    await Terminal.executeCommands(command);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(outputText()[0]).toContain(error);
  });
});
