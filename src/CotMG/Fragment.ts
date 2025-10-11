import type { FragmentType } from "@nsdefs";
import { FragmentTypeEnum, Effect } from "./FragmentType";
import { Shapes } from "./data/Shapes";

export const Fragments: Fragment[] = [];

export class Fragment {
  id: number;
  shape: boolean[][];
  type: FragmentType;
  power: number;
  limit: number;
  effect: string;

  constructor(id: number, shape: boolean[][], type: FragmentType, power: number, limit: number, effect: string) {
    this.id = id;
    this.shape = shape;
    this.type = type;
    this.power = power;
    this.limit = limit;
    this.effect = effect;
  }

  fullAt(x: number, y: number, rotation: number): boolean {
    if (y < 0) return false;
    if (y >= this.height(rotation)) return false;
    if (x < 0) return false;
    if (x >= this.width(rotation)) return false;
    // start xy, modifier xy
    let [sx, sy, mx, my] = [0, 0, 1, 1];
    if (rotation === 1) {
      [sx, sy, mx, my] = [this.width(rotation) - 1, 0, -1, 1];
    } else if (rotation === 2) {
      [sx, sy, mx, my] = [this.width(rotation) - 1, this.height(rotation) - 1, -1, -1];
    } else if (rotation === 3) {
      [sx, sy, mx, my] = [0, this.height(rotation) - 1, 1, -1];
    }
    let [qx, qy] = [sx + mx * x, sy + my * y];
    if (rotation % 2 === 1) [qx, qy] = [qy, qx];
    return this.shape[qy][qx];
  }

  width(rotation: number): number {
    if (rotation % 2 === 0) return this.shape[0].length;
    return this.shape.length;
  }

  height(rotation: number): number {
    if (rotation % 2 === 0) return this.shape.length;
    return this.shape[0].length;
  }

  // List of direct neighbors of this fragment.
  neighbors(rotation: number): number[][] {
    const candidates: number[][] = [];

    const add = (x: number, y: number): void => {
      if (this.fullAt(x, y, rotation)) return;
      if (candidates.some((coord) => coord[0] === x && coord[1] === y)) return;
      candidates.push([x, y]);
    };
    for (let y = 0; y < this.height(rotation); y++) {
      for (let x = 0; x < this.width(rotation); x++) {
        // This cell is full, add all it's neighbors.
        if (!this.fullAt(x, y, rotation)) continue;
        add(x - 1, y);
        add(x + 1, y);
        add(x, y - 1);
        add(x, y + 1);
      }
    }
    const cells: number[][] = [];
    for (const candidate of candidates) {
      if (cells.some((cell) => cell[0] === candidate[0] && cell[1] === candidate[1])) continue;
      cells.push(candidate);
    }

    return cells;
  }

  copy(): Fragment {
    return Object.assign({}, this);
  }
}

export function FragmentById(id: number): Fragment | null {
  for (const fragment of Fragments) {
    if (fragment.id === id) return fragment;
  }
  return null;
}

(function () {
  const _ = false;
  const X = true;
  Fragments.push(
    new Fragment(
      0, // id
      Shapes.S,
      FragmentTypeEnum.Hacking,
      1,
      1, // limit
      Effect(FragmentTypeEnum.Hacking),
      //Effect(FragmentType.Hacking],
    ),
  );
  Fragments.push(
    new Fragment(
      1, // id
      Shapes.Z,
      FragmentTypeEnum.Hacking,
      1,
      1, // limit
      Effect(FragmentTypeEnum.Hacking),
    ),
  );
  Fragments.push(
    new Fragment(
      5, // id
      Shapes.T,
      FragmentTypeEnum.HackingSpeed,
      1.3,
      1, // limit
      Effect(FragmentTypeEnum.HackingSpeed),
    ),
  );

  Fragments.push(
    new Fragment(
      6, // id
      Shapes.I,
      FragmentTypeEnum.HackingMoney,
      2, // power
      1, // limit
      Effect(FragmentTypeEnum.HackingMoney),
    ),
  );
  Fragments.push(
    new Fragment(
      7, // id
      Shapes.J,
      FragmentTypeEnum.HackingGrow,
      0.5, // power
      1, // limit
      Effect(FragmentTypeEnum.HackingGrow),
    ),
  );
  Fragments.push(
    new Fragment(
      10, // id
      Shapes.T,
      FragmentTypeEnum.Strength,
      2, // power
      1, // limit
      Effect(FragmentTypeEnum.Strength),
    ),
  );
  Fragments.push(
    new Fragment(
      12, // id
      Shapes.L,
      FragmentTypeEnum.Defense,
      2, // power
      1, // limit
      Effect(FragmentTypeEnum.Defense),
    ),
  );
  Fragments.push(
    new Fragment(
      14, // id
      Shapes.L,
      FragmentTypeEnum.Dexterity,
      2, // power
      1, // limit
      Effect(FragmentTypeEnum.Dexterity),
    ),
  );
  Fragments.push(
    new Fragment(
      16, // id
      Shapes.S,
      FragmentTypeEnum.Agility,
      2, // power
      1, // limit
      Effect(FragmentTypeEnum.Agility),
    ),
  );
  Fragments.push(
    new Fragment(
      18, // id
      Shapes.S,
      FragmentTypeEnum.Charisma,
      3, // power
      1, // limit
      Effect(FragmentTypeEnum.Charisma),
    ),
  );
  Fragments.push(
    new Fragment(
      20, // id
      Shapes.I,
      FragmentTypeEnum.HacknetMoney,
      1, // power
      1, // limit
      Effect(FragmentTypeEnum.HacknetMoney),
    ),
  );
  Fragments.push(
    new Fragment(
      21, // id
      Shapes.O,
      FragmentTypeEnum.HacknetCost,
      2, // power
      1, // limit
      Effect(FragmentTypeEnum.HacknetCost),
    ),
  );
  Fragments.push(
    new Fragment(
      25, // id
      Shapes.J,
      FragmentTypeEnum.Rep,
      0.5, // power
      1, // limit
      Effect(FragmentTypeEnum.Rep),
    ),
  );
  Fragments.push(
    new Fragment(
      27, // id
      Shapes.J,
      FragmentTypeEnum.WorkMoney,
      10, // power
      1, // limit
      Effect(FragmentTypeEnum.WorkMoney),
    ),
  );
  Fragments.push(
    new Fragment(
      28, // id
      Shapes.L,
      FragmentTypeEnum.Crime,
      2, // power
      1, // limit
      Effect(FragmentTypeEnum.Crime),
    ),
  );
  Fragments.push(
    new Fragment(
      30, // id
      Shapes.S,
      FragmentTypeEnum.Bladeburner,
      0.4, // power
      1, // limit
      Effect(FragmentTypeEnum.Bladeburner),
    ),
  );
  Fragments.push(
    new Fragment(
      100, // id
      [
        // shape
        [_, X, X],
        [X, X, _],
        [_, X, _],
      ],
      FragmentTypeEnum.Booster,
      1.1, // power
      99, // limit
      Effect(FragmentTypeEnum.Booster),
    ),
  );
  Fragments.push(
    new Fragment(
      101, // id
      [
        // shape
        [X, X, X, X],
        [X, _, _, _],
      ],
      FragmentTypeEnum.Booster,
      1.1, // power
      99, // limit
      Effect(FragmentTypeEnum.Booster),
    ),
  );
  Fragments.push(
    new Fragment(
      102, // id
      [
        // shape
        [_, X, X, X],
        [X, X, _, _],
      ],
      FragmentTypeEnum.Booster,
      1.1, // power
      99, // limit
      Effect(FragmentTypeEnum.Booster),
    ),
  );
  Fragments.push(
    new Fragment(
      103, // id
      [
        // shape
        [X, X, X, _],
        [_, _, X, X],
      ],
      FragmentTypeEnum.Booster,
      1.1, // power
      99, // limit
      Effect(FragmentTypeEnum.Booster),
    ),
  );
  Fragments.push(
    new Fragment(
      104, // id
      [
        // shape
        [_, X, X],
        [_, X, _],
        [X, X, _],
      ],
      FragmentTypeEnum.Booster,
      1.1, // power
      99, // limit
      Effect(FragmentTypeEnum.Booster),
    ),
  );
  Fragments.push(
    new Fragment(
      105, // id
      [
        // shape
        [_, _, X],
        [_, X, X],
        [X, X, _],
      ],
      FragmentTypeEnum.Booster,
      1.1, // power
      99, // limit
      Effect(FragmentTypeEnum.Booster),
    ),
  );
  Fragments.push(
    new Fragment(
      106, // id
      [
        // shape
        [X, _, _],
        [X, X, X],
        [X, _, _],
      ],
      FragmentTypeEnum.Booster,
      1.1, // power
      99, // limit
      Effect(FragmentTypeEnum.Booster),
    ),
  );
  Fragments.push(
    new Fragment(
      107, // id
      [
        // shape
        [_, X, _],
        [X, X, X],
        [_, X, _],
      ],
      FragmentTypeEnum.Booster,
      1.1, // power
      99, // limit
      Effect(FragmentTypeEnum.Booster),
    ),
  );
})();
