import { Bench } from "tinybench";
import { initGameEnvironment, setupBasicTestingEnvironment, getWorkerScriptAndNS } from "../Utilities";
import { Player } from "@player";

initGameEnvironment();

beforeEach(() => {
  setupBasicTestingEnvironment();
});

test("getPlayer", () => {
  const { ns } = getWorkerScriptAndNS();
  const props = [
    "hp",
    "skills",
    "exp",
    "mults",
    "city",
    "numPeopleKilled",
    "money",
    "location",
    "totalPlaytime",
    "jobs",
    "factions",
    "entropy",
    "karma",
  ] as const;
  const expected = Object.fromEntries(props.map((k) => [k, Player[k]]));
  expect(ns.getPlayer()).toEqual(expected);
});
// Benchmarks shouldn't waste time on every test run. Un-skip this when evaluating changes.
test.skip("Benchmark getPlayer", async () => {
  const { ns } = getWorkerScriptAndNS();
  const bench = new Bench().add("getPlayer", () => ns.getPlayer());
  await bench.run();
  console.table(bench.table());
});
