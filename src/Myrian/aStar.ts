import { Myrian } from "./Myrian";

export const aStar = (myrian: Myrian, start: [number, number], goal: [number, number]): [number, number][] => {
  if (myrian.getTile(goal[0], goal[1]).Content !== " ") return [];

  const h = (n: [number, number], m: [number, number]) => Math.abs(n[0] - m[0]) + Math.abs(n[1] - m[1]);

  const d = (n: [number, number], m: [number, number]) => {
    const tile = myrian.getTile(m[0], m[1]);
    if (tile.Content !== " ") return Infinity;
    return Math.abs(n[0] - m[0]) + Math.abs(n[1] - m[1]);
  };

  const openSet = new Set([start]);

  const cameFrom = new Map<[number, number], [number, number]>();

  const gScore = new Map<[number, number], number>();
  gScore.set(start, 0);

  const fScore = new Map<[number, number], number>();
  fScore.set(start, h(start, goal));

  const bestCurrent = () => {
    let best;
    for (const n of openSet.values()) {
      if (best !== undefined && (fScore.get(n) ?? Infinity) >= (fScore.get(best) ?? Infinity)) continue;
      best = n;
    }
    return best ?? [-1, -1];
  };

  const eq = (n: [number, number], m: [number, number]) => n[0] === m[0] && n[1] === m[1];

  const neighbors = (n: [number, number]): Iterable<[number, number]> => {
    const diffs = [
      [-1, 0],
      [+1, 0],
      [0, -1],
      [0, +1],
    ];
    let i = -1;
    return {
      [Symbol.iterator]: () => ({
        next: () =>
          ++i === diffs.length ? { value: [-1, -1], done: true } : { value: [n[0] + diffs[i][0], n[1] + diffs[i][1]] },
      }),
    };
  };

  /**
   * @param {Map<[number, number], [number, number]>} cameFrom
   * @param {[number, number]} current
   */
  const reconstructPath = (cameFrom: Map<[number, number], [number, number]>, current: [number, number]) => {
    const totalPath = [current];
    while (cameFrom.has(current)) {
      current = cameFrom.get(current) ?? [-1, -1];
      totalPath.unshift(current);
    }
    return totalPath;
  };

  while (openSet.size) {
    const current = bestCurrent();
    if (eq(current, goal)) return reconstructPath(cameFrom, current);
    openSet.delete(current);
    for (const neighbor of neighbors(current)) {
      const tentativegScore = (gScore.get(current) ?? Infinity) + d(current, neighbor);
      if (tentativegScore >= (gScore.get(neighbor) ?? Infinity)) continue;
      cameFrom.set(neighbor, current);
      gScore.set(neighbor, tentativegScore);
      fScore.set(neighbor, tentativegScore + h(neighbor, goal));
      if (!openSet.has(neighbor)) openSet.add(neighbor);
    }
  }
  return [];
};
