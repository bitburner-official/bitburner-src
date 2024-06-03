export function generateGraph(states: string[], symbols: string[]): Record<string, Record<string, string>> {
  const graph = new GraphGenerator(states, symbols, Math.random() > 0.5);
  graph.generate();

  return graph.collect();
}

export class GraphGenerator {
  graph: Record<string, Record<string, string>> = {};
  isBipartite: boolean;
  set: Record<string, boolean> = {};

  unusedStates: string[];
  symbols: string[];

  constructor(states: string[], symbols: string[], isBipartite: boolean) {
    this.unusedStates = states;
    this.symbols = symbols;
    this.isBipartite = isBipartite;

    for (const state of states) this.graph[state] = {};
    this.set[states[0]] = false;

    const start = this.unusedStates[0];
    const end = this.unusedStates[this.unusedStates.length - 1];
    const length = Math.ceil(this.unusedStates.length * (Math.random() * 0.2 + 0.4)); // 40% - 60%

    this.unusedStates = this.unusedStates.slice(1, -1);
    this.createRandomPath(start, end, length);
  }

  collect() {
    this.entangle();
    return this.graph;
  }

  generate() {
    while (this.hasStatesLeft()) {
      const percentageUsed = Math.random() * 0.2 + 0.1; // 10% - 30%
      const statesUsed = Math.ceil(percentageUsed * this.unusedStates.length);
      this.performRandomOperation(statesUsed);
    }

    this.entangle();

    return this;
  }

  performRandomOperation(numStates: number) {
    const possibleOperations: ((length: number) => GraphGenerator)[] = [this.addDetour, this.addKite];

    GraphGenerator.randomElement(possibleOperations).bind(this)(numStates);
  }

  static randomElement<T>(list: T[]) {
    return list[Math.floor(Math.random() * list.length)];
  }

  vertexHasOpenEdges(vertex: string, num = 1) {
    return Object.keys(this.graph[vertex]).length + num <= this.symbols.length;
  }

  vertexExists(vertex: string) {
    for (const other in this.graph) {
      if (other === vertex) continue;

      if (Object.values(this.graph[other]).includes(vertex)) return true;
    }

    return false;
  }

  hasStatesLeft() {
    return this.unusedStates.length > 0;
  }

  pickRandomVertex(filterFunction: (vertex: string) => boolean) {
    const vertices = Object.keys(this.graph).filter(filterFunction);
    if (vertices.length === 0) throw new Error("Couldn't generate Worm graph. Graph has no open edges left.");

    return GraphGenerator.randomElement(vertices);
  }

  useRandomState(setValue: boolean, exclude: string[] = []) {
    const state = GraphGenerator.randomElement(this.unusedStates.filter((state) => !exclude.includes(state)));
    this.unusedStates.splice(this.unusedStates.indexOf(state), 1);

    if (state === undefined) throw new Error("Couldn't generate Worm graph. No unused states left.");
    this.set[state] = setValue;

    return state;
  }

  createRandomConnection(from: string, to: string) {
    if (!this.vertexHasOpenEdges(from)) throw new Error("Couldn't generate Worm graph. Vertex has no open edges.");
    if (this.isBipartite) {
      if (!(from in this.set)) throw new Error("Couldn't generate Worm graph. A vertex has no associated set.");
      if (!(to in this.set)) this.set[to] = !this.set[from];
      if (this.set[from] === this.set[to])
        throw new Error("Couldn't generate Worm graph. Tried to connect vertices from the same set.");
    }

    const possibleSymbols = this.symbols.filter((s) => !Object.keys(this.graph[from]).includes(s));
    this.graph[from][GraphGenerator.randomElement(possibleSymbols)] = to;

    return to;
  }

  createRandomPath(from: string, to: string, length: number) {
    while (this.hasStatesLeft() && length > 0) {
      const state = this.useRandomState(!this.set[from], [to]);
      this.createRandomConnection(from, state);
      from = state;
      length--;
    }
    this.createRandomConnection(from, to);

    return to;
  }

  createTail(length: number) {
    if (!this.hasStatesLeft()) throw new Error("Couldn't generate Worm graph. No states left for tail.");
    const tailLength = Math.min(length, this.unusedStates.length);
    let current = this.pickRandomVertex((vertex) => this.vertexExists(vertex) && this.vertexHasOpenEdges(vertex));

    for (let i = 0; i < tailLength; i++) {
      const state = this.useRandomState(!this.set[current]);

      this.createRandomConnection(current, state);
      current = state;
    }

    return current;
  }

  entangle() {
    for (const vertex of Object.keys(this.graph)) {
      const percentageConnected = Math.pow(Math.random(), 1.5);

      let currentConnections = Object.keys(this.graph[vertex]).length;

      while (
        currentConnections / this.symbols.length < percentageConnected &&
        currentConnections < this.symbols.length
      ) {
        const target = this.pickRandomVertex(
          (v) => this.vertexExists(v) && (!this.isBipartite || this.set[v] !== this.set[vertex]),
        );
        this.createRandomConnection(vertex, target);
        currentConnections++;
      }
    }

    return this;
  }

  addDetour(length: number) {
    if (!this.hasStatesLeft()) return this;

    const tailEnd = this.createTail(length);
    const detourEnd = this.pickRandomVertex(
      (vertex) => this.vertexExists(vertex) && (!this.isBipartite || this.set[vertex] !== this.set[tailEnd]),
    );

    this.createRandomConnection(tailEnd, detourEnd);
    return this;
  }

  addKite(length: number) {
    if (!this.hasStatesLeft()) return this;

    this.createTail(length);

    return this;
  }
}
