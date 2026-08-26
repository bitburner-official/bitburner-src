import { CodingContractTypes, parseArrayString } from "../ContractTypes";
import { CodingContractName } from "@enums";

export const proper2ColoringOfAGraph: Pick<CodingContractTypes, CodingContractName.Proper2ColoringOfAGraph> = {
  [CodingContractName.Proper2ColoringOfAGraph]: {
    difficulty: 7,
    numTries: 5,
    desc: (data: [number, [number, number][]]): string => {
      return [
        `给你以下表示图的数据：\n`,
        `${JSON.stringify(data)}\n`,
        `注意，这里所说的“图”指的是图论中的图，与统计或绘图无关。`,
        `数据的第一个元素表示图中顶点的数量。`,
        `每个顶点是 0 到 ${data[0] - 1} 之间的唯一数字。`,
        `数据的下一个元素表示图的边。`,
        `如果图中存在边 [u,v]，则称两个顶点 u,v 相邻。`,
        `注意边 [u,v] 与边 [v,u] 是同一条边，因为顺序不重要。`,
        `你需要构造该图的一个 2-着色，即给图中每个`,
        `顶点分配一种“颜色”（0 或 1），使得任意两个相邻的顶点都不具有`,
        `相同的颜色。以数组形式提交你的答案，其中元素 i`,
        `表示顶点 i 的颜色。如果无法为给定图构造 2-着色，`,
        `则提交一个空数组。\n\n`,
        `示例：\n\n`,
        `输入：[4, [[0, 2], [0, 3], [1, 2], [1, 3]]]\n`,
        `输出：[0, 0, 1, 1]\n\n`,
        `输入：[3, [[0, 1], [0, 2], [1, 2]]]\n`,
        `输出：[]`,
      ].join(" ");
    },
    generate: (): [number, [number, number][]] => {
      //Generate two partite sets
      const n = Math.floor(Math.random() * 5) + 3;
      const m = Math.floor(Math.random() * 5) + 3;

      //50% chance of spawning any given valid edge in the bipartite graph
      const edges: [number, number][] = [];
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
          if (Math.random() > 0.5) {
            edges.push([i, n + j]);
          }
        }
      }

      //Add an edge at random with no regard to partite sets
      let a = Math.floor(Math.random() * (n + m));
      let b = Math.floor(Math.random() * (n + m));
      if (a > b) [a, b] = [b, a]; //Enforce lower numbers come first
      if (a != b && !edges.includes([a, b])) {
        edges.push([a, b]);
      }

      //Randomize array in-place using Durstenfeld shuffle algorithm.
      function shuffle<T>(array: T[]): void {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
      }

      //Replace instances of the original vertex names in-place
      const vertexShuffler = Array.from(Array(n + m).keys());
      shuffle(vertexShuffler);
      for (let i = 0; i < edges.length; i++) {
        edges[i] = [vertexShuffler[edges[i][0]], vertexShuffler[edges[i][1]]];
        if (edges[i][0] > edges[i][1]) {
          //Enforce lower numbers come first
          [edges[i][0], edges[i][1]] = [edges[i][1], edges[i][0]];
        }
      }

      //Shuffle the order of the edges themselves, as well
      shuffle(edges);

      return [n + m, edges];
    },
    getAnswer: () => {
      return null;
    },
    solver: (data, answer) => {
      //Helper function to get neighbourhood of a vertex
      function neighbourhood(vertex: number): number[] {
        const adjLeft = data[1].filter(([a]) => a == vertex).map(([, b]) => b);
        const adjRight = data[1].filter(([, b]) => b == vertex).map(([a]) => a);
        return adjLeft.concat(adjRight);
      }

      const coloring: (1 | 0 | undefined)[] = Array<1 | 0 | undefined>(data[0]).fill(undefined);
      while (coloring.some((val) => val === undefined)) {
        //Color a vertex in the graph
        const initialVertex: number = coloring.findIndex((val) => val === undefined);
        coloring[initialVertex] = 0;
        const frontier: number[] = [initialVertex];

        //Propagate the coloring throughout the component containing v greedily
        while (frontier.length > 0) {
          const v: number = frontier.pop() || 0;
          const neighbors: number[] = neighbourhood(v);

          //For each vertex u adjacent to v
          for (const u of neighbors) {
            //Set the color of u to the opposite of v's color if it is new,
            //then add u to the frontier to continue the algorithm.
            if (coloring[u] === undefined) {
              if (coloring[v] === 0) coloring[u] = 1;
              else coloring[u] = 0;

              frontier.push(u);
            }

            //Assert u,v do not have the same color
            else if (coloring[u] === coloring[v]) {
              //If u,v do have the same color, no proper 2-coloring exists
              return answer.length === 0;
            }
          }
        }
      }

      return data[1].every(([a, b]) => answer[a] !== answer[b]);
    },
    convertAnswer: (ans) => {
      const parsedAnswer = parseArrayString(ans.replace(/\s/g, ""));
      if (!proper2ColoringOfAGraph[CodingContractName.Proper2ColoringOfAGraph].validateAnswer(parsedAnswer)) {
        return null;
      }
      return parsedAnswer;
    },
    validateAnswer: (ans): ans is (1 | 0)[] => Array.isArray(ans) && !ans.some((a) => a !== 1 && a !== 0),
  },
};
