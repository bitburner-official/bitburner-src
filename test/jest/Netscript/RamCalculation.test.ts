import { Player } from "../../../src/Player";
import { NetscriptFunctions } from "../../../src/NetscriptFunctions";
import { RamCosts, getRamCost, RamCostConstants, RamCostTree } from "../../../src/Netscript/RamCostGenerator";
import { Environment } from "../../../src/Netscript/Environment";
import { RunningScript } from "../../../src/Script/RunningScript";
import { Script } from "../../../src/Script/Script";
import { WorkerScript } from "../../../src/Netscript/WorkerScript";
import { calculateRamUsage } from "../../../src/Script/RamCalculations";
import { ns } from "../../../src/NetscriptFunctions";
import { InternalAPI, NetscriptContext } from "src/Netscript/APIWrapper";
import { Singularity } from "@nsdefs";

type PotentiallyAsyncFunction = (arg?: unknown) => { catch?: PotentiallyAsyncFunction };

/** Get a potentiallyAsyncFunction from a layer of the external ns */
function getFunction(fn: unknown) {
  if (typeof fn !== "function") throw new Error("Expected a function at this location.");
  return fn as PotentiallyAsyncFunction;
}
function grabCost<API>(ramEntry: RamCostTree<API>[keyof API]) {
  if (typeof ramEntry === "function") return ramEntry();
  if (typeof ramEntry === "number") return ramEntry;
  throw new Error("Invalid ramcost: " + ramEntry);
}
function isRemovedFunction(ctx: NetscriptContext, fn: (ctx: NetscriptContext) => (...__: unknown[]) => unknown) {
  return /REMOVED FUNCTION/.test(fn(ctx) + "");
}

describe("Netscript RAM Calculation/Generation Tests", function () {
  Player.sourceFiles[0] = { n: 4, lvl: 3 };
  // For simulating costs of singularity functions.
  const sf4 = Player.sourceFiles[0];
  const baseCost = RamCostConstants.Base;
  const maxCost = RamCostConstants.Max;
  const script = new Script();
  /** Creates a RunningScript object which calculates static ram usage */
  function createRunningScript(code: string) {
    script.code = code;
    script.updateRamUsage([]);
    const runningScript = new RunningScript(script);
    return runningScript;
  }

  /** Runs a Netscript function and properly catches an error even if it returns promise. */
  function tryFunction(fn: PotentiallyAsyncFunction) {
    try {
      fn()?.catch?.(() => undefined);
    } catch {}
  }

  let scriptRef = createRunningScript("");
  //Since it is expensive to create a workerscript and wrap the ns API, this is done once
  const workerScript = {
    args: [] as string[],
    code: "",
    delay: null,
    dynamicLoadedFns: {},
    dynamicRamUsage: RamCostConstants.Base,
    env: new Environment(),
    ramUsage: scriptRef.ramUsage,
    scriptRef,
  };
  const nsExternal = NetscriptFunctions(workerScript as WorkerScript);

  function combinedRamCheck(
    fn: PotentiallyAsyncFunction,
    fnPath: string[],
    expectedRamCost: number,
    extraLayerCost = 0,
  ) {
    const code = `${fnPath.join(".")}();\n`.repeat(3);
    const fnName = fnPath[fnPath.length - 1];

    //check imported getRamCost fn vs. expected ram from test
    expect(getRamCost(...fnPath)).toEqual(expectedRamCost);

    // Static ram check
    const staticCost = calculateRamUsage(code, []).cost;
    expect(staticCost).toBeCloseTo(Math.min(baseCost + expectedRamCost + extraLayerCost, maxCost));

    // reset workerScript for dynamic check
    scriptRef = createRunningScript(code);
    Object.assign(workerScript, {
      code,
      scriptRef,
      ramUsage: scriptRef.ramUsage,
      dynamicRamUsage: baseCost,
      env: new Environment(),
      dynamicLoadedFns: {},
    });
    workerScript.env.vars = nsExternal;

    // Run the function through the workerscript's args
    if (typeof fn === "function") {
      tryFunction(fn);
      tryFunction(fn);
      tryFunction(fn);
    } else {
      throw new Error(`Invalid function specified: [${fnPath.toString()}]`);
    }

    expect(workerScript.dynamicLoadedFns).toHaveProperty(fnName);
    expect(workerScript.dynamicRamUsage).toBeCloseTo(Math.min(expectedRamCost + baseCost, maxCost), 5);
    expect(workerScript.dynamicRamUsage).toBeCloseTo(scriptRef.ramUsage - extraLayerCost, 5);
  }

  describe("ns", () => {
    function testLayer<API>(
      internalLayer: InternalAPI<API>,
      externalLayer: API,
      ramLayer: RamCostTree<API>,
      path: string[],
      extraLayerCost: number,
    ) {
      describe(path[path.length - 1] ?? "Base ns layer", () => {
        for (const [key, val] of Object.entries(internalLayer) as [keyof API, InternalAPI<API>[keyof API]][]) {
          const newPath = [...path, key as string];
          if (typeof val === "function") {
            // Removed functions have no ram cost and should be skipped.
            if (isRemovedFunction({ workerScript }, val)) return;
            const fn = getFunction(externalLayer[key]);
            const fnName = newPath.join(".");
            if (!(key in ramLayer)) {
              throw new Error("Missing ramcost for " + fnName);
            }
            const expectedRam = grabCost(ramLayer[key]);
            it(`${fnName}()`, () => combinedRamCheck(fn, newPath, expectedRam, extraLayerCost));
          }
          //A layer should be the only other option. Hacknet is currently the only layer with a layer cost.
          else if (typeof val === "object" && key !== "enums") {
            //hacknet is currently the only layer with a layer cost.
            const layerCost = key === "hacknet" ? 4 : 0;
            testLayer(val as InternalAPI<unknown>, externalLayer[key], ramLayer[key], newPath, layerCost);
          }
          // Other things like args, enums, etc. have no cost
        }
      });
    }
    testLayer(ns, nsExternal, RamCosts, [], 0);
  });

  describe("Singularity multiplier checks", () => {
    // Checks were already done above for SF4.3 having normal ramcost.
    sf4.lvl = 3;
    const lvlToMult = { 0: 16, 1: 16, 2: 4 };
    const externalSingularity = nsExternal.singularity;
    const ramCostSingularity = RamCosts.singularity;
    const singObjects = (
      Object.entries(ns.singularity) as [keyof Singularity, InternalAPI<Singularity>[keyof Singularity]][]
    )
      .filter(([__, v]) => typeof v === "function" && !isRemovedFunction({ workerScript }, v))
      .map(([name]) => {
        return {
          name,
          baseRam: grabCost<Singularity>(ramCostSingularity[name]),
        };
      });
    for (const lvl of [0, 1, 2] as const) {
      it(`SF4.${lvl} check for x${lvlToMult[lvl]} costs`, () => {
        sf4.lvl = lvl;
        const expectedMult = lvlToMult[lvl];
        singObjects.forEach(({ name, baseRam }) => {
          const fn = getFunction(externalSingularity[name]);
          combinedRamCheck(fn, ["singularity", name], baseRam * expectedMult);
        });
      });
    }
  });
});
