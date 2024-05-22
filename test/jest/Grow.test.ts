import { PlayerObject } from "../../src/PersonObjects/Player/PlayerObject";
import { Server } from "../../src/Server/Server";
import { calculateServerGrowth } from "../../src/Server/formulas/grow";
import { numCycleForGrowthCorrected } from "../../src/Server/ServerHelpers";

test("Grow is accurate", () => {
  // Tests that certain special values work out to exactly what we'd expect,
  // given the formulas. The growth multiplier maxes out at 1.0035, and the
  // increment is .03 so with a difficulty of 10 it should be .003.
  // These tests are *exact* because the whole point is that the math should
  // get exactly the right value (or as close as is possible with floating-point).
  const server = new Server({ hostname: "foo", hackDifficulty: 5, serverGrowth: 100 });
  const player = new PlayerObject();
  expect(calculateServerGrowth(server, 1, player)).toBe(1.0035);
  expect(calculateServerGrowth(server, 2, player)).toBe(1.00701225);
  server.hackDifficulty = 10;
  expect(calculateServerGrowth(server, 1, player)).toBe(1.003);
  expect(calculateServerGrowth(server, 2, player)).toBe(1.006009);
  expect(calculateServerGrowth(server, 3, player)).toBe(1.009027027);
  expect(calculateServerGrowth(server, 4, player)).toBe(1.012054108081);
});

describe("numCycleForGrowthCorrected reverses calculateServerGrowth", () => {
  // Test that numCycleForGrowthCorrected() functions properly as the inverse
  // of calculateServerGrowth().
  // calculateServerGrowth() works for *any* given number of threads, but is
  // usually passed an integer. numCycleForGrowthCorrected() *always* returns
  // an integer, the ceiling of the floating-point value. When reversing an
  // integer number of threads, it should *always* return the same integer.
  // Similarly, if we pass the next-highest representable number as a target,
  // it should *always* return the next largest integer, since the previous
  // number is no longer sufficient.

  // This is an arbitrary transcedental constant.
  const multiplier = Math.exp(1.4);
  const server = new Server({ hostname: "foo", hackDifficulty: 10 * multiplier, serverGrowth: 100 });
  server.moneyMax = 1e308; // Not available as a constructor param
  const player = new PlayerObject();
  const tests = [];
  while (server.moneyAvailable < 5e49) {
    tests.push(server.moneyAvailable);
    server.moneyAvailable = (server.moneyAvailable + 59) * calculateServerGrowth(server, 59, player);
  }
  test.each(tests)("startMoney: %f", (money: number) => {
    // Do fewer threads to save on test time
    for (let threads = 0; threads < 30; threads++) {
      const newMoney = (money + threads) * calculateServerGrowth(server, threads, player);
      const eps = newMoney ? 2 ** (Math.floor(Math.log2(newMoney)) - 52) : Number.MIN_VALUE;
      expect(numCycleForGrowthCorrected(server, newMoney, money, 1, player)).toBe(threads);
      const value = numCycleForGrowthCorrected(server, newMoney + eps, money, 1, player);
      // Write our own check because Jest is a goblin that can't provide context
      if (value !== threads + 1) {
        throw new Error(
          `value (${value}) was not equal to threads+1 (${threads + 1})\n\n` +
            `newMoney: ${newMoney} eps: ${eps} newMoney+eps: ${newMoney + eps} value: ${value} threads: ${threads}`,
        );
      }
    }
  });
  const tests2 = [];
  for (let t = 0; t <= 900000; t += 2000) {
    tests2.push([t, t * calculateServerGrowth(server, t, player)]);
  }
  test.each(tests2)("threads: %f newMoney: %f", (threads: number, newMoney: number) => {
    const eps = newMoney ? 2 ** (Math.floor(Math.log2(newMoney)) - 52) : Number.MIN_VALUE;
    expect(numCycleForGrowthCorrected(server, newMoney, 0, 1, player)).toBe(threads);
    const value = numCycleForGrowthCorrected(server, newMoney + eps, 0, 1, player);
    // Write our own check because Jest is a goblin that can't provide context
    if (value !== threads + 1) {
      throw new Error(
        `value (${value}) was not equal to threads+1 (${threads + 1})\n\n` +
          `newMoney: ${newMoney} eps: ${eps} newMoney+eps: ${newMoney + eps} value: ${value} threads: ${threads}`,
      );
    }
  });
});
