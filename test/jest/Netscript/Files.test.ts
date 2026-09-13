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
