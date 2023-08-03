import { SleeveMyrianWork } from "../PersonObjects/Sleeve/Work/SleeveMyrianWork";
import { constructorsForReviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "../utils/JSONReviver";
import { Player } from "@player";
import { DefaultWorld } from "./World";
import { MyrianTile } from "@nsdefs";

export interface MyrianSleeve {
  index: number;
  x: number;
  y: number;
}

export class Myrian {
  world: string[][] = [];
  resources = 0;
  sleeves: MyrianSleeve[] = [];
  storedCycles = 0;

  constructor() {
    this.world = DefaultWorld;
    this.resources = 0;
  }

  joinSleeve(sleeveId: number) {
    if (this.sleeves.find((m) => m.index === sleeveId)) return;
    const spawn = this.findSleeveSpawnPoint();
    Player.sleeves[sleeveId].startWork(new SleeveMyrianWork());
    this.sleeves.push({ index: sleeveId, x: spawn[0], y: spawn[0] });
  }

  findSleeveSpawnPoint(): [number, number] {
    // Wrong but will do for now
    return [1, 1];
  }

  /** Main process function called by the engine loop every game cycle */
  process(numCycles = 1): void {
    const CYCLE_CHUNK = 10;
    this.storedCycles += numCycles;
    if (this.storedCycles < CYCLE_CHUNK) return;

    // Calculate how many cycles to actually process.
    const cycles = Math.min(this.storedCycles, CYCLE_CHUNK);

    try {
      for (let x = 0; x < this.world.length; x++) {
        for (let y = 0; y < this.world[x].length; y++) {
          const tile = this.world[x][y];
          if (tile === "d" && Math.random() > 0.99) {
            this.world[x][y] = "b";
          }
        }
      }
      this.storedCycles -= cycles;
    } catch (e: unknown) {
      console.error(`Exception caught when processing Gang: ${e}`);
    }
  }

  getTile(x: number, y: number): MyrianTile {
    if (x < 0 || y < 0 || y > this.world.length || x > this.world[y].length) return { Content: "?" };
    return {
      Content: this.world[y][x],
    };
  }

  /** Serialize the current object to a JSON save state. */
  toJSON(): IReviverValue {
    return Generic_toJSON("Myrian", this);
  }

  /** Initializes a Myrian object from a JSON save state. */
  static fromJSON(value: IReviverValue): Myrian {
    const v = Generic_fromJSON(Myrian, value.data);
    return v;
  }
}

constructorsForReviver.Myrian = Myrian;
