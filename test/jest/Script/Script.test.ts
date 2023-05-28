import { resolveScriptFilePath } from "../../../src/Paths/ScriptFilePath";
import { Server } from "../../../src/Server/Server";

const code = `/** @param {NS} ns */
export async function main(ns) {
	ns.print(ns.getWeakenTime('n00dles'));
}`;

describe("Validate Save Script Works", function () {
  it("Save", function () {
    const hostname = "TestServer";
    const server = new Server({ hostname });
    const filename = resolveScriptFilePath("test.js");
    if (!filename) throw new Error("Could not resolve hardcoded filepath.");

    server.writeToContentFile(filename, code);
    const script = server.scripts.get(filename);
    if (!script) throw new Error("Script was not saved.");

    expect(script.filename).toEqual(filename);
    expect(script.code).toEqual(code);
    expect(script.server).toEqual(hostname);
  });
});
