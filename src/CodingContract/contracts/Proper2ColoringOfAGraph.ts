import { CodingContractTypes, removeBracketsFromArrayString } from "../ContractTypes";
import { CodingContractName } from "@enums";

export const proper2ColoringOfAGraph: Pick<CodingContractTypes, CodingContractName.Proper2ColoringOfAGraph> = {
  [CodingContractName.Proper2ColoringOfAGraph]: {
    difficulty: 7,
    numTries: 5,
    desc: (data: [number, [number, number][]]): string => {
      return [
        `You are given the following data, representing a graph:\n`,
        `${JSON.stringify(data)}\n`,
        `Note that "graph", as used here, refers to the field of graph theory, and has`,
        `no relation to statistics or plotting.`,
        `The first element of the data represents the number of vertices in the graph.`,
        `Each vertex is a unique number between 0 and ${data[0] - 1}.`,
        `The next element of the data represents the edges of the graph.`,
        `Two vertices u,v in a graph are said to be adjacent if there exists an edge [u,v].`,
        `Note that an edge [u,v] is the same as an edge [v,u], as order does not matter.`,
        `You must construct a 2-coloring of the graph, meaning that you have to assign each`,
        `vertex in the graph a "color", either 0 or 1, such that no two adjacent vertices have`,
        `the same color. Submit your answer in the form of an array, where element i`,
        `represents the color of vertex i. If it is impossible to construct a 2-coloring of`,
        `the given graph, instead submit an empty array.\n\n`,
        `Examples:\n\n`,
        `Input: [4, [[0, 2], [0, 3], [1, 2], [1, 3]]]\n`,
        `Output: [0, 0, 1, 1]\n\n`,
        `Input: [3, [[0, 1], [0, 2], [1, 2]]]\n`,
        `Output: []`,
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
      const sanitized = removeBracketsFromArrayString(ans).replace(/\s/g, "");
      if (sanitized === "") return [];
      const arr = sanitized.split(",").map((s) => parseInt(s, 10));
      // An inline function is needed here, so that TS knows this returns true if it matches the type
      if (((a): a is (1 | 0)[] => !a.some((n) => n !== 1 && n !== 0))(arr)) return arr;
      return null;
    },
    validateAnswer: (ans): ans is (1 | 0)[] =>
      typeof ans === "object" && Array.isArray(ans) && !ans.some((a) => a !== 1 && a !== 0),
  },
};
