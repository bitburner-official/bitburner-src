import { Bus } from "@nsdefs";
import { Glitch } from "@enums";
import { myrian, myrianSize } from "../Myrian";
import { pickOne } from "../utils";

const applyRust = () => {
  myrian.rust = {};
  const rust = myrian.glitches[Glitch.Rust];
  for (let i = 0; i < rust * 3; i++) {
    const x = Math.floor(Math.random() * myrianSize);
    const y = Math.floor(Math.random() * myrianSize);
    myrian.rust[`${x}:${y}`] = true;
  }
};

// DO NOT use `Object.keys` on a Rustable because it will return way more than just the rustable stats.
const rustStats: (keyof Rustable)[] = ["moveLvl", "transferLvl", "reduceLvl", "installLvl", "maxEnergy"];
type Rustable = Pick<Bus, "moveLvl" | "transferLvl" | "reduceLvl" | "installLvl" | "maxEnergy">;

export const rustBus = (bus: Bus, rust: number) => {
  const rustable = bus as Rustable;
  const nonZero = rustStats.filter((stat) => rustable[stat] > 0);
  const chosen = pickOne(nonZero);
  rustable[chosen] = Math.max(0, rustable[chosen] - rust * 0.1);

  // cap energy when maxEnergy is reduced
  bus.energy = Math.min(bus.energy, bus.maxEnergy);
};

export const startRust = () => setInterval(applyRust, 30000);
