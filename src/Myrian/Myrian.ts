import { SleeveMyrianWork } from "../PersonObjects/Sleeve/Work/SleeveMyrianWork";
import { constructorsForReviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "../utils/JSONReviver";
import { Player } from "@player";
import { DefaultWorld } from "./World";

interface MyrianSleeve {
  index: number;
  x: number;
  y: number;
}

export class Myrian {
  world: string[][] = [];
  resources = 0;
  sleeves: MyrianSleeve[] = [];

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
