import { getNS, initGameEnvironment, setupBasicTestingEnvironment } from "../Utilities";

beforeAll(() => {
  initGameEnvironment();
});

beforeEach(() => {
  setupBasicTestingEnvironment();
});

test("mv can convert .js <--> .txt", () => {
  const ns = getNS();
  const wasJS = "// this file was .js";
  const wasTXT = "// this file was .txt";
  ns.write("foo.js", wasJS);
  ns.write("bar.txt", wasTXT);

  ns.mv("home", "foo.js", "foo.txt");
  ns.mv("home", "bar.txt", "bar.js");

  expect(ns.read("foo.txt")).toBe(wasJS);
  expect(ns.read("bar.js")).toBe(wasTXT);
});

describe("getScriptRam", () => {
  test("throws with parse details for syntax errors, then succeeds after a fix", () => {
    const ns = getNS();
    ns.write("broken.js", "export async function main( {", "w");

    for (let i = 0; i < 2; i++) {
      expect(() => ns.getScriptRam("broken.js")).toThrow(/broken.js on home.*syntax errors/);
      expect(() => ns.getScriptRam("broken.js")).toThrow(/Unexpected token/);
    }

    ns.write("broken.js", "export async function main(ns) { ns.hack('n00dles'); }", "w");
    expect(ns.getScriptRam("broken.js")).toBe(1.7);
    expect(ns.getScriptRam("broken.js")).toBe(1.7);
  });

  test("throws for an imported script with syntax errors", () => {
    const ns = getNS();
    ns.write("broken.js", "export const value = ;", "w");
    ns.write("importer.js", 'import { value } from "./broken.js"; export function main() { return value; }', "w");
    expect(() => ns.getScriptRam("importer.js")).toThrow(/Unexpected token/);
  });

  test("returns zero for a missing script", () => {
    expect(getNS().getScriptRam("missing.js")).toBe(0);
  });
});
